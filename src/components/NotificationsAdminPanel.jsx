import { useEffect, useState } from "react";
import { FiAlertCircle, FiBell, FiCheckCircle, FiExternalLink, FiSend } from "react-icons/fi";
import api from "../lib/api";

export default function NotificationsAdminPanel() {
  const [subTab, setSubTab] = useState("device");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [devicePermission, setDevicePermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  );
  const [deviceEnabled, setDeviceEnabled] = useState(() => localStorage.getItem("apengjers_device_notif") === "true");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    api.get("/api/orders/webhook-setting")
      .then(({ data }) => setWebhookUrl(data?.webhookUrl || ""))
      .catch(() => {});
  }, []);

  const showMessage = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: "", text: "" }), 4000);
  };

  const handleActivateDeviceNotification = async () => {
    if (!("Notification" in window)) {
      showMessage("error", "Browser kamu tidak mendukung notifikasi perangkat.");
      return;
    }
    if (Notification.permission === "granted") {
      const nextState = !deviceEnabled;
      setDeviceEnabled(nextState);
      localStorage.setItem("apengjers_device_notif", String(nextState));
      showMessage("success", nextState ? "Notifikasi perangkat aktif." : "Notifikasi perangkat dinonaktifkan.");
      return;
    }
    const permission = await Notification.requestPermission();
    setDevicePermission(permission);
    if (permission === "granted") {
      setDeviceEnabled(true);
      localStorage.setItem("apengjers_device_notif", "true");
      showMessage("success", "Izin notifikasi perangkat berhasil diaktifkan.");
    } else showMessage("error", "Izin notifikasi ditolak di pengaturan browser.");
  };

  const saveWebhook = async () => {
    setIsSaving(true);
    try {
      await api.put("/api/orders/webhook-setting", { webhookUrl, discordPaymentReceived: true });
      showMessage("success", "Webhook pembayaran berhasil disimpan.");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Gagal menyimpan URL webhook.");
    } finally { setIsSaving(false); }
  };

  const testWebhook = async () => {
    setIsTesting(true);
    try {
      const { data } = await api.post("/api/orders/webhook-setting/test", { webhookUrl });
      showMessage("success", data.message || "Pesan test berhasil dikirim ke Discord.");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Gagal mengirim test ke Discord.");
    } finally { setIsTesting(false); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center gap-2.5">
      {[{ id: "device", label: "Notifikasi Perangkat" }, { id: "discord", label: "Webhook Discord" }].map((tab) => <button key={tab.id} type="button" onClick={() => setSubTab(tab.id)} className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${subTab === tab.id ? "border-blue-600 bg-blue-50/60 text-blue-600 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>{tab.label}</button>)}
    </div>
    {feedback.text && <div role="status" className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{feedback.type === "success" ? <FiCheckCircle className="h-4 w-4 shrink-0" /> : <FiAlertCircle className="h-4 w-4 shrink-0" />}<span>{feedback.text}</span></div>}

    {subTab === "device" ? <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h3 className="text-sm font-bold text-slate-900">Notifikasi perangkat</h3><p className="mt-1 text-xs text-slate-500">Aktifkan pemberitahuan browser pada perangkat ini.</p>{devicePermission === "denied" && <p className="mt-2 text-xs font-semibold text-rose-600">Izin diblokir browser. Ubah izin dari ikon pengaturan di samping URL.</p>}</div><button type="button" onClick={handleActivateDeviceNotification} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white ${devicePermission === "granted" && deviceEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}><FiBell className="h-4 w-4" />{devicePermission === "granted" && deviceEnabled ? "Aktif (klik untuk matikan)" : "Aktifkan"}</button></div></section> : <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div><h3 className="text-sm font-bold text-slate-900">Notifikasi pembayaran diterima</h3><p className="mt-1 text-xs leading-5 text-slate-500">Webhook Discord hanya mengirim pesan satu baris saat Midtrans mengonfirmasi pembayaran.</p></div>
      <div><label htmlFor="discordWebhookUrl" className="block text-xs font-bold text-slate-700">URL Webhook Discord</label><input id="discordWebhookUrl" type="url" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://discord.com/api/webhooks/..." className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none" /></div>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={isSaving} onClick={saveWebhook} className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Menyimpan…" : "Simpan URL"}</button><button type="button" disabled={isTesting || !webhookUrl} onClick={testWebhook} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><FiSend className="h-3.5 w-3.5" />{isTesting ? "Mengirim…" : "Kirim test"}</button><a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 text-xs font-bold text-blue-600 hover:underline">Panduan webhook <FiExternalLink className="h-3.5 w-3.5" /></a></div>
    </section>}
  </div>;
}
