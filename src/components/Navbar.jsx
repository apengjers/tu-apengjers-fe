import { useEffect, useState } from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { FiBookOpen, FiGift, FiHome, FiLogIn, FiLogOut, FiMenu, FiSettings, FiX, FiZap } from "react-icons/fi";
import { TbClipboardCheck } from "react-icons/tb";
import LoginModal from "./LoginModal";
import api from "../lib/api";

const navItems = [
  { to: "/", label: "Beranda", icon: FiHome, end: true },
  { to: "/joki-roblox", label: "Joki Roblox", icon: FiZap },
  { to: "/gift-item", label: "Gift Item", icon: FiGift },
  { to: "/cara-order", label: "Cara Order", icon: FiBookOpen },
  { to: "/cek-transaksi", label: "Cek Pesanan", icon: TbClipboardCheck },
];

const getLinkClass = (isActive, mobile = false) =>
  `flex items-center gap-2 rounded-xl font-semibold transition-colors ${
    mobile ? "w-full px-4 py-3 text-sm" : "px-3 py-2 text-sm"
  } ${
    isActive
      ? "bg-blue-50 text-blue-800"
      : "text-slate-600 hover:bg-slate-50 hover:text-blue-800"
  }`;

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const resetToken = searchParams.get("reset");

  // Baca status login dari token yang tersimpan
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    let isActive = true;
    api
      .get("/auth/me")
      .then(({ data }) => {
        if (isActive) setUser(data);
      })
      .catch((error) => {
        // Token kedaluwarsa/tidak valid -> bersihkan. Error jaringan: biarkan token.
        if (error.response?.status === 401) localStorage.removeItem("token");
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsMobileMenuOpen(false);
    window.location.href = "/";
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Tautan "lupa kata sandi" dari email: /?reset=TOKEN -> buka modal reset otomatis
  useEffect(() => {
    if (resetToken) setShowLoginModal(true);
  }, [resetToken]);

  const clearResetParam = () => {
    if (!searchParams.has("reset")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("reset");
    setSearchParams(next, { replace: true });
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    clearResetParam();
  };

  const firstName = (user?.displayName || user?.email || "").split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const Avatar = () =>
    user?.photo ? (
      <img src={user.photo} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
    ) : (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-900 text-sm font-bold text-white">
        {initial}
      </span>
    );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 text-left shadow-sm backdrop-blur-md">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2" aria-label="ApengJers, beranda">
            <img src="/logo-apengjers.png" alt="" className="h-11 w-11 object-contain" />
            <span className="hidden text-base font-extrabold tracking-tight text-slate-900 sm:block">
              Apeng<span className="text-orange-500">Jers</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => getLinkClass(isActive)}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden shrink-0 lg:block">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <NavLink
                    to="/adminproduct"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiSettings aria-hidden="true" className="h-4 w-4" />
                    Admin
                  </NavLink>
                )}
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 py-1 pl-1 pr-3 text-sm font-semibold text-slate-800">
                  <Avatar />
                  {firstName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <FiLogOut aria-hidden="true" className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <FiLogIn aria-hidden="true" className="h-4 w-4" />
                Masuk
              </button>
            )}
          </div>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav
            id="mobile-navigation"
            className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 shadow-lg lg:hidden sm:px-6"
            aria-label="Navigasi mobile"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => getLinkClass(isActive, true)}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}

              {user ? (
                <>
                  <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                    <Avatar />
                    {user.displayName || user.email}
                  </div>
                  {user.role === "admin" && (
                    <NavLink
                      to="/adminproduct"
                      className={({ isActive }) => getLinkClass(isActive, true)}
                    >
                      <FiSettings aria-hidden="true" className="h-4 w-4" />
                      Admin
                    </NavLink>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    <FiLogOut aria-hidden="true" className="h-4 w-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
                >
                  <FiLogIn aria-hidden="true" className="h-4 w-4" />
                  Masuk
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <LoginModal
        show={showLoginModal}
        onClose={closeLoginModal}
        resetToken={resetToken}
        onResetComplete={clearResetParam}
      />
    </>
  );
}

export default Navbar;
