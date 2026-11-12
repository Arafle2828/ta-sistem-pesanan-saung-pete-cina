import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tag,
  BarChart3,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  QrCode,
  RefreshCw,
  Unlock,
  ExternalLink,
  Copy,
  Check,
  Timer,
} from "lucide-react";
import Dashboard from "./Dashboard";
import SalesReport from "./SalesReport";
import MenuManagement from "./MenuManagement";
import OrderDetail from "./OrderDetail";
import { api, formatRp, mapDbOrderToUi, type Order, type TableInfo } from "../lib/api";

type AdminPage =
  | "dashboard"
  | "orders"
  | "tables"
  | "menu"
  | "categories"
  | "report"
  | "users"
  | "settings";

const NAV_ITEMS: {
  id: AdminPage;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pesanan", icon: ShoppingBag },
  { id: "tables", label: "Meja & QR Code", icon: QrCode },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "categories", label: "Kategori", icon: Tag },
  { id: "report", label: "Laporan Penjualan", icon: BarChart3 },
  { id: "users", label: "Pengguna", icon: Users },
  { id: "settings", label: "Pengaturan", icon: Settings },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  processing: "bg-blue-100 text-blue-700",
  preparing: "bg-wood/15 text-wood",
  ready: "bg-success/15 text-success",
  done: "bg-dark/10 text-dark/50",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Baru",
  processing: "Diproses",
  preparing: "Disiapkan",
  ready: "Siap",
  done: "Selesai",
};

function OrdersPage({ onViewOrder }: { onViewOrder: (id: string) => void }) {
  const [orderList, setOrderList] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    api
      .getOrders()
      .then((res) => {
        if (active && Array.isArray(res.orders)) {
          setOrderList(res.orders.map(mapDbOrderToUi));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-beige px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-dark font-serif">Pesanan</h1>
        <p className="text-dark/50 text-sm mt-0.5">{orderList.length} pesanan tercatat</p>
      </div>
      <div className="bg-white rounded-2xl border border-beige-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-beige/60">
                {["ID Pesanan", "Meja", "Waktu", "Item", "Total", "Pembayaran", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-dark/40 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {orderList.map((order: Order) => (
                <tr
                  key={order.id}
                  className="border-t border-beige-dark/50 hover:bg-beige/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-semibold text-dark whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-5 py-3.5 text-dark/70">Meja {order.table}</td>
                  <td className="px-5 py-3.5 text-dark/50">{order.time}</td>
                  <td className="px-5 py-3.5 text-dark/60">
                    {order.items.reduce((a, i) => a + i.qty, 0)} item
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-dark whitespace-nowrap">
                    {formatRp(order.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-beige text-dark/60 font-medium px-2 py-1 rounded-lg">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => onViewOrder(order.id)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CategoriesPage() {
  const [cats, setCats] = useState<Array<{ id: string; name: string; slug: string; sort_order: number }>>([]);

  useEffect(() => {
    api
      .getCategories()
      .then((res) => {
        if (Array.isArray(res.categories)) setCats(res.categories);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-beige px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-dark font-serif">Kategori Menu</h1>
        <p className="text-dark/50 text-sm mt-0.5">{cats.length} kategori terdaftar di database</p>
      </div>
      <div className="bg-white rounded-2xl border border-beige-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige/60 text-left">
              {["Urutan", "Nama Kategori", "Slug"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-dark/40 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-beige-dark/50">
                <td className="px-5 py-3.5 font-semibold text-dark">{c.sort_order}</td>
                <td className="px-5 py-3.5 font-semibold text-primary">{c.name}</td>
                <td className="px-5 py-3.5 text-dark/60 font-mono text-xs">{c.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TablesQrPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [message, setMessage] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    try {
      const res = await api.getTables();
      if (Array.isArray(res.tables)) {
        setTables(res.tables);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
    const pollIv = setInterval(loadTables, 4000);
    const clockIv = setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      clearInterval(pollIv);
      clearInterval(clockIv);
    };
  }, [loadTables]);

  const handleRegenerateQr = async (tableNumber: number) => {
    setBusyId(`qr-${tableNumber}`);
    setMessage(null);
    try {
      const res = await api.regenerateTableQr(tableNumber);
      setMessage(res.message || `QR Meja ${tableNumber} berhasil diacak ulang.`);
      await loadTables();
    } catch (err: any) {
      setMessage(err?.message || "Gagal mengacak QR meja.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRegenerateAll = async () => {
    setBusyId("all");
    setMessage(null);
    try {
      const res = await api.regenerateAllTableQrs();
      setMessage(res.message || "Seluruh QR Code meja berhasil diacak ulang.");
      await loadTables();
    } catch (err: any) {
      setMessage(err?.message || "Gagal mengacak seluruh QR meja.");
    } finally {
      setBusyId(null);
    }
  };

  const handleResetSession = async (tableNumber: number) => {
    setBusyId(`reset-${tableNumber}`);
    setMessage(null);
    try {
      const res = await api.resetTableSession(tableNumber);
      setMessage(res.message || `Sesi Meja ${tableNumber} berhasil dibuka kembali.`);
      await loadTables();
    } catch (err: any) {
      setMessage(err?.message || "Gagal mereset sesi meja.");
    } finally {
      setBusyId(null);
    }
  };

  const formatRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diffSec = Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000);
    if (diffSec <= 0) return "Habis";
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const occupiedCount = tables.filter(
    (t) => t.status === "occupied" || t.has_active_session || t.active_orders_count > 0
  ).length;

  return (
    <div className="h-full overflow-y-auto bg-beige px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">
            Manajemen Meja, Token QR Acak & Sesi Pemesanan
          </h1>
          <p className="text-dark/50 text-sm mt-0.5">
            Setiap meja memiliki kode QR unik acak & batas waktu sesi 15 menit untuk mencegah tabrakan pesanan antar meja
          </p>
        </div>
        <button
          onClick={handleRegenerateAll}
          disabled={busyId === "all"}
          className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-deep transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={busyId === "all" ? "animate-spin" : ""} />
          Acak Ulang Semua QR Meja
        </button>
      </div>

      {/* Ringkasan Status Meja */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-beige-dark p-4">
          <p className="text-xs text-dark/40 font-semibold uppercase">Total Meja</p>
          <p className="text-2xl font-bold text-dark mt-1">{tables.length} Meja</p>
        </div>
        <div className="bg-white rounded-2xl border border-beige-dark p-4">
          <p className="text-xs text-dark/40 font-semibold uppercase">Meja Tersedia</p>
          <p className="text-2xl font-bold text-success mt-1">
            {Math.max(0, tables.length - occupiedCount)} Meja
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-beige-dark p-4">
          <p className="text-xs text-dark/40 font-semibold uppercase">Meja Terkunci / Aktif</p>
          <p className="text-2xl font-bold text-wood mt-1">{occupiedCount} Meja</p>
        </div>
      </div>

      {message && (
        <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-primary/60 hover:text-primary">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-beige-dark p-10 text-center text-sm text-dark/40">
          Memuat daftar meja & QR Code...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((t) => {
            const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8443";
            const qrPath = `/order?qr=${encodeURIComponent(t.qr_token)}`;
            const fullUrl = `${origin}${qrPath}`;
            const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(
              fullUrl
            )}`;
            const remaining = formatRemaining(t.session_expires_at);
            const isOccupied =
              t.status === "occupied" ||
              t.has_active_session ||
              t.active_orders_count > 0;

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-beige-dark p-4 flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-dark">Meja {t.table_number}</span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isOccupied
                          ? "bg-gold/15 text-wood"
                          : "bg-success/15 text-success"
                      }`}
                    >
                      {isOccupied ? "Sedang Digunakan" : "Tersedia"}
                    </span>
                  </div>

                  {/* Visual QR & Token Info */}
                  <div className="mt-3 flex items-center gap-3 bg-beige/60 rounded-xl p-2.5 border border-beige-dark/60">
                    <img
                      src={qrImgUrl}
                      alt={`QR Meja ${t.table_number}`}
                      className="w-16 h-16 rounded-lg bg-white p-1 border border-beige-dark shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[10px] font-semibold text-dark/40 uppercase">
                        Token QR Acak
                      </p>
                      <p className="text-xs font-mono font-bold text-primary truncate">
                        {t.qr_token}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(fullUrl);
                            setCopiedId(t.id);
                            setTimeout(() => setCopiedId(null), 1500);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-dark/60 hover:text-primary bg-white px-2 py-1 rounded-lg border border-beige-dark"
                        >
                          {copiedId === t.id ? <Check size={11} /> : <Copy size={11} />}
                          {copiedId === t.id ? "Tersalin" : "Salin URL"}
                        </button>
                        <a
                          href={qrPath}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary/15"
                        >
                          <ExternalLink size={11} />
                          Uji QR
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Info Sesi & Pesanan Aktif */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-dark/60">
                      <span>Pesanan Aktif:</span>
                      <strong className="text-dark">{t.active_orders_count} pesanan</strong>
                    </div>
                    <div className="flex items-center justify-between text-dark/60">
                      <span className="flex items-center gap-1">
                        <Timer size={12} />
                        Timer Sesi (Maks 15m):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          remaining && remaining !== "Habis" ? "text-primary" : "text-dark/40"
                        }`}
                      >
                        {remaining || "Tidak aktif"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Admin/Kasir */}
                <div className="pt-2 border-t border-beige-dark/60 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRegenerateQr(t.table_number)}
                    disabled={busyId === `qr-${t.table_number}`}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-dark/70 hover:text-primary bg-beige hover:bg-primary/10 py-2 px-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      size={12}
                      className={busyId === `qr-${t.table_number}` ? "animate-spin" : ""}
                    />
                    Acak QR
                  </button>
                  <button
                    onClick={() => handleResetSession(t.table_number)}
                    disabled={busyId === `reset-${t.table_number}`}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-wood hover: bg-gold/15 hover:bg-gold/25 py-2 px-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Unlock size={12} />
                    Reset Sesi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-beige gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Settings size={28} className="text-primary/40" />
      </div>
      <h2 className="text-xl font-bold text-dark">{title}</h2>
      <p className="text-dark/40 text-sm max-w-xs">
        Halaman ini sedang dalam pengembangan dan akan segera tersedia.
      </p>
    </div>
  );
}

export default function AdminLayout() {
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleViewOrder = (id: string) => setSelectedOrderId(id);
  const handleBack = () => setSelectedOrderId(null);

  const renderContent = () => {
    if (selectedOrderId) {
      return <OrderDetail orderId={selectedOrderId} onBack={handleBack} />;
    }
    switch (page) {
      case "dashboard":
        return <Dashboard onViewOrder={handleViewOrder} />;
      case "orders":
        return <OrdersPage onViewOrder={handleViewOrder} />;
      case "tables":
        return <TablesQrPage />;
      case "menu":
        return <MenuManagement />;
      case "report":
        return <SalesReport />;
      case "categories":
        return <CategoriesPage />;
      case "users":
        return <ComingSoon title="Manajemen Pengguna" />;
      case "settings":
        return <ComingSoon title="Pengaturan" />;
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 bg-primary-deep flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <UtensilsCrossed size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Saung Pete Cina</p>
              <p className="text-soft-green text-[10px] font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
            Menu Utama
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = page === item.id && !selectedOrderId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setSelectedOrderId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                    active
                      ? "bg-primary text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    size={17}
                    className={active ? "text-white" : "text-white/40 group-hover:text-white"}
                  />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {active && <ChevronRight size={14} className="text-white/40" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">SP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold leading-tight truncate">
                Pemilik Saung
              </p>
              <p className="text-white/30 text-[10px]">Admin Restoran</p>
            </div>
            <button className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
              <LogOut size={14} className="text-white/30 hover:text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
}
