# Dokumentasi Pembaruan URL Gambar Menu (`image_url`) pada Database & Aplikasi Web
## Sistem Informasi Rumah Makan Saung Pete Cina

**Tanggal Pembaruan**: 11 November 2026  
**Database Target**: PostgreSQL (`db_saoengpetecina`)

---

## 1. Ringkasan Pembaruan

Dokumen ini mencatat pembaruan data foto/gambar (`image_url`) untuk seluruh **57 menu** Saung Pete Cina yang menggabungkan **aset foto lokal** di `public/images/menus/` (`/images/menus/...`) serta sumber gambar kuliner daring (Wikimedia Commons & Unsplash CDN) ke dalam database PostgreSQL dan kode sumber aplikasi web.

| Komponen | File / Target yang Diperbarui | Deskripsi Perubahan |
| :--- | :--- | :--- |
| **Direktori Aset Lokal** | `public/images/menus/` | Menyimpan 31 file gambar menu lokal (`.jpg`, `.jpeg`, `.webp`) yang disajikan langsung oleh Vite pada path `/images/menus/<nama_file>`. |
| **Database Aktif (PostgreSQL)** | Tabel `menus` pada `db_saoengpetecina` | Memperbarui kolom `image_url` pada seluruh **57 baris menu** (`UPDATE menus SET image_url = ... WHERE LOWER(name) = LOWER(...)`). |
| **Skema & Seed SQL** | `database/schema_db_saoengpetecina.sql`<br>`supabase/seed.sql` | Menyinkronkan nilai `image_url` dengan path gambar lokal (`/images/menus/...`) dan URL gambar masing-masing menu menggunakan CTE `WITH seed_menus ... UPDATE menus`. |
| **Data Fallback Frontend** | `src/data/mockData.ts` | Memperbarui properti `image` pada ke-57 item di `menuItems` agar tampilan tetap konsisten baik saat terhubung ke backend maupun saat mode fallback/offline. |
| **Komponen UI Menu** | `src/pages/CustomerOrder.tsx`<br>`src/pages/MenuManagement.tsx` | Menambahkan atribut `loading="lazy"` pada elemen `<img>` di katalog pemesanan pelanggan dan halaman manajemen menu admin. |

---

## 2. Daftar Lengkap 57 Menu Beserta URL Gambar (`image_url`)

### 2.1 Kategori: Best Seller (`best-seller`)
| No | Nama Menu | Harga (Rp) | Sumber | Path / URL Gambar (`image_url`) |
| :---: | :--- | ---: | :---: | :--- |
| 1 | 1 Ekor Ayam Taliwang | 39.000 | Lokal | `/images/menus/!_ekor_ayam_taliwang.jpg` |

### 2.2 Kategori: Makanan (`makanan`)
| No | Nama Menu | Harga (Rp) | Sumber | Path / URL Gambar (`image_url`) |
| :---: | :--- | ---: | :---: | :--- |
| 2 | Nasi Putih | 6.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Meshi_001.jpg/960px-Meshi_001.jpg` |
| 3 | Nasi Liwet | 7.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Nasi_Liwet_Solo.jpg/960px-Nasi_Liwet_Solo.jpg` |

### 2.3 Kategori: Lauk (`lauk`)
| No | Nama Menu | Harga (Rp) | Sumber | Path / URL Gambar (`image_url`) |
| :---: | :--- | ---: | :---: | :--- |
| 4 | Ayam Bakakak Taliwang | 39.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Ayam_Panggang.jpg/960px-Ayam_Panggang.jpg` |
| 5 | Ayam Bakakak Goreng | 39.000 | Lokal | `/images/menus/Ayam_bekakak.jpg` |
| 6 | Ayam Bakakak Bakar | 39.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Ayam_bakar_bumbu_rujak.jpg/960px-Ayam_bakar_bumbu_rujak.jpg` |
| 7 | Ikan Nila Bakar | 29.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Gurame_bakar_kecap_1.JPG/960px-Gurame_bakar_kecap_1.JPG` |
| 8 | Ikan Nila Pecak | 30.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Pecak_Nila.jpg/960px-Pecak_Nila.jpg` |
| 9 | Ikan Nila Goreng | 28.000 | Unsplash | `https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=640&q=80` |
| 10 | Ikan Lele Pecak | 15.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Mangut_lele.jpg/960px-Mangut_lele.jpg` |
| 11 | Ikan Lele Goreng | 10.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Pecel_Lele_1.JPG/960px-Pecel_Lele_1.JPG` |
| 12 | Ikan Mas | 15.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Ikan_pesmol.JPG/960px-Ikan_pesmol.JPG` |
| 13 | Ikan Kembung | 12.000 | Unsplash | `https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=640&q=80` |
| 14 | Pindang Bandeng | 12.000 | Lokal | `/images/menus/Pindang_bandeng.webp` |
| 15 | Paha Ayam | 12.000 | Lokal | `/images/menus/Paha_ayam.jpg` |
| 16 | Sayap Ayam | 8.000 | Unsplash | `https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=640&q=80` |
| 17 | Paru Goreng | 16.000 | Lokal | `/images/menus/Paru_goreng.jpg` |
| 18 | Sate Udang | 17.000 | Lokal | `/images/menus/Sate_udang.jpg` |
| 19 | Sate Usus | 5.000 | Lokal | `/images/menus/Sate_Usus.jpg` |
| 20 | Sate Kulit | 5.000 | Lokal | `/images/menus/Sate_kulit.webp` |
| 21 | Sate Ati | 5.000 | Lokal | `/images/menus/Sate_ampela.jpg` |
| 22 | Sate Ampela | 5.000 | Lokal | `/images/menus/Sate_ampela.jpg` |
| 23 | Sate Ceker | 5.000 | Lokal | `/images/menus/Sate_ceker.jpg` |
| 24 | Sate Telur Puyuh | 8.000 | Lokal | `/images/menus/Sate_telur_puyuh.jpg` |
| 25 | Pepes Tahu | 6.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Pepes_ikan_emas_%28pais_lauk_mas%29_Sunda.jpg/960px-Pepes_ikan_emas_%28pais_lauk_mas%29_Sunda.jpg` |
| 26 | Botok Teri Pete Cina | 10.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Bubur_Lolos_Botok_Roti.jpg/960px-Bubur_Lolos_Botok_Roti.jpg` |
| 27 | Tempe Mendoan/pcs | 3.000 | Lokal | `/images/menus/Tempe_mendoan.jpg` |
| 28 | Bakwan Jagung/pcs | 3.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Perkedel_Jagung_Jakarta.jpg/960px-Perkedel_Jagung_Jakarta.jpg` |
| 29 | Telur Dadar | 10.000 | Lokal | `/images/menus/Telur_dadar.jpg` |
| 30 | Tempe/pcs | 2.000 | Lokal | `/images/menus/Tempe.jpg` |
| 31 | Tahu/pcs | 2.000 | Lokal | `/images/menus/Tahu.jpg` |
| 32 | Ikan Asin Japuh | 6.000 | Lokal | `/images/menus/Ikan_asin_japuh.jpg` |
| 33 | Ikan Asin Peda | 7.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Bandeng_Presto_Juwana.JPG/960px-Bandeng_Presto_Juwana.JPG` |
| 34 | Ikan Asin Cumi | 7.000 | Unsplash | `https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=640&q=80` |
| 35 | Tumis Cumi | 17.000 | Lokal | `/images/menus/Tumis_cumi.jpg` |
| 36 | Jengkol/pcs | 2.000 | Wikimedia | `https://upload.wikimedia.org/wikipedia/commons/7/71/Resep_cara_membuat_semur_jengkol_pedas_yang_yummy.jpg` |
| 37 | Pete | 10.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Parkia_speciosa.JPG/960px-Parkia_speciosa.JPG` |

### 2.4 Kategori: Sayuran (`sayuran`)
| No | Nama Menu | Harga (Rp) | Sumber | Path / URL Gambar (`image_url`) |
| :---: | :--- | ---: | :---: | :--- |
| 38 | Kangkung Crispy | 10.000 | Lokal | `/images/menus/Kangkung_Crispy.jpeg` |
| 39 | Jukut | 10.000 | Lokal | `/images/menus/Jukut.jpg` |
| 40 | Tumis Kangkung | 12.000 | Lokal | `/images/menus/Tumis_kangkung.jpg` |
| 41 | Tumis Tauge | 12.000 | Lokal | `/images/menus/Tumis_tauge.jpg` |
| 42 | Sayur Asem | 10.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Sayur_asem_vegetable_soup.jpg/960px-Sayur_asem_vegetable_soup.jpg` |
| 43 | Terong Goreng/pcs | 8.000 | Lokal | `/images/menus/Terong_goreng.webp` |

### 2.5 Kategori: Soto (`soto`)
| No | Nama Menu | Harga (Rp) | Sumber | Path / URL Gambar (`image_url`) |
| :---: | :--- | ---: | :---: | :--- |
| 44 | Soto Ayam | 30.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Soto_ayam.JPG/960px-Soto_ayam.JPG` |
| 45 | Soto Daging | 40.000 | Lokal | `/images/menus/Soto_daging.jpg` |
| 46 | Soto Babat | 35.000 | Lokal | `/images/menus/soto_babat.jpg` |
| 47 | Soto Paru | 37.000 | Lokal | `/images/menus/Soto_paru.jpg` |
| 48 | Soto Kikil | 30.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Soto_Mie_Bogor_2.JPG/960px-Soto_Mie_Bogor_2.JPG` |
| 49 | Soto Kaki Sapi | 40.000 | Lokal | `/images/menus/Soto_kaki_sapi.jpg` |
| 50 | Soto Campur | 40.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Soto_Ayam_Savoy_Homann_Hotel.JPG/960px-Soto_Ayam_Savoy_Homann_Hotel.JPG` |

### 2.6 Kategori: Minuman (`minuman`)
| No | Nama Menu | Harga (Rp) | Sumber | Path / URL Gambar (`image_url`) |
| :---: | :--- | ---: | :---: | :--- |
| 51 | Es Batu | 2.000 | Lokal | `/images/menus/Es_batu.jpg` |
| 52 | Es Teh Tawar | 5.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/ES_TEH_MANIS.jpg/960px-ES_TEH_MANIS.jpg` |
| 53 | Mineral | 5.000 | Lokal | `/images/menus/Mineral.jpg` |
| 54 | Kopi Hitam | 5.000 | Lokal | `/images/menus/Kopi_hitam.jpg` |
| 55 | Es Teh Manis | 7.000 | Wikimedia | `https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Iced_Tea_from_flickr.jpg/960px-Iced_Tea_from_flickr.jpg` |
| 56 | Jeruk Hangat | 8.000 | Lokal | `/images/menus/Jeruk_hangat.jpg` |
| 57 | Jeruk Dingin | 10.000 | Lokal | `/images/menus/es_jeruk.jpg` |

---

## 3. Struktur Query Sinkronisasi Database

Skrip SQL pada `database/schema_db_saoengpetecina.sql` dan `supabase/seed.sql` menggunakan struktur Common Table Expression (`WITH seed_menus ...`) yang melakukan **dua operasi sekaligus secara idempoten**:
1. **Memperbarui (`UPDATE`)** kolom `image_url` untuk menu yang sudah ada di tabel `menus` berdasarkan pencocokan nama menu (`LOWER(existing.name) = LOWER(m.name)`).
2. **Menyisipkan (`INSERT`)** menu baru apabila belum terdaftar di tabel `menus`.
