import { useEffect, useState } from "react";
import { FiBell, FiCheckCircle, FiChevronDown, FiChevronRight, FiExternalLink, FiSend, FiAlertCircle } from "react-icons/fi";
import api from "../lib/api";

export default function NotificationsAdminPanel() {
  const [subTab, setSubTab] = useState("device");
  const [expandedDiscordItem, setExpandedDiscordItem] = useState("newOrder");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const [devicePermission, setDevicePermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  );
  const [deviceEnabled, setDeviceEnabled] = useState(() => {
    return localStorage.getItem("apengjers_device_notif") === "true";
  });

  const [settings, setSettings] = useState({
    discordWebhookUrl: "",
    discordNewOrder: true,
    discordOrderIssue: true,
    discordEmptyStock: true,
  });

  useEffect(() => {
    api.get("/api/orders/webhook-setting")
      .then(({ data }) => {
        if (data) {
          setSettings((prev) => ({
            ...prev,
            discordWebhookUrl: data.webhookUrl || "",
            discordNewOrder: data.discordNewOrder ?? prev.discordNewOrder,
            discordOrderIssue: data.discordOrderIssue ?? prev.discordOrderIssue,
            discordEmptyStock: data.discordEmptyStock ?? prev.discordEmptyStock,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const showMessage = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: "", text: "" }), 4000);
  };

  const saveSettingsToBackend = async (nextSettings) => {
    setIsSaving(true);
    try {
      await api.put("/api/orders/webhook-setting", {
        webhookUrl: nextSettings.discordWebhookUrl,
        discordNewOrder: nextSettings.discordNewOrder,
        discordOrderIssue: nextSettings.discordOrderIssue,
        discordEmptyStock: nextSettings.discordEmptyStock,
      });
      showMessage("success", "Pengaturan notifikasi berhasil disimpan.");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Gagal menyimpan pengaturan notifikasi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettingsToBackend(updated);
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
      showMessage("success", "Izin notifikasi perangkat berhasil diaktifkan!");
    } else {
      showMessage("error", "Izin notifikasi ditolak di pengaturan browser.");
    }
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    try {
      const { data } = await api.post("/api/orders/webhook-setting/test", {
        webhookUrl: settings.discordWebhookUrl,
      });
      showMessage("success", data.message || "Pesan test berhasil dikirim ke Discord!");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Gagal mengirim test ke Discord.");
    } finally {
      setIsTesting(false);
    }
  };

  const discordMenuItems = [
    {
      id: "newOrder",
      toggleKey: "discordNewOrder",
      title: "Notifikasi Pesanan Baru",
      subtitle: "Pantau pesanan masuk lebih cepat",
      helper: "Mengirimkan detail order Joki & Gift Item ke channel Discord begitu pembeli membuat pesanan.",
    },
    {
      id: "orderIssue",
      toggleKey: "discordOrderIssue",
      title: "Notifikasi Kendala Pesanan",
      subtitle: "Selalu update jika ada pesanan yang bermasalah",
      helper: "Mengirimkan peringatan ke Discord ketika status order diubah atau bermasalah.",
    },
    {
      id: "emptyStock",
      toggleKey: "discordEmptyStock",
      title: "Notifikasi Stok Kosong",
      subtitle: "Peringatan jika produk kehabisan stok",
      helper: "Mengirimkan peringatan ke Discord ketika stok produk di katalog habis (0).",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Tab Pills (2 Tab Saja: Perangkat & Discord) */}
      <div className="flex flex-wrap items-center gap-2.5">
        {[
          { id: "device", label: "Notifikasi Perangkat" },
          { id: "discord", label: "Notifikasi Webhook Discord" },
        ].map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                isActive
                  ? "border-blue-600 bg-blue-50/60 text-blue-600 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {feedback.text && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? <FiCheckCircle className="h-4 w-4 shrink-0" /> : <FiAlertCircle className="h-4 w-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* TAB 1: NOTIFIKASI PERANGKAT */}
      {subTab === "device" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Izinkan Notifikasi</h3>
              <p className="mt-1 text-xs text-slate-500">
                Notifikasi yang berkaitan dengan pesanan dan pemberitahuan penting lainnya.
              </p>
              {devicePermission === "denied" && (
                <p className="mt-2 text-xs font-semibold text-rose-600">
                  Izin notifikasi diblokir oleh browser. Klik ikon gembok di sebelah URL browser untuk mengizinkan.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleActivateDeviceNotification}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white transition ${
                devicePermission === "granted" && deviceEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FiBell className="h-4 w-4" />
              {devicePermission === "granted" && deviceEnabled ? "Aktif (Klik untuk Matikan)" : "Aktifkan"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFIKASI WEBHOOK DISCORD */}
      {subTab === "discord" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-700">
              Sekarang kamu bisa aktifkan notifikasi lewat webhook Discord agar selalu update soal pesanan toko kamu.
            </p>
            <a
              href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              Pelajari Selengkapnya <FiExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {discordMenuItems.map((item) => {
              const isOpen = expandedDiscordItem === item.id;
              return (
                <div key={item.id} className="transition">
                  <button
                    type="button"
                    onClick={() => setExpandedDiscordItem(isOpen ? "" : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/70"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          settings[item.toggleKey] && settings.discordWebhookUrl
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {settings[item.toggleKey] && settings.discordWebhookUrl ? "Aktif" : "Nonaktif"}
                      </span>
                      {isOpen ? (
                        <FiChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <FiChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-slate-600">{item.helper}</p>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={settings[item.toggleKey]}
                          onClick={() => handleToggle(item.toggleKey)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            settings[item.toggleKey] ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              settings[item.toggleKey] ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700">
                          URL Webhook Discord
                        </label>
                        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                          <input
                            type="url"
                            value={settings.discordWebhookUrl}
                            onChange={(e) => setSettings({ ...settings, discordWebhookUrl: e.target.value })}
                            placeholder="https://discord.com/api/webhooks/..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => saveSettingsToBackend(settings)}
                            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isSaving ? "Menyimpan..." : "Simpan URL"}
                          </button>
                          <button
                            type="button"
                            disabled={isTesting || !settings.discordWebhookUrl}
                            onClick={handleTestWebhook}
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <FiSend className="h-3.5 w-3.5" />
                            {isTesting ? "Mengirim..." : "Test"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}