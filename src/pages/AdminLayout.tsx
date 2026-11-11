import { useState, useEffect } from "react";
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
} from "lucide-react";
import Dashboard from "./Dashboard";
import SalesReport from "./SalesReport";
import MenuManagement from "./MenuManagement";
import OrderDetail from "./OrderDetail";
import { orders as fallbackOrders, formatRp, type Order } from "../data/mockData";
import { api, mapDbOrderToUi } from "../lib/api";

type AdminPage = "dashboard" | "orders" | "menu" | "categories" | "report" | "users" | "settings";

const NAV_ITEMS: {
  id: AdminPage;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pesanan", icon: ShoppingBag },
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
  const [orderList, setOrderList] = useState<Order[]>(fallbackOrders);

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
