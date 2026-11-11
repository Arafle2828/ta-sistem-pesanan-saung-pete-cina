import pkg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // Tambahkan ini untuk koneksi Supabase
});
pool.on("connect", () => {
  console.log("✅ Terhubung ke database PostgreSQL:", process.env.DB_NAME || "db_saoengpetecina");
});

pool.on("error", (err) => {
  console.error("❌ Kesalahan database PostgreSQL:", err.message);
});

export const query = (text, params) => pool.query(text, params);
