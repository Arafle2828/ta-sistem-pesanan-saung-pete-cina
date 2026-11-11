import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronRight,
  CheckCircle2,
  Clock,
  ChefHat,
  Bell,
  Package,
  UtensilsCrossed,
} from "lucide-react";
import {
  menuItems as fallbackMenuItems,
  CATEGORIES,
  formatRp,
  type MenuCategory,
  type MenuItem,
} from "../data/mockData";
import { api, mapDbMenuToUi } from "../lib/api";

interface CartItem {
  item: MenuItem;
  qty: number;
}

const STATUS_STEPS = [
  { key: "received", label: "Diterima", icon: CheckCircle2 },
  { key: "processing", label: "Diproses", icon: Clock },
  { key: "preparing", label: "Disiapkan", icon: ChefHat },
  { key: "ready", label: "Siap", icon: Bell },
  { key: "done", label: "Selesai", icon: Package },
];

const DB_STATUS_TO_STEP: Record<string, number> = {
  new: 1,
  processing: 2,
  preparing: 3,
  ready: 4,
  completed: 5,
  done: 5,
};

export default function CustomerOrder() {
  const tableNumber = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("table")) || 5;
  }, []);

  const [menus, setMenus] = useState<MenuItem[]>(fallbackMenuItems);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Pelanggan");
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
  const [orderNote, setOrderNote] = useState("");
  const [step, setStep] = useState<"menu" | "cart" | "confirm" | "tracking">("menu");
  const [orderStatus, setOrderStatus] = useState(1);
  const [orderNumber, setOrderNumber] = useState("ORD-0001");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getMenus()
      .then((res) => {
        if (active && Array.isArray(res.menus) && res.menus.length > 0) {
          setMenus(res.menus.map(mapDbMenuToUi));
        }
      })
      .catch(() => {
        // Gunakan fallback data lokal jika server belum aktif
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (step !== "tracking" || !orderNumber) return;
    const iv = setInterval(() => {
      api
        .getOrderDetail(orderNumber)
        .then((res) => {
          if (res.order?.status) {
            setOrderStatus(DB_STATUS_TO_STEP[res.order.status] ?? 1);
          }
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(iv);
  }, [step, orderNumber]);

  const filteredMenu = useMemo(
    () =>
      activeCategory === "Semua"
        ? menus
        : menus.filter((m) => m.category === activeCategory),
    [activeCategory, menus]
  );

  const cartCount = cart.reduce((acc, c) => acc + c.qty, 0);
  const cartTotal = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string | number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const getQty = (id: string | number) => cart.find((c) => c.item.id === id)?.qty ?? 0;

  const handleOrder = async () => {
    setSubmitting(true);
    try {
      const res = await api.createOrder({
        table_number: tableNumber,
        customer_name: customerName.trim() || "Pelanggan",
        order_type: orderType,
        notes: orderNote.trim() || undefined,
        items: cart.map(({ item, qty }) => ({
          menu_id: item.id,
          name: item.name,
          quantity: qty,
        })),
      });
      if (res.order?.order_number) {
        setOrderNumber(res.order.order_number);
      }
      setOrderStatus(1);
      setStep("tracking");
    } catch {
      // Fallback simulasi jika backend tidak aktif
      setOrderNumber(`ORD-${String(Math.floor(Math.random() * 900) + 100)}`);
      setOrderStatus(1);
      setStep("tracking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-primary-deep flex items-center justify-center overflow-hidden">
      <div className="w-[390px] h-full bg-beige flex flex-col relative overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-primary text-white px-4 pt-10 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-soft-green font-medium tracking-widest uppercase">
                Saung Pete Cina
              </p>
              <h1 className="text-lg font-bold leading-tight">Selamat Datang!</h1>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center border border-white/20">
              <p className="text-[10px] text-soft-green font-medium">MEJA</p>
              <p className="text-xl font-bold leading-none">{tableNumber}</p>
            </div>
          </div>
          <p className="text-xs text-white/60 mt-1">
            Silakan pilih menu dan pesan langsung dari meja Anda
          </p>
        </div>

        {step === "menu" && (
          <>
            {/* Category Tabs */}
            <div className="bg-white border-b border-beige-dark px-2 py-2 flex gap-1 overflow-x-auto shrink-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "text-dark/60 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-beige-dark transition-all ${
                    !item.available ? "opacity-60" : ""
                  }`}
                >
                  <div className="relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-36 object-cover bg-beige-dark"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-primary/15 via-beige to-wood/15 flex items-center justify-center">
                        <UtensilsCrossed size={28} className="text-primary/35" />
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
                        <span className="bg-danger text-white text-xs font-bold px-3 py-1 rounded-full">
                          Habis
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {formatRp(item.price)}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-dark text-sm leading-tight">{item.name}</h3>
                        <p className="text-xs text-dark/50 mt-0.5 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {getQty(item.id) > 0 ? (
                        <div className="flex items-center gap-3 bg-primary/5 rounded-xl px-1 py-1">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white border border-beige-dark flex items-center justify-center text-primary shadow-sm"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="text-sm font-bold text-primary w-4 text-center">
                            {getQty(item.id)}
                          </span>
                          <button
                            onClick={() => item.available && addToCart(item)}
                            className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => item.available && addToCart(item)}
                          disabled={!item.available}
                          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          Tambah
                        </button>
                      )}
                      <span className="text-[10px] text-dark/40 bg-beige rounded-lg px-2 py-1 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-20" />
            </div>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-beige via-beige/95 to-transparent pointer-events-none">
                <button
                  onClick={() => setStep("cart")}
                  className="w-full bg-primary text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-lg shadow-primary/30 pointer-events-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-1.5">
                      <ShoppingCart size={18} />
                    </div>
                    <span className="font-bold text-sm">{cartCount} item ditambahkan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{formatRp(cartTotal)}</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              </div>
            )}
          </>
        )}

        {step === "cart" && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-beige-dark shrink-0">
              <button
                onClick={() => setStep("menu")}
                className="w-8 h-8 rounded-xl border border-beige-dark flex items-center justify-center"
              >
                <X size={16} className="text-dark/60" />
              </button>
              <h2 className="font-bold text-dark">Pesanan Saya</h2>
              <span className="ml-auto text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-full">
                {cartCount} item
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map(({ item, qty }) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 border border-beige-dark flex items-center gap-3"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-beige-dark shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <UtensilsCrossed size={20} className="text-primary/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark text-sm leading-tight">{item.name}</p>
                    <p className="text-xs text-primary font-semibold mt-0.5">
                      {formatRp(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg border border-beige-dark flex items-center justify-center text-dark/60"
                    >
                      <Minus size={12} strokeWidth={2.5} />
                    </button>
                    <span className="text-sm font-bold text-dark w-4 text-center">{qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-t border-beige-dark px-4 py-4 shrink-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-dark/60 mb-1 block">
                    Nama Pemesan
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Pelanggan"
                    className="w-full rounded-xl border border-beige-dark bg-beige text-xs text-dark px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark/60 mb-1 block">
                    Tipe Pesanan
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as "dine-in" | "takeaway")}
                    className="w-full rounded-xl border border-beige-dark bg-beige text-xs text-dark px-3 py-2 outline-none focus:border-primary"
                  >
                    <option value="dine-in">Makan di Tempat</option>
                    <option value="takeaway">Bawa Pulang</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-dark/60 mb-1.5 block">
                  Catatan untuk Dapur (opsional)
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Misal: tidak pedas, kurangi garam..."
                  className="w-full rounded-xl border border-beige-dark bg-beige text-sm text-dark px-3 py-2.5 resize-none outline-none focus:border-primary transition-colors"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark/60 font-medium">Total Pesanan</span>
                <span className="font-bold text-dark text-lg">{formatRp(cartTotal)}</span>
              </div>
              <button
                onClick={() => setStep("confirm")}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:bg-primary-deep transition-colors shadow-lg shadow-primary/30"
              >
                Lanjut ke Konfirmasi
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-beige-dark shrink-0">
              <button
                onClick={() => setStep("cart")}
                className="w-8 h-8 rounded-xl border border-beige-dark flex items-center justify-center"
              >
                <X size={16} className="text-dark/60" />
              </button>
              <h2 className="font-bold text-dark">Konfirmasi Pesanan</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="bg-white rounded-2xl border border-beige-dark p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-dark/60 uppercase tracking-wide">
                    Meja {tableNumber} · {orderType === "dine-in" ? "Makan di Tempat" : "Bawa Pulang"}
                  </span>
                  <span className="text-xs text-dark/40">{cart.length} menu pilihan</span>
                </div>
                {cart.map(({ item, qty }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-beige-dark/50 last:border-0"
                  >
                    <span className="text-sm text-dark font-medium">
                      {item.name} ×{qty}
                    </span>
                    <span className="text-sm font-semibold text-dark">
                      {formatRp(item.price * qty)}
                    </span>
                  </div>
                ))}
                {orderNote && (
                  <div className="mt-3 bg-gold/10 rounded-xl p-3">
                    <p className="text-xs text-wood font-semibold mb-0.5">Catatan</p>
                    <p className="text-xs text-dark/70">{orderNote}</p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-beige-dark">
                  <span className="font-bold text-dark">Total</span>
                  <span className="font-bold text-primary text-lg">{formatRp(cartTotal)}</span>
                </div>
              </div>
              <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 text-xs text-wood leading-relaxed">
                <p className="font-semibold mb-1">Pembayaran di Kasir</p>
                <p className="text-dark/60">
                  Kami menerima <strong>Cash</strong>, <strong>Debit</strong>, dan{" "}
                  <strong>QRIS</strong>. Tagihan akan diberikan setelah makan.
                </p>
              </div>
            </div>
            <div className="px-4 pb-6 shrink-0">
              <button
                onClick={handleOrder}
                disabled={submitting}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:bg-primary-deep transition-colors shadow-lg shadow-primary/30 disabled:opacity-50"
              >
                {submitting ? "Mengirim Pesanan..." : "Kirim Pesanan Sekarang"}
              </button>
            </div>
          </div>
        )}

        {step === "tracking" && (
          <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-8">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="font-bold text-dark text-xl text-center mb-1">Pesanan Diterima!</h2>
            <p className="text-dark/50 text-sm text-center mb-2">Nomor pesanan Anda</p>
            <div className="bg-primary text-white rounded-2xl px-6 py-2 mb-6">
              <span className="text-xl font-bold tracking-widest">{orderNumber}</span>
            </div>
            <div className="w-full bg-white rounded-2xl border border-beige-dark p-5 space-y-4">
              <h3 className="font-bold text-dark text-sm">Status Pesanan</h3>
              {STATUS_STEPS.map((s, i) => {
                const done = i < orderStatus;
                const active =
                  i === orderStatus - 1 ||
                  (orderStatus >= STATUS_STEPS.length && i === STATUS_STEPS.length - 1);
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        done || active ? "bg-primary text-white" : "bg-beige-dark text-dark/30"
                      } ${active ? "ring-4 ring-primary/20 scale-110" : ""}`}
                    >
                      <s.icon size={15} />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          done || active ? "text-dark" : "text-dark/30"
                        }`}
                      >
                        {s.label}
                      </p>
                    </div>
                    {active && (
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((d) => (
                          <div
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: `${d * 150}ms` }}
                          />
                        ))}
                      </div>
                    )}
                    {done && i < orderStatus - 1 && (
                      <CheckCircle2 size={16} className="text-success" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 w-full bg-white rounded-2xl border border-beige-dark p-4">
              <h3 className="font-bold text-dark text-sm mb-2">Ringkasan Pesanan</h3>
              {cart.map(({ item, qty }) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-dark/70">
                    {item.name} ×{qty}
                  </span>
                  <span className="font-medium text-dark">{formatRp(item.price * qty)}</span>
                </div>
              ))}
              <div className="border-t border-beige-dark mt-2 pt-2 flex justify-between">
                <span className="font-bold text-dark text-sm">Total</span>
                <span className="font-bold text-primary">{formatRp(cartTotal)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setCart([]);
                setStep("menu");
                setOrderStatus(1);
                setOrderNote("");
              }}
              className="mt-5 w-full border border-primary text-primary font-semibold py-3 rounded-2xl text-sm hover:bg-primary/5 transition-colors"
            >
              Tambah Pesanan Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
