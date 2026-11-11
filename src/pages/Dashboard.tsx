import { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, Clock, Star } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { api, formatRp, mapDbOrderToUi, type Order } from "../lib/api";

const STATUS_LABEL: Record<string, string> = {
  new: "Baru",
  processing: "Diproses",
  preparing: "Disiapkan",
  ready: "Siap",
  done: "Selesai",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  processing: "bg-blue-100 text-blue-700",
  preparing: "bg-wood/15 text-wood",
  ready: "bg-success/15 text-success",
  done: "bg-dark/10 text-dark/50",
};

const CustomLineTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-beige-dark shadow-lg p-3 text-sm">
      <p className="font-semibold text-dark mb-1">{label}</p>
      <p className="text-primary font-bold">{formatRp(payload[0].value)}</p>
    </div>
  );
};

const CustomBarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-beige-dark shadow-lg p-3 text-sm">
      <p className="font-semibold text-dark mb-1">{label}</p>
      <p className="text-wood font-bold">{payload[0].value} terjual</p>
    </div>
  );
};

interface Props {
  onViewOrder: (id: string) => void;
}

export default function Dashboard({ onViewOrder }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<
    Array<{ day: string; revenue: number; transactions: number; expenses: number }>
  >([]);
  const [topMenus, setTopMenus] = useState<Array<{ name: string; sold: number; revenue: number }>>(
    []
  );
  const [summary, setSummary] = useState<{
    total_transactions_today: number;
    total_revenue_today: number;
    active_orders: number;
    top_menu_today: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getOrders()
      .then((res) => {
        if (active && Array.isArray(res.orders)) {
          setOrders(res.orders.map(mapDbOrderToUi));
        }
      })
      .catch(() => {});

    api
      .getReportSummary()
      .then((res) => {
        if (active && res.summary) setSummary(res.summary);
      })
      .catch(() => {});

    api
      .getSalesChart(7)
      .then((res) => {
        if (active && Array.isArray(res.chartData) && res.chartData.length > 0) {
          setSalesData(
            res.chartData.map((d: any) => ({
              day: d.day_name || d.date,
              revenue: Number(d.revenue || 0),
              transactions: Number(d.transactions || 0),
              expenses: Number(d.expenses || 0),
            }))
          );
        }
      })
      .catch(() => {});

    api
      .getBestSellers(6)
      .then((res) => {
        if (active && Array.isArray(res.bestSellers) && res.bestSellers.length > 0) {
          setTopMenus(
            res.bestSellers.map((b: any) => ({
              name: b.name,
              sold: Number(b.sold || 0),
              revenue: Number(b.revenue || 0),
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const todayRevenue =
    summary?.total_revenue_today ?? salesData[salesData.length - 1]?.revenue ?? 0;
  const todayTx =
    summary?.total_transactions_today ?? salesData[salesData.length - 1]?.transactions ?? 0;
  const activeOrders =
    summary?.active_orders ?? orders.filter((o) => o.status !== "done").length;
  const topItem = topMenus[0] || { name: summary?.top_menu_today || "-", sold: 0 };

  return (
    <div className="h-full overflow-y-auto bg-beige px-6 py-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-dark font-serif">Dashboard</h1>
        <p className="text-dark/50 text-sm mt-0.5">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · Restoran buka
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Transaksi Hari Ini",
            value: todayTx.toString(),
            sub: "transaksi",
            icon: ShoppingBag,
            color: "bg-primary",
          },
          {
            label: "Total Pendapatan Hari Ini",
            value: formatRp(todayRevenue),
            sub: "pendapatan hari ini",
            icon: TrendingUp,
            color: "bg-wood",
          },
          {
            label: "Pesanan Diproses",
            value: activeOrders.toString(),
            sub: "pesanan aktif",
            icon: Clock,
            color: "bg-gold",
          },
          {
            label: "Menu Terlaris",
            value: topItem.name.split(" ").slice(0, 3).join(" "),
            sub: `${topItem.sold} terjual`,
            icon: Star,
            color: "bg-soft-green",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-beige-dark shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-dark leading-tight">{card.value}</p>
            <p className="text-xs text-dark/50 mt-0.5">{card.label}</p>
            <p className="text-[10px] text-dark/35 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Line Chart: Daily Revenue */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-beige-dark p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-dark">Penjualan 7 Hari Terakhir</h2>
              <p className="text-xs text-dark/40 mt-0.5">Total pendapatan per hari</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
              7 Hari
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8DC" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#252525", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#252525", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v >= 1000000 ? `${v / 1000000}jt` : `${v / 1000}rb`)}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2F5D50"
                strokeWidth={2.5}
                dot={{ fill: "#2F5D50", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#2F5D50" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Top Menu */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-beige-dark p-5">
          <div className="mb-5">
            <h2 className="font-bold text-dark">Menu Terlaris</h2>
            <p className="text-xs text-dark/40 mt-0.5">Saung Pete Cina</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={topMenus.slice(0, 4)}
              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8DC" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#252525", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9, fill: "#252525", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={(v: string) => (v.length > 12 ? v.slice(0, 12) + "…" : v)}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="sold" fill="#8B5E3C" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-beige-dark overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-beige-dark">
          <div>
            <h2 className="font-bold text-dark">Pesanan Terkini</h2>
            <p className="text-xs text-dark/40 mt-0.5">{orders.length} pesanan</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-beige/60 text-left">
                {["ID Pesanan", "Meja", "Waktu", "Total", "Pembayaran", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold text-dark/40 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-beige-dark/50 hover:bg-beige/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-semibold text-dark whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-5 py-3.5 text-dark/70">Meja {order.table}</td>
                  <td className="px-5 py-3.5 text-dark/50 whitespace-nowrap">{order.time}</td>
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
                      className="text-xs text-primary font-semibold hover:underline whitespace-nowrap"
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
