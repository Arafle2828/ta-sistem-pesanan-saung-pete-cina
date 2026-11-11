# Panduan Integrasi Supabase, Deployment, dan Git Push
## Sistem Informasi Pengelolaan Pesanan Saung Pete Cina

**Tanggal Penyusunan**: 11 November 2026  
**Target Sistem**: Frontend (React + Vite), Backend (Node.js + Express + Socket.IO), Database (Supabase PostgreSQL)

---

## 1. Arsitektur Komponen & Strategi Deployment

Sistem Saung Pete Cina memiliki 3 komponen utama dengan kebutuhan hosting yang berbeda:

```text
┌─────────────────────────────────┐
│     Pelanggan & Kasir / Dapur   │
│   (Mobile Browser / Komputer)   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   Frontend (React + Vite)       │  ==> Deploy ke: VERCEL
│   - Katalog Menu via QR         │      (Gratis, cepat, auto-deploy Git)
│   - Monitoring Status Pesanan   │
│   - Admin & Kasir Dashboard     │
└────────────────┬────────────────┘
                 │ (REST API & Socket.IO WebSocket)
                 ▼
┌─────────────────────────────────┐
│   Backend (Express + Socket.IO) │  ==> Deploy ke: RENDER / RAILWAY
│   - Real-time Order Engine      │      (Mendukung long-running WebSocket)
│   - Auth & Role Management      │      *JANGAN di Vercel Serverless*
│   - CRUD Menu, Meja, Laporan    │
└────────────────┬────────────────┘
                 │ (PostgreSQL Connection Pool + SSL)
                 ▼
┌─────────────────────────────────┐
│   Database (Cloud PostgreSQL)   │  ==> Menggunakan: SUPABASE
│   - 57 Menu Asli & 7 Kategori   │      (Managed PostgreSQL di Cloud)
│   - Data Meja, User, & Pesanan  │
└─────────────────────────────────┘
```

> ⚠️ **Mengapa Backend TIDAK Boleh di Vercel?**  
> Vercel bekerja dengan sistem **Serverless Functions** yang otomatis *sleep/mati* beberapa detik setelah request selesai. Padahal sistem antrean dapur dan live tracking pesanan meja mengandalkan **Socket.IO (WebSocket)** yang memerlukan koneksi jaringan aktif terus-menerus (*persistent connection*). Oleh karena itu:
> - **Frontend** di-deploy ke **Vercel**.
> - **Backend** di-deploy ke **Render.com** atau **Railway.app** (atau dijalankan di laptop lokal untuk demo sidang).
> - **Database** di-host di **Supabase**.

---

## 2. Langkah Integrasi Database ke Supabase

Projek ini telah dilengkapi dengan skrip migrasi dan seed data siap pakai di folder `supabase/`.

### Langkah 2.1: Buat Project Baru di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan login dengan akun GitHub Anda.
2. Klik tombol **New Project**.
3. Masukkan konfigurasi project:
   - **Name**: `db-saung-pete-cina` (atau sesuai keinginan).
   - **Database Password**: Buat password yang kuat dan **catat password ini**.
   - **Region**: Pilih yang terdekat (misal: `Singapore (ap-southeast-1)`).
   - **Pricing Plan**: `Free`.
4. Klik **Create new project** dan tunggu 1-2 menit hingga status database menjadi *Active*.

---

### Langkah 2.2: Eksekusi Migrasi Tabel & Seed Data di SQL Editor
Buka dashboard project Supabase Anda, lalu masuk ke menu **SQL Editor** (ikon `>_` pada menu kiri):

1. **Jalankan Skrip Inisialisasi Tabel (`0001_init.sql`)**:
   - Buka file lokal: `supabase/migrations/0001_init.sql`.
   - Salin seluruh kodenya, tempel ke tab baru di SQL Editor Supabase.
   - Klik tombol **Run**. Skrip ini akan membuat tabel: `users`, `tables`, `categories`, `menus`, `orders`, `order_items`, `payments`, dan `daily_expenses`.

2. **Jalankan Keamanan Data / RLS (`0002_rls.sql`)** *(Opsional tapi Disarankan)*:
   - Buka file lokal: `supabase/migrations/0002_rls.sql`.
   - Salin kodenya, tempel ke SQL Editor Supabase, lalu klik **Run**.

3. **Jalankan Data Master Asli (`seed.sql`)**:
   - Buka file lokal: `supabase/seed.sql`.
   - Salin seluruh isinya, tempel ke SQL Editor Supabase, lalu klik **Run**.
   - Skrip ini akan otomatis mengisi:
     - **3 Akun Staf**: Admin/Owner (`admin@spc.local`), Kasir (`kasir@spc.local`), Karyawan Dapur (`dapur@spc.local`).
     - **12 Meja Pelanggan** (Meja 01 s/d Meja 12).
     - **7 Kategori Menu Asli** (Best Seller, Makanan, Lauk, Soto, Sayuran, Minuman, Paket).
     - **57 Menu Asli Saung Pete Cina** lengkap dengan harga dan URL foto.

4. **Verifikasi Data**:
   - Klik menu **Table Editor** di bilah kiri Supabase.
   - Periksa tabel `menus` (harus berisi 57 baris) dan `categories` (harus berisi 7 baris).

---

### Langkah 2.3: Ambil Kredensial Database Supabase
1. Masuk ke menu **Project Settings** (ikon roda gigi di pojok kiri bawah) > pilih tab **Database**.
2. Gulir ke bagian **Connection parameters**:
   - **Host**: `db.xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: *(Password yang Anda buat pada Langkah 2.1)*

---

## 3. Konfigurasi Backend untuk Supabase

### Langkah 3.1: Konfigurasi `server/.env`
Buka file `server/.env` di komputer Anda, lalu perbarui variabel database:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=spc_secret_jwt_key_2026_super_secure

# Konfigurasi PostgreSQL Cloud Supabase
DB_HOST=db.xxxxxxxxxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=masukkan_password_supabase_kamu
DB_NAME=postgres
DB_SSL=true
```

### Langkah 3.2: Penanganan SSL di `server/src/config/db.js`
Koneksi ke Supabase mewajibkan enkripsi SSL. Pastikan konfigurasi pool di `server/src/config/db.js` mendukung kondisi lokal dan Supabase:

```javascript
import pkg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production" || process.env.DB_SSL === "true";

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "postgres",
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

---

## 4. Panduan Deployment

### Opsi A: Skenario Praktis Sidang Tugas Akhir (Hybrid Cloud)
Jika Anda butuh sistem yang stabil dan mudah dikontrol saat demo sidang:
1. **Database**: Aktif di Supabase Cloud (semua transaksi tersimpan di internet).
2. **Backend**: Dijalankan dari laptop (`npm run server`) pada `http://localhost:5000`.
3. **Frontend**: Dijalankan dari laptop (`npm run dev`) atau dibuka dari HP lewat jaringan WiFi yang sama menggunakan IP laptop (misal: `http://192.168.1.10:8443?table=01`).

---

### Opsi B: Skenario Full Cloud (Live di Internet)

#### 1. Deploy Backend ke Render.com (Gratis)
1. Buka [https://render.com](https://render.com) dan daftar via GitHub.
2. Klik **New +** > pilih **Web Service**.
3. Hubungkan repository GitHub Anda.
4. Konfigurasikan:
   - **Name**: `spc-api-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
5. Masuk ke bagian **Environment Variables** dan tambahkan isi dari `server/.env` (`DB_HOST`, `DB_PASSWORD`, `DB_USER`, `DB_NAME`, `DB_PORT`, `DB_SSL=true`, `JWT_SECRET`).
6. Klik **Create Web Service**. Setelah build selesai, Anda akan mendapatkan URL backend, contoh: `https://spc-api-backend.onrender.com`.

#### 2. Deploy Frontend ke Vercel (Gratis)
1. Buka [https://vercel.com](https://vercel.com) dan login via GitHub.
2. Klik **Add New...** > **Project** > Pilih repository Anda.
3. Konfigurasi Vercel:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (root repo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Masuk ke **Environment Variables**:
   - `VITE_API_URL` = `https://spc-api-backend.onrender.com/api` *(Arahkan ke backend Render)*
   - `VITE_SUPABASE_URL` = URL project Supabase Anda
   - `VITE_SUPABASE_ANON_KEY` = Anon key project Supabase Anda
5. Klik **Deploy**. Website siap diakses publik!

---

## 5. Panduan Melakukan Git Push ke GitHub

Jalankan perintah berikut di terminal / PowerShell root projek Anda:

### Langkah 5.1: Cek File yang Akan Di-commit
Pastikan file rahasia seperti `.env` dan `node_modules/` **tidak masuk** ke daftar commit:
```bash
git status
```

### Langkah 5.2: Simpan dan Commit Perubahan
```bash
# Tambahkan semua perubahan file dokumentasi dan kode
git add .

# Beri pesan commit yang jelas
git commit -m "docs: panduan integrasi supabase, deployment, dan pembaruan arsitektur"
```

### Langkah 5.3: Hubungkan ke Remote GitHub & Push
Jika repo GitHub Anda baru dibuat dan belum dihubungkan:
```bash
# Ubah branch utama menjadi main
git branch -M main

# Tambahkan URL repository GitHub Anda (ganti username dan repo-name)
git remote add origin https://github.com/<username-github-kamu>/<nama-repo>.git

# Push ke GitHub
git push -u origin main
```

Jika repository lokal sudah terhubung sebelumnya ke GitHub, Anda cukup menjalankan:
```bash
git push
```

