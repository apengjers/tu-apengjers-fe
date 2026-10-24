import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import { FiAlertCircle, FiRefreshCw, FiStar } from "react-icons/fi";

export default function HotGamesAdminPanel() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { data } = await api.get("/api/games");
      setGames(Array.isArray(data) ? data : []);
    } catch {
      setErrorMessage("Daftar game gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);

  const saveGame = async (game, changes) => {
    setSavingId(game._id);
    setErrorMessage("");
    try {
      await api.put(`/api/games/${game._id}`, {
        nama: game.nama,
        slug: game.slug,
        gambar: game.gambar || "",
        jenis: game.jenis || "joki",
        isFeatured: changes.isFeatured ?? game.isFeatured,
        featuredOrder: Number(changes.featuredOrder ?? game.featuredOrder) || 0,
      });
      await loadGames();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Hot Games gagal diperbarui.");
    } finally {
      setSavingId("");
    }
  };

  const featuredCount = games.filter((game) => game.isFeatured).length;

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-base font-extrabold text-slate-900">Hot Games beranda</h2><p className="mt-1 text-xs text-slate-500">Pilih game Joki atau Gift yang ingin ditonjolkan ({featuredCount} aktif).</p></div><button type="button" onClick={loadGames} disabled={isLoading} className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} /> Muat ulang</button></div>
      {errorMessage && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><FiAlertCircle />{errorMessage}</p>}
      {isLoading ? <p className="py-16 text-center text-sm text-slate-500">Memuat game…</p> : games.length ? <div className="mt-5 grid gap-3 md:grid-cols-2">
        {games.map((game) => <article key={game._id} className={`flex items-center gap-4 rounded-2xl border p-4 ${game.isFeatured ? "border-orange-200 bg-orange-50/50" : "border-slate-200 bg-white"}`}>
          {game.gambar ? <img src={game.gambar} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400"><FiStar /></span>}
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-extrabold text-slate-900">{game.nama}</h3><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-800">{game.jenis === "gift" ? "Gift Item" : "Joki Roblox"}</span></div><p className="mt-1 text-[10px] text-slate-500">/{game.jenis === "gift" ? "gift-item" : "joki-roblox"}/{game.slug}</p>{game.isFeatured && <label className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-600">Urutan <input type="number" min="0" step="1" defaultValue={game.featuredOrder || 0} onBlur={(event) => { if (Number(event.target.value) !== Number(game.featuredOrder || 0)) saveGame(game, { featuredOrder: event.target.value }); }} className="w-16 rounded-md border border-slate-200 px-2 py-1" /></label>}</div>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[10px] font-bold text-slate-600"><input type="checkbox" checked={Boolean(game.isFeatured)} disabled={savingId === game._id} onChange={(event) => saveGame(game, { isFeatured: event.target.checked })} className="h-4 w-4 accent-orange-500" />Unggulkan</label>
        </article>)}
      </div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center text-sm text-slate-500">Tambahkan game di tab Game sebelum memilih Hot Games.</div>}
    </section>
  );
}
