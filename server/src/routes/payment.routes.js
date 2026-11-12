import express from "express";
import { query, pool } from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 1. Proses Pembayaran di Kasir
router.post("/", authenticate, requireRole("cashier", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id, payment_method, amount_paid } = req.body;

    if (!order_id || !payment_method || amount_paid === undefined) {
      return res.status(400).json({ success: false, message: "ID pesanan, metode bayar, dan nominal bayar wajib diisi." });
    }

    await client.query("BEGIN");

    // Ambil info pesanan
    const orderRes = await client.query("SELECT * FROM orders WHERE id::text = $1 OR order_number = $1 FOR UPDATE", [order_id]);
    if (orderRes.rows.length === 0) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    const order = orderRes.rows[0];
    const totalAmount = parseFloat(order.total_amount);
    const paid = parseFloat(amount_paid);

    if (paid < totalAmount && payment_method.toLowerCase() === "cash") {
      throw new Error(`Nominal pembayaran kurang. Total: Rp ${totalAmount.toLocaleString("id-ID")}, Dibayar: Rp ${paid.toLocaleString("id-ID")}`);
    }

    const changeAmount = Math.max(0, paid - totalAmount);

    // Catat atau update tabel payments
    const payRes = await client.query(
      `INSERT INTO payments (order_id, cashier_id, payment_method, amount_paid, change_amount, payment_status, paid_at)
       VALUES ($1, $2, $3, $4, $5, 'paid', CURRENT_TIMESTAMP)
       ON CONFLICT (order_id) DO UPDATE
       SET cashier_id = EXCLUDED.cashier_id,
           payment_method = EXCLUDED.payment_method,
           amount_paid = EXCLUDED.amount_paid,
           change_amount = EXCLUDED.change_amount,
           payment_status = 'paid',
           paid_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [order.id, req.user?.id || null, payment_method.toLowerCase(), paid, changeAmount]
    );

    // Update status pesanan menjadi completed
    await client.query("UPDATE orders SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [order.id]);

    // Bebaskan meja & sesi meja jika tidak ada pesanan aktif lain di meja tersebut
    if (order.table_id) {
      const remainingOrders = await client.query(
        "SELECT id FROM orders WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled') AND id != $2",
        [order.table_id, order.id]
      );
      if (remainingOrders.rows.length === 0) {
        await client.query(
          `UPDATE tables
           SET status = 'available',
               active_session_token = NULL,
               session_expires_at = NULL
           WHERE id = $1`,
          [order.table_id]
        );
      }
    }

    await client.query("COMMIT");

    const payment = payRes.rows[0];

    // Emit event real-time
    const io = req.app.get("io");
    if (io) {
      io.emit("payment_completed", { order_id, status: "completed", payment });
    }

    res.json({
      success: true,
      message: "Pembayaran berhasil dicatat.",
      payment: {
        ...payment,
        order_number: order.order_number,
        total_amount: totalAmount,
        change_amount: changeAmount,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error processing payment:", error);
    res.status(400).json({ success: false, message: error.message || "Gagal memproses pembayaran." });
  } finally {
    client.release();
  }
});

// 2. Ambil Struk / Invoice Pembayaran
router.get("/:order_id/receipt", async (req, res) => {
  try {
    const { order_id } = req.params;

    const sql = `
      SELECT o.id, o.order_number, o.customer_name, o.order_type, o.created_at, o.total_amount,
             t.table_number,
             p.payment_method, p.amount_paid, p.change_amount, p.paid_at,
             u.name AS cashier_name,
             COALESCE(
               json_agg(
                 json_build_object(
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
      LEFT JOIN users u ON p.cashier_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      WHERE o.id::text = $1 OR o.order_number = $1
      GROUP BY o.id, t.table_number, p.id, u.name
    `;

    const result = await query(sql, [order_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Struk tidak ditemukan." });
    }

    res.json({ success: true, receipt: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat struk belanja.", error: error.message });
  }
});

export default router;
