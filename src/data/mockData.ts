export type MenuCategory =
  | "Semua"
  | "Best Seller"
  | "Makanan"
  | "Lauk"
  | "Soto"
  | "Sayuran"
  | "Minuman"
  | "Paket";

export const CATEGORIES: MenuCategory[] = [
  "Semua",
  "Best Seller",
  "Makanan",
  "Lauk",
  "Soto",
  "Sayuran",
  "Minuman",
  "Paket",
];

export type OrderStatus = "new" | "processing" | "preparing" | "ready" | "done";
export type PaymentMethod = "Cash" | "Debit" | "QRIS";

export interface MenuItem {
  id: string | number;
  name: string;
  category: Exclude<MenuCategory, "Semua">;
  price: number;
  description: string;
  image: string | null;
  available: boolean;
}

export interface OrderItem {
  menu_id?: string | number;
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  dbId?: string;
  table: number;
  customerName?: string;
  orderType?: "dine-in" | "takeaway";
  notes?: string;
  time: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: "paid" | "pending";
  createdAt: string;
}

export const menuItems: MenuItem[] = [
  // Best Seller
  {
    id: 1,
    name: "1 Ekor Ayam Taliwang",
    category: "Best Seller",
    price: 39000,
    description: "Menu best seller 1 ekor ayam bumbu Taliwang khas Saung Pete Cina",
    image: "/images/menus/!_ekor_ayam_taliwang.jpg",
    available: true,
  },

  // Makanan (Nasi)
  {
    id: 2,
    name: "Nasi Putih",
    category: "Makanan",
    price: 6000,
    description: "Nasi putih hangat",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Meshi_001.jpg/960px-Meshi_001.jpg",
    available: true,
  },
  {
    id: 3,
    name: "Nasi Liwet",
    category: "Makanan",
    price: 7000,
    description: "Nasi liwet gurih hangat",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/Nasi_Liwet_Solo.jpg/960px-Nasi_Liwet_Solo.jpg",
    available: true,
  },

  // Lauk
  {
    id: 4,
    name: "Ayam Bakakak Taliwang",
    category: "Lauk",
    price: 39000,
    description: "Ayam bakakak dengan bumbu Taliwang",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Ayam_Panggang.jpg/960px-Ayam_Panggang.jpg",
    available: true,
  },
  {
    id: 5,
    name: "Ayam Bakakak Goreng",
    category: "Lauk",
    price: 39000,
    description: "Ayam bakakak goreng gurih",
    image: "/images/menus/Ayam_bekakak.jpg",
    available: true,
  },
  {
    id: 6,
    name: "Ayam Bakakak Bakar",
    category: "Lauk",
    price: 39000,
    description: "Ayam bakakak bakar bumbu khas",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Ayam_bakar_bumbu_rujak.jpg/960px-Ayam_bakar_bumbu_rujak.jpg",
    available: true,
  },
  {
    id: 7,
    name: "Ikan Nila Bakar",
    category: "Lauk",
    price: 29000,
    description: "Ikan nila bakar bumbu khas",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Gurame_bakar_kecap_1.JPG/960px-Gurame_bakar_kecap_1.JPG",
    available: true,
  },
  {
    id: 8,
    name: "Ikan Nila Pecak",
    category: "Lauk",
    price: 30000,
    description: "Ikan nila dengan siraman sambal pecak",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Pecak_Nila.jpg/960px-Pecak_Nila.jpg",
    available: true,
  },
  {
    id: 9,
    name: "Ikan Nila Goreng",
    category: "Lauk",
    price: 28000,
    description: "Ikan nila goreng renyah",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=640&q=80",
    available: true,
  },
  {
    id: 10,
    name: "Ikan Lele Pecak",
    category: "Lauk",
    price: 15000,
    description: "Ikan lele dengan siraman sambal pecak",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Mangut_lele.jpg/960px-Mangut_lele.jpg",
    available: true,
  },
  {
    id: 11,
    name: "Ikan Lele Goreng",
    category: "Lauk",
    price: 10000,
    description: "Ikan lele goreng renyah",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Pecel_Lele_1.JPG/960px-Pecel_Lele_1.JPG",
    available: true,
  },
  {
    id: 12,
    name: "Ikan Mas",
    category: "Lauk",
    price: 15000,
    description: "Olahan ikan mas khas Saung Pete Cina",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Ikan_pesmol.JPG/960px-Ikan_pesmol.JPG",
    available: true,
  },
  {
    id: 13,
    name: "Ikan Kembung",
    category: "Lauk",
    price: 12000,
    description: "Olahan ikan kembung gurih",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=640&q=80",
    available: true,
  },
  {
    id: 14,
    name: "Pindang Bandeng",
    category: "Lauk",
    price: 12000,
    description: "Pindang ikan bandeng bumbu khas",
    image: "/images/menus/Pindang_bandeng.webp",
    available: true,
  },
  {
    id: 15,
    name: "Paha Ayam",
    category: "Lauk",
    price: 12000,
    description: "Lauk potongan paha ayam",
    image: "/images/menus/Paha_ayam.jpg",
    available: true,
  },
  {
    id: 16,
    name: "Sayap Ayam",
    category: "Lauk",
    price: 8000,
    description: "Lauk potongan sayap ayam",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=640&q=80",
    available: true,
  },
  {
    id: 17,
    name: "Paru Goreng",
    category: "Lauk",
    price: 16000,
    description: "Paru sapi goreng gurih",
    image: "/images/menus/Paru_goreng.jpg",
    available: true,
  },
  {
    id: 18,
    name: "Sate Udang",
    category: "Lauk",
    price: 17000,
    description: "Tusuk sate udang",
    image: "/images/menus/Sate_udang.jpg",
    available: true,
  },
  {
    id: 19,
    name: "Sate Usus",
    category: "Lauk",
    price: 5000,
    description: "Tusuk sate usus ayam",
    image: "/images/menus/Sate_Usus.jpg",
    available: true,
  },
  {
    id: 20,
    name: "Sate Kulit",
    category: "Lauk",
    price: 5000,
    description: "Tusuk sate kulit ayam",
    image: "/images/menus/Sate_kulit.webp",
    available: true,
  },
  {
    id: 21,
    name: "Sate Ati",
    category: "Lauk",
    price: 5000,
    description: "Tusuk sate ati ayam",
    image: "/images/menus/Sate_ampela.jpg",
    available: true,
  },
  {
    id: 22,
    name: "Sate Ampela",
    category: "Lauk",
    price: 5000,
    description: "Tusuk sate ampela ayam",
    image: "/images/menus/Sate_ampela.jpg",
    available: true,
  },
  {
    id: 23,
    name: "Sate Ceker",
    category: "Lauk",
    price: 5000,
    description: "Tusuk sate ceker ayam",
    image: "/images/menus/Sate_ceker.jpg",
    available: true,
  },
  {
    id: 24,
    name: "Sate Telur Puyuh",
    category: "Lauk",
    price: 8000,
    description: "Tusuk sate telur puyuh",
    image: "/images/menus/Sate_telur_puyuh.jpg",
    available: true,
  },
  {
    id: 25,
    name: "Pepes Tahu",
    category: "Lauk",
    price: 6000,
    description: "Pepes tahu kukus bumbu khas",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Pepes_ikan_emas_%28pais_lauk_mas%29_Sunda.jpg/960px-Pepes_ikan_emas_%28pais_lauk_mas%29_Sunda.jpg",
    available: true,
  },
  {
    id: 26,
    name: "Botok Teri Pete Cina",
    category: "Lauk",
    price: 10000,
    description: "Botok teri dengan pete cina",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Bubur_Lolos_Botok_Roti.jpg/960px-Bubur_Lolos_Botok_Roti.jpg",
    available: true,
  },
  {
    id: 27,
    name: "Tempe Mendoan/pcs",
    category: "Lauk",
    price: 3000,
    description: "Tempe mendoan hangat (harga per pcs)",
    image: "/images/menus/Tempe_mendoan.jpg",
    available: true,
  },
  {
    id: 28,
    name: "Bakwan Jagung/pcs",
    category: "Lauk",
    price: 3000,
    description: "Bakwan jagung goreng (harga per pcs)",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Perkedel_Jagung_Jakarta.jpg/960px-Perkedel_Jagung_Jakarta.jpg",
    available: true,
  },
  {
    id: 29,
    name: "Telur Dadar",
    category: "Lauk",
    price: 10000,
    description: "Telur dadar hangat",
    image: "/images/menus/Telur_dadar.jpg",
    available: true,
  },
  {
    id: 30,
    name: "Tempe/pcs",
    category: "Lauk",
    price: 2000,
    description: "Tempe goreng (harga per pcs)",
    image: "/images/menus/Tempe.jpg",
    available: true,
  },
  {
    id: 31,
    name: "Tahu/pcs",
    category: "Lauk",
    price: 2000,
    description: "Tahu goreng (harga per pcs)",
    image: "/images/menus/Tahu.jpg",
    available: true,
  },
  {
    id: 32,
    name: "Ikan Asin Japuh",
    category: "Lauk",
    price: 6000,
    description: "Ikan asin japuh goreng",
    image: "/images/menus/Ikan_asin_japuh.jpg",
    available: true,
  },
  {
    id: 33,
    name: "Ikan Asin Peda",
    category: "Lauk",
    price: 7000,
    description: "Ikan asin peda goreng",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Bandeng_Presto_Juwana.JPG/960px-Bandeng_Presto_Juwana.JPG",
    available: true,
  },
  {
    id: 34,
    name: "Ikan Asin Cumi",
    category: "Lauk",
    price: 7000,
    description: "Ikan asin cumi goreng",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=640&q=80",
    available: true,
  },
  {
    id: 35,
    name: "Tumis Cumi",
    category: "Lauk",
    price: 17000,
    description: "Tumis cumi bumbu khas",
    image: "/images/menus/Tumis_cumi.jpg",
    available: true,
  },
  {
    id: 36,
    name: "Jengkol/pcs",
    category: "Lauk",
    price: 2000,
    description: "Olahan jengkol (harga per pcs)",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/71/Resep_cara_membuat_semur_jengkol_pedas_yang_yummy.jpg",
    available: true,
  },
  {
    id: 37,
    name: "Pete",
    category: "Lauk",
    price: 10000,
    description: "Olahan pete segar",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Parkia_speciosa.JPG/960px-Parkia_speciosa.JPG",
    available: true,
  },

  // Sayuran
  {
    id: 38,
    name: "Kangkung Crispy",
    category: "Sayuran",
    price: 10000,
    description: "Kangkung goreng crispy renyah",
    image: "/images/menus/Kangkung_Crispy.jpeg",
    available: true,
  },
  {
    id: 39,
    name: "Jukut",
    category: "Sayuran",
    price: 10000,
    description: "Sayur jukut khas Saung Pete Cina",
    image: "/images/menus/Jukut.jpg",
    available: true,
  },
  {
    id: 40,
    name: "Tumis Kangkung",
    category: "Sayuran",
    price: 12000,
    description: "Tumis kangkung segar",
    image: "/images/menus/Tumis_kangkung.jpg",
    available: true,
  },
  {
    id: 41,
    name: "Tumis Tauge",
    category: "Sayuran",
    price: 12000,
    description: "Tumis tauge segar",
    image: "/images/menus/Tumis_tauge.jpg",
    available: true,
  },
  {
    id: 42,
    name: "Sayur Asem",
    category: "Sayuran",
    price: 10000,
    description: "Sayur asem segar",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Sayur_asem_vegetable_soup.jpg/960px-Sayur_asem_vegetable_soup.jpg",
    available: true,
  },
  {
    id: 43,
    name: "Terong Goreng/pcs",
    category: "Sayuran",
    price: 8000,
    description: "Terong goreng (harga per pcs)",
    image: "/images/menus/Terong_goreng.webp",
    available: true,
  },

  // Soto
  {
    id: 44,
    name: "Soto Ayam",
    category: "Soto",
    price: 30000,
    description: "Soto hangat dengan isian daging ayam",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Soto_ayam.JPG/960px-Soto_ayam.JPG",
    available: true,
  },
  {
    id: 45,
    name: "Soto Daging",
    category: "Soto",
    price: 40000,
    description: "Soto hangat dengan isian daging sapi",
    image: "/images/menus/Soto_daging.jpg",
    available: true,
  },
  {
    id: 46,
    name: "Soto Babat",
    category: "Soto",
    price: 35000,
    description: "Soto hangat dengan isian babat sapi",
    image: "/images/menus/soto_babat.jpg",
    available: true,
  },
  {
    id: 47,
    name: "Soto Paru",
    category: "Soto",
    price: 37000,
    description: "Soto hangat dengan isian paru sapi",
    image: "/images/menus/Soto_paru.jpg",
    available: true,
  },
  {
    id: 48,
    name: "Soto Kikil",
    category: "Soto",
    price: 30000,
    description: "Soto hangat dengan isian kikil sapi",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Soto_Mie_Bogor_2.JPG/960px-Soto_Mie_Bogor_2.JPG",
    available: true,
  },
  {
    id: 49,
    name: "Soto Kaki Sapi",
    category: "Soto",
    price: 40000,
    description: "Soto hangat dengan isian kaki sapi",
    image: "/images/menus/Soto_kaki_sapi.jpg",
    available: true,
  },
  {
    id: 50,
    name: "Soto Campur",
    category: "Soto",
    price: 40000,
    description: "Soto hangat dengan isian campur",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Soto_Ayam_Savoy_Homann_Hotel.JPG/960px-Soto_Ayam_Savoy_Homann_Hotel.JPG",
    available: true,
  },

  // Minuman
  {
    id: 51,
    name: "Es Batu",
    category: "Minuman",
    price: 2000,
    description: "Gelas es batu tambahan",
    image: "/images/menus/Es_batu.jpg",
    available: true,
  },
  {
    id: 52,
    name: "Es Teh Tawar",
    category: "Minuman",
    price: 5000,
    description: "Es teh tawar dingin",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/ES_TEH_MANIS.jpg/960px-ES_TEH_MANIS.jpg",
    available: true,
  },
  {
    id: 53,
    name: "Mineral",
    category: "Minuman",
    price: 5000,
    description: "Air mineral kemasan",
    image: "/images/menus/Mineral.jpg",
    available: true,
  },
  {
    id: 54,
    name: "Kopi Hitam",
    category: "Minuman",
    price: 5000,
    description: "Kopi hitam panas",
    image: "/images/menus/Kopi_hitam.jpg",
    available: true,
  },
  {
    id: 55,
    name: "Es Teh Manis",
    category: "Minuman",
    price: 7000,
    description: "Es teh manis dingin",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Iced_Tea_from_flickr.jpg/960px-Iced_Tea_from_flickr.jpg",
    available: true,
  },
  {
    id: 56,
    name: "Jeruk Hangat",
    category: "Minuman",
    price: 8000,
    description: "Minuman jeruk peras hangat",
    image: "/images/menus/Jeruk_hangat.jpg",
    available: true,
  },
  {
    id: 57,
    name: "Jeruk Dingin",
    category: "Minuman",
    price: 10000,
    description: "Minuman jeruk peras dingin dengan es",
    image: "/images/menus/es_jeruk.jpg",
    available: true,
  },
];

export const orders: Order[] = [
  {
    id: "ORD-0001",
    table: 3,
    time: "11:24",
    items: [
      { name: "1 Ekor Ayam Taliwang", qty: 1, price: 39000, notes: "Pedas sedang" },
      { name: "Nasi Liwet", qty: 2, price: 7000 },
      { name: "Es Teh Manis", qty: 2, price: 7000 },
    ],
    status: "new",
    total: 67000,
    paymentMethod: "QRIS",
    createdAt: "2026-11-11T11:24:00",
  },
  {
    id: "ORD-0002",
    table: 5,
    time: "11:18",
    items: [
      { name: "Ikan Nila Pecak", qty: 1, price: 30000 },
      { name: "Nasi Putih", qty: 2, price: 6000 },
      { name: "Kangkung Crispy", qty: 1, price: 10000 },
      { name: "Jeruk Dingin", qty: 2, price: 10000 },
    ],
    status: "processing",
    total: 72000,
    paymentMethod: "Cash",
    createdAt: "2026-11-11T11:18:00",
  },
  {
    id: "ORD-0003",
    table: 1,
    time: "11:05",
    items: [
      { name: "Soto Campur", qty: 2, price: 40000 },
      { name: "Nasi Putih", qty: 2, price: 6000 },
      { name: "Tempe Mendoan/pcs", qty: 4, price: 3000 },
      { name: "Es Teh Tawar", qty: 2, price: 5000 },
    ],
    status: "preparing",
    total: 114000,
    paymentMethod: "Debit",
    createdAt: "2026-11-11T11:05:00",
  },
  {
    id: "ORD-0004",
    table: 7,
    time: "10:52",
    items: [
      { name: "Ayam Bakakak Bakar", qty: 1, price: 39000 },
      { name: "Sayur Asem", qty: 1, price: 10000 },
      { name: "Botok Teri Pete Cina", qty: 1, price: 10000 },
      { name: "Nasi Liwet", qty: 2, price: 7000 },
    ],
    status: "ready",
    total: 73000,
    paymentMethod: "QRIS",
    createdAt: "2026-11-11T10:52:00",
  },
  {
    id: "ORD-0005",
    table: 2,
    time: "10:35",
    items: [
      { name: "Soto Ayam", qty: 2, price: 30000 },
      { name: "Nasi Putih", qty: 2, price: 6000 },
      { name: "Es Teh Manis", qty: 2, price: 7000 },
    ],
    status: "done",
    total: 86000,
    paymentMethod: "Cash",
    createdAt: "2026-11-11T10:35:00",
  },
];

export const dailySalesData = [
  { day: "Sen", revenue: 1245000, transactions: 38, expenses: 520000 },
  { day: "Sel", revenue: 1580000, transactions: 47, expenses: 610000 },
  { day: "Rab", revenue: 1320000, transactions: 41, expenses: 490000 },
  { day: "Kam", revenue: 1890000, transactions: 56, expenses: 720000 },
  { day: "Jum", revenue: 2150000, transactions: 68, expenses: 850000 },
  { day: "Sab", revenue: 2680000, transactions: 84, expenses: 1010000 },
  { day: "Min", revenue: 2320000, transactions: 72, expenses: 890000 },
];

export const topMenuData = [
  { name: "1 Ekor Ayam Taliwang", sold: 145, revenue: 5655000 },
  { name: "Nasi Liwet", sold: 210, revenue: 1470000 },
  { name: "Es Teh Manis", sold: 203, revenue: 1421000 },
  { name: "Ikan Nila Pecak", sold: 94, revenue: 2820000 },
  { name: "Soto Ayam", sold: 82, revenue: 2460000 },
  { name: "Kangkung Crispy", sold: 76, revenue: 760000 },
];

export const formatRp = (amount: number): string => {
  return "Rp " + Number(amount || 0).toLocaleString("id-ID");
};
