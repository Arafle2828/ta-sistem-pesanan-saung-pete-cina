import express from "express";
import { query } from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 1. Ambil Semua Meja beserta jumlah pesanan aktif di masing-masing meja
router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*,
             COUNT(o.id) FILTER (WHERE o.status NOT IN ('completed', 'cancelled'))::int AS active_orders_count
      FROM tables t
      LEFT JOIN orders o ON o.table_id = t.id
      GROUP BY t.id
      ORDER BY t.table_number ASC
    `);
    res.json({ success: true, tables: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat data meja.", error: error.message });
  }
});

// 1b. Ambil Info 1 Meja berdasarkan Nomor Meja (beserta pesanan aktif di meja tersebut)
router.get("/:tableNumber", async (req, res) => {
  try {
    const tableNum = parseInt(req.params.tableNumber, 10);
    if (Number.isNaN(tableNum)) {
      return res.status(400).json({ success: false, message: "Nomor meja tidak valid." });
    }

    const tableRes = await query("SELECT * FROM tables WHERE table_number = $1", [tableNum]);
    if (tableRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });
    }

    const activeOrdersRes = await query(
      `SELECT id, order_number, customer_name, status, total_amount, created_at
       FROM orders
       WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled')
       ORDER BY created_at DESC`,
      [tableRes.rows[0].id]
    );

    res.json({
      success: true,
      table: {
        ...tableRes.rows[0],
        active_orders: activeOrdersRes.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat detail meja.", error: error.message });
  }
});

// 2. Tambah Meja Baru (Hanya Admin)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { table_number } = req.body;
    if (!table_number) {
      return res.status(400).json({ success: false, message: "Nomor meja wajib diisi." });
    }

    const qrUrl = `/order?table=${table_number}`;
    const result = await query(
      "INSERT INTO tables (table_number, qr_code_url, status) VALUES ($1, $2, 'available') ON CONFLICT (table_number) DO UPDATE SET qr_code_url = EXCLUDED.qr_code_url RETURNING *",
      [parseInt(table_number, 10), qrUrl]
    );

    res.status(201).json({ success: true, message: "Meja berhasil ditambahkan.", table: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menambahkan meja.", error: error.message });
  }
});

// 3. Ubah Status Meja (mendukung ID UUID maupun table_number)
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["available", "occupied"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status meja harus 'available' atau 'occupied'." });
    }

    const result = await query(
      "UPDATE tables SET status = $1 WHERE id::text = $2 OR table_number::text = $2 RETURNING *",
      [status, String(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });
    }

    const updatedTable = result.rows[0];
    const io = req.app.get("io");
    if (io) {
      io.emit("table_status_updated", updatedTable);
    }

    res.json({ success: true, table: updatedTable });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui status meja.", error: error.message });
  }
});

export default router;
