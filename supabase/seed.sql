-- Saung Pete Cina - Data awal (kategori, menu, meja 1-12)
-- Kategori "Semua" adalah filter di UI, bukan baris database.

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

INSERT INTO tables (table_number) SELECT generate_series(1, 12) ON CONFLICT (table_number) DO NOTHING;
