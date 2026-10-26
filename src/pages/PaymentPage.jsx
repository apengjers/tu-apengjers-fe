import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCopy, FiExternalLink, FiRefreshCw, FiShield } from "react-icons/fi";
import api from "../lib/api";

const channelNames = { other_qris: "QRIS", bca_va: "VA BCA", echannel: "Mandiri Bill Payment", bni_va: "VA BNI", bri_va: "VA BRI", permata_va: "VA Permata", gopay: "GoPay", shopeepay: "ShopeePay" };
const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800 disabled:cursor-wait disabled:opacity-60";

function PaymentNumber({ label, value }) {
  const [message, setMessage] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setMessage("Tersalin"); }
    catch { setMessage("Gagal menyalin. Salin nomor secara manual."); }
  };
  return <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-sm text-slate-600">{label}</p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
      <p className="min-w-0 break-all text-xl font-bold tabular-nums text-slate-900">{value}</p>
      <button type="button" onClick={copy} className={`${button} bg-white text-blue-900 hover:bg-blue-50`}><FiCopy aria-hidden="true" /> Salin</button>
    </div>
    {message && <p role="status" className="mt-2 text-sm text-slate-600">{message}</p>}
  </div>;
}

export default function PaymentPage() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(Date.now());
  const [qrFailed, setQrFailed] = useState(false);
  const trackingUrl = `/cek-transaksi?orderCode=${encodeURIComponent(orderCode)}`;

  useEffect(() => {
    const controller = new AbortController();
    setCheckout(null);
    setLoading(true);
    setError("");
    setQrFailed(false);
    api.post("/api/midtrans/charge", { orderCode }, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setCheckout(data); })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const message = err.response?.data?.message;
        setError(message || (err.response?.status === 404
          ? "Layanan pembayaran belum tersedia. Pastikan backend sudah diperbarui dan di-restart."
          : !err.response ? "Tidak bisa terhubung ke layanan pembayaran. Periksa koneksi atau hubungi admin."
            : "Pembayaran gagal dimuat. Coba lagi atau hubungi admin."));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [orderCode]);

  const checkStatus = useCallback(async (manual = false) => {
    if (manual) { setChecking(true); setNotice(""); }
    try {
      const { data } = await api.get(`/api/midtrans/status/${encodeURIComponent(orderCode)}`);
      setCheckout((current) => current ? { ...current, order: { ...current.order, ...data } } : current);
      if (manual && data.status === "new" && data.paymentStatus === "unpaid") setNotice("Pembayaran belum terverifikasi. Jika sudah membayar, tunggu sebentar; status akan dicek otomatis.");
    } catch {
      setNotice("Status pembayaran belum bisa diperbarui. Coba cek lagi; jangan ulangi pembayaran jika saldo sudah terpotong.");
    } finally { if (manual) setChecking(false); }
  }, [orderCode]);

  const order = checkout?.order;
  const payment = checkout?.payment;
  const active = order?.status === "new" && order?.paymentStatus === "unpaid";

  useEffect(() => {
    if (order?.paymentStatus === "paid") navigate(trackingUrl, { replace: true });
  }, [order?.paymentStatus, navigate, trackingUrl]);

  useEffect(() => {
    if (!active) return;
    // Serialized polling avoids overlapping requests on slow networks.
    let disposed = false;
    let timer;
    const poll = async () => {
      if (disposed) return;
      if (!document.hidden) await checkStatus();
      if (!disposed) timer = setTimeout(poll, 5000);
    };
    void poll();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { disposed = true; clearTimeout(timer); clearInterval(clock); };
  }, [active, checkStatus]);

  const expires = payment?.expiresAt ? Date.parse(payment.expiresAt) : NaN;
  const seconds = Number.isFinite(expires) ? Math.max(0, Math.ceil((expires - now) / 1000)) : null;
  const remaining = seconds === null ? "Mengikuti batas waktu penyedia pembayaran" : seconds === 0 ? "Waktu pembayaran habis. Memeriksa status penyedia…" : `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const method = channelNames[order?.paymentChannel] || payment?.paymentType || "Pembayaran";
  const numbers = [
    ...(payment?.vaNumbers || []).map(({ bank, number }) => ({ label: `Virtual Account ${bank.toUpperCase()}`, value: number })),
    ...(payment?.permataVaNumber ? [{ label: "Virtual Account Permata", value: payment.permataVaNumber }] : []),
    ...(payment?.billerCode ? [{ label: "Kode perusahaan Mandiri", value: payment.billerCode }] : []),
    ...(payment?.billKey ? [{ label: "Kode pembayaran Mandiri", value: payment.billKey }] : []),
  ];

  return <>
    <Helmet><title>Pembayaran | ApengJers</title><meta name="robots" content="noindex, nofollow" /><meta name="referrer" content="no-referrer" /></Helmet>
    <main className="mx-auto max-w-6xl px-4 py-10 text-left text-slate-900 sm:px-6">
      <Link to={trackingUrl} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"><FiArrowLeft aria-hidden="true" /> Cek pesanan</Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Selesaikan pembayaran</h1>
      <p className="mt-2 text-base text-slate-600">Bayar pesanan ApengJers kamu. Konfirmasi pembayaran dilakukan otomatis.</p>
      {loading && <section aria-busy="true" aria-label="Memuat pembayaran" className="mt-6 rounded-[20px] bg-white p-6"><h2 className="font-semibold">Menyiapkan pembayaran…</h2><p role="status" className="mt-3 text-sm text-slate-600">Mohon tunggu, jangan tutup halaman ini.</p><div className="mt-6 h-40 rounded-xl bg-slate-100" /></section>}
      {error && <section className="mt-6 rounded-[20px] bg-white p-6"><h2 className="font-semibold">Pembayaran belum tersedia</h2><p role="alert" className="mt-3 text-sm leading-6 text-rose-800">{error}</p><button type="button" onClick={() => window.location.reload()} className={`${button} mt-5 bg-blue-900 text-white hover:bg-blue-800`}>Coba lagi</button></section>}
      {order && <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* At max width: 1104px content = 720px payment + 24px gap + 360px summary. */}
        <section className="min-w-0 rounded-[20px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{method}</h2><span className={`rounded-full px-3 py-1 text-sm ${order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-900" : active ? "bg-blue-50 text-blue-900" : "bg-slate-100 text-slate-700"}`}>{order.paymentStatus === "paid" ? "Pembayaran diterima" : active ? "Menunggu pembayaran" : order.paymentStatus === "refunded" ? "Dana dikembalikan" : order.status === "cancelled" ? "Pesanan dibatalkan" : "Lihat status pesanan"}</span></div>
          {active && payment && <>
            <p className="mt-6 text-sm text-slate-600">Total pembayaran</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{money(order.totalPrice)}</p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-600">Selesaikan sebelum batas waktu</p><p className="mt-1 font-semibold tabular-nums">{remaining}</p>{Number.isFinite(expires) && <p className="mt-1 text-sm text-slate-600">{new Date(expires).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })} WIB</p>}</div>
            {seconds !== 0 && <>
              {payment.qrUrl && <div className="mt-6 text-center">{!qrFailed ? <img src={payment.qrUrl} alt={`Kode pembayaran ${method} untuk pesanan ini`} referrerPolicy="no-referrer" onError={() => setQrFailed(true)} className="mx-auto aspect-square w-64 max-w-full object-contain" /> : <p role="alert" className="text-sm text-rose-800">Kode QR gagal dimuat. Buka kode QR di bawah atau muat ulang halaman.</p>}<a href={payment.qrUrl} target="_blank" rel="noopener noreferrer" className={`${button} mt-3 text-blue-900 hover:bg-blue-50`}><FiExternalLink aria-hidden="true" /> Buka kode QR</a></div>}
              <div className="mt-6 space-y-3">{numbers.map(({ label, value }) => <PaymentNumber key={label} label={label} value={value} />)}</div>
              {payment.deeplinkUrl && <a href={payment.deeplinkUrl} rel="noreferrer" className={`${button} mt-6 w-full bg-blue-900 text-white hover:bg-blue-800`}>Buka {method}<FiExternalLink aria-hidden="true" /></a>}
              {!payment.qrUrl && !numbers.length && !payment.deeplinkUrl && <p role="alert" className="mt-5 text-sm leading-6 text-amber-900">Instruksi bayar belum tersedia dari penyedia. Jangan transfer manual; coba muat ulang atau hubungi admin dengan ID order ini.</p>}
              <div className="mt-6"><h3 className="font-semibold">Cara membayar</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">{numbers.length ? <><li>Buka aplikasi mobile banking atau ATM bank pilihanmu.</li><li>{payment.billKey ? "Pilih pembayaran Mandiri Bill Payment / Multi Payment. Masukkan kode perusahaan dan kode pembayaran di atas." : "Pilih menu pembayaran Virtual Account, lalu masukkan nomor di atas."}</li><li>Periksa nama merchant dan nominal sebelum mengonfirmasi pembayaran.</li></> : <><li>{payment.deeplinkUrl ? `Buka aplikasi ${method} lewat tombol di atas${payment.qrUrl ? ", atau scan kode QR dari aplikasi pembayaran" : ""}.` : "Buka aplikasi bank atau e-wallet yang mendukung QRIS, lalu scan kode QR. Untuk perangkat yang sama, gunakan fitur scan dari galeri jika tersedia."}</li><li>Periksa merchant dan nominal, lalu konfirmasi di aplikasi pembayaran.</li></>}<li>Kembali ke halaman ini. Status diperbarui setelah pembayaran terverifikasi.</li></ol></div>
            </>}
            <button type="button" disabled={checking} onClick={() => checkStatus(true)} className={`${button} mt-6 w-full ${payment.deeplinkUrl && seconds !== 0 ? "bg-slate-100 text-slate-900 hover:bg-slate-200" : "bg-blue-900 text-white hover:bg-blue-800"}`}><FiRefreshCw aria-hidden="true" />{checking ? "Memeriksa…" : "Cek status pembayaran"}</button>
          </>}
          {!active && <p className="mt-6 text-sm leading-6 text-slate-600">{order.paymentStatus === "paid" ? "Pembayaran terverifikasi. Mengarahkan ke status pesanan…" : "Pesanan ini tidak menerima pembayaran baru. Lihat status pesanan atau hubungi admin jika saldo sudah terpotong."}</p>}
          {notice && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{notice}</p>}
        </section>
        <aside className="min-w-0 space-y-6">
          <section className="rounded-[20px] bg-white p-6"><h2 className="text-lg font-semibold">Pesananmu</h2><p className="mt-4 font-semibold">{order.productName}</p>{order.gameName && <p className="mt-1 text-sm text-slate-600">{order.gameName}</p>}<dl className="mt-5 space-y-4 text-sm"><div><dt className="text-slate-600">ID order</dt><dd className="mt-1 break-all font-semibold">{order.orderCode}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Jumlah</dt><dd className="tabular-nums">{order.quantity}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-600">Total</dt><dd className="font-bold tabular-nums">{money(order.totalPrice)}</dd></div></dl><Link to={trackingUrl} className={`${button} mt-6 w-full bg-slate-100 text-slate-900 hover:bg-slate-200`}>Lacak pesanan</Link></section>
          <section className="px-1"><h2 className="flex items-center gap-2 text-sm font-semibold"><FiShield aria-hidden="true" /> Pembayaran aman</h2><p className="mt-3 text-sm leading-6 text-slate-600">Pembayaran diproses melalui Midtrans. ApengJers tidak meminta PIN, password, atau OTP. Jangan bagikan tautan pembayaran dan ID order kamu.</p></section>
        </aside>
      </div>}
    </main>
  </>;
}
