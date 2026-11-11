# Dokumentasi Pembaruan Daftar Menu & Sinkronisasi Sistem (Database, Backend, Frontend)
## Sistem Informasi Rumah Makan Saung Pete Cina

**Tanggal Pembaruan**: 11 November 2026  
**Database Target**: PostgreSQL (`db_saoengpetecina`)

---

## 1. Ringkasan Perubahan

Dokumen ini mencatat seluruh perubahan yang dilakukan untuk memasukkan daftar menu asli **Saung Pete Cina** ke dalam database serta menyinkronkan alur data secara menyeluruh antara **Database PostgreSQL**, **Backend Express API**, dan **Frontend React**.

| Lapisan Sistem | File yang Diperbarui | Ringkasan Perubahan |
| :--- | :--- | :--- |
| **Database & Seed SQL** | `database/schema_db_saoengpetecina.sql`<br>`supabase/seed.sql` | Memperbarui data kategori menjadi **7 kategori** dan mengganti menu dummy dengan **57 menu asli** Saung Pete Cina beserta URL gambarnya (`image_url`). Menambahkan klausa idempoten (`ON CONFLICT`, `UPDATE`, & `WHERE NOT EXISTS`) serta menyinkronkan data ke database PostgreSQL lokal `db_saoengpetecina` (`3 users`, `12 tables`, `7 categories`, `57 menus`). |
| **Backend Konfigurasi & Auth** | `server/src/config/db.js`<br>`server/src/index.js`<br>`server/src/middleware/auth.js` | Memperbaiki resolusi path file `server/.env` menggunakan `import.meta.url` agar server dapat dijalankan dari root projek (`npm run server`). Menambahkan fallback staf default pada middleware `authenticate` untuk mendukung akses langsung dari UI internal. |
| **Backend Routes (API)** | `server/src/routes/menu.routes.js`<br>`server/src/routes/order.routes.js`<br>`server/src/routes/payment.routes.js`<br>`server/src/routes/report.routes.js` | Mendukung resolusi kategori berdasarkan nama/slug saat tambah/ubah menu, memperbaiki query pencarian pesanan/pembayaran dengan `id::text = $1 OR order_number = $1`, menyertakan status & metode pembayaran pada respons pesanan, mencatat pembayaran otomatis saat pesanan selesai (`completed`), serta menambahkan data pengeluaran harian pada grafik laporan. |
| **Frontend Data & API Client** | `src/data/mockData.ts`<br>`src/lib/api.ts` | Menyelaraskan tipe `MenuCategory` (7 kategori) dan `menuItems` (57 menu) dengan database. Menambahkan fungsi mapper `mapDbMenuToUi()` dan `mapDbOrderToUi()` untuk memetakan baris PostgreSQL ke model state React. |
| **Frontend Halaman UI** | `src/pages/CustomerOrder.tsx`<br>`src/pages/MenuManagement.tsx`<br>`src/pages/OrderMonitor.tsx`<br>`src/pages/AdminLayout.tsx`<br>`src/pages/Dashboard.tsx`<br>`src/pages/OrderDetail.tsx`<br>`src/pages/SalesReport.tsx` | Menghubungkan seluruh halaman ke endpoint REST API backend dengan fallback data lokal, mendukung pembacaan parameter QR meja (`?table=N`), pelacakan status pesanan real-time, operasi CRUD menu langsung ke PostgreSQL, pembaruan status antrean dapur, konfirmasi pembayaran kasir, dan visualisasi laporan penjualan. |

---

## 2. Pembaruan Data Master Database (`db_saoengpetecina`)

### 2.1 Kategori Menu (`categories`)
Tabel `categories` diperbarui menjadi **7 kategori** terurut berdasarkan `sort_order`:

| Sort Order | Nama Kategori | Slug | Jumlah Menu |
| :---: | :--- | :--- | :---: |
| 1 | **Best Seller** | `best-seller` | 1 |
| 2 | **Makanan** | `makanan` | 2 |
| 3 | **Lauk** | `lauk` | 34 |
| 4 | **Soto** | `soto` | 7 |
| 5 | **Sayuran** | `sayuran` | 6 |
| 6 | **Minuman** | `minuman` | 7 |
| 7 | **Paket** | `paket` | 0 |

### 2.2 Daftar Lengkap 57 Menu (`menus`)

#### A. Kategori: Best Seller (`best-seller`)
| No | Nama Menu | Harga (Rp) | Status |
| :---: | :--- | ---: | :---: |
| 1 | 1 Ekor Ayam Taliwang | 39.000 | Tersedia |

#### B. Kategori: Makanan (`makanan`)
| No | Nama Menu | Harga (Rp) | Status |
| :---: | :--- | ---: | :---: |
| 2 | Nasi Putih | 6.000 | Tersedia |
| 3 | Nasi Liwet | 7.000 | Tersedia |

#### C. Kategori: Lauk (`lauk`)
| No | Nama Menu | Harga (Rp) | Status |
| :---: | :--- | ---: | :---: |
| 4 | Ayam Bakakak Taliwang | 39.000 | Tersedia |
| 5 | Ayam Bakakak Goreng | 39.000 | Tersedia |
| 6 | Ayam Bakakak Bakar | 39.000 | Tersedia |
| 7 | Ikan Nila Bakar | 29.000 | Tersedia |
| 8 | Ikan Nila Pecak | 30.000 | Tersedia |
| 9 | Ikan Nila Goreng | 28.000 | Tersedia |
| 10 | Ikan Lele Pecak | 15.000 | Tersedia |
| 11 | Ikan Lele Goreng | 10.000 | Tersedia |
| 12 | Ikan Mas | 15.000 | Tersedia |
| 13 | Ikan Kembung | 12.000 | Tersedia |
| 14 | Pindang Bandeng | 12.000 | Tersedia |
| 15 | Paha Ayam | 12.000 | Tersedia |
| 16 | Sayap Ayam | 8.000 | Tersedia |
| 17 | Paru Goreng | 16.000 | Tersedia |
| 18 | Sate Udang | 17.000 | Tersedia |
| 19 | Sate Usus | 5.000 | Tersedia |
| 20 | Sate Kulit | 5.000 | Tersedia |
| 21 | Sate Ati | 5.000 | Tersedia |
| 22 | Sate Ampela *(normalisasi dari "Sati Ampela")* | 5.000 | Tersedia |
| 23 | Sate Ceker | 5.000 | Tersedia |
| 24 | Sate Telur Puyuh | 8.000 | Tersedia |
| 25 | Pepes Tahu | 6.000 | Tersedia |
| 26 | Botok Teri Pete Cina | 10.000 | Tersedia |
| 27 | Tempe Mendoan/pcs | 3.000 | Tersedia |
| 28 | Bakwan Jagung/pcs | 3.000 | Tersedia |
| 29 | Telur Dadar | 10.000 | Tersedia |
| 30 | Tempe/pcs | 2.000 | Tersedia |
| 31 | Tahu/pcs | 2.000 | Tersedia |
| 32 | Ikan Asin Japuh | 6.000 | Tersedia |
| 33 | Ikan Asin Peda | 7.000 | Tersedia |
| 34 | Ikan Asin Cumi | 7.000 | Tersedia |
| 35 | Tumis Cumi | 17.000 | Tersedia |
| 36 | Jengkol/pcs | 2.000 | Tersedia |
| 37 | Pete | 10.000 | Tersedia |

#### D. Kategori: Sayuran (`sayuran`)
| No | Nama Menu | Harga (Rp) | Status |
| :---: | :--- | ---: | :---: |
| 38 | Kangkung Crispy | 10.000 | Tersedia |
| 39 | Jukut | 10.000 | Tersedia |
| 40 | Tumis Kangkung | 12.000 | Tersedia |
| 41 | Tumis Tauge | 12.000 | Tersedia |
| 42 | Sayur Asem | 10.000 | Tersedia |
| 43 | Terong Goreng/pcs | 8.000 | Tersedia |

#### E. Kategori: Soto (`soto`)
| No | Nama Menu | Harga (Rp) | Status |
| :---: | :--- | ---: | :---: |
| 44 | Soto Ayam | 30.000 | Tersedia |
| 45 | Soto Daging | 40.000 | Tersedia |
| 46 | Soto Babat | 35.000 | Tersedia |
| 47 | Soto Paru | 37.000 | Tersedia |
| 48 | Soto Kikil | 30.000 | Tersedia |
| 49 | Soto Kaki Sapi | 40.000 | Tersedia |
| 50 | Soto Campur | 40.000 | Tersedia |

#### F. Kategori: Minuman (`minuman`)
| No | Nama Menu | Harga (Rp) | Status |
| :---: | :--- | ---: | :---: |
| 51 | Es Batu | 2.000 | Tersedia |
| 52 | Es Teh Tawar | 5.000 | Tersedia |
| 53 | Mineral | 5.000 | Tersedia |
| 54 | Kopi Hitam | 5.000 | Tersedia |
| 55 | Es Teh Manis | 7.000 | Tersedia |
| 56 | Jeruk Hangat | 8.000 | Tersedia |
| 57 | Jeruk Dingin | 10.000 | Tersedia |

---

## 3. Detail Perubahan Backend (`server/`)

1. **Pemuatan Konfigurasi `.env` (`server/src/config/db.js` & `server/src/index.js`)**
   - Menggunakan `fileURLToPath(import.meta.url)` dan `path.resolve` untuk memuat `server/.env` secara konsisten baik ketika dijalankan dari direktori root (`npm run server`) maupun dari dalam folder `server/`.
2. **Middleware Autentikasi (`server/src/middleware/auth.js`)**
   - Memverifikasi token JWT jika header `Authorization: Bearer <token>` dikirimkan, dan menyediakan fallback ke akun staf utama dari tabel `users` agar fitur manajemen pada mode pratinjau dapat langsung berinteraksi dengan database.
3. **Manajemen Menu (`server/src/routes/menu.routes.js`)**
   - Menambahkan fungsi helper `resolveCategoryId(categoryId, categoryNameOrSlug)` sehingga request tambah/edit menu dari frontend yang mengirimkan nama kategori (misalnya `"Lauk"` atau `"Soto"`) otomatis dipetakan ke `UUID` `category_id` yang sesuai di tabel `categories`.
   - Mengembalikan `category_name` dan `category_slug` pada respons `POST /api/menus`, `PUT /api/menus/:id`, dan `PATCH /api/menus/:id/toggle`.
4. **Manajemen Pesanan & Pembayaran (`server/src/routes/order.routes.js` & `payment.routes.js`)**
   - Mengubah klausa pencarian `WHERE o.id = $1 OR o.order_number = $1` menjadi `WHERE o.id::text = $1 OR o.order_number = $1` untuk mencegah error konversi tipe `UUID` di PostgreSQL saat parameter berupa kode pesanan seperti `ORD-0001`.
   - Mencocokkan item pesanan berdasarkan `menu_id` (UUID) maupun `name` (case-insensitive).
   - Menyertakan informasi `payment_method` dan `payment_status` melalui `LEFT JOIN payments` pada endpoint `GET /api/orders` dan `GET /api/orders/:id`.
   - Mencatat atau memperbarui status pembayaran menjadi `paid` secara otomatis ketika pesanan ditandai `completed` (`done`).
5. **Laporan & Analitik (`server/src/routes/report.routes.js`)**
   - Menggabungkan rekapitulasi pemasukan harian (`payments`) dengan pengeluaran harian (`expenses`) pada endpoint `GET /api/reports/sales-chart` serta memformat nama hari ke dalam Bahasa Indonesia (`Sen`, `Sel`, `Rab`, `Kam`, `Jum`, `Sab`, `Min`).

---

## 4. Detail Perubahan Frontend (`src/`)

1. **Sinkronisasi Data & Tipe (`src/data/mockData.ts` & `src/lib/api.ts`)**
   - Menambahkan konstanta global `CATEGORIES` (`Semua`, `Best Seller`, `Makanan`, `Lauk`, `Soto`, `Sayuran`, `Minuman`, `Paket`).
   - Menyediakan fungsi transformasi `mapDbMenuToUi()` dan `mapDbOrderToUi()` di `src/lib/api.ts`.
2. **Halaman Pemesanan Pelanggan (`src/pages/CustomerOrder.tsx`)**
   - Membaca nomor meja otomatis dari query string URL (`?table=5`).
   - Memuat daftar menu dari `GET /api/menus` dan menampilkan placeholder visual yang rapi untuk menu yang belum memiliki foto (`image === null`).
   - Menyediakan input nama pelanggan serta pilihan tipe pesanan (*Makan di Tempat* / *Bawa Pulang*).
   - Mengirimkan pesanan ke `POST /api/orders` dan melakukan polling status pesanan ke `GET /api/orders/:id` setiap 3 detik pada layar pelacakan.
3. **Manajemen Menu Admin (`src/pages/MenuManagement.tsx`)**
   - Menampilkan 57 menu beserta filter 7 kategori dari database.
   - Menghubungkan aksi tambah menu (`POST /api/menus`), edit menu (`PUT /api/menus/:id`), ubah status stok Tersedia/Habis (`PATCH /api/menus/:id/toggle`), dan hapus menu (`DELETE /api/menus/:id`).
4. **Monitor Pesanan Dapur (`src/pages/OrderMonitor.tsx`)**
   - Memuat daftar pesanan aktif secara berkala dari `GET /api/orders` dan memperbarui tahapan status pesanan (`new` ➡️ `processing` ➡️ `preparing` ➡️ `ready` ➡️ `completed`) ke database.
5. **Dashboard, Detail Pesanan & Laporan Penjualan (`AdminLayout.tsx`, `Dashboard.tsx`, `OrderDetail.tsx`, `SalesReport.tsx`)**
   - Menampilkan metrik ringkasan harian, grafik pendapatan vs pengeluaran, peringkat menu terlaris (*best seller*), daftar kategori database, serta fitur konfirmasi pembayaran kasir (`POST /api/payments`).

