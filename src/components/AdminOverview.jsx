//test update
import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import { FiActivity, FiAlertCircle, FiCheck, FiClock, FiPackage, FiRefreshCw } from "react-icons/fi";

const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
const statusLabels = { new: "Baru", confirmed: "Dikonfirmasi", processing: "Diproses", completed: "Selesai", cancelled: "Dibatalkan" };

export default function AdminOverview({ products, games, onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [summaryResponse, ordersResponse] = await Promise.all([api.get("/api/orders/summary"), api.get("/api/orders")]);
      setSummary(summaryResponse.data);
      setRecentOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data.slice(0, 5) : []);
    } catch {
      setErrorMessage("Ringkasan order gagal dimuat. Pastikan backend terbaru sudah berjalan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  const cards = [
    { label: "Pesanan baru", value: summary?.new ?? "—", icon: FiAlertCircle, tone: "bg-amber-50 text-amber-700", onClick: () => onNavigate("orders", "new") },
    { label: "Sedang diproses", value: summary?.processing ?? "—", icon: FiActivity, tone: "bg-blue-50 text-blue-800", onClick: () => onNavigate("orders", "processing") },
    { label: "Transaksi dilayani", value: summary?.completed ?? "—", icon: FiCheck, tone: "bg-emerald-50 text-emerald-700", onClick: () => onNavigate("orders", "completed") },
    { label: "Nilai order selesai", value: summary ? money(summary.completedRevenue) : "—", icon: FiClock, tone: "bg-violet-50 text-violet-700", onClick: () => onNavigate("orders", "completed") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-extrabold text-slate-900">Ringkasan toko</h2><p className="mt-1 text-xs text-slate-500">Metrik diperbarui dari order yang tersimpan di backend.</p></div><button type="button" onClick={loadOverview} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} /> Muat ulang</button></div>
      {errorMessage && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{errorMessage}</p>}
      <section aria-label="Metrik toko" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone, onClick }) => <button key={label} type="button" onClick={onClick} className="flex min-h-28 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><span><span className="block text-xs font-semibold text-slate-500">{label}</span><span className="mt-1 block text-xl font-black text-slate-900">{isLoading ? "…" : value}</span></span>
        </button>)}
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-extrabold text-slate-900">Pesanan terbaru</h3><p className="mt-1 text-xs text-slate-500">Order paling baru masuk.</p></div><button type="button" onClick={() => onNavigate("orders", "all")} className="text-xs font-bold text-blue-800 hover:text-orange-600">Semua pesanan →</button></div>
          {isLoading ? <p className="py-8 text-center text-xs text-slate-500">Memuat…</p> : recentOrders.length ? <ul className="mt-4 divide-y divide-slate-100">{recentOrders.map((order) => <li key={order._id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-extrabold text-slate-800">{order.orderCode} · {order.productName}</p><p className="mt-1 text-[10px] text-slate-500">{order.jenis === "gift" ? "Gift Item" : "Joki Roblox"} · {order.quantity} item · {new Date(order.createdAt).toLocaleDateString("id-ID")}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">{statusLabels[order.status] || order.status}</span></li>)}</ul> : <p className="py-8 text-center text-xs text-slate-500">Belum ada order.</p>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-extrabold text-slate-900">Katalog toko</h3><p className="mt-1 text-xs text-slate-500">Data yang sudah kamu kelola.</p>
          <div className="mt-4 space-y-3"><button type="button" onClick={() => onNavigate("products")} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left hover:bg-blue-50"><span className="flex items-center gap-2 text-xs font-bold text-slate-700"><FiPackage /> Produk</span><span className="text-sm font-black text-slate-900">{products.length}</span></button><button type="button" onClick={() => onNavigate("games")} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left hover:bg-blue-50"><span className="text-xs font-bold text-slate-700">Game Roblox</span><span className="text-sm font-black text-slate-900">{games.length}</span></button></div>
          <button type="button" onClick={() => onNavigate("hotGames")} className="mt-4 w-full rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-800 hover:bg-orange-100">Atur Hot Games beranda</button>
        </section>
      </div>
    </div>
  );
}
