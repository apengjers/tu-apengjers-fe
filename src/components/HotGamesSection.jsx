import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiGift, FiZap } from "react-icons/fi";
import api from "../lib/api";

export default function HotGamesSection() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    let isActive = true;
    api.get("/api/games", { params: { featured: true } })
      .then(({ data }) => { if (isActive && Array.isArray(data)) setGames(data); })
      .catch(() => {});
    return () => { isActive = false; };
  }, []);

  if (!games.length) return null;

  return (
    <section aria-labelledby="hot-games-title">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">PILIHAN ADMIN</p><h2 id="hot-games-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Hot Games Roblox</h2></div>
        <p className="max-w-md text-sm leading-6 text-slate-500">Game unggulan untuk layanan joki dan gift item.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {games.map((game) => {
          const isGift = game.jenis === "gift";
          const href = `${isGift ? "/gift-item" : "/joki-roblox"}/${game.slug}`;
          const Icon = isGift ? FiGift : FiZap;
          return <article key={game._id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-900 to-violet-700">{game.gambar ? <img src={game.gambar} alt={game.nama} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-white"><Icon className="h-12 w-12" aria-hidden="true" /></div>}<span className="absolute left-3 top-3 rounded-full bg-slate-950/65 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">{isGift ? "Gift Item" : "Joki Roblox"}</span></div>
            <div className="p-5"><h3 className="text-lg font-extrabold text-slate-900">{game.nama}</h3><Link to={href} className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-blue-800 hover:text-orange-600">Lihat game <FiArrowRight aria-hidden="true" /></Link></div>
          </article>;
        })}
      </div>
    </section>
  );
}
