import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronsRight,
  FiEdit2,
  FiHelpCircle,
  FiList,
  FiLogOut,
  FiSearch,
  FiSettings,
} from "react-icons/fi";
import api from "../lib/api";
import { SUMMARY_TABS } from "../lib/order";

export function UserAvatar({ user, className = "h-8 w-8", textClass = "text-sm" }) {
  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();
  return user?.photo ? (
    <img src={user.photo} alt="" referrerPolicy="no-referrer" className={`${className} rounded-full object-cover`} />
  ) : (
    <span className={`grid ${className} place-items-center rounded-full bg-blue-900 font-bold text-white ${textClass}`}>
      {initial}
    </span>
  );
}

const menuItems = [
  { to: "/riwayat", label: "Riwayat Transaksi", icon: FiList },
  { to: "/cek-transaksi", label: "Cek Pesanan", icon: FiSearch },
  { to: "/cara-order", label: "Pusat Bantuan", icon: FiHelpCircle },
  { to: "/profil", label: "Pengaturan Akun", icon: FiSettings },
];

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const rootRef = useRef(null);
  const location = useLocation();
  const firstName = (user.displayName || user.email || "").split(" ")[0];

  // Tutup saat pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  // Tutup saat klik di luar / tekan Escape
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Ambil jumlah pesanan tiap kali dropdown dibuka
  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    api
      .get("/api/orders/mine/counts")
      .then(({ data }) => active && setCounts(data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl bg-slate-50 py-1 pl-1 pr-2.5 text-sm font-semibold text-slate-800 transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <UserAvatar user={user} />
        <span className="max-w-[110px] truncate">{firstName}</span>
        <FiChevronDown aria-hidden="true" className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="modal-pop absolute right-0 top-full mt-3 w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl"
        >
          <div className="bg-gradient-to-br from-blue-950 to-blue-700 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} className="h-12 w-12" textClass="text-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-extrabold uppercase tracking-wide">{user.displayName || user.email}</p>
                  <Link to="/profil" aria-label="Edit profil" className="shrink-0 text-blue-100 transition hover:text-white">
                    <FiEdit2 className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <p className="truncate text-xs text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800">Riwayat Pembelian</h3>
              <Link to="/riwayat" className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900">
                Lihat Semua <FiChevronsRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-white p-1.5 shadow-sm">
              {SUMMARY_TABS.map(({ id, label, icon: Icon }) => (
                <Link
                  key={id}
                  to={`/riwayat?tab=${id}`}
                  role="menuitem"
                  className="relative flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5 text-center transition hover:bg-blue-50"
                >
                  <span className="relative text-blue-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {counts[id] > 0 && (
                      <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                        {counts[id] > 99 ? "99+" : counts[id]}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-semibold leading-tight text-slate-600">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <ul className="divide-y divide-slate-100 bg-white">
            {menuItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  role="menuitem"
                  className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
                >
                  <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <FiLogOut className="h-4 w-4" aria-hidden="true" />
                Keluar
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}