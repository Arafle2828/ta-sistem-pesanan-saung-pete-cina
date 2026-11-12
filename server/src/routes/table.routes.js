import express from "express";
import crypto from "node:crypto";
import { query, pool, generateQrToken } from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

const SESSION_DURATION_MINUTES = 15;

// Helper untuk membersihkan sesi meja yang sudah kedaluwarsa dan tidak punya pesanan aktif
async function cleanupExpiredTableSessions(clientOrPool = pool) {
  await clientOrPool.query(`
    UPDATE tables t
    SET active_session_token = NULL,
        session_expires_at = NULL,
        status = 'available'
    WHERE t.active_session_token IS NOT NULL
      AND t.session_expires_at IS NOT NULL
      AND t.session_expires_at <= CURRENT_TIMESTAMP
      AND NOT EXISTS (
        SELECT 1 FROM orders o
        WHERE o.table_id = t.id
          AND o.status NOT IN ('completed', 'cancelled')
      )
  `);
}

// 1. Ambil Semua Meja beserta jumlah pesanan aktif & status sesi di masing-masing meja
router.get("/", async (req, res) => {
  try {
    await cleanupExpiredTableSessions();

    const result = await query(`
      SELECT t.id,
             t.table_number,
             t.qr_token,
             t.qr_code_url,
             t.status,
             t.session_expires_at,
             (t.active_session_token IS NOT NULL) AS has_active_session,
             t.created_at,
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

// 1b. Inisialisasi / Validasi Sesi Meja saat Scan QR Code (Mencegah Tabrakan Antar Meja/Pelanggan)
router.post("/session/init", async (req, res) => {
  const client = await pool.connect();
  try {
    const { qr_token, table_number, client_session_token, renew } = req.body;

    if (!qr_token && !table_number) {
      return res.status(400).json({
        success: false,
        message: "Token QR atau nomor meja wajib disertakan.",
      });
    }

    await client.query("BEGIN");
    await cleanupExpiredTableSessions(client);

    let tableRes;
    if (qr_token) {
      tableRes = await client.query(
        "SELECT * FROM tables WHERE qr_token = $1 FOR UPDATE",
        [String(qr_token).trim()]
      );
    } else {
      const tableNum = parseInt(table_number, 10);
      if (Number.isNaN(tableNum) || tableNum <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Nomor meja tidak valid." });
      }
      tableRes = await client.query(
        "SELECT * FROM tables WHERE table_number = $1 FOR UPDATE",
        [tableNum]
      );
      if (tableRes.rows.length === 0 && tableNum <= 50) {
        const newQrToken = generateQrToken(tableNum);
        tableRes = await client.query(
          `INSERT INTO tables (table_number, qr_token, qr_code_url, status)
           VALUES ($1, $2, $3, 'available')
           RETURNING *`,
          [tableNum, newQrToken, `/order?qr=${newQrToken}`]
        );
      }
    }

    if (tableRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "QR Code meja tidak valid atau telah diperbarui oleh Admin. Silakan scan ulang QR di meja Anda.",
      });
    }

    let table = tableRes.rows[0];

    // Pastikan meja memiliki qr_token jika sebelumnya belum ada
    if (!table.qr_token) {
      const generatedQr = generateQrToken(table.table_number);
      const updatedQr = await client.query(
        "UPDATE tables SET qr_token = $1, qr_code_url = $2 WHERE id = $3 RETURNING *",
        [generatedQr, `/order?qr=${generatedQr}`, table.id]
      );
      table = updatedQr.rows[0];
    }

    const activeOrdersRes = await client.query(
      `SELECT id, order_number, customer_name, status, total_amount, created_at
       FROM orders
       WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled')
       ORDER BY created_at DESC`,
      [table.id]
    );
    const activeOrders = activeOrdersRes.rows;

    const now = new Date();
    const expiresAt = table.session_expires_at ? new Date(table.session_expires_at) : null;
    const isTimerActive = Boolean(expiresAt && expiresAt > now);
    const hasActiveOrders = activeOrders.length > 0;
    const isSessionLocked = Boolean(table.active_session_token) && (isTimerActive || hasActiveOrders);

    let isOwner = false;
    let lockedByOther = false;
    let sessionTokenToReturn = null;

    if (!isSessionLocked) {
      // Meja kosong / sesi sebelumnya sudah habis tanpa pesanan -> Buat sesi baru 15 menit
      const newSessionToken = crypto.randomBytes(16).toString("hex");
      const updateRes = await client.query(
        `UPDATE tables
         SET active_session_token = $1,
             session_expires_at = CURRENT_TIMESTAMP + ($2 || ' minutes')::interval,
             status = 'occupied'
         WHERE id = $3
         RETURNING *`,
        [newSessionToken, String(SESSION_DURATION_MINUTES), table.id]
      );
      table = updateRes.rows[0];
      isOwner = true;
      sessionTokenToReturn = newSessionToken;
    } else if (client_session_token && client_session_token === table.active_session_token) {
      // Perangkat ini adalah pemilik sah sesi meja
      isOwner = true;
      sessionTokenToReturn = table.active_session_token;

      // Jika pemegang sesi ingin tambah pesanan baru (renew) atau timer 15 menit sebelumnya habis tapi pesanan masih aktif
      if (renew || (!isTimerActive && hasActiveOrders)) {
        const updateRes = await client.query(
          `UPDATE tables
           SET session_expires_at = CURRENT_TIMESTAMP + ($1 || ' minutes')::interval,
               status = 'occupied'
           WHERE id = $2
           RETURNING *`,
          [String(SESSION_DURATION_MINUTES), table.id]
        );
        table = updateRes.rows[0];
      }
    } else {
      // Dikunci oleh pelanggan/HP lain! Cegah tabrakan pesanan
      isOwner = false;
      lockedByOther = true;
      sessionTokenToReturn = null;
    }

    await client.query("COMMIT");

    const io = req.app.get("io");
    if (io && isOwner) {
      io.emit("table_status_updated", {
        id: table.id,
        table_number: table.table_number,
        status: table.status,
        session_expires_at: table.session_expires_at,
        has_active_session: Boolean(table.active_session_token),
      });
    }

    res.json({
      success: true,
      is_owner: isOwner,
      locked_by_other: lockedByOther,
      session_token: sessionTokenToReturn,
      session_expires_at: table.session_expires_at,
      max_duration_minutes: SESSION_DURATION_MINUTES,
      table: {
        id: table.id,
        table_number: table.table_number,
        qr_token: table.qr_token,
        qr_code_url: table.qr_code_url,
        status: table.status,
        session_expires_at: table.session_expires_at,
        active_orders: activeOrders,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      success: false,
      message: "Gagal menginisialisasi sesi meja.",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 1c. Ambil Info 1 Meja berdasarkan Nomor Meja atau QR Token (beserta pesanan aktif)
router.get("/:tableIdentifier", async (req, res) => {
  try {
    await cleanupExpiredTableSessions();
    const identifier = String(req.params.tableIdentifier).trim();
    const tableNum = parseInt(identifier, 10);

    let tableRes;
    if (!Number.isNaN(tableNum) && String(tableNum) === identifier) {
      tableRes = await query("SELECT * FROM tables WHERE table_number = $1", [tableNum]);
    } else {
      tableRes = await query("SELECT * FROM tables WHERE qr_token = $1 OR id::text = $1", [identifier]);
    }

    if (tableRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });
    }

    const table = tableRes.rows[0];
    const activeOrdersRes = await query(
      `SELECT id, order_number, customer_name, status, total_amount, created_at
       FROM orders
       WHERE table_id = $1 AND status NOT IN ('completed', 'cancelled')
       ORDER BY created_at DESC`,
      [table.id]
    );

    res.json({
      success: true,
      table: {
        id: table.id,
        table_number: table.table_number,
        qr_token: table.qr_token,
        qr_code_url: table.qr_code_url,
        status: table.status,
        session_expires_at: table.session_expires_at,
        has_active_session: Boolean(table.active_session_token),
        active_orders: activeOrdersRes.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat detail meja.", error: error.message });
  }
});

// 2. Tambah Meja Baru (Admin)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { table_number } = req.body;
    if (!table_number) {
      return res.status(400).json({ success: false, message: "Nomor meja wajib diisi." });
    }

    const num = parseInt(table_number, 10);
    const qrToken = generateQrToken(num);
    const qrUrl = `/order?qr=${qrToken}`;
    const result = await query(
      `INSERT INTO tables (table_number, qr_token, qr_code_url, status)
       VALUES ($1, $2, $3, 'available')
       ON CONFLICT (table_number) DO UPDATE
       SET qr_token = COALESCE(tables.qr_token, EXCLUDED.qr_token),
           qr_code_url = COALESCE(tables.qr_code_url, EXCLUDED.qr_code_url)
       RETURNING *`,
      [num, qrToken, qrUrl]
    );

    res.status(201).json({ success: true, message: "Meja berhasil ditambahkan.", table: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menambahkan meja.", error: error.message });
  }
});

// 3. Acak Ulang (Regenerate) Token QR Code untuk 1 Meja
router.post("/:id/regenerate-qr", async (req, res) => {
  try {
    const { id } = req.params;
    const findRes = await query(
      "SELECT * FROM tables WHERE id::text = $1 OR table_number::text = $1",
      [String(id)]
    );

    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });
    }

    const table = findRes.rows[0];
    const newQrToken = generateQrToken(table.table_number);
    const newQrUrl = `/order?qr=${newQrToken}`;

    const updateRes = await query(
      `UPDATE tables
       SET qr_token = $1,
           qr_code_url = $2
       WHERE id = $3
       RETURNING *`,
      [newQrToken, newQrUrl, table.id]
    );

    res.json({
      success: true,
      message: `QR Code acak baru untuk Meja ${table.table_number} berhasil dibuat.`,
      table: updateRes.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengacak ulang QR Code meja.", error: error.message });
  }
});

// 4. Acak Ulang Semua QR Code Meja Sekaligus
router.post("/regenerate-all-qr", async (req, res) => {
  try {
    const allTables = await query("SELECT id, table_number FROM tables ORDER BY table_number ASC");
    const updated = [];
    for (const row of allTables.rows) {
      const newToken = generateQrToken(row.table_number);
      const newUrl = `/order?qr=${newToken}`;
      const r = await query(
        "UPDATE tables SET qr_token = $1, qr_code_url = $2 WHERE id = $3 RETURNING *",
        [newToken, newUrl, row.id]
      );
      updated.push(r.rows[0]);
    }
    res.json({
      success: true,
      message: "Seluruh QR Code meja berhasil diacak ulang.",
      tables: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengacak ulang seluruh QR meja.", error: error.message });
  }
});

// 5. Reset / Buka Kunci Sesi Meja secara Manual (Kasir / Admin)
router.post("/:id/reset-session", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE tables
       SET active_session_token = NULL,
           session_expires_at = NULL,
           status = 'available'
       WHERE id::text = $1 OR table_number::text = $1
       RETURNING *`,
      [String(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });
    }

    const updatedTable = result.rows[0];
    const io = req.app.get("io");
    if (io) {
      io.emit("table_status_updated", updatedTable);
    }

    res.json({
      success: true,
      message: `Sesi Meja ${updatedTable.table_number} berhasil di-reset dan siap digunakan pelanggan baru.`,
      table: updatedTable,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal me-reset sesi meja.", error: error.message });
  }
});

// 6. Ubah Status Meja (mendukung ID UUID maupun table_number)
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["available", "occupied"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status meja harus 'available' atau 'occupied'." });
    }

    const result = await query(
      `UPDATE tables
       SET status = $1,
           active_session_token = CASE WHEN $1 = 'available' THEN NULL ELSE active_session_token END,
           session_expires_at = CASE WHEN $1 = 'available' THEN NULL ELSE session_expires_at END
       WHERE id::text = $2 OR table_number::text = $2
       RETURNING *`,
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
