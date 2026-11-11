import { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, ChefHat, Bell, Package, Printer } from "lucide-react";
import { orders as fallbackOrders, formatRp, type Order, type PaymentMethod } from "../data/mockData";
import { api, mapDbOrderToUi } from "../lib/api";

const STATUS_STEPS: {
  key: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { key: "received", label: "Pesanan Diterima", sub: "Pesanan masuk ke sistem", icon: CheckCircle2 },
  { key: "processing", label: "Diproses", sub: "Pesanan dikonfirmasi kasir", icon: Clock },
  { key: "preparing", label: "Sedang Disiapkan", sub: "Dapur sedang memasak", icon: ChefHat },
  { key: "ready", label: "Siap Diantar", sub: "Makanan siap di meja saji", icon: Bell },
  { key: "done", label: "Selesai", sub: "Pesanan selesai & dibayar", icon: Package },
];

const STATUS_INDEX: Record<string, number> = {
  new: 0,
  processing: 1,
  preparing: 2,
  ready: 3,
  done: 4,
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  processing: "bg-blue-100 text-blue-700",
  preparing: "bg-wood/15 text-wood",
  ready: "bg-success/15 text-success",
  done: "bg-dark/10 text-dark/50",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Pesanan Baru",
  processing: "Diproses",
  preparing: "Sedang Disiapkan",
  ready: "Siap Diantar",
  done: "Selesai",
};

interface Props {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetail({ orderId, onBack }: Props) {
  const [order, setOrder] = useState<Order>(
    () => fallbackOrders.find((o) => o.id === orderId) ?? fallbackOrders[0]
  );
  const [payMethod, setPayMethod] = useState<PaymentMethod>(order.paymentMethod || "QRIS");
  const [processingPay, setProcessingPay] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getOrderDetail(orderId)
      .then((res) => {
        if (active && res.order) {
          const mapped = mapDbOrderToUi(res.order);
          setOrder(mapped);
          setPayMethod(mapped.paymentMethod);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [orderId]);

  const statusIndex = STATUS_INDEX[order.status] ?? 0;
  const subtotal = order.items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = order.total || subtotal;

  const handleCompletePayment = async () => {
    setProcessingPay(true);
    try {
      await api.processPayment(
        order.dbId || order.id,
        payMethod.toLowerCase() as "cash" | "debit" | "qris",
        total
      );
      setOrder((prev) => ({
        ...prev,
        status: "done",
        paymentMethod: payMethod,
        paymentStatus: "paid",
      }));
    } catch {
      setOrder((prev) => ({
        ...prev,
        status: "done",
        paymentMethod: payMethod,
        paymentStatus: "paid",
      }));
    } finally {
      setProcessingPay(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-beige px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-beige-dark bg-white flex items-center justify-center text-dark/50 hover:text-dark transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-dark font-serif">Detail Pesanan</h1>
          <p className="text-dark/40 text-xs mt-0.5">{order.id}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 border border-beige-dark bg-white text-dark/60 text-sm font-medium px-3 py-2 rounded-xl hover:bg-beige transition-colors"
        >
          <Printer size={14} />
          Cetak Struk
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Left: Order Info */}
        <div className="xl:col-span-3 space-y-4">
          {/* Order Header Card */}
          <div className="bg-white rounded-2xl border border-beige-dark p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-dark text-lg">{order.id}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-dark/50">
                  <span className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary">M</span>
                    </div>
                    Meja {order.table}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {order.time}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark/40 font-medium">Pembayaran</p>
                <span className="text-sm font-bold bg-beige text-dark/70 px-3 py-1 rounded-lg mt-1 inline-block">
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-beige-dark pt-4 space-y-3">
              <h3 className="text-xs font-semibold text-dark/40 uppercase tracking-wide">
                Item Pesanan
              </h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{item.qty}×</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-gold font-medium mt-0.5">
                        ⚠ Catatan: {item.notes}
                      </p>
                    )}
                    <p className="text-xs text-dark/40 mt-0.5">{formatRp(item.price)} / porsi</p>
                  </div>
                  <span className="font-bold text-dark text-sm shrink-0">
                    {formatRp(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-beige-dark mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark/60">Subtotal</span>
                <span className="font-medium text-dark">{formatRp(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-dark border-t border-beige-dark pt-2 mt-1">
                <span>Total Bayar</span>
                <span className="text-primary text-lg">{formatRp(total)}</span>
              </div>
            </div>

            {order.status !== "done" && (
              <div className="border-t border-beige-dark mt-4 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(["Cash", "Debit", "QRIS"] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        payMethod === m
                          ? "bg-primary text-white border-primary"
                          : "border-beige-dark text-dark/60 hover:border-primary"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCompletePayment}
                  disabled={processingPay}
                  className="bg-success text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  {processingPay ? "Memproses..." : "Konfirmasi Pembayaran & Selesai"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Status Timeline */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-beige-dark p-5">
            <h3 className="font-bold text-dark mb-5">Timeline Status</h3>
            <div className="space-y-1">
              {STATUS_STEPS.map((s, i) => {
                const done = i <= statusIndex;
                const active = i === statusIndex;
                return (
                  <div key={s.key} className="flex gap-3 pb-5 last:pb-0 relative">
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-4 top-9 w-0.5 h-full -translate-x-1/2 ${
                          done && i < statusIndex ? "bg-primary" : "bg-beige-dark"
                        }`}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        done ? "bg-primary text-white" : "bg-beige-dark text-dark/20"
                      } ${active ? "ring-4 ring-primary/20 scale-110" : ""}`}
                    >
                      <s.icon size={15} />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          done ? "text-dark" : "text-dark/30"
                        }`}
                      >
                        {s.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${done ? "text-dark/50" : "text-dark/20"}`}>
                        {s.sub}
                      </p>
                      {active && (
                        <div className="flex gap-1 mt-2">
                          {[0, 1, 2].map((d) => (
                            <div
                              key={d}
                              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                              style={{ animationDelay: `${d * 150}ms` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-4 bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wide">
              Info Pesanan
            </h3>
            {[
              { label: "Nomor Pesanan", value: order.id },
              { label: "Pemesan", value: order.customerName || "Pelanggan" },
              { label: "Nomor Meja", value: `Meja ${order.table}` },
              { label: "Waktu Masuk", value: `${order.time} WIB` },
              { label: "Metode Bayar", value: order.paymentMethod },
              {
                label: "Jumlah Item",
                value: `${order.items.reduce((a, i) => a + i.qty, 0)} item`,
              },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-dark/50">{r.label}</span>
                <span className="font-semibold text-dark">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
