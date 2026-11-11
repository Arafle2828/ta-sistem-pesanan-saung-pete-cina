import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 1. Login Staf & Pemilik
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
    }

    const result = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Email atau password salah." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email atau password salah." });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || "saung_pete_cina_secret_key_2026_super_secure",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Auth login error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat login.", error: error.message });
  }
});

// 2. Cek Profil Pengguna Login
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await query("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data profil.", error: error.message });
  }
});

// 3. Buat Akun Staf Baru (Hanya Admin)
router.post("/register", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Semua bidang wajib diisi." });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
      [name, email.toLowerCase().trim(), passwordHash, role]
    );

    res.status(201).json({
      success: true,
      message: "Akun staf berhasil dibuat.",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat akun staf.", error: error.message });
  }
});

export default router;
