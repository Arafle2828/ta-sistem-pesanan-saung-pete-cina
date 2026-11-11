-- Saung Pete Cina - Skema awal
-- Jalankan di Supabase SQL Editor (urutan: 0001 -> 0002 -> seed.sql)

-- ============ ENUMS ============
CREATE TYPE user_role AS ENUM ('admin', 'cashier', 'kitchen');
CREATE TYPE table_status AS ENUM ('available', 'occupied');
CREATE TYPE order_type AS ENUM ('dine-in', 'takeaway');
CREATE TYPE order_status AS ENUM ('new', 'processing', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'debit', 'qris');
CREATE TYPE payment_status AS ENUM ('paid', 'pending');

-- ============ PROFILES (staf; terhubung ke Supabase Auth) ============
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'cashier',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Otomatis buat profil saat akun staf dibuat. Role default 'cashier' (paling rendah
-- dari yang berizin); ubah manual ke 'admin'/'kitchen' lewat SQL Editor.
CREATE FUNCTION handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ MASTER DATA ============
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT UNIQUE NOT NULL CHECK (table_number > 0),
  qr_code_url TEXT,
  status table_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menus_category ON menus(category_id);

-- ============ PESANAN ============
CREATE SEQUENCE order_number_seq START 1;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL
    DEFAULT ('ORD-' || lpad(nextval('order_number_seq')::text, 4, '0')),
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  customer_name VARCHAR(50) NOT NULL DEFAULT 'Pelanggan',
  order_type order_type NOT NULL DEFAULT 'dine-in',
  status order_status NOT NULL DEFAULT 'new',
  notes TEXT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  item_notes TEXT
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payment_method payment_method NOT NULL,
  amount_paid DECIMAL(12, 2) NOT NULL,
  change_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'paid',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(50) NOT NULL DEFAULT 'Operasional',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ updated_at otomatis ============
CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============ Realtime untuk monitor dapur ============
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
