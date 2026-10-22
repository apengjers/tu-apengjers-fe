import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiCreditCard, FiMessageCircle, FiShield, FiUser } from "react-icons/fi";

const steps = [
  {
    number: "01",
    title: "Pilih layanan",
    description: "Pilih paket Joki Roblox atau item gift, lalu periksa opsi yang tersedia.",
    icon: FiCheck,
  },
  {
    number: "02",
    title: "Isi detail yang diperlukan",
    description: "Masukkan username Roblox penerima dan detail target. Jangan pernah mengirim password, OTP, cookie, atau kode pemulihan akun.",
    icon: FiUser,
  },
  {
    number: "03",
    title: "Konfirmasi harga dan pembayaran",
    description: "Harga dan metode pembayaran perlu dikonfirmasi penjual sebelum transaksi. Pilihan pembayaran di website saat ini masih pratinjau UI.",
    icon: FiCreditCard,
  },
  {
    number: "04",
    title: "Koordinasi dan pantau pesanan",
    description: "Setelah alur order terhubung, penjual akan memberikan konfirmasi dan pembaruan progres melalui kanal kontak yang disediakan.",
    icon: FiMessageCircle,
  },
];

export default function CaraOrderPage() {
  return (
    <>
      <Helmet><title>Cara Order | ApengJers</title></Helmet>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-left sm:px-6 sm:pt-14">
        <header className="max-w-3xl">
          <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-700">Panduan pemesanan</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Order dengan jelas dan aman</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Ikuti alur ini untuk layanan Joki Roblox dan Gift Item. Website masih tahap pengembangan, jadi formulir dan pilihan pembayaran belum mengirim order sungguhan.
          </p>
        </header>

        <section aria-label="Langkah pemesanan" className="mt-9 grid gap-4 sm:grid-cols-2">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.16em] text-orange-500">{number}</span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-800"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              </div>
              <h2 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <aside className="mt-6 flex gap-4 rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-blue-800"><FiShield className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 className="font-extrabold text-blue-950">Jaga keamanan akun</h2>
            <p className="mt-1 text-sm leading-6 text-blue-950/75">Penjual tidak perlu password akun Roblox untuk memproses form ini. Jangan bagikan password, OTP, cookie, ataupun kode pemulihan kepada siapa pun.</p>
          </div>
        </aside>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/joki-roblox" className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800">Lihat Joki Roblox <FiArrowRight aria-hidden="true" /></Link>
          <Link to="/gift-item" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Lihat Gift Item <FiArrowRight aria-hidden="true" /></Link>
        </div>
      </main>
    </>
  );
}
