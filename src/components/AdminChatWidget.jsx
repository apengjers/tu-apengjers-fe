import { useEffect, useRef, useState, useCallback } from "react";
import { FiMessageSquare, FiSend, FiX, FiCopy, FiCheck, FiRefreshCw } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import api from "../lib/api";
import "./AdminChatWidget.css";

// ─── Quick actions admin ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "📊 Ringkasan hari ini",   msg: "Berikan ringkasan pesanan dan pendapatan hari ini" },
  { label: "🆕 Pesanan baru",         msg: "Tampilkan semua pesanan baru yang belum dikonfirmasi" },
  { label: "⚠️ Stok kritis",         msg: "Produk mana saja yang stoknya kritis atau habis?" },
  { label: "💰 Pendapatan",           msg: "Berapa total pendapatan hari ini dari pesanan yang sudah bayar?" },
  { label: "📦 Semua produk",         msg: "Tampilkan daftar semua produk beserta harga dan stoknya" },
  { label: "🔍 Cari order",           msg: null, input: true, placeholder: "Masukkan kode order (AJ-...)" },
];

// ─── Sub-komponen bubble ──────────────────────────────────────────────────────
function AdminBubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isAssistant = msg.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`achat-row achat-row-${msg.role}`}>
      <div className="achat-bubble-wrapper">
        <div className="achat-bubble">
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>
        {isAssistant && (
          <button
            className={`achat-copy-btn${copied ? " achat-copy-btn--done" : ""}`}
            type="button"
            onClick={handleCopy}
            title={copied ? "Tersalin!" : "Salin"}
          >
            {copied ? <FiCheck size={10} /> : <FiCopy size={10} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────
export default function AdminChatWidget() {
  const WELCOME = {
    id: "welcome",
    role: "assistant",
    text: "Hai Admin! 👋 Saya siap bantu kelola toko.\nPilih aksi cepat atau ketik pertanyaanmu.",
  };

  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([WELCOME]);
  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const [summary,   setSummary]   = useState(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const searchRef      = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus & ESC
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Fetch summary saat widget dibuka
  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get("/api/admin-chat/summary");
      setSummary(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isOpen) fetchSummary();
  }, [isOpen, fetchSummary]);

  const pushMsg = (role, text) =>
    setMessages((prev) => [...prev, { id: `${Date.now()}-${role}`, role, text }]);

  const handleReset = () => {
    setMessages([WELCOME]);
    setInput("");
    setSearchMode(false);
    setSearchInput("");
    fetchSummary();
  };

  // Kirim ke LLM admin
  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || isTyping) return;

    const userMsg = { id: `${Date.now()}-user`, role: "user", text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput("");
    setIsTyping(true);

    try {
      const history = nextMsgs
        .filter((m) => m.id !== "welcome")
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }));

      const { data } = await api.post("/api/admin-chat", { message: text, history });
      pushMsg("assistant", data.reply || "Tidak ada respons.");
    } catch (err) {
      pushMsg("assistant", err.response?.data?.error || "Gagal terhubung ke asisten.");
    } finally {
      setIsTyping(false);
    }
  };

  // Cari order by code
  const searchOrder = async (e) => {
    e.preventDefault();
    const code = searchInput.trim().toUpperCase();
    if (!code || isTyping) return;

    pushMsg("user", `Cari order: ${code}`);
    setSearchInput("");
    setSearchMode(false);
    setIsTyping(true);

    try {
      const { data } = await api.get(`/api/orders/${code.startsWith("AJ-") ? "" : ""}mine/${code}`);
      pushMsg("assistant",
        `**Order ${data.orderCode}**\n\n` +
        `📦 ${data.productName} × ${data.quantity}\n` +
        `👤 ${data.robloxUsername || data.recipientUsername || "-"}\n` +
        `📊 Status: ${data.status}\n` +
        `💳 Bayar: ${data.paymentStatus}\n` +
        `💰 Total: Rp${data.totalPrice?.toLocaleString("id-ID")}\n` +
        `📱 WA: ${data.whatsapp || "-"}\n` +
        `📅 ${new Date(data.createdAt).toLocaleString("id-ID")}`
      );
    } catch (err) {
      if (err.response?.status === 404) {
        // Coba via admin endpoint
        try {
          const { data: orders } = await api.get(`/api/orders?search=${code}`);
          const found = Array.isArray(orders) ? orders.find(o => o.orderCode === code) : null;
          if (found) {
            pushMsg("assistant",
              `**Order ${found.orderCode}**\n\n` +
              `📦 ${found.productName} × ${found.quantity}\n` +
              `📊 Status: ${found.status} | 💳 ${found.paymentStatus}\n` +
              `💰 Total: Rp${found.totalPrice?.toLocaleString("id-ID")}`
            );
          } else {
            pushMsg("assistant", `Order **${code}** tidak ditemukan.`);
          }
        } catch {
          pushMsg("assistant", `Order **${code}** tidak ditemukan.`);
        }
      } else {
        pushMsg("assistant", "Gagal mengambil data order.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const showQuickActions = messages.length <= 1;

  return (
    <div className="achat-widget">
      {isOpen && (
        <section className="achat-panel" aria-label="Admin chat asisten">

          {/* Header */}
          <header className="achat-header">
            <div className="achat-header-brand">
              <div className="achat-avatar" aria-hidden="true">
                <FiMessageSquare />
              </div>
              <div>
                <h2>Admin Asisten</h2>
                <p><span className="achat-status-dot" /> ApengJers AI</p>
              </div>
            </div>
            <div className="achat-header-actions">
              {/* Summary badges */}
              {summary && (
                <div className="achat-badges">
                  {summary.newOrders > 0 && (
                    <span className="achat-badge achat-badge--alert" title="Pesanan baru">
                      {summary.newOrders} baru
                    </span>
                  )}
                  {summary.lowStockProducts > 0 && (
                    <span className="achat-badge achat-badge--warn" title="Stok kritis">
                      {summary.lowStockProducts} kritis
                    </span>
                  )}
                </div>
              )}
              <button className="achat-icon-btn" type="button" onClick={handleReset} title="Reset">
                <FiRefreshCw size={15} />
              </button>
              <button className="achat-icon-btn" type="button" onClick={() => setIsOpen(false)} aria-label="Tutup">
                <FiX size={17} />
              </button>
            </div>
          </header>

          {/* Summary bar */}
          {summary && isOpen && (
            <div className="achat-summary-bar">
              <span>📦 Hari ini: <strong>{summary.todayOrders}</strong></span>
              <span>💰 Paid: <strong>Rp{summary.todayRevenue?.toLocaleString("id-ID")}</strong></span>
              <span>🆕 Baru: <strong>{summary.newOrders}</strong></span>
            </div>
          )}

          {/* Pesan */}
          <div className="achat-messages" aria-live="polite">
            <div className="achat-time">ADMIN APENGJERS</div>

            {messages.map((msg) => (
              <AdminBubble key={msg.id} msg={msg} />
            ))}

            {isTyping && (
              <div className="achat-row achat-row-assistant">
                <div className="achat-bubble achat-bubble--typing">
                  <span className="achat-typing-label">Memproses...</span>
                  <span className="achat-typing-dots"><span /><span /><span /></span>
                </div>
              </div>
            )}

            {/* Quick actions di welcome screen */}
            {showQuickActions && (
              <div className="achat-quick-actions">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="achat-action-btn"
                    onClick={() => {
                      if (action.input) {
                        setSearchMode(true);
                        setTimeout(() => searchRef.current?.focus(), 100);
                      } else {
                        sendMessage(action.msg);
                      }
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {searchMode ? (
            <form className="achat-composer" onSubmit={searchOrder}>
              <label className="sr-only" htmlFor="achat-search">Kode order</label>
              <input
                id="achat-search"
                ref={searchRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Kode order (AJ-...)"
                maxLength={50}
              />
              <button type="button" onClick={() => setSearchMode(false)} className="achat-cancel-btn">Batal</button>
              <button type="submit" disabled={!searchInput.trim() || isTyping}>
                <FiSend size={15} />
              </button>
            </form>
          ) : (
            <form className="achat-composer" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
              <label className="sr-only" htmlFor="achat-input">Tanya asisten admin</label>
              <input
                id="achat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya seputar pesanan, stok, pendapatan..."
                maxLength={500}
              />
              <button type="submit" aria-label="Kirim" disabled={!input.trim() || isTyping}>
                <FiSend size={15} />
              </button>
            </form>
          )}

          <p className="achat-footer-note">Asisten admin ApengJers · Data real-time dari DB</p>
        </section>
      )}

      {/* Launcher */}
      <button
        className={`achat-launcher${isOpen ? " achat-launcher-open" : ""}`}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Tutup asisten admin" : "Buka asisten admin"}
      >
        {isOpen ? <FiX size={22} /> : <FiMessageSquare size={22} />}
        {!isOpen && summary?.newOrders > 0 && (
          <span className="achat-launcher-badge">{summary.newOrders}</span>
        )}
      </button>
    </div>
  );
}
