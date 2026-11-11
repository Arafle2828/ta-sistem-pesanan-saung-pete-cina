-- Saung Pete Cina - Row Level Security
-- Prinsip: pelanggan (anon) hanya boleh MEMBACA katalog. Membuat pesanan dan
-- melacak status dilakukan lewat server (service role) pada iterasi berikutnya,
-- sehingga anon tidak punya akses langsung ke orders/order_items/payments.

-- Helper: role staf yang sedang login (NULL jika bukan staf)
CREATE FUNCTION current_staff_role() RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- profiles: staf membaca profil sendiri; admin membaca/mengelola semua
CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR current_staff_role() = 'admin');
CREATE POLICY profiles_admin_update ON profiles FOR UPDATE TO authenticated
  USING (current_staff_role() = 'admin') WITH CHECK (current_staff_role() = 'admin');

-- Katalog: publik baca, admin kelola
CREATE POLICY categories_public_read ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_admin_write ON categories FOR ALL TO authenticated
  USING (current_staff_role() = 'admin') WITH CHECK (current_staff_role() = 'admin');

CREATE POLICY menus_public_read ON menus FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY menus_admin_write ON menus FOR ALL TO authenticated
  USING (current_staff_role() = 'admin') WITH CHECK (current_staff_role() = 'admin');

CREATE POLICY tables_public_read ON tables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY tables_admin_write ON tables FOR ALL TO authenticated
  USING (current_staff_role() = 'admin') WITH CHECK (current_staff_role() = 'admin');

-- Pesanan: seluruh staf membaca; dapur/kasir/admin mengubah status
CREATE POLICY orders_staff_read ON orders FOR SELECT TO authenticated
  USING (current_staff_role() IS NOT NULL);
CREATE POLICY orders_staff_update ON orders FOR UPDATE TO authenticated
  USING (current_staff_role() IS NOT NULL) WITH CHECK (current_staff_role() IS NOT NULL);

CREATE POLICY order_items_staff_read ON order_items FOR SELECT TO authenticated
  USING (current_staff_role() IS NOT NULL);

-- Pembayaran: kasir dan admin saja
CREATE POLICY payments_cashier_read ON payments FOR SELECT TO authenticated
  USING (current_staff_role() IN ('cashier', 'admin'));
CREATE POLICY payments_cashier_insert ON payments FOR INSERT TO authenticated
  WITH CHECK (current_staff_role() IN ('cashier', 'admin') AND cashier_id = auth.uid());

-- Pengeluaran: admin saja
CREATE POLICY expenses_admin_all ON expenses FOR ALL TO authenticated
  USING (current_staff_role() = 'admin') WITH CHECK (current_staff_role() = 'admin');
