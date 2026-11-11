import express from "express";
import { query } from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Semua rute laporan diproteksi untuk Admin / Pemilik
router.use(authenticate, requireRole("admin"));

// 1. Ringkasan Dashboard Hari Ini (Summary Cards)
router.get("/summary", async (req, res) => {
  try {
    // Total transaksi & pendapatan hari ini
    const todaySales = await query(`
      SELECT COUNT(id) AS total_transactions,
             COALESCE(SUM(amount_paid), 0) AS total_revenue
      FROM payments
      WHERE DATE(paid_at) = CURRENT_DATE AND payment_status = 'paid'
    `);

    // Pesanan sedang diproses di dapur (aktif)
    const activeOrders = await query(`
      SELECT COUNT(id) AS active_orders_count
      FROM orders
      WHERE status IN ('new', 'processing', 'preparing', 'ready')
    `);

    // Menu terlaris hari ini
    const topMenu = await query(`
      SELECT m.name, SUM(oi.quantity) AS total_sold
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = CURRENT_DATE AND o.status != 'cancelled'
      GROUP BY m.id, m.name
      ORDER BY total_sold DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      summary: {
        total_transactions_today: parseInt(todaySales.rows[0].total_transactions, 10),
        total_revenue_today: parseFloat(todaySales.rows[0].total_revenue),
        active_orders: parseInt(activeOrders.rows[0].active_orders_count, 10),
        top_menu_today: topMenu.rows.length > 0 ? topMenu.rows[0].name : "Belum ada transaksi",
      },
    });
  } catch (error) {
    console.error("Report summary error:", error);
    res.status(500).json({ success: false, message: "Gagal memuat ringkasan laporan.", error: error.message });
  }
});

// 2. Grafik Tren Penjualan Harian (7 Hari Terakhir / Range Tanggal)
router.get("/sales-chart", async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const sql = `
      WITH days_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '1 day' * ($1 - 1),
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      ),
      daily_pay AS (
        SELECT DATE(paid_at) AS day,
               COUNT(id) AS transactions,
               COALESCE(SUM(amount_paid), 0) AS revenue
        FROM payments
        WHERE payment_status = 'paid'
        GROUP BY DATE(paid_at)
      ),
      daily_exp AS (
        SELECT expense_date AS day,
               COALESCE(SUM(amount), 0) AS expenses
        FROM expenses
        GROUP BY expense_date
      )
      SELECT CASE EXTRACT(ISODOW FROM d.day)
               WHEN 1 THEN 'Sen'
               WHEN 2 THEN 'Sel'
               WHEN 3 THEN 'Rab'
               WHEN 4 THEN 'Kam'
               WHEN 5 THEN 'Jum'
               WHEN 6 THEN 'Sab'
               WHEN 7 THEN 'Min'
             END AS day_name,
             TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
             COALESCE(p.transactions, 0)::int AS transactions,
             COALESCE(p.revenue, 0)::numeric AS revenue,
             COALESCE(e.expenses, 0)::numeric AS expenses
      FROM days_series d
      LEFT JOIN daily_pay p ON p.day = d.day
      LEFT JOIN daily_exp e ON e.day = d.day
      ORDER BY d.day ASC
    `;

    const result = await query(sql, [parseInt(days, 10)]);
    res.json({ success: true, chartData: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat grafik penjualan.", error: error.message });
  }
});

// 3. Daftar Menu Terlaris (Best Seller)
router.get("/best-sellers", async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const sql = `
      SELECT m.id, m.name, m.price,
             SUM(oi.quantity) AS sold,
             SUM(oi.subtotal) AS revenue
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY m.id, m.name, m.price
      ORDER BY sold DESC
      LIMIT $1
    `;

    const result = await query(sql, [parseInt(limit, 10)]);
    res.json({ success: true, bestSellers: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat menu terlaris.", error: error.message });
  }
});

// 4. Laporan Rinci Transaksi untuk Export PDF/Excel
router.get("/transactions", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let sql = `
      SELECT o.order_number, o.created_at, o.customer_name, o.order_type,
             t.table_number,
             p.payment_method, p.amount_paid, p.paid_at,
             u.name AS cashier_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      JOIN payments p ON o.id = p.order_id
      LEFT JOIN users u ON p.cashier_id = u.id
      WHERE p.payment_status = 'paid'
    `;
    const params = [];

    if (start_date) {
      params.push(start_date);
      sql += ` AND DATE(p.paid_at) >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      sql += ` AND DATE(p.paid_at) <= $${params.length}`;
    }

    sql += ` ORDER BY p.paid_at DESC`;

    const result = await query(sql, params);
    res.json({ success: true, transactions: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat riwayat transaksi.", error: error.message });
  }
});

export default router;
