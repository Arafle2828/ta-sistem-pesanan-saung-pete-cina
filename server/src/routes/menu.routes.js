import express from "express";
import { query } from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 1. Ambil Semua Kategori (Publik)
router.get("/categories", async (req, res) => {
  try {
    const result = await query("SELECT * FROM categories ORDER BY sort_order ASC, name ASC");
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat kategori.", error: error.message });
  }
});

// 2. Ambil Semua Menu dengan Informasi Kategori (Publik)
router.get("/", async (req, res) => {
  try {
    const { category, available_only } = req.query;
    let sql = `
      SELECT m.*, c.name AS category_name, c.slug AS category_slug
      FROM menus m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== "Semua") {
      params.push(category);
      sql += ` AND (c.slug = $${params.length} OR c.name ILIKE $${params.length})`;
    }

    if (available_only === "true") {
      sql += ` AND m.is_available = true`;
    }

    sql += ` ORDER BY c.sort_order ASC, m.name ASC`;

    const result = await query(sql, params);
    res.json({ success: true, menus: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat menu.", error: error.message });
  }
});

async function resolveCategoryId(categoryId, categoryNameOrSlug) {
  if (categoryId) return categoryId;
  if (!categoryNameOrSlug) return null;
  const res = await query(
    "SELECT id FROM categories WHERE LOWER(slug) = LOWER($1) OR LOWER(name) = LOWER($1) LIMIT 1",
    [String(categoryNameOrSlug).trim()]
  );
  return res.rows[0]?.id || null;
}

// 3. Tambah Menu Baru (Hanya Admin)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, category_id, category, description, price, image_url, is_available } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Nama dan harga wajib diisi." });
    }

    const resolvedCatId = await resolveCategoryId(category_id, category);

    const insertRes = await query(
      `INSERT INTO menus (name, category_id, description, price, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [name, resolvedCatId, description || null, parseFloat(price), image_url || null, is_available !== false]
    );

    const result = await query(
      `SELECT m.*, c.name AS category_name, c.slug AS category_slug
       FROM menus m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = $1`,
      [insertRes.rows[0].id]
    );

    res.status(201).json({ success: true, message: "Menu berhasil ditambahkan.", menu: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menambahkan menu.", error: error.message });
  }
});

// 4. Ubah Menu (Hanya Admin)
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, category, description, price, image_url, is_available } = req.body;
    const resolvedCatId = await resolveCategoryId(category_id, category);

    const updateRes = await query(
      `UPDATE menus 
       SET name = COALESCE($1, name),
           category_id = COALESCE($2, category_id),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           image_url = COALESCE($5, image_url),
           is_available = COALESCE($6, is_available)
       WHERE id::text = $7
       RETURNING id`,
      [name, resolvedCatId, description, price !== undefined ? parseFloat(price) : null, image_url, is_available, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Menu tidak ditemukan." });
    }

    const result = await query(
      `SELECT m.*, c.name AS category_name, c.slug AS category_slug
       FROM menus m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = $1`,
      [updateRes.rows[0].id]
    );

    res.json({ success: true, message: "Menu berhasil diperbarui.", menu: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui menu.", error: error.message });
  }
});

// 5. Toggle Status Ketersediaan Menu (Tersedia / Habis)
router.patch("/:id/toggle", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const toggleRes = await query(
      `UPDATE menus SET is_available = NOT is_available WHERE id::text = $1 RETURNING id`,
      [id]
    );

    if (toggleRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Menu tidak ditemukan." });
    }

    const result = await query(
      `SELECT m.*, c.name AS category_name, c.slug AS category_slug
       FROM menus m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = $1`,
      [toggleRes.rows[0].id]
    );

    res.json({ success: true, message: "Status menu diperbarui.", menu: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengubah status menu.", error: error.message });
  }
});

// 6. Hapus Menu (Hanya Admin)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM menus WHERE id::text = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Menu tidak ditemukan." });
    }
    res.json({ success: true, message: "Menu berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus menu.", error: error.message });
  }
});

export default router;
