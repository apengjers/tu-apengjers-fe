import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FiAlertCircle, FiBox, FiLock, FiLogIn, FiPlus, FiRefreshCw, FiTag } from "react-icons/fi";
import api from "../lib/api";
import LoginModal from "../components/LoginModal";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [accessState, setAccessState] = useState("checking");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    let isActive = true;
    const token = localStorage.getItem("token");

    if (!token) {
      setAccessState("signed-out");
      return () => { isActive = false; };
    }

    api.get("/auth/me")
      .then(({ data }) => {
        if (isActive) setAccessState(data.role === "admin" ? "admin" : "forbidden");
      })
      .catch((error) => {
        if (!isActive) return;
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setAccessState("signed-out");
        } else {
          setAccessState("error");
        }
      });

    return () => { isActive = false; };
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await api.get("/api/products");
      const data = response.data;
      setProducts(Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : []);
    } catch {
      setErrorMessage("Data produk belum bisa dimuat. Pastikan backend dan koneksi database berjalan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessState === "admin") fetchProducts();
  }, [accessState, fetchProducts]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus produk “${product.nama}”?`)) return;
    try {
      await api.delete(`/api/products/${product._id}`);
      await fetchProducts();
    } catch {
      setErrorMessage("Produk gagal dihapus. Coba lagi setelah koneksi backend diperiksa.");
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    await fetchProducts();
  };

  const stockCount = products.reduce((total, product) => total + (Number(product.stok) || 0), 0);

  if (accessState !== "admin") {
    const isChecking = accessState === "checking";
    const isSignedOut = accessState === "signed-out";
    return (
      <>
        <Helmet><title>Akses Penjual | ApengJers</title></Helmet>
        <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-12 sm:px-6">
          <section className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-800"><FiLock className="h-6 w-6" aria-hidden="true" /></span>
            <h1 className="mt-5 text-2xl font-black text-slate-900">{isChecking ? "Memeriksa akses…" : isSignedOut ? "Masuk sebagai penjual" : accessState === "forbidden" ? "Akun ini belum punya akses penjual" : "Panel belum dapat dibuka"}</h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              {isChecking ? "Tunggu sebentar, akses akun sedang diverifikasi." : isSignedOut ? "Masuk dengan akun yang memiliki role admin untuk mengelola katalog." : accessState === "forbidden" ? "Minta pemilik sistem mengatur role akun penjual menjadi admin." : "Server autentikasi belum bisa dihubungi. Pastikan backend sedang berjalan lalu coba lagi."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {isSignedOut && <button type="button" onClick={() => setIsLoginOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"><FiLogIn aria-hidden="true" /> Masuk</button>}
              {accessState === "forbidden" && <button type="button" onClick={() => { localStorage.removeItem("token"); setAccessState("signed-out"); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Ganti akun</button>}
              {accessState === "error" && <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Coba lagi</button>}
            </div>
          </section>
        </main>
        <LoginModal show={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Helmet><title>Panel Penjual | ApengJers</title></Helmet>
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 text-left sm:px-6 sm:pt-10">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-700"><FiTag aria-hidden="true" /> Panel penjual</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Kelola katalog</h1>
            <p className="mt-2 text-sm text-slate-600">Atur produk dan ketersediaan item yang ditampilkan di tokomu.</p>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-800"
          >
            <FiPlus aria-hidden="true" className="h-4 w-4" /> Tambah produk
          </button>
        </header>

        <section aria-label="Ringkasan katalog" className="mt-7 grid gap-4 sm:grid-cols-2">
          <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-800"><FiBox className="h-5 w-5" aria-hidden="true" /></span>
            <div><p className="text-xs font-semibold text-slate-500">Produk terdaftar</p><p className="mt-1 text-2xl font-black text-slate-900">{products.length}</p></div>
          </article>
          <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FiTag className="h-5 w-5" aria-hidden="true" /></span>
            <div><p className="text-xs font-semibold text-slate-500">Total stok tersedia</p><p className="mt-1 text-2xl font-black text-slate-900">{stockCount}</p></div>
          </article>
        </section>

        {errorMessage && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-base font-extrabold text-slate-900">Daftar produk</h2><p className="mt-1 text-xs text-slate-500">Data katalog tersimpan melalui backend.</p></div>
            <button type="button" onClick={fetchProducts} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <FiRefreshCw aria-hidden="true" className={isLoading ? "animate-spin" : ""} /> Muat ulang
            </button>
          </div>
          {isLoading ? (
            <div className="py-14 text-center text-sm text-slate-500">Memuat katalog…</div>
          ) : (
            <ProductTable products={products} onEdit={(product) => { setSelectedProduct(product); setIsFormOpen(true); }} onDelete={handleDelete} />
          )}
        </section>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}>
          <ProductForm initialData={selectedProduct} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
        </div>
      )}
    </>
  );
}
