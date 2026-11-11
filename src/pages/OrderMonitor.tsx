import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  ChefHat,
  Bell,
  CheckCircle2,
  RefreshCw,
  Utensils,
  LayoutGrid,
  User,
} from "lucide-react";
import {
  api,
  formatRp,
  mapDbOrderToUi,
  type Order,
  type OrderStatus,
  type TableInfo,
} from "../lib/api";

const COLUMNS: {
  key: OrderStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    key: "new",
    label: "Pesanan Baru",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/30",
    icon: Bell,
  },
  {
    key: "processing",
    label: "Diproses",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: RefreshCw,
  },
  {
    key: "preparing",
    label: "Sedang Disiapkan",
    color: "text-wood",
    bg: "bg-wood/10",
    border: "border-wood/30",
    icon: ChefHat,
  },
  {
    key: "ready",
    label: "Siap Diantar",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    icon: Utensils,
  },
  {
    key: "done",
    label: "Selesai",
    color: "text-dark/40",
    bg: "bg-dark/5",
    border: "border-dark/10",
    icon: CheckCircle2,
  },
];

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: "processing",
  processing: "preparing",
  preparing: "ready",
  ready: "done",
  done: null,
};

const ACTION_LABEL: Record<OrderStatus, string> = {
  new: "Proses",
  processing: "Mulai Masak",
  preparing: "Siap Diantar",
  ready: "Selesai",
  done: "",
};

function elapsed(time: string): string {
  const parts = time.replace(".", ":").split(":").map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const now = new Date();
  const diff = now.getHours() * 60 + now.getMinutes() - (h * 60 + m);
  const d = Math.max(0, diff);
  if (d < 60) return `${d} mnt`;
  return `${Math.floor(d / 60)}j ${d % 60}m`;
}

export default function OrderMonitor() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [now, setNow] = useState(() =>
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );

  const loadData = useCallback(() => {
    api
      .getOrders()
      .then((res) => {
        if (Array.isArray(res.orders)) {
          setOrders(res.orders.map(mapDbOrderToUi));
        }
      })
      .catch(() => {});

    api
      .getTables()
      .then((res) => {
        if (Array.isArray(res.tables)) {
          setTables(res.tables);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
    const iv = setInterval(() => {
      loadData();
      setNow(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    }, 3000);

    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(iv);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadData]);

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))
    );
    try {
      await api.updateOrderStatus(order.dbId || order.id, next);
      loadData();
    } catch {
      loadData();
    }
  };

  const handleToggleTableStatus = async (table: TableInfo) => {
    const nextStatus = table.status === "occupied" ? "available" : "occupied";
    setTables((prev) =>
      prev.map((t) => (t.table_number === table.table_number ? { ...t, status: nextStatus } : t))
    );
    await api.updateTableStatus(table.id || table.table_number, nextStatus);
    loadData();
  };

  const visibleOrders =
    selectedTable === null ? orders : orders.filter((o) => o.table === selectedTable);

  const columnOrders = (key: OrderStatus) => visibleOrders.filter((o) => o.status === key);

  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const selectedTableObj =
    selectedTable !== null ? tables.find((t) => t.table_number === selectedTable) : null;

  return (
    <div className="h-full bg-primary-deep flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-primary-deep border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <ChefHat size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-soft-green font-medium tracking-widest uppercase">
              Saung Pete Cina
            </p>
            <h1 className="text-white font-bold text-base leading-tight">
              Monitor Pesanan & Meja
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5"
            title="Segarkan pesanan & meja"
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Live Sync</span>
          </button>
          <div className="bg-white/10 rounded-xl px-3 py-1.5 text-white/80 text-sm">
            <LayoutGrid size={13} className="inline mr-1.5 text-gold" />
            <span className="font-bold text-white">{occupiedCount}</span>
            <span className="text-white/50 ml-1">/ {tables.length || 12} meja terisi</span>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-1.5 text-white/80 text-sm font-semibold">
            <Clock size={13} className="inline mr-1.5 text-soft-green" />
            {now}
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-1.5 text-white/80 text-sm">
            <span className="font-bold text-white">
              {orders.filter((o) => o.status !== "done").length}
            </span>
            <span className="text-white/50 ml-1">pesanan aktif</span>
          </div>
        </div>
      </div>

      {/* Bar Integrasi Status Meja (/api/tables) */}
      <div className="bg-white/5 border-b border-white/10 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedTable(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTable === null
                ? "bg-primary text-white shadow-sm"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            Semua Meja ({orders.filter((o) => o.status !== "done").length})
          </button>
          {tables.map((t) => {
            const activeForTable = orders.filter(
              (o) => o.table === t.table_number && o.status !== "done"
            ).length;
            const isOccupied = t.status === "occupied" || activeForTable > 0;
            const isSelected = selectedTable === t.table_number;

            return (
              <button
                key={t.table_number}
                onClick={() =>
                  setSelectedTable(isSelected ? null : t.table_number)
                }
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? "bg-gold text-white border-gold shadow-sm"
                    : isOccupied
                    ? "bg-gold/15 text-gold border-gold/40 hover:bg-gold/25"
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80"
                }`}
                title={`Meja ${t.table_number} (${isOccupied ? "Terisi" : "Kosong"})`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOccupied ? "bg-gold animate-pulse" : "bg-success"
                  }`}
                />
                <span>Meja {t.table_number}</span>
                {activeForTable > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/25 text-white" : "bg-gold text-white"
                    }`}
                  >
                    {activeForTable}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedTableObj && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-white/60">
              Status Meja {selectedTableObj.table_number}:{" "}
              <strong
                className={
                  selectedTableObj.status === "occupied" ? "text-gold" : "text-success"
                }
              >
                {selectedTableObj.status === "occupied" ? "Terisi" : "Tersedia"}
              </strong>
            </span>
            <button
              onClick={() => handleToggleTableStatus(selectedTableObj)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {selectedTableObj.status === "occupied" ? "Kosongkan Meja" : "Tandai Terisi"}
            </button>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-3 h-full min-w-max">
          {COLUMNS.map((col) => {
            const colOrders = columnOrders(col.key);
            return (
              <div
                key={col.key}
                className="w-72 flex flex-col bg-white/5 rounded-2xl overflow-hidden"
              >
                {/* Column Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${col.bg} flex items-center justify-center`}>
                      <col.icon size={14} className={col.color} />
                    </div>
                    <h2 className="text-white text-sm font-semibold">{col.label}</h2>
                  </div>
                  <span
                    className={`text-xs font-bold ${col.color} ${col.bg} px-2 py-0.5 rounded-full border ${col.border}`}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Order Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {colOrders.length === 0 && (
                    <div className="text-center py-8 text-white/20 text-sm">Tidak ada pesanan</div>
                  )}
                  {colOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`bg-white rounded-xl border ${col.border} overflow-hidden shadow-sm`}
                    >
                      {/* Card Header */}
                      <div className={`${col.bg} px-3 py-2 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark text-sm">{order.id}</span>
                          <button
                            onClick={() =>
                              setSelectedTable(
                                selectedTable === order.table ? null : order.table
                              )
                            }
                            className={`text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 ${col.color} hover:bg-white transition-colors`}
                          >
                            Meja {order.table}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-dark/50 text-xs">
                          <Clock size={11} />
                          <span>{order.time}</span>
                          <span className="text-dark/30">·</span>
                          <span className="text-gold font-medium">{elapsed(order.time)}</span>
                        </div>
                      </div>

                      {/* Customer & Order Type Subheader */}
                      <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b border-beige-dark/60 text-[11px] text-dark/60">
                        <span className="flex items-center gap-1 font-medium text-dark/80 truncate">
                          <User size={11} className="text-primary shrink-0" />
                          {order.customerName || "Pelanggan"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-beige text-dark/70 font-medium text-[10px]">
                          {order.orderType === "takeaway" ? "Bawa Pulang" : "Makan di Tempat"}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="px-3 py-2.5 space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {item.qty}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-dark text-xs font-medium leading-snug">
                                {item.name}
                              </p>
                              {item.notes && (
                                <p className="text-[10px] text-gold font-medium mt-0.5 leading-tight">
                                  ⚠ {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {order.notes && (
                          <p className="text-[10px] text-wood bg-gold/10 rounded-lg px-2 py-1 font-medium">
                            Catatan: {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-3 pb-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-dark">{formatRp(order.total)}</span>
                        {NEXT_STATUS[order.status] && (
                          <button
                            onClick={() => advance(order)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                              col.key === "new"
                                ? "bg-gold text-white hover:bg-gold/90"
                                : col.key === "processing"
                                ? "bg-wood text-white hover:bg-wood/90"
                                : col.key === "preparing"
                                ? "bg-success text-white hover:bg-success/90"
                                : "bg-primary text-white hover:bg-primary-deep"
                            }`}
                          >
                            {ACTION_LABEL[order.status]}
                          </button>
                        )}
                        {order.status === "done" && (
                          <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
