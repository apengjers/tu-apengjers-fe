import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Carousel from "./Carousel";
import HotGamesSection from "./HotGamesSection";
import {
  FiArrowRight,
  FiClock,
  FiGift,
  FiShield,
  FiZap,
} from "react-icons/fi";

const services = [
  {
    to: "/joki-roblox",
    eyebrow: "BANTU PROGRESS",
    title: "Joki Roblox",
    description:
      "Pilih experience dan target yang ingin dicapai. Detail paket dan estimasi akan ditampilkan sebelum kamu memesan.",
    icon: FiZap,
    accent: "from-orange-400 to-rose-500",
    iconBackground: "bg-orange-50 text-orange-600",
    action: "Lihat layanan joki",
  },
  {
    to: "/gift-item",
    eyebrow: "KIRIM HADIAH",
    title: "Gift Item",
    description:
      "Cari item untuk dikirim ke teman. Pastikan username penerima dan syarat gift sudah sesuai sebelum order.",
    icon: FiGift,
    accent: "from-blue-500 to-violet-500",
    iconBackground: "bg-blue-50 text-blue-700",
    action: "Jelajahi gift item",
  },
];

const orderSteps = [
  {
    number: "01",
    title: "Pilih layanan",
    description: "Tentukan joki atau item gift yang kamu cari.",
  },
  {
    number: "02",
    title: "Isi detail order",
    description: "Masukkan target atau username penerima dengan teliti.",
  },
  {
    number: "03",
    title: "Pantau pesanan",
    description: "Simpan ID pesanan untuk melihat perkembangan order.",
  },
];

const faqs = [
  {
    question: "Data apa yang perlu disiapkan untuk joki?",
    answer:
      "Siapkan nama experience Roblox, target yang ingin dicapai, dan catatan khusus. Rincian yang diperlukan bisa berbeda untuk setiap layanan.",
  },
  {
    question: "Apakah saya perlu memberikan password atau kode OTP?",
    answer:
      "Jangan kirim password, kode OTP, atau kode pemulihan lewat chat. Detail akses untuk setiap layanan harus dijelaskan dengan aman sebelum pemesanan.",
  },
  {
    question: "Apakah semua item bisa dikirim sebagai gift?",
    answer:
      "Tidak selalu. Ketersediaan gift dan syarat pengiriman bergantung pada item dan experience yang dipilih. Periksa detail produk sebelum order.",
  },
];

function ServiceCard({ service }) {
  const Icon = service.icon;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 sm:p-8">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${service.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl ${service.iconBackground}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-slate-500">
          {service.eyebrow}
        </span>
      </div>
      <h3 className="mt-7 text-2xl font-black tracking-tight text-slate-900">{service.title}</h3>
      <p className="mt-3 min-h-[72px] max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
        {service.description}
      </p>
      <Link
        to={service.to}
        className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-blue-800 transition group-hover:gap-3"
      >
        {service.action}
        <FiArrowRight aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function HomeSections() {
  return (
    <>
      <Helmet>
        <title>Joki Roblox & Gift Item | ApengJers</title>
        <meta
          name="description"
          content="Lihat layanan joki Roblox dan gift item dari ApengJers. Pilih layanan, siapkan detail, dan pantau pesananmu."
        />
      </Helmet>

      <main className="mx-auto max-w-7xl space-y-16 px-4 pb-16 pt-7 text-left sm:space-y-20 sm:px-6 sm:pt-10 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#101d31] text-white shadow-2xl shadow-blue-950/15">
          <div className="absolute -right-28 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-blue-600/25 blur-3xl" />
          <div className="absolute -bottom-48 left-1/4 -z-10 h-[25rem] w-[25rem] rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:40px_40px]" />

          <div className="grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-4 lg:px-14 lg:py-16">
            <div className="order-2 max-w-2xl lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-bold tracking-wide text-blue-100">
                <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,.9)]" />
                TOKO LAYANAN ROBLOX
              </div>
              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Progress jalan.
                <span className="mt-1 block bg-gradient-to-r from-orange-300 to-amber-400 bg-clip-text text-transparent">
                  Gift jadi kejutan.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Cari bantuan joki untuk target Roblox-mu atau pilih item gift untuk teman. Mulai dari layanan yang kamu butuhkan.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/joki-roblox"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                >
                  <FiZap aria-hidden="true" />
                  Cari Joki Roblox
                  <FiArrowRight aria-hidden="true" />
                </Link>
                <Link
                  to="/gift-item"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <FiGift aria-hidden="true" />
                  Lihat Gift Item
                </Link>
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400">
                <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                Jangan bagikan password, OTP, atau kode pemulihan akun.
              </p>
            </div>

            <div className="order-1 mx-auto w-full max-w-[520px] lg:order-2">
              <Carousel />
            </div>
          </div>
        </section>

        <HotGamesSection />

        <section aria-labelledby="services-title">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">PILIH KEBUTUHANMU</p>
              <h2 id="services-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Dua cara bikin sesi Roblox makin seru
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              Lihat detail layanan dan syaratnya sebelum menentukan pilihan.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service) => <ServiceCard key={service.to} service={service} />)}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">SINGKAT DAN JELAS</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Alur order</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              Siapkan detail yang dibutuhkan agar permintaan joki atau gift-mu mudah dipahami.
            </p>
            <Link to="/cara-order" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-blue-800 hover:text-orange-600">
              Baca panduan order <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {orderSteps.map((step) => (
              <li key={step.number} className="rounded-2xl bg-slate-50 p-5">
                <span className="text-xs font-black tracking-[0.16em] text-orange-600">{step.number}</span>
                <h3 className="mt-3 font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]" aria-labelledby="faq-title">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">SEBELUM ORDER</p>
            <h2 id="faq-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Pertanyaan yang sering muncul
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              Cek hal-hal penting tentang detail joki, keamanan akun, dan ketersediaan gift.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-blue-200 open:bg-blue-50/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-800 marker:hidden">
                  {faq.question}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-45 group-open:bg-blue-100 group-open:text-blue-800">
                    <span aria-hidden="true" className="text-lg leading-none">+</span>
                  </span>
                </summary>
                <p className="mt-3 pr-8 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 px-6 py-8 text-white sm:flex-row sm:items-center sm:px-9 sm:py-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-200">SIAP MULAI?</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Pilih layanan yang kamu cari</h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/joki-roblox" className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-orange-400">
              <FiZap aria-hidden="true" /> Joki Roblox
            </Link>
            <Link to="/gift-item" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15">
              <FiGift aria-hidden="true" /> Gift Item
            </Link>
          </div>
        </section>

        <div className="-mt-10 flex items-center justify-center gap-2 text-center text-xs text-slate-400 sm:-mt-14">
          <FiClock aria-hidden="true" className="h-3.5 w-3.5" />
          Ketersediaan dan syarat layanan ditampilkan pada detail paket.
        </div>
      </main>
    </>
  );
}
