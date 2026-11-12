import pkg from "pg";
import crypto from "node:crypto";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pkg;

const rawHost = (process.env.DB_HOST || "localhost")
  .replace(/^https?:\/\//i, "")
  .replace(/\/.*$/, "");

const isRemoteSsl =
  process.env.DB_SSL === "true" ||
  rawHost.includes("supabase.co") ||
  rawHost.includes("supabase.com");

export const pool = new Pool({
  host: rawHost,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_saoengpetecina",
  ssl: isRemoteSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
pool.on("connect", () => {
  console.log("✅ Terhubung ke database PostgreSQL:", process.env.DB_NAME || "db_saoengpetecina");
});

pool.on("error", (err) => {
  console.error("❌ Kesalahan database PostgreSQL:", err.message);
});

export const query = (text, params) => pool.query(text, params);

export function generateQrToken(tableNumber) {
  const rand = crypto.randomBytes(6).toString("hex");
  return `spc-m${tableNumber}-${rand}`;
}

export async function ensureTableQrSessionSchema() {
  try {
    await pool.query(`
      ALTER TABLE tables
        ADD COLUMN IF NOT EXISTS qr_token VARCHAR(64) UNIQUE,
        ADD COLUMN IF NOT EXISTS active_session_token VARCHAR(64),
        ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMP WITH TIME ZONE;
    `);

    await pool.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS session_token VARCHAR(64);
    `);

    const tablesWithoutToken = await pool.query(
      "SELECT id, table_number FROM tables WHERE qr_token IS NULL OR qr_code_url IS NULL OR qr_code_url NOT LIKE '/order?qr=%'"
    );

    for (const row of tablesWithoutToken.rows) {
      const token = generateQrToken(row.table_number);
      const qrUrl = `/order?qr=${token}`;
      await pool.query(
        "UPDATE tables SET qr_token = COALESCE(qr_token, $1), qr_code_url = '/order?qr=' || COALESCE(qr_token, $1) WHERE id = $2",
        [token, row.id]
      );
    }
    console.log("🔒 Skema QR Token & Sesi Meja siap digunakan.");
  } catch (err) {
    console.warn("⚠️ Gagal menjalankan auto-migrasi skema sesi meja:", err.message);
  }
}
