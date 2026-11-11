import { useState, useEffect } from "react";
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  orders as fallbackOrders,
  dailySalesData as fallbackSales,
  topMenuData as fallbackTopMenus,
  formatRp,
  type Order,
} from "../data/mockData";
import { api, mapDbOrderToUi } from "../lib/api";

const DATE_FILTERS = ["Hari ini", "Minggu ini", "Bulan ini", "Custom"];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-beige-dark shadow-lg p-3 text-sm">
      <p className="font-semibold text-dark mb-2 text-xs">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name === "revenue"
            ? "Pendapatan: "
            : p.name === "expenses"
            ? "Pengeluaran: "
            : "Transaksi: "}
          {p.name === "transactions" ? p.value : formatRp(p.value)}
        </p>
      ))}
    </div>
  );
};

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

export default function SalesReport() {
  const [activeFilter, setActiveFilter] = useState("Minggu ini");
  const [dateFrom, setDateFrom] = useState("2026-11-05");
  const [dateTo, setDateTo] = useState("2026-11-11");
  const [orders, setOrders] = useState<Order[]>(fallbackOrders);
  const [chartData, setChartData] = useState(
    fallbackSales.map((d) => ({
      period: d.day,
      revenue: d.revenue,
      transactions: d.transactions,
      expenses: d.expenses ?? 0,
    }))
  );
  const [topMenus, setTopMenus] = useState(fallbackTopMenus);

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
      .getSalesChart(7)
      .then((res) => {
        if (active && Array.isArray(res.chartData) && res.chartData.length > 0) {
          setChartData(
            res.chartData.map((d: any) => ({
              period: d.day_name || d.date,
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

  const totalRevenue = chartData.reduce((a, d) => a + d.revenue, 0);
  const totalExpenses = chartData.reduce((a, d) => a + d.expenses, 0);
  const totalTx = chartData.reduce((a, d) => a + d.transactions, 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="h-full overflow-y-auto bg-beige px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Laporan Penjualan</h1>
          <p className="text-dark/50 text-sm mt-0.5">
            Analisis pendapatan dan transaksi restoran
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 border border-beige-dark bg-white text-dark/70 text-sm font-medium px-4 py-2 rounded-xl hover:bg-beige transition-colors"
          >
            <Printer size={15} />
            Cetak
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-deep transition-colors"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-beige-dark p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-beige rounded-xl p-1 gap-1">
            {DATE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeFilter === f
                    ? "bg-primary text-white shadow-sm"
                    : "text-dark/60 hover:text-dark"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {activeFilter === "Custom" && (
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-beige-dark rounded-xl px-3 py-1.5 text-sm text-dark bg-beige outline-none focus:border-primary transition-colors"
              />
              <span className="text-dark/40 text-sm">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-beige-dark rounded-xl px-3 py-1.5 text-sm text-dark bg-beige outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Transaksi",
            value: `${totalTx}`,
            sub: "transaksi",
            icon: Receipt,
            color: "bg-primary",
            iconColor: "text-white",
            trend: "+14%",
          },
          {
            label: "Total Pendapatan",
            value: formatRp(totalRevenue),
            sub: "bruto",
            icon: TrendingUp,
            color: "bg-success",
            iconColor: "text-white",
            trend: "+9%",
          },
          {
            label: "Total Pengeluaran",
            value: formatRp(totalExpenses),
            sub: "operasional",
            icon: TrendingDown,
            color: "bg-danger",
            iconColor: "text-white",
            trend: "",
          },
          {
            label: "Laba Bersih",
            value: formatRp(netIncome),
            sub: "netto",
            icon: DollarSign,
            color: "bg-gold",
            iconColor: "text-white",
            trend: "+11%",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-beige-dark shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              {card.trend && (
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ArrowUpRight size={10} />
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-dark leading-tight">{card.value}</p>
            <p className="text-xs text-dark/50 mt-0.5">{card.label}</p>
            <p className="text-[10px] text-dark/30 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-beige-dark p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-dark">Tren Pendapatan & Pengeluaran</h2>
              <p className="text-xs text-dark/40 mt-0.5">{activeFilter}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8DC" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 9, fill: "#252525", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#252525", opacity: 0.4 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v >= 1000000 ? `${v / 1000000}jt` : `${v / 1000}rb`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) =>
                  value === "revenue" ? "Pendapatan" : "Pengeluaran"
                }
                wrapperStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2F5D50"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#C94C4C"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-beige-dark p-5">
          <div className="mb-5">
            <h2 className="font-bold text-dark">Menu Terlaris</h2>
            <p className="text-xs text-dark/40 mt-0.5">Berdasarkan jumlah terjual</p>
          </div>
          <div className="space-y-3">
            {topMenus.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-dark/80 flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i === 0
                          ? "bg-gold text-white"
                          : i === 1
                          ? "bg-soft-green text-white"
                          : i === 2
                          ? "bg-wood text-white"
                          : "bg-beige-dark text-dark/40"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-dark">{item.sold}</span>
                </div>
                <div className="h-1.5 bg-beige-dark rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, (item.sold / Math.max(1, topMenus[0]?.sold || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-beige-dark overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-beige-dark">
          <div>
            <h2 className="font-bold text-dark">Detail Transaksi</h2>
            <p className="text-xs text-dark/40 mt-0.5">{orders.length} transaksi</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-beige/60 text-left">
                {["ID Pesanan", "Meja", "Waktu", "Total", "Pembayaran", "Status"].map((h) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-beige-dark bg-beige/30 flex items-center justify-between">
          <span className="text-xs text-dark/40">
            Menampilkan {orders.length} dari {orders.length} transaksi
          </span>
          <span className="text-sm font-bold text-dark">
            Grand Total: {formatRp(orders.reduce((a, o) => a + o.total, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
