import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const statusLabels = { new: "Baru", confirmed: "Dikonfirmasi", processing: "Diproses", completed: "Selesai", cancelled: "Dibatalkan" };
const nextStatuses = { new: ["confirmed", "cancelled"], confirmed: ["processing", "cancelled"], processing: ["completed", "cancelled"], completed: [], cancelled: [] };
const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export default function OrdersAdminPanel({ onOrdersChanged = async () => {}, initialStatus = "all" }) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const params = statusFilter === "all" ? {} : { status: statusFilter };
      const { data } = await api.get("/api/orders", { params });
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setErrorMessage("Daftar pesanan gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const updateOrder = async (order, update) => {
    setSavingId(order._id);
    setErrorMessage("");
    try {
      await api.patch(`/api/orders/${order._id}`, update);
      await loadOrders();
      await onOrdersChanged();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Status order gagal diperbarui.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-base font-extrabold text-slate-900">Pesanan masuk</h2><p className="mt-1 text-xs text-slate-500">Pesanan baru menahan stok yang tersedia sampai selesai atau dibatalkan.</p></div>
        <div className="flex gap-2"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status pesanan" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"><option value="all">Semua status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={loadOrders} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} /> Muat ulang</button></div>
      </div>
      {errorMessage && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><FiAlertCircle />{errorMessage}</p>}
      {isLoading ? <div className="py-16 text-center text-sm text-slate-500">Memuat pesanan…</div> : orders.length ? <div className="mt-5 space-y-3">
        {orders.map((order) => <article key={order._id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-slate-900">{order.orderCode}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${order.status === "completed" ? "bg-emerald-100 text-emerald-800" : order.status === "cancelled" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800"}`}>{statusLabels[order.status]}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">{order.jenis === "gift" ? "Gift Item" : "Joki Roblox"}</span></div><p className="mt-2 text-sm font-bold text-slate-800">{order.gameName && `${order.gameName} · `}{order.productName} × {order.quantity}</p><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString("id-ID")} · Total katalog {money(order.totalPrice)}</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label={`Ubah status ${order.orderCode}`} value={order.status} disabled={savingId === order._id || !nextStatuses[order.status].length} onChange={(event) => updateOrder(order, { status: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:bg-slate-50">{[order.status, ...nextStatuses[order.status]].map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select>
              <button type="button" disabled={savingId === order._id || order.paymentStatus === "paid"} onClick={() => updateOrder(order, { paymentStatus: "paid" })} className={`rounded-lg px-3 py-2 text-xs font-bold ${order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{order.paymentStatus === "paid" ? "Lunas" : "Tandai lunas"}</button>
            </div>
          </div>
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2">
            <p><span className="text-slate-500">WhatsApp: </span><a href={`https://wa.me/${String(order.whatsapp).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="font-bold text-blue-800 hover:underline">{order.whatsapp}</a></p>
            <p><span className="text-slate-500">Pembayaran: </span><span className="font-semibold text-slate-700">{order.paymentStatus === "paid" ? "Lunas" : order.requestedPaymentMethod || "Belum dipilih"}</span></p>
            <p><span className="text-slate-500">Username Roblox: </span><span className="font-semibold text-slate-700">{order.recipientUsername || order.robloxUsername || "—"}</span></p>
            {order.displayName && <p><span className="text-slate-500">Display name: </span><span className="font-semibold text-slate-700">{order.displayName}</span></p>}
            {order.contactEmail && <p><span className="text-slate-500">Email: </span><span className="font-semibold text-slate-700">{order.contactEmail}</span></p>}
            {order.notes && <p className="whitespace-pre-line sm:col-span-2"><span className="text-slate-500">Catatan: </span><span className="font-semibold text-slate-700">{order.notes}</span></p>}
          </div>
        </article>)}
      </div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-5 py-16 text-center text-sm text-slate-500">Belum ada pesanan untuk filter ini.</div>}
    </section>
  );
}
