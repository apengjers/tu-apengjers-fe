import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCreditCard,
  FiGrid,
  FiInfo,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";

const paymentMethods = [
  { id: "qris", name: "QRIS", detail: "Scan kode dari aplikasi pembayaran", icon: FiGrid },
  { id: "bank", name: "Transfer bank", detail: "Virtual account atau transfer", icon: FiCreditCard },
  { id: "ewallet", name: "E-wallet", detail: "Metode yang tersedia akan ditampilkan", icon: FiSmartphone },
];

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="max-w-[65%] break-words text-right text-xs font-bold text-slate-800">{value || "—"}</dd>
    </div>
  );
}

export default function OrderFormPage({ orderType }) {
  const location = useLocation();
  const selection = location.state;
  const isGift = orderType === "gift";
  const hasSelection = isGift ? Boolean(selection?.item) : Boolean(selection?.experience);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [formData, setFormData] = useState({
    robloxUsername: "",
    password: "",
    recipientUsername: "",
    backupCode1: "",
    backupCode2: "",
    backupCode3: "",
    catatan: "",
    whatsapp: "",
    contactEmail: "",
    notes: "",
    confirmDetails: false,
  });

  const orderTitle = isGift ? "Detail Gift Item" : "Detail Joki Roblox";
  const selectedTitle = isGift
    ? selection?.item?.itemName
    : `${selection?.experience?.name} · ${selection?.package?.name}`;
  const selectedOption = isGift ? selection?.option : selection?.package?.detail;
  const catalogPath = isGift ? "/gift-item" : "/joki-roblox";

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  if (!hasSelection) {
    return (
      <>
        <Helmet><title>Pilih layanan | ApengJers</title></Helmet>
        <main className="mx-auto flex min-h-[65vh] max-w-4xl items-center px-4 py-12 sm:px-6">
          <section className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-800"><FiInfo className="h-6 w-6" /></span>
            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900">Pilih layanan terlebih dahulu</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Detail pesanan dimulai dari paket yang kamu pilih di katalog. Buka katalog, pilih layanan, lalu lanjutkan ke form ini.
            </p>
            <Link to={catalogPath} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">
              <FiArrowLeft aria-hidden="true" /> Kembali ke katalog
            </Link>
          </section>
        </main>
      </>
    );
  }

  const handleReview = (event) => {
    event.preventDefault();
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet><title>{orderTitle} | ApengJers</title></Helmet>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-7 text-left sm:px-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-800">Beranda</Link>
          <span aria-hidden="true">/</span>
          <Link to={catalogPath} className="hover:text-blue-800">{isGift ? "Gift Item" : "Joki Roblox"}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800">Detail order</span>
        </nav>

        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-800">
            LANGKAH {currentStep} DARI 3
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {currentStep === 1 ? orderTitle : currentStep === 2 ? "Periksa ringkasanmu" : isPreviewReady ? "Checkout pratinjau siap" : "Pilih metode pembayaran"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {currentStep === 1
              ? "Isi informasi yang diperlukan agar detail layanan atau gift bisa diperiksa sebelum order."
              : currentStep === 2
                ? "Pastikan semua detail sudah benar sebelum memilih metode pembayaran."
                : "Pilih metode untuk melihat pratinjau checkout. Transaksi asli belum dibuat."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {currentStep === 1 ? (
              <form onSubmit={handleReview} className="space-y-5">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">PILIHANMU</p>
                  <h2 className="mt-1 text-base font-extrabold text-slate-900">{selectedTitle}</h2>
                </div>

                {isGift ? (
                  <div>
                    <label htmlFor="recipientUsername" className="mb-1.5 block text-sm font-bold text-slate-800">Username Roblox penerima <span className="text-red-500">*</span></label>
                    <input
                      id="recipientUsername"
                      name="recipientUsername"
                      value={formData.recipientUsername}
                      onChange={updateField}
                      required
                      autoComplete="off"
                      placeholder="Masukkan username penerima"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Periksa ejaan username sebelum melanjutkan.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div><label htmlFor="robloxUsername" className="mb-1.5 block text-sm font-bold text-slate-800">Username Roblox <span className="text-red-500">*</span></label><input id="robloxUsername" name="robloxUsername" value={formData.robloxUsername} onChange={updateField} required autoComplete="off" placeholder="Username akun Roblox" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /><p className="mt-1.5 text-xs text-slate-500">Jangan masukkan password, OTP, atau kode pemulihan.</p></div>
                      <div><label htmlFor="displayName" className="mb-1.5 block text-sm font-bold text-slate-800">Display name <span className="text-red-500">*</span></label><input id="displayName" name="displayName" value={formData.displayName} onChange={updateField} required autoComplete="off" placeholder="Nama tampilan di game" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></div>
                      {[1, 2, 3, 4].map((number) => <div key={number}><label htmlFor={`note${number}`} className="mb-1.5 block text-sm font-bold text-slate-800">Catatan {number}</label><input id={`note${number}`} name={`note${number}`} value={formData[`note${number}`]} onChange={updateField} maxLength={200} autoComplete="off" placeholder={`Catatan ${number} untuk admin (opsional)`} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></div>)}
                      <div><label htmlFor="whatsapp" className="mb-1.5 block text-sm font-bold text-slate-800">WhatsApp <span className="text-red-500">*</span></label><input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={updateField} required autoComplete="tel" placeholder="Contoh: +62 812 3456 7890" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /><p className="mt-1.5 text-xs text-slate-500">Admin menggunakan nomor ini untuk menghubungimu.</p></div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-bold text-slate-800">Email <span className="font-normal text-slate-400">(opsional)</span></label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={updateField}
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {isGift && <div>
                  <label htmlFor="notes" className="mb-1.5 block text-sm font-bold text-slate-800">Catatan tambahan <span className="font-normal text-slate-400">(opsional)</span></label>
                  <input
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={updateField}
                    maxLength={200}
                    autoComplete="off"
                    placeholder="Tambahkan informasi yang relevan"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>}

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    name="confirmDetails"
                    checked={formData.confirmDetails}
                    onChange={updateField}
                    required
                    className="mt-0.5 h-4 w-4 accent-blue-800"
                  />
                  <span className="text-xs leading-5 text-slate-600">
                    Saya sudah memeriksa username dan detail order. Saya memahami ketersediaan layanan mengikuti aturan Roblox dan experience terkait.
                  </span>
                </label>

                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-orange-400 sm:w-auto">
                  Lihat ringkasan <FiArrowRight aria-hidden="true" />
                </button>
              </form>
            ) : currentStep === 2 ? (
              <div>
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                  <p className="text-xs leading-5 text-amber-950">
                    Periksa ringkasan sebelum lanjut. Detail belum dikirim ke admin dan belum memulai pembayaran.
                  </p>
                </div>
                <dl className="divide-y divide-slate-100">
                  <SummaryRow label="Layanan" value={isGift ? "Gift Item" : "Joki Roblox"} />
                  <SummaryRow label={isGift ? "Experience / item" : "Experience / paket"} value={selectedTitle} />
                  <SummaryRow label={isGift ? "Opsi gift" : "Cakupan paket"} value={selectedOption} />
                  <SummaryRow label={isGift ? "Username penerima" : "Username Roblox"} value={isGift ? formData.recipientUsername : formData.robloxUsername} />
                  {!isGift && <>
                    <SummaryRow label="Password" value={formData.password} />
                    <SummaryRow label="Backup Code 1" value={formData.backupCode1 || "—"} />
                    <SummaryRow label="Backup Code 2" value={formData.backupCode2 || "—"} />
                    <SummaryRow label="Backup Code 3" value={formData.backupCode3 || "—"} />
                    <SummaryRow label="Catatan" value={formData.catatan || "—"} />
                    <SummaryRow label="WhatsApp" value={formData.whatsapp} />
                  </>}
                  <SummaryRow label="Email kontak" value={formData.contactEmail || "Tidak diberikan"} />
                  {isGift && <SummaryRow label="Catatan" value={formData.notes || "Tidak ada"} />}
                  <SummaryRow label={isGift ? "Harga katalog" : "Harga paket"} value={isGift ? `${formatRupiah(selection.item.price)} · konfirmasi ulang sebelum order` : selection?.package?.price ? formatRupiah(selection.package.price) : "Menunggu konfirmasi"} />
                </dl>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => setCurrentStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <FiArrowLeft aria-hidden="true" /> Ubah detail
                  </button>
                  <button type="button" onClick={() => setCurrentStep(3)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-400">
                    Pilih metode pembayaran <FiArrowRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {isPreviewReady ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-700"><FiCheck className="h-5 w-5" aria-hidden="true" /></span>
                    <h2 className="mt-4 text-lg font-extrabold text-emerald-950">Pilihan checkout siap ditinjau</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                      Metode pilihan: <strong>{paymentMethods.find((method) => method.id === selectedPayment)?.name}</strong>. Belum ada order atau pembayaran yang dikirim.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button type="button" onClick={() => setIsPreviewReady(false)} className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Ganti metode</button>
                      <button type="button" onClick={() => setCurrentStep(2)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Kembali ke ringkasan</button>
                      <Link to="/cara-order" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Cara order <FiArrowRight aria-hidden="true" /></Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
                      Metode berikut hanya untuk pratinjau UI. Belum terhubung ke penyedia pembayaran.
                    </div>
                    <fieldset>
                      <legend className="mb-3 text-sm font-extrabold text-slate-900">Pilih metode</legend>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          const isSelected = selectedPayment === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => {
                                setSelectedPayment(method.id);
                                setIsPreviewReady(false);
                              }}
                              aria-pressed={isSelected}
                              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}
                            >
                              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${isSelected ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-extrabold text-slate-900">{method.name}</span>
                                <span className="mt-1 block text-xs text-slate-500">{method.detail}</span>
                              </span>
                              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${isSelected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300"}`}>
                                {isSelected && <FiCheck className="h-3 w-3" aria-hidden="true" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => setCurrentStep(2)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                        <FiArrowLeft aria-hidden="true" /> Kembali
                      </button>
                      <button type="button" disabled={!selectedPayment} onClick={() => setIsPreviewReady(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-300">
                        Lihat pratinjau checkout <FiArrowRight aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">Ringkasan pilihan</h2>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{isGift ? "GIFT ITEM" : "JOKI ROBLOX"}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{selectedTitle}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs text-slate-500">Harga</span>
                  <span className="text-xs font-extrabold text-slate-800">{isGift ? formatRupiah(selection.item.price) : selection?.package?.price ? formatRupiah(selection.package.price) : "Konfirmasi"}</span>
                </div>
                {selectedPayment && (
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-xs text-slate-500">Metode</span>
                    <span className="text-xs font-extrabold text-slate-800">{paymentMethods.find((method) => method.id === selectedPayment)?.name}</span>
                  </div>
                )}
              </div>
              <Link to={catalogPath} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-800 hover:text-orange-600">
                <FiArrowLeft aria-hidden="true" /> Ganti pilihan
              </Link>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-blue-950">
                <FiShield aria-hidden="true" className="text-blue-700" /> Keamanan akun
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-blue-950/75">
                <li>Jangan bagikan password atau OTP.</li>
                <li>Isi hanya detail yang diperlukan untuk order.</li>
                <li>Pastikan username tujuan sudah benar.</li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
