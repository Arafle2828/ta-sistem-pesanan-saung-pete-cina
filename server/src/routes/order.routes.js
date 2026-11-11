import express from "express";
import { query, pool } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// 1. Buat Pesanan Baru oleh Pelanggan (Publik via QR Meja)
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { table_number, customer_name, order_type, notes, payment_method, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Pesanan harus memiliki minimal 1 item menu." });
    }

    await client.query("BEGIN");

    // Ambil ID meja jika ada nomor meja
    let tableId = null;
    if (table_number) {
      const tableNum = parseInt(table_number, 10);
      let tableRes = await client.query(
        "SELECT id FROM tables WHERE table_number = $1",
        [tableNum]
      );
      if (tableRes.rows.length === 0 && !Number.isNaN(tableNum) && tableNum > 0) {
        tableRes = await client.query(
          "INSERT INTO tables (table_number, qr_code_url, status) VALUES ($1, $2, 'occupied') ON CONFLICT (table_number) DO UPDATE SET status = 'occupied' RETURNING id",
          [tableNum, `/order?table=${tableNum}`]
        );
      }
      if (tableRes.rows.length > 0) {
        tableId = tableRes.rows[0].id;
        await client.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [tableId]);
      }
    }

    // Ambil semua menu untuk pencocokan via ID maupun nama
    const menuRes = await client.query("SELECT id, name, price, is_available FROM menus");
    const menuById = new Map();
    const menuByName = new Map();
    menuRes.rows.forEach((m) => {
      menuById.set(String(m.id), m);
      menuByName.set(m.name.toLowerCase(), m);
    });

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const dbMenu =
        menuById.get(String(item.menu_id)) ||
        (item.name ? menuByName.get(String(item.name).toLowerCase()) : null);
      if (!dbMenu) {
        throw new Error(`Menu '${item.name || item.menu_id}' tidak ditemukan di database.`);
      }
      if (!dbMenu.is_available) {
        throw new Error(`Menu '${dbMenu.name}' saat ini sedang habis.`);
      }

      const qty = parseInt(item.quantity, 10);
      if (qty <= 0) {
        throw new Error(`Kuantitas untuk '${dbMenu.name}' tidak valid.`);
      }

      const unitPrice = parseFloat(dbMenu.price);
      const subtotal = unitPrice * qty;
      calculatedTotal += subtotal;

      validatedItems.push({
        menu_id: dbMenu.id,
        name: dbMenu.name,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
        item_notes: item.notes || null,
      });
    }

    // Buat record pesanan di tabel orders
    const orderRes = await client.query(
      `INSERT INTO orders (table_id, customer_name, order_type, status, notes, total_amount)
       VALUES ($1, $2, $3, 'new', $4, $5)
       RETURNING *`,
      [tableId, customer_name || "Pelanggan", order_type || "dine-in", notes || null, calculatedTotal]
    );

    const createdOrder = orderRes.rows[0];

    // Masukkan detail item pesanan ke tabel order_items
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, unit_price, subtotal, item_notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [createdOrder.id, item.menu_id, item.quantity, item.unit_price, item.subtotal, item.item_notes]
      );
    }

    // Jika metode pembayaran dikirim saat pemesanan, catat sebagai pending payment
    const methodNormalized = ["cash", "debit", "qris"].includes(String(payment_method || "").toLowerCase())
      ? String(payment_method).toLowerCase()
      : "qris";

    await client.query(
      `INSERT INTO payments (order_id, payment_method, amount_paid, change_amount, payment_status)
       VALUES ($1, $2, $3, 0, 'pending')
       ON CONFLICT (order_id) DO NOTHING`,
      [createdOrder.id, methodNormalized, calculatedTotal]
    );

    await client.query("COMMIT");

    const fullOrder = {
      ...createdOrder,
      table_number: table_number || null,
      payment_method: methodNormalized,
      payment_status: "pending",
      items: validatedItems,
    };

    // Emit event real-time ke semua client yang terkoneksi via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("new_order", fullOrder);
      if (tableId) {
        io.emit("table_status_updated", { id: tableId, table_number: Number(table_number), status: "occupied" });
      }
    }

    res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat.",
      order: fullOrder,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", error);
    res.status(400).json({ success: false, message: error.message || "Gagal membuat pesanan." });
  } finally {
    client.release();
  }
});

// 2. Ambil Daftar Pesanan (Staf/Dapur/Kasir)
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, date, table_number } = req.query;

    let sql = `
      SELECT o.*, t.table_number, t.status AS table_status,
             COALESCE(p.payment_method::text, 'qris') AS payment_method,
             COALESCE(p.payment_status::text, 'pending') AS payment_status,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'menu_id', oi.menu_id,
                   'name', m.name,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price,
                   'subtotal', oi.subtotal,
                   'item_notes', oi.item_notes
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) AS items
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "all") {
      const normalizedStatus = status === "done" ? "completed" : status;
      params.push(normalizedStatus);
      sql += ` AND o.status = $${params.length}`;
    }

    if (table_number) {
      params.push(parseInt(table_number, 10));
      sql += ` AND t.table_number = $${params.length}`;
    }

    if (date === "today") {
      sql += ` AND DATE(o.created_at) = CURRENT_DATE`;
    }

    sql += ` GROUP BY o.id, t.table_number, t.status, p.payment_method, p.payment_status ORDER BY o.created_at DESC`;

    const result = await query(sql, params);
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data pesanan.", error: error.message });
  }
});

// 3. Ambil Detail Pesanan Tertentu (Bisa diakses Pelanggan untuk Tracking atau Kasir/Dapur)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT o.*, t.table_number,
             COALESCE(p.payment_method::text, 'qris') AS payment_method,
             COALESCE(p.payment_status::text, 'pending') AS payment_status,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'menu_id', oi.menu_id,
                   'name', m.name,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price,
                   'subtotal', oi.subtotal,
                   'item_notes', oi.item_notes
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) AS items
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      WHERE o.id::text = $1 OR o.order_number = $1
      GROUP BY o.id, t.table_number, p.payment_method, p.payment_status
    `;

    const result = await query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil detail pesanan.", error: error.message });
  }
});

// 4. Update Status Pesanan (Dapur / Kasir)
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const rawStatus = req.body.status;
    const status = rawStatus === "done" ? "completed" : rawStatus;

    const validStatuses = ["new", "processing", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Status pesanan tidak valid." });
    }

    const result = await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id::text = $2 OR order_number = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
    }

    const updatedOrder = result.rows[0];

    // Jika status selesai (completed), pastikan pembayaran tercatat sebagai paid
    if (status === "completed") {
      await query(
        `INSERT INTO payments (order_id, cashier_id, payment_method, amount_paid, change_amount, payment_status, paid_at)
         VALUES ($1, $2, 'cash', $3, 0, 'paid', CURRENT_TIMESTAMP)
         ON CONFLICT (order_id) DO UPDATE
         SET payment_status = 'paid',
             paid_at = CURRENT_TIMESTAMP`,
        [updatedOrder.id, req.user?.id || null, updatedOrder.total_amount]
      );
    }

    // Jika pesanan selesai atau dibatalkan, bebaskan meja jika tidak ada pesanan aktif lain di meja itu
    let freedTable = null;
    if (status === "completed" || status === "cancelled") {
      if (updatedOrder.table_id) {
        const activeOrders = await query(
          "SELECT id FROM orders WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled') AND id != $2",
          [updatedOrder.table_id, updatedOrder.id]
        );
        if (activeOrders.rows.length === 0) {
          const tableUpdateRes = await query(
            "UPDATE tables SET status = 'available' WHERE id = $1 RETURNING *",
            [updatedOrder.table_id]
          );
          freedTable = tableUpdateRes.rows[0] || null;
        }
      }
    }

    // Emit event real-time ke semua client
    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        updated_at: updatedOrder.updated_at,
      });
      if (freedTable) {
        io.emit("table_status_updated", freedTable);
      }
    }

    res.json({ success: true, message: "Status pesanan berhasil diperbarui.", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui status pesanan.", error: error.message });
  }
});

export default router;
