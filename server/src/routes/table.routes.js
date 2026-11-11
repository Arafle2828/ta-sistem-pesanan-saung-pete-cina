import express from "express";
import { query } from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 1. Ambil Semua Meja
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM tables ORDER BY table_number ASC");
    res.json({ success: true, tables: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat data meja.", error: error.message });
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
      "INSERT INTO tables (table_number, qr_code_url, status) VALUES ($1, $2, 'available') RETURNING *",
      [parseInt(table_number, 10), qrUrl]
    );

    res.status(201).json({ success: true, message: "Meja berhasil ditambahkan.", table: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menambahkan meja.", error: error.message });
  }
});

// 3. Ubah Status Meja
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      "UPDATE tables SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });
    }

    res.json({ success: true, table: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui status meja.", error: error.message });
  }
});

export default router;
