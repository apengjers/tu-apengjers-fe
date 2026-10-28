import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheck, FiChevronDown, FiCopy, FiLock, FiPackage } from "react-icons/fi";
import api from "../lib/api";
import { HISTORY_TABS, money, paymentMethodLabels, statusInfo } from "../lib/order";

const openLogin = () => window.dispatchEvent(new Event("open-login"));

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-500">{label}</p>
      <p className="mt-0.5 break-words text-xs font-bold text-slate-800">{value}</p>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = statusInfo(order);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard tidak tersedia, abaikan */
    }
  };

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">
          {order.jenis === "gift" ? "Gift Item" : "Joki Roblox"}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${status.tone}`}>{status.label}</span>
        <span className="ml-auto text-[11px] text-slate-500">{new Date(order.createdAt).toLocaleString("id-ID")}</span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-slate-900">
            {order.gameName && `${order.gameName} · `}
            {order.productName} × {order.quantity}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-blue-800"
            aria-label={`Salin kode order ${order.orderCode}`}
          >
            <span className="break-all">{order.orderCode}</span>
            {copied ? <FiCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <FiCopy className="h-3.5 w-3.5 shrink-0" />}
          </button>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold text-slate-500">Total</p>
          <p className="text-sm font-black text-slate-900">{money(order.totalPrice)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
      >
        {expanded ? "Sembunyikan detail" : "Lihat detail"}
        <FiChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
          <DetailRow label="Harga satuan" value={money(order.unitPrice)} />
          <DetailRow label="Jumlah" value={String(order.quantity)} />
          <DetailRow label="Pembayaran" value={order.paymentStatus === "paid" ? "Lunas" : order.paymentStatus === "refunded" ? "Dikembalikan" : "Belum dibayar"} />
          <DetailRow label="Username Roblox" value={order.robloxUsername} />
          <DetailRow label="Display name" value={order.displayName} />
          <DetailRow label="Penerima gift" value={order.recipientUsername} />
          <DetailRow label="WhatsApp" value={order.whatsapp} />
          <DetailRow label="Metode pembayaran" value={paymentMethodLabels[order.requestedPaymentMethod]} />
        </div>
      )}
    </li>
  );
}

export default function RiwayatTransaksi() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "";
  const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

  const [data, setData] = useState({ orders: [], total: 0, pages: 0 });
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needLogin, setNeedLogin] = useState(!localStorage.getItem("token"));

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setNeedLogin(true);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError("");
    api
      .get("/api/orders/mine", { params: { tab: tab || undefined, page, limit: 10 } })
      .then(({ data: result }) => {
        if (!active) return;
        setNeedLogin(false);
        setData(result);
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 401) setNeedLogin(true);
        else setError(err.response?.data?.message || "Riwayat transaksi gagal dimuat. Coba lagi sebentar.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tab, page]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return undefined;
    let active = true;
    api
      .get("/api/orders/mine/counts")
      .then(({ data: result }) => active && setCounts(result))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setTab = (id) => setSearchParams(id ? { tab: id } : {});
  const setPage = (next) => {
    const params = {};
    if (tab) params.tab = tab;
    if (next > 1) params.page = String(next);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Akun</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Riwayat Transaksi</h1>
      <p className="mt-1 text-sm text-slate-500">Semua pesanan joki dan gift item yang kamu buat saat login.</p>

      {needLogin ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-800">
            <FiLock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-extrabold text-slate-900">Masuk untuk melihat riwayat</h2>
          <p className="mt-1 text-sm text-slate-500">Riwayat transaksi hanya tersedia untuk akun yang sedang login.</p>
          <button
            type="button"
            onClick={openLogin}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"
          >
            Masuk
          </button>
        </div>
      ) : (
        <>
          <div className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter status pesanan">
            <div className="flex w-max gap-2">
              {HISTORY_TABS.map(({ id, label }) => {
                const active = tab === id;
                return (
                  <button
                    key={id || "semua"}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                      active ? "bg-blue-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50"
                    }`}
                  >
                    {label}
                    {counts[id] > 0 && (
                      <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-rose-100 text-rose-700"}`}>{counts[id]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}

          {loading ? (
            <ul className="mt-6 space-y-3" aria-busy="true">
              {[0, 1, 2].map((item) => (
                <li key={item} className="h-28 animate-pulse rounded-2xl bg-white/70" />
              ))}
            </ul>
          ) : (
            !error &&
            (data.orders.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-800">
                  <FiPackage className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-extrabold text-slate-900">Belum ada transaksi</h2>
                <p className="mt-1 text-sm text-slate-500">Pesanan di kategori ini akan muncul di sini.</p>
                <Link to="/joki-roblox" className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900">
                  Mulai pesan
                </Link>
              </div>
            ) : (
              <>
                <ul className="mt-6 space-y-3">
                  {data.orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </ul>
                {data.pages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition enabled:hover:bg-blue-50 disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-xs font-semibold text-slate-500">
                      Halaman {data.page} dari {data.pages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= data.pages}
                      onClick={() => setPage(page + 1)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition enabled:hover:bg-blue-50 disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </div>
                )}
              </>
            ))
          )}
        </>
      )}
    </main>
  );
}