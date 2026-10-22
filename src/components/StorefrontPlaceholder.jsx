import { Link } from "react-router-dom";

export default function StorefrontPlaceholder({ eyebrow, title, description }) {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-5xl items-center px-4 py-16 sm:px-6">
      <section className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-blue-700" />
        <div className="px-6 py-12 text-left sm:px-12 sm:py-16">
          <p className="mb-4 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
            {eyebrow}
          </p>
          <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
              Halaman sedang disiapkan
            </span>
            <Link
              to="/"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
