import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiCheck,
  FiClock,
  FiGift,
  FiMap,
  FiSearch,
  FiShield,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

const serviceTypes = [
  { id: "quest", label: "Quest & misi", icon: FiMap },
  { id: "progress", label: "Level & progress", icon: FiTrendingUp },
  { id: "achievement", label: "Badge & achievement", icon: FiAward },
];

const experienceOptions = [
  {
    id: "blox-fruits",
    name: "Blox Fruits",
    category: "quest",
    categoryLabel: "Quest & leveling",
    description: "Bantuan progress dan penyelesaian target quest di experience pilihanmu.",
    icon: FiZap,
    color: "from-orange-400 to-rose-500",
    softColor: "bg-orange-50 text-orange-700",
    packages: [
      { name: "1 target", detail: "Untuk satu target quest atau progress." },
      { name: "Beberapa target", detail: "Gabungkan beberapa target dalam satu order." },
      { name: "Target khusus", detail: "Ceritakan target yang ingin dicapai." },
    ],
  },
  {
    id: "grow-a-garden",
    name: "Grow a Garden",
    category: "progress",
    categoryLabel: "Progress & event",
    description: "Pilih bantuan progress atau aktivitas sesuai kebutuhan di game.",
    icon: FiTrendingUp,
    color: "from-emerald-400 to-teal-600",
    softColor: "bg-emerald-50 text-emerald-700",
    packages: [
      { name: "Target ringan", detail: "Untuk satu kebutuhan progress sederhana." },
      { name: "Target lanjutan", detail: "Untuk target dengan beberapa tahapan." },
      { name: "Target khusus", detail: "Sesuaikan rincian dengan kebutuhanmu." },
    ],
  },
  {
    id: "adopt-me",
    name: "Adopt Me!",
    category: "achievement",
    categoryLabel: "Task & achievement",
    description: "Rencanakan bantuan aktivitas atau target tertentu di experience.",
    icon: FiAward,
    color: "from-violet-400 to-blue-600",
    softColor: "bg-violet-50 text-violet-700",
    packages: [
      { name: "1 target", detail: "Untuk satu task atau achievement." },
      { name: "Paket beberapa target", detail: "Pilih lebih dari satu target untuk dibahas." },
      { name: "Target khusus", detail: "Jelaskan target dan batas waktu yang diinginkan." },
    ],
  },
  {
    id: "custom-experience",
    name: "Experience lainnya",
    category: "custom",
    categoryLabel: "Custom target",
    description: "Belum menemukan game yang dicari? Sampaikan nama experience dan targetnya.",
    icon: FiGift,
    color: "from-sky-400 to-indigo-600",
    softColor: "bg-sky-50 text-sky-700",
    packages: [
      { name: "Konsultasi target", detail: "Cocokkan kebutuhan dengan layanan yang tersedia." },
      { name: "Target khusus", detail: "Rincian dan estimasi ditentukan setelah pengecekan." },
    ],
  },
];

const filters = [
  { id: "all", label: "Semua layanan" },
  ...serviceTypes.map(({ id, label }) => ({ id, label })),
  { id: "custom", label: "Target khusus" },
];

export default function JokiRobloxPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeExperience, setActiveExperience] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const visibleExperiences = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return experienceOptions.filter((experience) => {
      const matchesFilter = activeFilter === "all" || experience.category === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${experience.name} ${experience.categoryLabel} ${experience.description}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const openPackages = (experience) => {
    setActiveExperience(experience);
    setSelectedPackage(null);
  };

  return (
    <>
      <Helmet>
        <title>Joki Roblox | ApengJers</title>
        <meta name="description" content="Pilih jenis layanan joki Roblox dan target experience yang kamu inginkan." />
      </Helmet>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 text-left sm:px-6 sm:pt-10 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-800">Beranda</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800">Joki Roblox</span>
        </nav>

        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#101d31] px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="absolute -bottom-36 left-1/3 -z-10 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-blue-100">
                <FiZap aria-hidden="true" className="text-orange-300" /> LAYANAN JOKI
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Joki Roblox</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                Pilih experience dan jenis target yang kamu butuhkan. Rincian, estimasi, dan harga perlu disepakati sebelum order.
              </p>
            </div>
            <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
              <p className="text-xs leading-5 text-slate-300">
                Jangan berikan password, OTP, atau kode pemulihan akun. Pastikan metode pengerjaan dijelaskan sebelum pemesanan.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900">Pilih experience</h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">
                Contoh UI
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Paket dan game di katalog ini masih contoh dan bisa disesuaikan.</p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-400 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 sm:max-w-xs">
            <FiSearch aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="sr-only">Cari experience atau layanan</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari game atau layanan"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filter layanan">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                activeFilter === filter.id
                  ? "bg-blue-900 text-white shadow-md shadow-blue-900/15"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {visibleExperiences.length > 0 ? (
          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Daftar layanan joki">
            {visibleExperiences.map((experience) => {
              const Icon = experience.icon;
              const isActive = activeExperience?.id === experience.id;

              return (
                <article
                  key={experience.id}
                  className={`group flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                  }`}
                >
                  <div className={`relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br ${experience.color}`}>
                    <div className="absolute -right-6 -top-10 h-36 w-36 rounded-full border border-white/20" />
                    <div className="absolute -bottom-16 -left-5 h-40 w-40 rounded-full border border-white/20" />
                    <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/30 bg-white/15 text-white shadow-xl backdrop-blur-sm transition group-hover:rotate-3 group-hover:scale-105">
                      <Icon className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <span className="absolute left-4 top-4 rounded-full bg-black/15 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.12em] text-white backdrop-blur">
                      ROBLOX
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${experience.softColor}`}>
                        {experience.categoryLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <FiClock aria-hidden="true" /> Cek estimasi
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">{experience.name}</h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">{experience.description}</p>
                    <button
                      type="button"
                      onClick={() => openPackages(experience)}
                      aria-expanded={isActive}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-900"
                    >
                      Lihat pilihan paket
                      <FiArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <FiSearch className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
            <h3 className="mt-3 font-bold text-slate-800">Layanan belum ditemukan</h3>
            <p className="mt-1 text-sm text-slate-500">Coba kata pencarian atau filter yang berbeda.</p>
          </div>
        )}

        {activeExperience && (
          <section className="mt-8 scroll-mt-28 rounded-3xl border border-blue-100 bg-blue-50/70 p-5 sm:p-7" aria-labelledby="package-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700">PILIH PAKET · {activeExperience.name}</p>
                <h2 id="package-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900">Tentukan cakupan target</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Harga dan estimasi belum ditetapkan. Keduanya perlu disesuaikan dengan target serta ketentuan experience.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveExperience(null);
                  setSelectedPackage(null);
                }}
                className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900"
              >
                <FiArrowLeft aria-hidden="true" /> Tutup paket
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {activeExperience.packages.map((item) => {
                const isSelected = selectedPackage?.name === item.name;
                return (
                  <article key={item.name} className={`rounded-2xl border p-4 transition ${isSelected ? "border-blue-500 bg-white ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}>
                    <h3 className="font-extrabold text-slate-900">{item.name}</h3>
                    <p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">{item.detail}</p>
                    <p className="mt-3 text-[10px] font-semibold text-slate-400">Harga & estimasi: perlu dikonfirmasi</p>
                    <button
                      type="button"
                      onClick={() => setSelectedPackage(item)}
                      aria-pressed={isSelected}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${isSelected ? "bg-emerald-600 text-white" : "bg-blue-50 text-blue-800 hover:bg-blue-100"}`}
                    >
                      {isSelected ? <><FiCheck aria-hidden="true" /> Dipilih</> : "Pilih paket"}
                    </button>
                  </article>
                );
              })}
            </div>

            {selectedPackage && (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-emerald-700">PAKET DIPILIH</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{activeExperience.name} · {selectedPackage.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Isi detail target sebelum memeriksa ringkasan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/pesan/joki-roblox", {
                    state: { experience: activeExperience, package: selectedPackage },
                  })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-800"
                >
                  Isi detail joki <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            )}
          </section>
        )}

        <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-extrabold">Jaga keamanan akun</h2>
            <p className="mt-1 text-xs leading-5 text-amber-900/80">
              Jangan bagikan password, OTP, atau kode pemulihan. Pastikan layanan yang dipilih sesuai aturan Roblox dan experience terkait.
            </p>
          </div>
        </aside>
      </main>
    </>
  );
}
