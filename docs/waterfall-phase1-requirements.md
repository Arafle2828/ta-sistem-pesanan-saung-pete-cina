# Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL)
## Tahap 1 Metode Waterfall: Analisis Kebutuhan (Requirements Specification)

**Judul Tugas Akhir**: RANCANG BANGUN SISTEM PENGELOLAAN PESANAN DAN LAPORAN PENJUALAN TERINTEGRASI BERBASIS WEB PADA SAOENG PETE CINA  
**Objek Penelitian**: Rumah Makan Saung Pete Cina  
**Tanggal**: 22 September 2026  

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL) ini disusun sebagai hasil akhir dari **Tahap 1 (Analisis Kebutuhan)** dalam metode pengembangan **Waterfall**. Dokumen ini bertujuan untuk mendefinisikan secara spesifik kebutuhan fungsional, kebutuhan non-fungsional, karakteristik pengguna, serta batasan sistem yang akan dibangun untuk rumah makan Saung Pete Cina.

### 1.2 Ruang Lingkup Sistem
Sistem yang dibangun adalah aplikasi berbasis web (*web-based application*) yang mengintegrasikan 3 fungsi inti operasional rumah makan Saung Pete Cina:
1. **Pemesanan Menu Berbasis QR Code**: Pelanggan dapat memindai QR Code di meja makan untuk melihat katalog menu, memilih opsi makanan/minuman (makan di tempat / dibawa pulang), dan mengirim pesanan tanpa antre.
2. **Monitoring Pesanan Real-time**: Layar pemantauan dapur/karyawan yang menampilkan daftar pesanan secara *real-time* berdasarkan status (*Pesanan Baru* ➡️ *Diproses* ➡️ *Sedang Disiapkan* ➡️ *Siap Diantar* ➡️ *Selesai*), sekaligus memberikan *live status tracking* pada perangkat HP pelanggan.
3. **Laporan Penjualan & Analytics Omset**: Dashboard khusus Pemilik/Admin untuk mengelola data master menu, mencetak struk transaksi digital/PDF, serta menyajikan analisis grafik penjualan harian, mingguan, bulanan, dan identifikasi menu terlaris (*best seller*).

---

## 2. Deskripsi Umum Sistem

### 2.1 Identifikasi Aktor (Pengguna Sistem)

| Aktor | Deskripsi & Hak Akses | Perangkat Utama |
| :--- | :--- | :--- |
| **Pelanggan (Customer)** | Mengakses antarmuka pemesanan via scan QR Code Meja. Tidak memerlukan proses registrasi/login. Memilih menu, mengisi nama & nomor meja, mengirim pesanan, serta memantau status pesanan secara *real-time*. | Smartphone (Mobile Web Browser) |
| **Karyawan Dapur (Kitchen Staff)** | Mengakses antarmuka *Kitchen Monitoring Board*. Menerima notifikasi pesanan masuk, memantau rincian pesanan per meja, dan mengubah status pesanan hingga siap disajikan. | Tablet / Laptop / PC Dapur |
| **Kasir (Cashier)** | Mengakses antarmuka kasir untuk mengonfirmasi transaksi pembayaran (Tunai, Debit, QRIS), mengubah status pesanan menjadi selesai, dan mencetak/generate struk digital PDF. | PC Kasir / Tablet |
| **Pemilik / Admin (Owner)** | Akses penuh ke *Admin Dashboard*. Mengelola master data menu, harga, stok, data meja, me-generate QR Code meja, serta melihat dan mendownload Laporan Penjualan. | Laptop / PC Pemilik |

---

## 3. Kebutuhan Fungsional (Functional Requirements / SKPL-F)

### 3.1 Modul Pelanggan (Customer Ordering UI)
- **SKPL-F-01 [Akses via QR Code]**: Sistem harus dapat menampilkan halaman katalog menu secara otomatis sesuai dengan nomor meja berdasarkan parameter URL QR Code (contoh: `/order?table=05`).
- **SKPL-F-02 [Katalog Menu Interaktif]**: Sistem harus menyajikan katalog menu berdasarkan kategori (Semua, Makanan, Lauk, Sayuran, Minuman, Paket) lengkap dengan foto, nama, harga (Rupiah), deskripsi singkat, dan badge status stok (*Tersedia* / *Habis*).
- **SKPL-F-03 [Pilihan Tipe Pesanan]**: Sistem harus menyediakan pilihan apakah pelanggan ingin *Makan di Tempat (Dine-in)* atau *Dibawa Pulang (Takeaway)*.
- **SKPL-F-04 [Keranjang & Catatan Pesanan]**: Pelanggan dapat menambah/mengurangi jumlah pesanan, memberikan catatan khusus per item (misal: "tanpa pedas"), serta melihat total biaya secara akurat.
- **SKPL-F-05 [Submit Pesanan & ID Pesanan]**: Sistem harus membuat ID Pesanan unik (contoh: `#SPC-1024`) dan menyimpan pesanan ke database saat pelanggan menekan tombol *Kirim Pesanan*.
- **SKPL-F-06 [Real-time Status Tracking]**: Sistem harus menampilkan garis waktu (*timeline status*) progres pesanan di HP pelanggan secara otomatis tanpa perlu melakukan refresh halaman manual (*Pesanan Diterima* ➡️ *Diproses* ➡️ *Disiapkan* ➡️ *Siap* ➡️ *Selesai*).

### 3.2 Modul Monitoring Pesanan Dapur & Karyawan
- **SKPL-F-07 [Kitchen Display Board]**: Sistem harus menampilkan papan Kanban/kolom pesanan real-time untuk koki/karyawan yang terbagi dalam 5 status.
- **SKPL-F-08 [Update Status Pesanan]**: Karyawan dapat mengubah status pesanan dengan satu kali klik (contoh: *Terima Pesanan*, *Tandai Siap*).
- **SKPL-F-09 [Notifikasi Visual & Suara Pesanan Baru]**: Sistem harus memicu indikator visual dan sinyal suara ketika ada pesanan baru yang dikirim oleh pelanggan.

### 3.3 Modul Kasir & Cetak Struk Digital
- **SKPL-F-10 [Verifikasi Pembayaran]**: Kasir dapat memilih metode pembayaran (Cash / Debit / QRIS) dan mencatat nominal uang tunai / bukti bayar.
- **SKPL-F-11 [Cetak Struk PDF / Digital Receipt]**: Sistem harus dapat membuat dan mengunduh berkas PDF struk belanja digital yang memuat detail rincian menu, subtotal, pajak, tipe bayar, tanggal, dan nomor meja.

### 3.4 Modul Admin & Pemilik (Owner Dashboard)
- **SKPL-F-12 [CRUD Master Menu & Kategori]**: Admin dapat menambah, mengubah harga, mengunggah foto, dan mengubah ketersediaan menu (*Tersedia* / *Habis*).
- **SKPL-F-13 [Manajemen Meja & QR Code Generator]**: Admin dapat mendaftarkan nomor meja baru dan mengunduh QR Code meja berformat gambar/PDF untuk dicetak.
- **SKPL-F-14 [Dashboard Ringkasan Omset]**: Menampilkan widget total pendapatan hari ini, total transaksi harian, jumlah pesanan aktif, dan grafik tren penjualan.
- **SKPL-F-15 [Laporan Penjualan & Analytics]**: 
  - Menyajikan filter rentang tanggal (Hari Ini, Minggu Ini, Bulan Ini, Custom Date).
  - Menampilkan tabel rekapitulasi penjualan, analisis menu terlaris (*best seller*), omset bersih, dan pengeluaran.
  - Ekspor laporan penjualan ke format PDF / Excel.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements / SKPL-NF)

### 4.1 Kinerja (Performance)
- **SKPL-NF-01 [Waktu Respon Page Load]**: Halaman web pelanggan harus dimuat dalam waktu < 2 detik pada jaringan 4G/WiFi standar.
- **SKPL-NF-02 [Real-time Latency]**: Latensi pembaruan status pesanan antara HP pelanggan dan papan monitoring dapur harus < 1 detik.

### 4.2 Kehandalan & Ketersediaan (Reliability & Availability)
- **SKPL-NF-03 [Uptime]**: Sistem diproyeksikan memiliki ketersediaan 99.5% menggunakan cloud infrastructure (Vercel + Supabase).
- **SKPL-NF-04 [Data Consistency]**: Transaksi penjualan dan perubahan stok menu harus bersifat atomic (ACID compliant).

### 4.3 Kemudahan Penggunaan & Estetika (Usability & Design)
- **SKPL-NF-05 [Mobile-first Design]**: Halaman pelanggan didesain khusus antarmuka smartphone (*responsive Mobile UI*).
- **SKPL-NF-06 [Earthy Visual Identity]**: Mengikuti skema warna resmi Saung Pete Cina (Dark Green `#2F5D50`, Deep Green `#23463D`, Wood Brown `#8B5E3C`, Light Beige `#F7F3EA`) dan font *Plus Jakarta Sans*.

### 4.4 Keamanan (Security)
- **SKPL-NF-07 [Akses Kontrol Staf]**: Halaman Admin/Kasir/Dapur dilindungi autentikasi Supabase Auth (email + password) dengan pembatasan akses per role (`admin`, `cashier`, `kitchen`) melalui Row Level Security.
- **SKPL-NF-08 [Validasi Input & Sanitasi]**: Semua form pemesanan dan input data disanitasi untuk mencegah serangan SQL Injection dan XSS.

---

## 5. Spesifikasi Lingkungan Teknologi (Tech Stack & Environment)

- **Frontend Application**: React 19 (Vite) + Tailwind CSS v4 + Lucide Icons + Recharts.
- **Backend Services**: Node.js (Express) + Supabase Realtime Subscriptions.
- **Database Engine**: PostgreSQL (Hosted via Supabase).
- **Format Laporan & Struk**: Client-side PDF Generation (`jspdf` / `html2canvas`).
- **Deployment Platform**: Vercel (Frontend Client & API) + Supabase Cloud.

---

## 6. Matrix Keterlacakan (Traceability Matrix Waterfall Phase 1)

| ID Kebutuhan | Nama Fitur | Modul Terkait | Prioritas |
| :--- | :--- | :--- | :--- |
| **SKPL-F-01** | Pemesanan via QR Code Meja | Customer UI | High (Tinggi) |
| **SKPL-F-02** | Katalog Menu Interaktif & Filter | Customer UI | High (Tinggi) |
| **SKPL-F-06** | Real-time Status Tracking Pesanan | Customer UI | High (Tinggi) |
| **SKPL-F-07** | Kitchen Order Monitoring Board | Kitchen Display | High (Tinggi) |
| **SKPL-F-11** | Cetak Struk Digital PDF | Cashier UI | Medium (Sedang) |
| **SKPL-F-12** | CRUD Menu & Kategori | Admin Dashboard | High (Tinggi) |
| **SKPL-F-13** | QR Code Meja Generator | Admin Dashboard | High (Tinggi) |
| **SKPL-F-15** | Laporan Penjualan & Analytics Omset | Admin/Owner Dashboard | High (Tinggi) |

---
*Dokumen ini merupakan hasil penyelesaian Tahap 1 (Analisis Kebutuhan) Metode Waterfall dan siap menjadi acuan untuk Tahap 2 (Perancangan Sistem & Database ERD).*
