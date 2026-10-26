import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import api from "../lib/api";
import { payOrder } from "../services/midtransPayment";
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

// id channel harus sama dengan PAYMENT_CHANNELS di backend (midtransService.js)
const paymentMethods = [
  { id: "qris", name: "QRIS", detail: "Scan kode dari aplikasi pembayaran", icon: FiGrid, channels: [{ id: "other_qris", name: "QRIS" }] },
  {
    id: "va",
    name: "Virtual Account",
    detail: "Bayar lewat VA bank pilihanmu",
    icon: FiCreditCard,
    channels: [
      { id: "bca_va", name: "VA BCA" },
      { id: "echannel", name: "VA Mandiri" },
      { id: "bni_va", name: "VA BNI" },
      { id: "bri_va", name: "VA BRI" },
      { id: "permata_va", name: "VA Permata" },
    ],
  },
  {
    id: "ewallet",
    name: "E-wallet",
    detail: "Bayar lewat dompet digital",
    icon: FiSmartphone,
    channels: [
      { id: "gopay", name: "GoPay" },
      { id: "shopeepay", name: "ShopeePay" },
    ],
  },
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
  const [selectedChannel, setSelectedChannel] = useState("");
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [paymentState, setPaymentState] = useState("idle"); // idle | opening | error
  const [paymentError, setPaymentError] = useState("");
  const [formData, setFormData] = useState({
    robloxUsername: "",
    robloxPassword: "",
    recipientUsername: "",
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
  const quantity = Math.max(1, Number(selection?.quantity) || 1);
  const unitPrice = isGift ? selection?.item?.price : selection?.package?.price;
  const hasCatalogPrice = Number.isFinite(Number(unitPrice));
  const catalogTotal = hasCatalogPrice ? Number(unitPrice) * quantity : null;
  const catalogPath = isGift ? "/gift-item" : "/joki-roblox";
  const selectedMethod = paymentMethods.find((method) => method.id === selectedPayment);
  const selectedChannelName = selectedMethod?.channels.find((channel) => channel.id === selectedChannel)?.name;
  const paymentLabel = selectedMethod ? (selectedMethod.channels.length > 1 && selectedChannelName ? `${selectedMethod.name} · ${selectedChannelName}` : selectedMethod.name) : "";

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    if (name === "whatsapp") {
      const normalized = value.replace(/[\s()-]/g, "").replace(/^08/, "+628").replace(/^628/, "+628");
      event.target.setCustomValidity(/^\+628[1-9]\d{7,10}$/.test(normalized) ? "" : "Masukkan nomor seluler Indonesia yang valid: 08…, 628…, atau +628… (10–13 digit dalam format 08).");
    }
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

  const startPayment = async (orderCode) => {
    setPaymentState("opening");
    setPaymentError("");
    try {
      await payOrder(orderCode); // halaman pembayaran custom ApengJers
    } catch (error) {
      setPaymentState("error");
      setPaymentError(error.response?.data?.message || error.message || "Halaman pembayaran gagal dibuka.");
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmittingOrder(true);
    setSubmitError("");
    try {
      const notes = isGift
        ? formData.notes
        : [formData.catatan, formData.note1, formData.note2, formData.note3, formData.note4].filter(Boolean).join("\n");
      const { data } = await api.post("/api/orders", {
        jenis: isGift ? "gift" : "joki",
        productId: isGift ? selection.item.productId : selection.package.id,
        quantity,
        robloxUsername: formData.robloxUsername,
        robloxPassword: isGift ? undefined : formData.robloxPassword,
        recipientUsername: formData.recipientUsername,
        whatsapp: formData.whatsapp,
        contactEmail: formData.contactEmail,
        notes,
        requestedPaymentMethod: selectedPayment,
        paymentChannel: selectedChannel,
      });
      setOrderResult(data.order);
      setFormData((current) => ({ ...current, robloxPassword: "" }));
      startPayment(data.order.orderCode);
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Permintaan belum terkirim. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsSubmittingOrder(false);
    }
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
            {currentStep === 1 ? orderTitle : currentStep === 2 ? "Periksa ringkasanmu" : orderResult ? "Order berhasil dibuat" : isPreviewReady ? "Konfirmasi permintaan order" : "Pilih metode pembayaran"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {currentStep === 1
              ? "Isi informasi yang diperlukan agar detail layanan atau gift bisa diperiksa sebelum order."
              : currentStep === 2
                ? "Pastikan semua detail sudah benar sebelum memilih metode pembayaran."
                : orderResult ? "Selesaikan pembayaran agar pesananmu bisa diproses." : "Pilih metode pembayaran, lalu buat order dan bayar."}
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
                    <div className="mt-5">
                      <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-bold text-slate-800">Nomor WhatsApp <span className="text-red-500">*</span></label>
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        value={formData.whatsapp}
                        onChange={updateField}
                        required
                        autoComplete="tel"
                        placeholder="Contoh: +62 812 3456 7890"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                      <p className="mt-1.5 text-xs text-slate-500">Admin memakai nomor ini untuk konfirmasi item, stok, dan pesananmu.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div><label htmlFor="robloxUsername" className="mb-1.5 block text-sm font-bold text-slate-800">Username Roblox <span className="text-red-500">*</span></label><input id="robloxUsername" name="robloxUsername" value={formData.robloxUsername} onChange={updateField} required autoComplete="off" placeholder="Username akun Roblox" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /><p className="mt-1.5 text-xs text-slate-500">Jangan masukkan OTP atau kode pemulihan.</p></div>
                      <div><label htmlFor="robloxPassword" className="mb-1.5 block text-sm font-bold text-slate-800">Password<span className="text-red-500">*</span></label><input id="robloxPassword" name="robloxPassword" type="password" value={formData.robloxPassword} onChange={updateField} required minLength={8} maxLength={200} autoComplete="new-password" aria-describedby="password-help" placeholder="Password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /><p id="password-help" className="mt-1.5 text-xs leading-5 text-slate-600">Pastikan Password Sesuai agar Admin bisa mengakses dan mengerjakan akun tersebut.</p></div>
                      {[1, 2, 3, 4].map((number) => <div key={number}><label htmlFor={`note${number}`} className="mb-1.5 block text-sm font-bold text-slate-800">Kode Backup {number}</label><input id={`note${number}`} name={`note${number}`} value={formData[`note${number}`]} onChange={updateField} maxLength={200} autoComplete="off" placeholder={`Kode Backup ${number} untuk admin (opsional)`} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></div>)}
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
                  <SummaryRow label="Jumlah" value={quantity} />
                  <SummaryRow label={isGift ? "Username penerima" : "Username Roblox"} value={isGift ? formData.recipientUsername : formData.robloxUsername} />
                  {!isGift && <SummaryRow label="Password akun" value="Disembunyikan untuk keamanan" />}
                  {!isGift && <>
                    <SummaryRow label="Catatan" value={formData.catatan || "—"} />
                  </>}
                  <SummaryRow label="WhatsApp" value={formData.whatsapp} />
                  <SummaryRow label="Email kontak" value={formData.contactEmail || "Tidak diberikan"} />
                  {isGift && <SummaryRow label="Catatan" value={formData.notes || "Tidak ada"} />}
                  <SummaryRow label="Harga per unit" value={hasCatalogPrice ? formatRupiah(unitPrice) : "Menunggu konfirmasi"} />
                  <SummaryRow label="Total katalog" value={hasCatalogPrice ? formatRupiah(catalogTotal) : "Menunggu konfirmasi"} />
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
                {orderResult ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-700"><FiCheck className="h-5 w-5" aria-hidden="true" /></span>
                    <h2 className="mt-4 text-lg font-extrabold text-emerald-950">{paymentState === "opening" ? "Mengarahkan ke pembayaran…" : "Order sudah tersimpan"}</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/80">ID order: <strong>{orderResult.orderCode}</strong>. {paymentState === "opening" ? "Kamu akan diarahkan ke halaman pembayaran ApengJers untuk melihat QRIS, nomor VA, atau membuka e-wallet pilihanmu." : "Halaman pembayaran gagal dibuka. Order sudah tersimpan, kamu bisa coba bayar lagi."}</p>
                    {paymentError && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-white p-3 text-xs text-rose-800">{paymentError}</p>}
                    <div className="mt-5 flex flex-wrap gap-3">
                      {paymentState === "error" && <button type="button" onClick={() => startPayment(orderResult.orderCode)} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">Bayar sekarang <FiArrowRight aria-hidden="true" /></button>}
                      <Link to={`/cek-transaksi?orderCode=${encodeURIComponent(orderResult.orderCode)}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">Lacak order <FiArrowRight aria-hidden="true" /></Link>
                      <Link to="/" className="rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Kembali ke beranda</Link>
                    </div>
                  </div>
                ) : isPreviewReady ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-700"><FiCheck className="h-5 w-5" aria-hidden="true" /></span>
                    <h2 className="mt-4 text-lg font-extrabold text-emerald-950">Periksa sebelum mengirim order</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/80">
                      Metode pembayaran pilihanmu: <strong>{paymentLabel}</strong>. Setelah order dibuat, kamu diarahkan ke halaman pembayaran ApengJers.
                    </p>
                    {submitError && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-white p-3 text-xs text-rose-800">{submitError}</p>}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button type="button" onClick={() => setIsPreviewReady(false)} className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Ganti metode</button>
                      <button type="button" onClick={() => setCurrentStep(2)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Kembali ke ringkasan</button>
                      <button type="button" onClick={handleSubmitOrder} disabled={isSubmittingOrder} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{isSubmittingOrder ? "Mengirim…" : "Buat order & bayar"} <FiArrowRight aria-hidden="true" /></button>
                      <Link to="/cara-order" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Cara order <FiArrowRight aria-hidden="true" /></Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
                      Pilih metode pembayaran. QRIS, nomor Virtual Account, atau tombol e-wallet akan tersedia di halaman pembayaran ApengJers. Konfirmasi e-wallet dilakukan di aplikasi penyedia.
                    </div>
                    <fieldset>
                      <legend className="mb-3 text-sm font-extrabold text-slate-900">Pilih metode pembayaran</legend>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          const isSelected = selectedPayment === method.id;
                          return (
                            <div key={method.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPayment(method.id);
                                setSelectedChannel(method.channels.length === 1 ? method.channels[0].id : "");
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
                            {isSelected && method.channels.length > 1 && (
                              <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-3">
                                {method.channels.map((channel) => (
                                  <button
                                    key={channel.id}
                                    type="button"
                                    aria-pressed={selectedChannel === channel.id}
                                    onClick={() => {
                                      setSelectedChannel(channel.id);
                                      setIsPreviewReady(false);
                                    }}
                                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${selectedChannel === channel.id ? "border-blue-500 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}
                                  >
                                    {channel.name}
                                  </button>
                                ))}
                              </div>
                            )}
                            </div>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => setCurrentStep(2)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                        <FiArrowLeft aria-hidden="true" /> Kembali
                      </button>
                      <button type="button" disabled={!selectedPayment || !selectedChannel} onClick={() => setIsPreviewReady(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-300">
                        Lanjutkan ke konfirmasi <FiArrowRight aria-hidden="true" />
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
                  <span className="text-xs text-slate-500">Jumlah</span>
                  <span className="text-xs font-extrabold text-slate-800">{quantity}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs text-slate-500">Total katalog</span>
                  <span className="text-xs font-extrabold text-slate-800">{hasCatalogPrice ? formatRupiah(catalogTotal) : "Konfirmasi"}</span>
                </div>
                {selectedPayment && (
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-xs text-slate-500">Metode</span>
                    <span className="text-xs font-extrabold text-slate-800">{paymentLabel}</span>
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
                <li>{isGift ? "Jangan bagikan password atau OTP." : "Gunakan password sementara, lalu ganti setelah pengerjaan selesai."}</li>
                {!isGift && <li>Jangan berikan OTP, backup code, atau cookie akun.</li>}
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
