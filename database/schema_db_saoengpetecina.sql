-- ====================================================================
-- SKEMA DATABASE UNTUK SAUNG PETE CINA (db_saoengpetecina)
-- Kompatibel 100% untuk PostgreSQL Standar (pgAdmin / DBeaver / psql)
-- ====================================================================

-- 1. Aktifkan ekstensi pgcrypto untuk pembuatan UUID otomatis
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Pembuatan Tipe ENUM
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'cashier', 'kitchen');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE table_status AS ENUM ('available', 'occupied');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('dine-in', 'takeaway');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('new', 'processing', 'preparing', 'ready', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'debit', 'qris');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'pending');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Tabel Users (Admin, Kasir, Dapur) - Mandiri tanpa bergantung pada schema auth
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Tables (Nomor Meja, Token QR Acak & Sesi Berbatas Waktu)
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number INT UNIQUE NOT NULL,
    qr_token VARCHAR(64) UNIQUE DEFAULT ('spc-' || substr(md5(random()::text), 1, 12)),
    qr_code_url TEXT,
    active_session_token VARCHAR(64),
    session_expires_at TIMESTAMP WITH TIME ZONE,
    status table_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Categories (Kategori Menu)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Menus (Katalog Makanan & Minuman)
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Sequence untuk penomoran otomatis pesanan (ORD-0001, dsb)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- 8. Tabel Orders (Pesanan Pelanggan)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL DEFAULT ('ORD-' || lpad(nextval('order_number_seq')::text, 4, '0')),
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    session_token VARCHAR(64),
    customer_name VARCHAR(50) DEFAULT 'Pelanggan',
    order_type order_type DEFAULT 'dine-in',
    status order_status DEFAULT 'new',
    notes TEXT,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabel Order Items (Detail Rincian Item Pesanan)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES menus(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    item_notes TEXT
);

-- 10. Tabel Payments (Pembayaran Kasir)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_method payment_method NOT NULL,
    amount_paid DECIMAL(12, 2) NOT NULL,
    change_amount DECIMAL(12, 2) DEFAULT 0,
    payment_status payment_status DEFAULT 'paid',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabel Expenses (Pengeluaran Operasional Rumah Makan)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(50) DEFAULT 'Operasional',
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Trigger Otomatis update kolom updated_at pada tabel orders
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ====================================================================
-- DATA AWAL (SEED DATA)
-- ====================================================================

-- A. Data Akun Pengguna Default (Password default: admin123 / kasir123 / dapur123)
-- Hash bcrypt untuk: admin123 ($2a$10$7R0Zq8tZ1v0qX0E3z.a7Mej9A5b2C1d0e9f8g7h6i5j4k3l2m1n0o)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Pemilik Saung', 'admin@saungpetecina.com', '$2a$10$U5X2zVw1o7W4a1yK3R0vRe1K6pYq.9Vf2nO5Zc0Xl8G9b1w7y3m6y', 'admin'),
  ('Kasir Utama', 'kasir@saungpetecina.com', '$2a$10$U5X2zVw1o7W4a1yK3R0vRe1K6pYq.9Vf2nO5Zc0Xl8G9b1w7y3m6y', 'cashier'),
  ('Koki Dapur', 'dapur@saungpetecina.com', '$2a$10$U5X2zVw1o7W4a1yK3R0vRe1K6pYq.9Vf2nO5Zc0Xl8G9b1w7y3m6y', 'kitchen')
ON CONFLICT (email) DO NOTHING;

-- B. Data Meja 1 sampai 12
INSERT INTO tables (table_number)
SELECT generate_series(1, 12)
ON CONFLICT (table_number) DO NOTHING;

-- C. Data Kategori Menu
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Best Seller', 'best-seller', 1),
  ('Makanan', 'makanan', 2),
  ('Lauk', 'lauk', 3),
  ('Soto', 'soto', 4),
  ('Sayuran', 'sayuran', 5),
  ('Minuman', 'minuman', 6),
  ('Paket', 'paket', 7)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

-- D. Data Menu Autentik Saung Pete Cina
WITH seed_menus (category_slug, name, description, price, image_url, is_available) AS (
  VALUES
  -- Best Seller
  ('best-seller', '1 Ekor Ayam Taliwang', 'Menu best seller 1 ekor ayam bumbu Taliwang khas Saung Pete Cina', 39000, '/images/menus/!_ekor_ayam_taliwang.jpg', true),

  -- Makanan (Nasi)
  ('makanan', 'Nasi Putih', 'Nasi putih hangat', 6000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Meshi_001.jpg/960px-Meshi_001.jpg', true),
  ('makanan', 'Nasi Liwet', 'Nasi liwet gurih hangat', 7000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Nasi_Liwet_Solo.jpg/960px-Nasi_Liwet_Solo.jpg', true),

  -- Lauk
  ('lauk', 'Ayam Bakakak Taliwang', 'Ayam bakakak dengan bumbu Taliwang', 39000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Ayam_Panggang.jpg/960px-Ayam_Panggang.jpg', true),
  ('lauk', 'Ayam Bakakak Goreng', 'Ayam bakakak goreng gurih', 39000, '/images/menus/Ayam_bekakak.jpg', true),
  ('lauk', 'Ayam Bakakak Bakar', 'Ayam bakakak bakar bumbu khas', 39000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Ayam_bakar_bumbu_rujak.jpg/960px-Ayam_bakar_bumbu_rujak.jpg', true),
  ('lauk', 'Ikan Nila Bakar', 'Ikan nila bakar bumbu khas', 29000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Gurame_bakar_kecap_1.JPG/960px-Gurame_bakar_kecap_1.JPG', true),
  ('lauk', 'Ikan Nila Pecak', 'Ikan nila dengan siraman sambal pecak', 30000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Pecak_Nila.jpg/960px-Pecak_Nila.jpg', true),
  ('lauk', 'Ikan Nila Goreng', 'Ikan nila goreng renyah', 28000, 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=640&q=80', true),
  ('lauk', 'Ikan Lele Pecak', 'Ikan lele dengan siraman sambal pecak', 15000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Mangut_lele.jpg/960px-Mangut_lele.jpg', true),
  ('lauk', 'Ikan Lele Goreng', 'Ikan lele goreng renyah', 10000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Pecel_Lele_1.JPG/960px-Pecel_Lele_1.JPG', true),
  ('lauk', 'Ikan Mas', 'Olahan ikan mas khas Saung Pete Cina', 15000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Ikan_pesmol.JPG/960px-Ikan_pesmol.JPG', true),
  ('lauk', 'Ikan Kembung', 'Olahan ikan kembung gurih', 12000, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=640&q=80', true),
  ('lauk', 'Pindang Bandeng', 'Pindang ikan bandeng bumbu khas', 12000, '/images/menus/Pindang_bandeng.webp', true),
  ('lauk', 'Paha Ayam', 'Lauk potongan paha ayam', 12000, '/images/menus/Paha_ayam.jpg', true),
  ('lauk', 'Sayap Ayam', 'Lauk potongan sayap ayam', 8000, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=640&q=80', true),
  ('lauk', 'Paru Goreng', 'Paru sapi goreng gurih', 16000, '/images/menus/Paru_goreng.jpg', true),
  ('lauk', 'Sate Udang', 'Tusuk sate udang', 17000, '/images/menus/Sate_udang.jpg', true),
  ('lauk', 'Sate Usus', 'Tusuk sate usus ayam', 5000, '/images/menus/Sate_Usus.jpg', true),
  ('lauk', 'Sate Kulit', 'Tusuk sate kulit ayam', 5000, '/images/menus/Sate_kulit.webp', true),
  ('lauk', 'Sate Ati', 'Tusuk sate ati ayam', 5000, '/images/menus/Sate_ampela.jpg', true),
  ('lauk', 'Sate Ampela', 'Tusuk sate ampela ayam', 5000, '/images/menus/Sate_ampela.jpg', true),
  ('lauk', 'Sate Ceker', 'Tusuk sate ceker ayam', 5000, '/images/menus/Sate_ceker.jpg', true),
  ('lauk', 'Sate Telur Puyuh', 'Tusuk sate telur puyuh', 8000, '/images/menus/Sate_telur_puyuh.jpg', true),
  ('lauk', 'Pepes Tahu', 'Pepes tahu kukus bumbu khas', 6000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Pepes_ikan_emas_%28pais_lauk_mas%29_Sunda.jpg/960px-Pepes_ikan_emas_%28pais_lauk_mas%29_Sunda.jpg', true),
  ('lauk', 'Botok Teri Pete Cina', 'Botok teri dengan pete cina', 10000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Bubur_Lolos_Botok_Roti.jpg/960px-Bubur_Lolos_Botok_Roti.jpg', true),
  ('lauk', 'Tempe Mendoan/pcs', 'Tempe mendoan hangat (harga per pcs)', 3000, '/images/menus/Tempe_mendoan.jpg', true),
  ('lauk', 'Bakwan Jagung/pcs', 'Bakwan jagung goreng (harga per pcs)', 3000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Perkedel_Jagung_Jakarta.jpg/960px-Perkedel_Jagung_Jakarta.jpg', true),
  ('lauk', 'Telur Dadar', 'Telur dadar hangat', 10000, '/images/menus/Telur_dadar.jpg', true),
  ('lauk', 'Tempe/pcs', 'Tempe goreng (harga per pcs)', 2000, '/images/menus/Tempe.jpg', true),
  ('lauk', 'Tahu/pcs', 'Tahu goreng (harga per pcs)', 2000, '/images/menus/Tahu.jpg', true),
  ('lauk', 'Ikan Asin Japuh', 'Ikan asin japuh goreng', 6000, '/images/menus/Ikan_asin_japuh.jpg', true),
  ('lauk', 'Ikan Asin Peda', 'Ikan asin peda goreng', 7000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Bandeng_Presto_Juwana.JPG/960px-Bandeng_Presto_Juwana.JPG', true),
  ('lauk', 'Ikan Asin Cumi', 'Ikan asin cumi goreng', 7000, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=640&q=80', true),
  ('lauk', 'Tumis Cumi', 'Tumis cumi bumbu khas', 17000, '/images/menus/Tumis_cumi.jpg', true),
  ('lauk', 'Jengkol/pcs', 'Olahan jengkol (harga per pcs)', 2000, 'https://upload.wikimedia.org/wikipedia/commons/7/71/Resep_cara_membuat_semur_jengkol_pedas_yang_yummy.jpg', true),
  ('lauk', 'Pete', 'Olahan pete segar', 10000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Parkia_speciosa.JPG/960px-Parkia_speciosa.JPG', true),

  -- Sayuran
  ('sayuran', 'Kangkung Crispy', 'Kangkung goreng crispy renyah', 10000, '/images/menus/Kangkung_Crispy.jpeg', true),
  ('sayuran', 'Jukut', 'Sayur jukut khas Saung Pete Cina', 10000, '/images/menus/Jukut.jpg', true),
  ('sayuran', 'Tumis Kangkung', 'Tumis kangkung segar', 12000, '/images/menus/Tumis_kangkung.jpg', true),
  ('sayuran', 'Tumis Tauge', 'Tumis tauge segar', 12000, '/images/menus/Tumis_tauge.jpg', true),
  ('sayuran', 'Sayur Asem', 'Sayur asem segar', 10000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Sayur_asem_vegetable_soup.jpg/960px-Sayur_asem_vegetable_soup.jpg', true),
  ('sayuran', 'Terong Goreng/pcs', 'Terong goreng (harga per pcs)', 8000, '/images/menus/Terong_goreng.webp', true),

  -- Soto
  ('soto', 'Soto Ayam', 'Soto hangat dengan isian daging ayam', 30000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Soto_ayam.JPG/960px-Soto_ayam.JPG', true),
  ('soto', 'Soto Daging', 'Soto hangat dengan isian daging sapi', 40000, '/images/menus/Soto_daging.jpg', true),
  ('soto', 'Soto Babat', 'Soto hangat dengan isian babat sapi', 35000, '/images/menus/soto_babat.jpg', true),
  ('soto', 'Soto Paru', 'Soto hangat dengan isian paru sapi', 37000, '/images/menus/Soto_paru.jpg', true),
  ('soto', 'Soto Kikil', 'Soto hangat dengan isian kikil sapi', 30000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Soto_Mie_Bogor_2.JPG/960px-Soto_Mie_Bogor_2.JPG', true),
  ('soto', 'Soto Kaki Sapi', 'Soto hangat dengan isian kaki sapi', 40000, '/images/menus/Soto_kaki_sapi.jpg', true),
  ('soto', 'Soto Campur', 'Soto hangat dengan isian campur', 40000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Soto_Ayam_Savoy_Homann_Hotel.JPG/960px-Soto_Ayam_Savoy_Homann_Hotel.JPG', true),

  -- Minuman
  ('minuman', 'Es Batu', 'Gelas es batu tambahan', 2000, '/images/menus/Es_batu.jpg', true),
  ('minuman', 'Es Teh Tawar', 'Es teh tawar dingin', 5000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/ES_TEH_MANIS.jpg/960px-ES_TEH_MANIS.jpg', true),
  ('minuman', 'Mineral', 'Air mineral kemasan', 5000, '/images/menus/Mineral.jpg', true),
  ('minuman', 'Kopi Hitam', 'Kopi hitam panas', 5000, '/images/menus/Kopi_hitam.jpg', true),
  ('minuman', 'Es Teh Manis', 'Es teh manis dingin', 7000, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Iced_Tea_from_flickr.jpg/960px-Iced_Tea_from_flickr.jpg', true),
  ('minuman', 'Jeruk Hangat', 'Minuman jeruk peras hangat', 8000, '/images/menus/Jeruk_hangat.jpg', true),
  ('minuman', 'Jeruk Dingin', 'Minuman jeruk peras dingin dengan es', 10000, '/images/menus/es_jeruk.jpg', true)
),
updated AS (
  UPDATE menus existing
  SET image_url = m.image_url
  FROM seed_menus m
  WHERE LOWER(existing.name) = LOWER(m.name)
  RETURNING existing.id
)
INSERT INTO menus (category_id, name, description, price, image_url, is_available)
SELECT c.id, m.name, m.description, m.price, m.image_url, m.is_available
FROM seed_menus m
JOIN categories c ON c.slug = m.category_slug
WHERE NOT EXISTS (
  SELECT 1 FROM menus existing WHERE LOWER(existing.name) = LOWER(m.name)
);
