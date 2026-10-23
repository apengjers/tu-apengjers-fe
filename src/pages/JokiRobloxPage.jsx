import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiClock, FiSearch, FiShield, FiZap } from "react-icons/fi";
import NotFound from "../components/NotFound";
import api from "../lib/api";

const gradients = ["from-orange-400 to-rose-500", "from-emerald-400 to-teal-600", "from-violet-400 to-blue-600", "from-sky-400 to-indigo-600"];
const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

function groupJokiProducts(products, games) {
  return games.map((game, index) => ({
    id: game.slug,
    gameId: game._id,
    name: game.nama,
    image: game.gambar,
    description: `Pilih produk joki ${game.nama} yang sesuai dengan kebutuhanmu.`,
    color: gradients[index % gradients.length],
    packages: products
      .filter((product) => (product.game?._id || product.game) === game._id)
      .map((product) => ({
        id: product._id,
        name: product.nama,
        detail: product.deskripsi || "Produk joki Roblox.",
        price: Number(product.harga) || 0,
        stock: Number(product.stok) || 0,
        image: product.gambar || "",
      })),
  }));
}

export default function JokiRobloxPage() {
  const { gameSlug } = useParams();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;
    Promise.all([api.get("/api/products", { params: { jenis: "joki" } }), api.get("/api/games", { params: { jenis: "joki" } })])
      .then(([productsResponse, gamesResponse]) => {
        const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
        const catalogGames = Array.isArray(gamesResponse.data) ? gamesResponse.data : [];
        if (isActive) setGames(groupJokiProducts(products, catalogGames));
      })
      .catch(() => { if (isActive) setLoadError("Katalog joki belum dapat dimuat. Coba lagi setelah koneksi backend diperiksa."); })
      .finally(() => { if (isActive) setIsLoading(false); });
    return () => { isActive = false; };
  }, []);

  if (isLoading) return <main className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-slate-500">Memuat katalog joki…</main>;
  if (loadError) return <main role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-rose-700">{loadError}</main>;
  const selectedGame = games.find((game) => game.id === gameSlug);
  if (gameSlug) return selectedGame ? <JokiGamePage game={selectedGame} /> : <NotFound />;
  return <JokiGameCatalog games={games} />;
}

function JokiGameCatalog({ games }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const visibleGames = useMemo(() => {
    const query = search.trim().toLowerCase();
    return games.filter((game) => !query || `${game.name} ${game.description} ${game.packages.map((item) => item.name).join(" ")}`.toLowerCase().includes(query));
  }, [games, search]);

  return (
    <>
      <Helmet><title>Joki Roblox | ApengJers</title><meta name="description" content="Pilih game untuk melihat produk joki Roblox yang tersedia." /></Helmet>
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 text-left sm:px-6 sm:pt-10 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500"><Link to="/" className="hover:text-blue-800">Beranda</Link><span aria-hidden="true">/</span><span className="text-slate-800">Joki Roblox</span></nav>
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#101d31] px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-blue-100"><FiZap className="text-orange-300" aria-hidden="true" /> LAYANAN JOKI</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Pilih game</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Lihat produk dan harga joki yang tersedia untuk game pilihanmu.</p></div>
            <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><FiShield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /><p className="text-xs leading-5 text-slate-300">Jangan berikan password, OTP, atau kode pemulihan akun.</p></div>
          </div>
        </section>
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black tracking-tight text-slate-900">Pilih experience</h2><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">Katalog joki</span></div><p className="mt-1 text-sm text-slate-500">Game dan gambarnya dikelola dari panel admin.</p></div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-400 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 sm:max-w-xs"><FiSearch aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="sr-only">Cari game</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari game" className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" /></label>
        </div>
        {visibleGames.length ? <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Daftar game joki">{visibleGames.map((game) => (
          <article key={game.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className={`relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br ${game.color}`}>{game.image ? <img src={game.image} alt={game.name} className="absolute inset-0 h-full w-full object-cover" /> : <div className="text-4xl font-black text-white/90">{game.name.slice(0, 1)}</div>}<div className="absolute inset-0 bg-slate-950/15" /><span className="absolute left-4 top-4 rounded-full bg-black/20 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.12em] text-white">ROBLOX</span></div>
            <div className="flex flex-1 flex-col p-5"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">Joki Roblox</span><span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400"><FiClock aria-hidden="true" /> {game.packages.length} produk</span></div><h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">{game.name}</h3><p className="mt-2 flex-1 text-xs leading-5 text-slate-600">{game.description}</p><button type="button" onClick={() => navigate(`/joki-roblox/${game.id}`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-900">Lihat produk <FiArrowRight aria-hidden="true" /></button></div>
          </article>
        ))}</section> : <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><FiSearch className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" /><h3 className="mt-3 font-bold text-slate-800">Game belum ditemukan</h3><p className="mt-1 text-sm text-slate-500">Coba kata pencarian lain atau tambahkan game dari panel admin.</p></div>}
      </main>
    </>
  );
}

function JokiGamePage({ game }) {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  return (
    <>
      <Helmet><title>Joki {game.name} | ApengJers</title><meta name="description" content={`Pilih produk joki ${game.name} yang tersedia.`} /></Helmet>
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 text-left sm:px-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500"><Link to="/" className="hover:text-blue-800">Beranda</Link><span aria-hidden="true">/</span><Link to="/joki-roblox" className="hover:text-blue-800">Joki Roblox</Link><span aria-hidden="true">/</span><span className="text-slate-800">{game.name}</span></nav>
        <section className={`relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br ${game.color} px-6 py-8 text-white sm:px-10 sm:py-11`}>{game.image && <img src={game.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25" />}<div className="absolute inset-0 -z-10 bg-slate-950/45" /><span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em]">JOKI ROBLOX</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{game.name}</h1><p className="mt-2 text-sm text-white/85">Pilih produk joki yang kamu butuhkan.</p></section>
        <section className="mt-8" aria-labelledby="products-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700">PRODUK JOKI · {game.name}</p><h2 id="products-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900">Pilih produk</h2></div><Link to="/joki-roblox" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><FiArrowLeft aria-hidden="true" /> Ganti game</Link></div>
          {game.packages.length ? <div className="mt-5 grid gap-3 md:grid-cols-3">{game.packages.map((product) => { const isSelected = selectedProduct?.id === product.id; return <article key={product.id} className={`rounded-2xl border p-5 transition ${isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}>{product.image && <img src={product.image} alt={product.name} className="mb-4 h-36 w-full rounded-xl object-cover" />}<h3 className="font-extrabold text-slate-900">{product.name}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">{product.detail}</p><p className="mt-3 text-sm font-extrabold text-blue-900">{formatRupiah(product.price)}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{product.stock > 0 ? `${product.stock} tersedia` : "Hubungi admin untuk jadwal"}</p><button type="button" onClick={() => setSelectedProduct(product)} aria-pressed={isSelected} className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${isSelected ? "bg-emerald-600 text-white" : "bg-blue-50 text-blue-800 hover:bg-blue-100"}`}>{isSelected ? <><FiCheck aria-hidden="true" /> Dipilih</> : "Pilih produk"}</button></article>; })}</div> : <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Belum ada produk untuk game ini.</p>}
          {selectedProduct && <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-emerald-700">PRODUK DIPILIH</p><p className="mt-1 text-sm font-bold text-slate-900">{game.name} · {selectedProduct.name}</p><p className="mt-1 text-xs text-slate-500">Isi detail target sebelum memeriksa ringkasan.</p></div><button type="button" onClick={() => navigate("/pesan/joki-roblox", { state: { experience: { id: game.id, name: game.name }, package: selectedProduct } })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-800">Isi detail joki <FiArrowRight aria-hidden="true" /></button></div>}
        </section>
      </main>
    </>
  );
}
