import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import NotFound from "../components/NotFound";
import QuantitySelector from "../components/QuantitySelector";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiGift,
  FiInfo,
  FiSearch,
  FiShield,
  FiShoppingBag,
} from "react-icons/fi";

const gradients = ["from-rose-400 to-pink-600", "from-emerald-400 to-teal-600", "from-orange-400 to-red-600", "from-sky-400 to-indigo-600"];
const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export default function GiftItemPage() {
  const navigate = useNavigate();
  const { gameSlug } = useParams();
  const [giftItems, setGiftItems] = useState([]);
  const [giftGames, setGiftGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGiftOption, setSelectedGiftOption] = useState("");
  const [isGiftSelected, setIsGiftSelected] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const detailRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      api.get("/api/products", { params: { jenis: "gift" } }),
      api.get("/api/games", { params: { jenis: "gift" } }),
    ])
      .then(([{ data }, gamesResponse]) => {
        const products = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        if (isActive) {
          setGiftGames(Array.isArray(gamesResponse.data) ? gamesResponse.data : []);
          setGiftItems(products.map((product, index) => ({
            id: product._id,
            productId: product._id,
            gameSlug: product.game?.slug || "",
            experience: product.game?.nama || product.kategori || "Gift Roblox",
            itemName: product.nama,
            kind: product.kategori || "Gift Item",
            description: product.deskripsi || "Item gift Roblox dari katalog ApengJers.",
            price: Number(product.harga) || 0,
            stock: Number(product.stok) || 0,
            image: product.gambar || "",
            color: gradients[index % gradients.length],
            options: ["Pesan item ini"],
            requirements: [
              "Username penerima harus benar dan memenuhi syarat gift di experience terkait.",
              "Stok dan metode pengiriman dikonfirmasi sebelum pembayaran.",
            ],
          })));
        }
      })
      .catch(() => {
        if (isActive) setLoadError("Katalog belum dapat dimuat. Coba lagi setelah koneksi backend diperiksa.");
      })
      .finally(() => { if (isActive) setIsLoading(false); });
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    setSearch("");
    setSelectedItem(null);
    setSelectedGiftOption("");
    setIsGiftSelected(false);
    setQuantity(1);
  }, [gameSlug]);

  useEffect(() => {
    if (selectedItem) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedItem]);

  const selectedGame = giftGames.find((game) => game.slug === gameSlug);
  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return giftItems.filter((item) => {
      const matchesGame = !gameSlug || item.gameSlug === gameSlug;
      const matchesSearch =
        !normalizedSearch ||
        `${item.experience} ${item.itemName} ${item.kind} ${item.description}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesGame && matchesSearch;
    });
  }, [gameSlug, giftItems, search]);
  const visibleGames = useMemo(() => {
    const query = search.trim().toLowerCase();
    return giftGames.filter((game) => !query || game.nama.toLowerCase().includes(query));
  }, [giftGames, search]);

  const openItem = (item) => {
    setSelectedItem(item);
    setSelectedGiftOption("");
    setIsGiftSelected(false);
    setQuantity(1);
  };

  if (gameSlug && !isLoading && !loadError && !selectedGame) return <NotFound />;

  return (
    <>
      <Helmet>
        <title>{selectedGame ? `Gift Item ${selectedGame.nama}` : "Gift Item Roblox"} | ApengJers</title>
        <meta name="description" content="Cari item game Roblox untuk dikirim sebagai gift. Cek ketersediaan dan syarat sebelum order." />
      </Helmet>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 text-left sm:px-6 sm:pt-10 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-800">Beranda</Link>
          <span aria-hidden="true">/</span>
          {selectedGame ? <><Link to="/gift-item" className="hover:text-blue-800">Gift Item</Link><span aria-hidden="true">/</span><span className="text-slate-800">{selectedGame.nama}</span></> : <span className="text-slate-800">Gift Item</span>}
        </nav>

        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#10223a] via-[#153962] to-[#233875] px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/4 -z-10 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl" />
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-blue-100">
                <FiGift aria-hidden="true" className="text-orange-300" /> GIFT ITEM
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Kirim item, bikin teman senang</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                Cari item dari experience pilihanmu. Cek stok, cara pengiriman, dan syarat gift sebelum menentukan pilihan.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-2">Konfirmasi ketersediaan</span>
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-2">Periksa username penerima</span>
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-2">Pahami syarat game</span>
              </div>
            </div>
            <div className="relative mx-auto grid h-40 w-40 place-items-center sm:h-48 sm:w-48">
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/15 bg-white/[0.06] rotate-6" />
              <div className="absolute inset-3 rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-400/20 to-pink-500/10 -rotate-6" />
              <FiGift className="relative h-20 w-20 text-orange-300 drop-shadow-[0_12px_20px_rgba(0,0,0,.25)] sm:h-24 sm:w-24" aria-hidden="true" />
              <span className="absolute -bottom-1 right-0 rounded-full border border-white/15 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold text-blue-100">
                Gift Roblox
              </span>
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900">{selectedGame ? `Gift item ${selectedGame.nama}` : "Pilih game"}</h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Katalog toko</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Item, stok, dan harga berasal dari katalog penjual.</p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-400 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 sm:max-w-xs">
            <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="sr-only">{selectedGame ? "Cari item" : "Cari game"}</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedItem(null);
                setSelectedGiftOption("");
                setIsGiftSelected(false);
              }}
              placeholder={selectedGame ? "Cari item" : "Cari game"}
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {loadError && <div role="alert" className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"><FiAlertCircle aria-hidden="true" />{loadError}</div>}

        {!gameSlug ? (isLoading ? (
          <div role="status" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white"><div className="h-40 rounded-t-3xl bg-slate-100" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="h-3 w-full rounded bg-slate-100" /></div></div>)}
          </div>
        ) : visibleGames.length ? (
          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Daftar game gift item">
            {visibleGames.map((game, index) => {
              const itemCount = giftItems.filter((item) => item.gameSlug === game.slug).length;
              return <article key={game._id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className={`relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                  {game.gambar ? <img src={game.gambar} alt={game.nama} className="absolute inset-0 h-full w-full object-cover" /> : <div className="text-4xl font-black text-white/90">{game.nama.slice(0, 1)}</div>}
                  <div className="absolute inset-0 bg-slate-950/15" />
                  <span className="absolute left-4 top-4 rounded-full bg-black/20 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.12em] text-white">GIFT ITEM</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">Gift Item</span><span className="text-[10px] font-semibold text-slate-400">{itemCount} item</span></div>
                  <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">{game.nama}</h3>
                  <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">Lihat item gift {game.nama} yang tersedia.</p>
                  <button type="button" onClick={() => navigate(`/gift-item/${game.slug}`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-900">Lihat item <FiArrowRight aria-hidden="true" /></button>
                </div>
              </article>;
            })}
          </section>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><FiSearch className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" /><h3 className="mt-3 font-bold text-slate-800">Game belum ditemukan</h3><p className="mt-1 text-sm text-slate-500">{giftGames.length ? "Coba kata pencarian lain." : "Belum ada game Gift Item yang ditambahkan admin."}</p></div>
        )) : isLoading ? (
          <div role="status" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white"><div className="h-40 rounded-t-3xl bg-slate-100" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="h-3 w-full rounded bg-slate-100" /><div className="h-3 w-1/2 rounded bg-slate-100" /></div></div>)}
          </div>
        ) : visibleItems.length > 0 ? (
          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Daftar gift item">
            {visibleItems.map((item) => {
              const isActive = selectedItem?.id === item.id;
              return (
                <article key={item.id} className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}>
                  <div className={`relative grid h-40 place-items-center overflow-hidden bg-gradient-to-br ${item.color}`}>
                    <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/20" />
                    <div className="absolute -bottom-20 -left-8 h-48 w-48 rounded-full border border-white/20" />
                    {item.image ? <img src={item.image} alt={item.itemName} className="absolute inset-0 h-full w-full object-cover" /> : <div className="relative grid h-20 w-20 place-items-center rounded-[1.6rem] border border-white/35 bg-white/15 text-white shadow-xl backdrop-blur-sm transition group-hover:rotate-3 group-hover:scale-105"><FiGift className="h-9 w-9" aria-hidden="true" /></div>}
                    <span className="absolute left-4 top-4 rounded-full bg-black/15 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.12em] text-white backdrop-blur">{item.experience.toUpperCase()}</span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-extrabold text-slate-700">{item.stock > 0 ? `${item.stock} TERSEDIA` : "HABIS"}</span>
                  </div>
                  <div className="p-5">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">{item.kind}</span>
                    <h3 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">{item.itemName}</h3>
                    <p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-[11px] font-extrabold text-slate-800">{formatRupiah(item.price)}</span>
                      <button
                        type="button"
                        onClick={() => openItem(item)}
                        aria-expanded={isActive}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-800 transition hover:text-orange-600"
                      >
                        Detail <FiArrowRight aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <FiSearch className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
            <h3 className="mt-3 font-bold text-slate-800">Item belum ditemukan</h3>
            <p className="mt-1 text-sm text-slate-500">{giftItems.some((item) => item.gameSlug === gameSlug) ? "Coba kata pencarian lain." : "Belum ada item yang dipasang untuk game ini."}</p>
          </div>
        )}

        {selectedItem && (
          <section ref={detailRef} className="mt-8 scroll-mt-28 rounded-3xl border border-blue-100 bg-blue-50/70 p-5 sm:p-7" aria-labelledby="gift-detail-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700">DETAIL GIFT · {selectedItem.experience}</p>
                <h2 id="gift-detail-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900">{selectedItem.itemName}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selectedItem.description}</p>
                <p className="mt-3 text-sm font-extrabold text-blue-900">{formatRupiah(selectedItem.price)} <span className="font-medium text-slate-500">· stok {selectedItem.stock}</span></p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setSelectedGiftOption("");
                  setIsGiftSelected(false);
                }}
                className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900"
              >
                <FiArrowLeft aria-hidden="true" /> Tutup detail
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.85fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <FiInfo aria-hidden="true" className="text-blue-700" /> Syarat sebelum gift
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {selectedItem.requirements.map((requirement) => (
                    <li key={requirement} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                      <FiCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <FiShoppingBag aria-hidden="true" className="text-orange-600" /> Opsi permintaan
                </h3>
                <div className="mt-3 space-y-2">
                  {selectedItem.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelectedGiftOption(option);
                        setIsGiftSelected(false);
                      }}
                      aria-pressed={selectedGiftOption === option}
                      className={`w-full rounded-xl border px-3.5 py-3 text-left text-xs font-semibold transition ${selectedGiftOption === option ? "border-blue-300 bg-blue-50 text-blue-900" : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  <QuantitySelector
                    quantity={quantity}
                    onChange={setQuantity}
                    max={selectedItem.stock > 0 ? selectedItem.stock : 1}
                    helperText={selectedItem.stock > 0 ? `Maksimal ${selectedItem.stock} sesuai stok yang tersedia.` : "Stok sedang habis."}
                  />
                </div>
                <p className="mt-3 text-xs font-extrabold text-slate-800">Total katalog: {formatRupiah(selectedItem.price * quantity)}</p>
                <p className="mt-3 text-[10px] leading-4 text-slate-400">Harga katalog dikonfirmasi admin. Stok ditahan saat permintaan order dikirim dan dilepas jika order dibatalkan.</p>
                <button
                  type="button"
                  onClick={() => setIsGiftSelected(true)}
                  disabled={!selectedGiftOption || selectedItem.stock < 1}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold text-white transition ${isGiftSelected ? "bg-emerald-600" : "bg-blue-900 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"}`}
                >
                  {isGiftSelected ? <><FiCheck aria-hidden="true" /> Gift dipilih</> : selectedItem.stock < 1 ? "Stok habis" : <>Pilih gift ini <FiArrowRight aria-hidden="true" /></>}
                </button>
              </div>
            </div>

            {isGiftSelected && (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <FiInfo className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
                  <p className="text-xs leading-5 text-slate-600">
                    <strong className="text-slate-900">Pilihan tersimpan di halaman ini.</strong> {selectedGiftOption}. Username penerima diminta di langkah berikutnya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/pesan/gift-item", {
                    state: { item: selectedItem, option: selectedGiftOption, quantity },
                  })}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-800"
                >
                  Isi detail penerima <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            )}
          </section>
        )}

        <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-extrabold">Gift harus sesuai aturan game</h2>
            <p className="mt-1 text-xs leading-5 text-amber-900/80">
              Ketersediaan dan prasyarat dapat berbeda pada tiap experience. Jangan berikan password atau kode keamanan akun.
            </p>
          </div>
        </aside>
      </main>
    </>
  );
}
