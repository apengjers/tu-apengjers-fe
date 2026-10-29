import { FiCheckCircle, FiClock, FiCreditCard, FiSend } from "react-icons/fi";

export const money = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export const SUMMARY_TABS = [
  { id: "menunggu-pembayaran", label: "Menunggu Pembayaran", icon: FiCreditCard },
  { id: "menunggu-dikirim", label: "Menunggu Dikirim", icon: FiClock },
  { id: "sudah-terkirim", label: "Sudah Terkirim", icon: FiSend },
  { id: "selesai", label: "Selesai", icon: FiCheckCircle },
];

export const HISTORY_TABS = [
  { id: "", label: "Semua" },
  ...SUMMARY_TABS.map(({ id, label }) => ({ id, label })),
  { id: "dibatalkan", label: "Dibatalkan" },
];

export function statusInfo(order) {
  const { status, paymentStatus } = order;
  if (status === "cancelled") return { label: "Dibatalkan", tone: "bg-slate-100 text-slate-600" };
  if (status === "completed") return { label: "Selesai", tone: "bg-emerald-100 text-emerald-800" };
  if (paymentStatus === "refunded") return { label: "Dana dikembalikan", tone: "bg-slate-100 text-slate-600" };
  if (paymentStatus === "unpaid") {
    return status === "new"
      ? { label: "Menunggu konfirmasi", tone: "bg-amber-100 text-amber-800" }
      : { label: "Menunggu pembayaran", tone: "bg-amber-100 text-amber-800" };
  }
  if (status === "processing") return { label: "Sedang diproses", tone: "bg-sky-100 text-sky-800" };
  return { label: "Menunggu dikirim", tone: "bg-blue-100 text-blue-800" };
}

export const paymentMethodLabels = { qris: "QRIS", bank: "Transfer Bank", ewallet: "E-Wallet" };