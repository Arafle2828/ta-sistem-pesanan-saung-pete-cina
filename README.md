# 🍽️ Rancang Bangun Sistem Pemesanan Menu, Monitoring Pesanan, dan Laporan Penjualan pada Saung Pete Cina Berbasis Web Menggunakan QR Code dengan Metode Waterfall

Selamat datang di repositori resmi Tugas Akhir pengembangan sistem informasi rumah makan Saung Pete Cina.

---

## 📌 Latar Belakang & Deskripsi Projek

Perkembangan teknologi informasi memberikan peluang bagi pelaku usaha di bidang kuliner untuk meningkatkan efektivitas dan efisiensi dalam menjalankan kegiatan operasional. Pemanfaatan sistem informasi dapat membantu proses pengelolaan data, pemesanan, pemantauan kegiatan operasional, serta penyajian informasi secara lebih cepat dan terorganisir. Hal tersebut menjadi semakin penting bagi rumah makan yang memiliki jumlah pelanggan cukup banyak dan membutuhkan proses pelayanan yang cepat dan tepat.

**Saung Pete Cina** merupakan salah satu rumah makan yang telah beroperasi sejak tahun 2023 dan memiliki sekitar 12–14 karyawan. Berdasarkan hasil wawancara dengan pemilik Saung Pete Cina, jumlah pelanggan yang datang rata-rata mencapai 50–100 pelanggan per hari dengan layanan makan di tempat maupun dibawa pulang. Dalam proses pemesanan, pelanggan mengambil menu pada bagian prasmanan dan pesanan tersebut disampaikan kepada karyawan yang kemudian meneruskannya kepada bagian dapur untuk diproses. Proses tersebut masih melibatkan penyampaian informasi secara manual antarbagian.

Proses pemesanan yang masih dilakukan secara manual menimbulkan beberapa kendala dalam kegiatan operasional. Berdasarkan hasil wawancara, pernah terjadi pesanan yang tidak tercatat karena pelanggan mengambil menu tetapi tidak tercatat oleh karyawan. Kondisi tersebut dapat menyebabkan ketidaksesuaian antara pesanan pelanggan dengan informasi yang diterima oleh bagian dapur. Kesalahan pencatatan juga dapat terjadi baik dari pihak pelanggan maupun karyawan.

Selain permasalahan dalam pencatatan pesanan, proses pemantauan status pesanan juga masih menjadi kendala. Pelanggan terkadang menanyakan secara langsung kepada bagian prasmanan maupun dapur mengenai perkembangan pesanannya. Hal tersebut menunjukkan bahwa informasi mengenai status pesanan belum dapat disampaikan secara langsung kepada pelanggan. Pemilik juga menyampaikan bahwa kebutuhan untuk melakukan pemantauan pesanan secara *real-time* masih ada, meskipun rumah makan telah memiliki aplikasi tertentu dalam kegiatan operasional.

Pada sisi pengelolaan informasi penjualan, Saung Pete Cina telah menggunakan aplikasi dalam proses transaksi pembayaran dengan metode cash, debit, dan QRIS. Namun, proses rekapitulasi pemasukan, omset, dan pengeluaran masih membutuhkan waktu sekitar 30–60 menit. Pemilik juga menyampaikan adanya kebutuhan untuk memperoleh informasi jumlah transaksi harian secara otomatis serta mengetahui menu yang memiliki tingkat penjualan tinggi (*best seller*).

Berdasarkan permasalahan tersebut, diperlukan suatu sistem yang dapat membantu mengintegrasikan **proses pemesanan menu**, **pemantauan status pesanan secara real-time**, serta **penyajian laporan penjualan**. Pemanfaatan **QR Code pada meja** memberikan alternatif bagi pelanggan untuk mengakses menu dan melakukan pemesanan secara langsung, sedangkan fitur monitoring pesanan membantu pelanggan dan karyawan memperoleh informasi perkembangan pesanan secara langsung. Selain itu, pengelolaan laporan penjualan secara terkomputerisasi diharapkan dapat mengurangi waktu yang diperlukan dalam proses rekapitulasi data penjualan.

Oleh karena itu, pada tugas akhir ini dirancang dan dibangun sebuah **Sistem Pemesanan Menu, Monitoring Pesanan, dan Laporan Penjualan pada Saung Pete Cina Berbasis Web Menggunakan QR Code** dengan menggunakan **Metode Waterfall** (Analisis Kebutuhan, Perancangan, Implementasi, Pengujian, dan Pemeliharaan).

---

## 🚀 Panduan Memulai (Quick Start)

### Prasyarat System
- Node.js / Python / Docker (sesuai *tech stack* yang dipilih)
- Git

### Instalasi & Menjalankan Projek
```bash
# Clone repositori (jika menggunakan remote repository)
git clone <repository-url>

# Masuk ke direktori projek
cd Projek_TA

# Install dependensi & jalankan environment lokal
# (Akan diperbarui setelah stack dikonfirmasi)
```

---

## 🛠️ Aturan Pengkodean & Alur Kerja (Guidelines)

1. **Clean & Modular Code**: Setiap modul memiliki tanggung jawab tunggal (*single responsibility*).
2. **Keamanan Credentials**: Jangan pernah melakukan commit file `.env` atau kunci API rahasia. Gunakan `.env.example` sebagai referensi.
3. **Penyimpanan Dokumentasi**: Seluruh panduan dan spesifikasi fitur tersimpan terstruktur di folder `docs/`.
4. **Visual & UI (Jika Berbasis Web/Mobile)**:
   - Gunakan palet warna modern, aksen yang harmonis, serta konsistensi tipografi.
   - Hindari penggunaan data placeholder generik; prioritaskan penggunaan data uji nyata/simulasi.

---

## 📁 Struktur Direktori

```text
Projek_TA/
├── docs/             # Dokumentasi projek, panduan, dan laporan TA
├── src/              # Source code utama aplikasi / sistem
├── .gitignore        # Daftar file yang diabaikan oleh Git
└── README.md         # Dokumentasi utama repositori
```

---

## 📋 Progress & Roadmap
- [x] Inisialisasi struktur repositori dan dokumentasi awal
- [ ] Konfirmasi *tech stack* & setup dependensi utama
- [ ] Pengembangan modul/fitur inti (MVP)
- [ ] Pengujian (Testing) & Refactoring
- [ ] Penyusunan Laporan & Finalisasi Projek
