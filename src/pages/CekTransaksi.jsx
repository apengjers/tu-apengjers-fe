import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheck, FiClock, FiCreditCard, FiPackage, FiSearch, FiShield } from "react-icons/fi";

const statusSteps = [
  { title: "Menunggu konfirmasi", detail: "Detail dan harga pesanan diperiksa penjual.", icon: FiClock },
  { title: "Menunggu pembayaran", detail: "Pembayaran dilakukan setelah nominal dan metode dikonfirmasi.", icon: FiCreditCard },
  { title: "Sedang diproses", detail: "Joki atau gift dikerjakan setelah pembayaran terverifikasi.", icon: FiPackage },
  { title: "Selesai", detail: "Pesanan selesai dan pembeli menerima konfirmasi.", icon: FiCheck },
];

function CekTransaksi() {
  return (
    <>
      <Helmet><title>Cek Pesanan | ApengJers</title></Helmet>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-left sm:px-6 sm:pt-14">
        <motion.header
          initial={{ y: -36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-800">Pelacakan pesanan</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Cek status pesananmu</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Masukkan ID order untuk melihat progres layanan Joki Roblox atau Gift Item. Fitur pelacakan belum aktif karena endpoint status pesanan belum tersedia.</p>
        </motion.header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <motion.div
            initial={{ x: -48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <label htmlFor="orderId" className="block text-sm font-extrabold text-slate-900">ID pesanan</label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="orderId" type="text" disabled placeholder="Contoh: AJ-123456" className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-500 placeholder:text-slate-400" />
              </div>
              <button type="button" disabled className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-300 px-5 py-3 text-sm font-bold text-white">Cek pesanan</button>
            </div>
            <div role="status" className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <FiClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
              <p className="text-xs leading-5 text-amber-950">Pelacakan belum terhubung ke backend, jadi ID pesanan belum bisa dicari di sini. Tombol dinonaktifkan agar tidak memberi kesan status sedang diperiksa.</p>
            </div>
            <Link to="/cara-order" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-orange-600">Lihat panduan order <FiArrowRight aria-hidden="true" /></Link>
          </motion.div>

          <motion.aside
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-800"><FiPackage className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Alur status</p>
                <h2 className="text-sm font-extrabold text-slate-900">Tahapan pesanan</h2>
              </div>
            </div>
            <ol className="mt-6 space-y-5">
              {statusSteps.map(({ title, detail, icon: Icon }, index) => (
                <motion.li
                  key={title}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.3 + index * 0.1 }}
                  className="relative flex gap-3"
                >
                  {index < statusSteps.length - 1 && <span aria-hidden="true" className="absolute left-[15px] top-8 h-8 w-px bg-slate-200" />}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </motion.aside>
        </section>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38 }}
          className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"
        >
          <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-blue-800" aria-hidden="true" />
          <p className="text-xs leading-5 text-blue-950/80">Jangan kirim password, OTP, cookie, atau kode pemulihan saat berkoordinasi mengenai pesanan.</p>
        </motion.aside>
      </main>
    </>
  );
}

export default CekTransaksi;
