import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheck, FiClock, FiCreditCard, FiPackage, FiSearch, FiShield } from "react-icons/fi";
import api from "../lib/api";
import { payOrder } from "../services/midtransPayment";

const statuses = [
  { id: "new", title: "Menunggu pembayaran", detail: "Selesaikan pembayaran di halaman ApengJers sebelum batas waktu penyedia berakhir.", icon: FiClock },
  { id: "confirmed", title: "Pembayaran diterima", detail: "Pembayaran terverifikasi. Admin akan segera memproses pesananmu.", icon: FiCreditCard },
  { id: "processing", title: "Sedang diproses", detail: "Layanan joki atau gift sedang dikerjakan.", icon: FiPackage },
  { id: "completed", title: "Selesai", detail: "Pesanan telah diselesaikan.", icon: FiCheck },
];
const statusLabels = { new: "Menunggu pembayaran", confirmed: "Pembayaran diterima", processing: "Sedang diproses", completed: "Selesai", cancelled: "Dibatalkan" };
const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export default function CekTransaksi() {
  const [searchParams] = useSearchParams();
  const [orderCode, setOrderCode] = useState(searchParams.get("orderCode") || searchParams.get("order_id") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const checkOrder = async (value = orderCode) => {
    const normalizedCode = value.trim();
    if (!normalizedCode) return;
    setLoading(true);
    setErrorMessage("");
    setOrder(null);
    try {
      const { data } = await api.get(`/api/orders/track/${encodeURIComponent(normalizedCode)}`);
      let latest = data;
      // Order belum dibayar -> sinkronkan dulu dengan Midtrans (berguna kalau notifikasi belum masuk)
      if (data.status === "new" && data.paymentStatus === "unpaid") {
        const synced = await api.get(`/api/midtrans/status/${encodeURIComponent(data.orderCode)}`).catch(() => null);
        if (synced?.data) latest = { ...data, status: synced.data.status, paymentStatus: synced.data.paymentStatus };
      }
      setOrder(latest);
    } catch (error) {
      setErrorMessage(error.response?.status === 404 ? "ID order tidak ditemukan. Periksa kembali kode yang kamu masukkan." : "Status order gagal dimuat. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => payOrder(order.orderCode)
    .catch(() => setErrorMessage("Halaman pembayaran gagal dibuka. Coba lagi sebentar."));

  // Datang dari redirect Midtrans (ada ?order_id=...)
  const returnedFromPayment = Boolean(searchParams.get("order_id") || searchParams.get("orderCode"));

  useEffect(() => {
    const codeFromUrl = searchParams.get("orderCode") || searchParams.get("order_id");
    if (codeFromUrl) checkOrder(codeFromUrl);
  // Run only when the incoming link carries an order code.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet><title>Cek Pesanan | ApengJers</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-left sm:px-6 sm:pt-14">
        <motion.header initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-800">Pelacakan pesanan</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Cek status pesananmu</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Masukkan ID order yang diberikan setelah permintaan berhasil dikirim.</p>
        </motion.header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <motion.section initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, delay: 0.1 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={(event) => { event.preventDefault(); checkOrder(); }}>
              <label htmlFor="orderCode" className="block text-sm font-extrabold text-slate-900">ID order</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1"><FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input id="orderCode" type="text" value={orderCode} onChange={(event) => setOrderCode(event.target.value)} required placeholder="Contoh: AJ-7F3A…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></div>
                <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{loading ? "Mencari…" : "Cek order"}</button>
              </div>
            </form>

            {errorMessage && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs leading-5 text-rose-800">{errorMessage}</p>}
            {order && returnedFromPayment && order.paymentStatus === "paid" && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">Pembayaran berhasil! Pesananmu sudah kami terima dan akan segera diproses.</p>}
            {order && returnedFromPayment && order.paymentStatus === "unpaid" && order.status === "new" && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">Pembayaranmu belum terverifikasi. Kalau sudah membayar, tunggu sebentar lalu klik "Cek order" lagi. Kalau belum, kamu bisa lanjut bayar di bawah.</p>}
            {order && <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">{order.jenis === "gift" ? "GIFT ITEM" : "JOKI ROBLOX"}</p><h2 className="mt-1 text-lg font-black text-slate-900">{order.orderCode}</h2></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-blue-900">{statusLabels[order.status] || order.status}</span></div>
              <p className="mt-3 text-sm font-bold text-slate-800">{order.gameName && `${order.gameName} · `}{order.productName} × {order.quantity}</p>

              {order.status === "new" && order.paymentStatus === "unpaid" && <button type="button" onClick={handlePay} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-orange-400"><FiCreditCard aria-hidden="true" /> Bayar sekarang</button>}
              {order.status === "cancelled" && <p className="mt-4 rounded-xl bg-white p-3 text-xs font-semibold text-slate-600">Order ini dibatalkan (misalnya karena pembayaran tidak selesai tepat waktu). Hubungi admin jika kamu perlu bantuan.</p>}
              <div className="mt-4 grid gap-3 border-t border-blue-100 pt-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold text-slate-500">Total order</p><p className="mt-1 text-sm font-extrabold text-slate-900">{money(order.totalPrice)}</p>{order.discountAmount > 0 && <p className="mt-1 text-[10px] font-semibold text-emerald-700">Promo {order.voucherCode}: −{money(order.discountAmount)}</p>}</div><div><p className="text-[10px] font-bold text-slate-500">Pembayaran</p><p className="mt-1 text-sm font-extrabold text-slate-900">{order.paymentStatus === "paid" ? "Lunas" : order.paymentStatus === "refunded" ? "Dikembalikan" : order.status === "cancelled" ? "Tidak dibayar" : "Belum dibayar"}</p></div></div>
            </div>}
            <Link to="/cara-order" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-orange-600">Lihat panduan order <FiArrowRight aria-hidden="true" /></Link>
          </motion.section>

          <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, delay: 0.15 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-800"><FiPackage className="h-5 w-5" aria-hidden="true" /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Alur status</p><h2 className="text-sm font-extrabold text-slate-900">Tahapan pesanan</h2></div></div>
            <ol className="mt-6 space-y-5">{statuses.map(({ id, title, detail, icon: Icon }, index) => {
              const isReached = order && statuses.findIndex((status) => status.id === order.status) >= index;
              return <motion.li key={id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 + index * 0.08 }} className="relative flex gap-3">{index < statuses.length - 1 && <span aria-hidden="true" className="absolute left-[15px] top-8 h-8 w-px bg-slate-200" />}<span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isReached ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}><Icon className="h-4 w-4" aria-hidden="true" /></span><div><h3 className="text-xs font-extrabold text-slate-800">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div></motion.li>;
            })}</ol>
          </motion.aside>
        </div>

        <aside className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"><FiShield className="mt-0.5 h-5 w-5 shrink-0 text-blue-800" aria-hidden="true" /><p className="text-xs leading-5 text-blue-950/80">Jangan kirim password, OTP, cookie, atau kode pemulihan saat berkoordinasi mengenai pesanan.</p></aside>
      </main>
    </>
  );
}
