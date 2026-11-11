# Peraturan & Standar Pengkodean Projek Tugas Akhir

Dokumen ini mendefinisikan aturan main, konvensi penulisan kode, serta standar kualitas yang harus dipatuhi selama proses pengembangan projek Tugas Akhir.

---

## 1. Prinsip Utama (Core Principles)
1. **Separation of Concerns (SoC)**: Pisahkan antara logika bisnis, tampilan antarmuka (UI), dan manajemen data/state.
2. **Readability & Maintainability**: Tulis kode yang mudah dibaca oleh manusia, bukan hanya oleh komputer. Gunakan nama variabel dan fungsi yang deskriptif.
3. **DRY (Don't Repeat Yourself)**: Ekstrak logika atau komponen yang digunakan berulang kali menjadi fungsi helper/komponen terpisah.
4. **Keamanan Data**: Kunci API, rahasia database, dan *credentials* wajib disimpan dalam variabel lingkungan (`.env`) dan tidak boleh di-commit.

---

## 2. Standar Penulisan Kode (Coding Conventions)

### JavaScript / TypeScript / React (Jika Digunakan)
- Gunakan **CamelCase** untuk variabel dan fungsi (`getUserData`, `isLoggedIn`).
- Gunakan **PascalCase** untuk komponen dan kelas (`UserProfileCard`, `NavigationHeader`).
- Gunakan **UPPER_SNAKE_CASE** untuk konstanta global (`MAX_RETRY_COUNT`, `API_BASE_URL`).
- Utamakan penggunaan `const` dan `let`, hindari `var`.

### Python (Jika Digunakan)
- Ikuti standar **PEP 8**.
- Gunakan **snake_case** untuk fungsi dan variabel (`get_user_data`, `is_active`).
- Gunakan **PascalCase** untuk class (`DataPreprocessor`, `RecommendationEngine`).

---

## 3. Konvensi Commit & Manajemen Git

Format pesan commit yang disarankan:
- `feat: <deskripsi>` — Penambahan fitur baru.
- `fix: <deskripsi>` — Perbaikan bug/error.
- `docs: <deskripsi>` — Perubahan atau penambahan dokumentasi.
- `style: <deskripsi>` — Perubahan format/tampilan tanpa mengubah logika bisnis.
- `refactor: <deskripsi>` — Restrukturisasi kode tanpa mengubah fungsionalitas.

---

## 4. Estetika & Kualitas UI/UX (Untuk Aplikasi Web/Mobile)
- Gunakan skema warna yang konsisten dan kontras yang cukup (rasio kontras accessibility).
- Sertakan *micro-animations* dan efek transisi halus pada elemen interaktif (hover, button click, loading state).
- Pastikan tampilan responsif dan dapat diakses dengan baik di berbagai ukuran layar.
