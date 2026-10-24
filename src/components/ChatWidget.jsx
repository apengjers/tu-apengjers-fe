import { useEffect, useRef, useState, useCallback } from "react";
import { FiMessageCircle, FiSend, FiX, FiCopy, FiCheck } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import api from "../lib/api";
import LoginModal from "./LoginModal";
import "./ChatWidget.css";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "joki-item",   label: "🎮 Joki & Item",    hint: "jasa joki dan item/gift game" },
  { id: "cara-pesan",  label: "📖 Cara Pesan",     hint: null, static: true },
  { id: "pembayaran",  label: "💳 Pembayaran",     hint: null, static: true },
  { id: "faq",         label: "❓ FAQ",             hint: null, static: true },
  { id: "order",       label: "📦 Cek Pesanan",    hint: null, requiresAuth: true },
];

const STATIC_CONTENT = {
  "cara-pesan": `**Cara Pesan di ApengJers**

**01 · Pilih layanan**
Buka halaman Joki Roblox atau Gift Item, lalu pilih paket yang sesuai.

**02 · Isi detail**
Masukkan username Roblox penerima dan detail target yang diminta. Jangan pernah kirim password, OTP, cookie, atau kode pemulihan akun.

**03 · Konfirmasi & bayar**
Harga dan metode pembayaran dikonfirmasi penjual sebelum transaksi diproses.

**04 · Pantau pesanan**
Penjual akan memberi konfirmasi dan update progres lewat kanal kontak yang tersedia.

---
⚠️ Penjual tidak perlu password akun Roblox-mu. Jangan bagikan info sensitif kepada siapa pun.`,

  "pembayaran": `**Metode Pembayaran ApengJers**

Saat ini pembayaran diproses melalui **Midtrans** dengan pilihan:

- 💰 Transfer Bank (BCA, BNI, BRI, Mandiri)
- 📱 E-Wallet (GoPay, OVO, DANA, ShopeePay)
- 🏪 Minimarket (Alfamart, Indomaret)
- 💳 Kartu Kredit / Debit

**Langkah bayar:**
1. Pilih produk dan isi form order
2. Pilih metode pembayaran saat checkout
3. Selesaikan pembayaran sesuai instruksi
4. Status pesanan akan diperbarui otomatis

---
⚠️ Jangan transfer ke rekening pribadi. Semua pembayaran melalui sistem resmi ApengJers.`,

  "faq": `**Pertanyaan yang Sering Ditanyakan**

**❓ Berapa lama proses joki?**
Tergantung paket yang dipilih. Estimasi tertera di halaman produk.

**❓ Apakah akun Roblox saya aman?**
Ya. Penjual tidak memerlukan password akun. Proses dilakukan dari akun penjual sendiri.

**❓ Ada garansi tidak?**
Setiap pesanan memiliki garansi sesuai deskripsi produk yang dipilih.

**❓ Bagaimana kalau pesanan belum selesai?**
Hubungi penjual lewat kanal kontak yang tersedia dengan menyertakan nomor pesananmu.

**❓ Bisa refund?**
Kebijakan refund berlaku jika layanan tidak terpenuhi sesuai deskripsi. Hubungi admin.

**❓ Apakah perlu buat akun untuk pesan?**
Tidak wajib, tapi disarankan agar kamu bisa melacak pesanan lebih mudah.`,
};

// Quick reply per kategori — muncul setelah LLM menjawab
const QUICK_REPLIES = {
  "joki-item": ["Lihat daftar harga", "Ada stok kosong?", "Cara pesan joki"],
  "cara-pesan": ["Info pembayaran", "Cek pesanan saya", "Berapa lama proses?"],
  "pembayaran": ["Cara pesan", "Cek pesanan saya", "Ada promo?"],
  "faq": ["Cara pesan", "Info pembayaran", "Lihat produk"],
};

// Typing label per konteks
const TYPING_LABELS = {
  "joki-item":  "Mencari info produk...",
  "cara-pesan": "Memuat panduan...",
  "pembayaran": "Memuat info pembayaran...",
  "faq":        "Memuat FAQ...",
  "order":      "Mengambil data pesanan...",
  default:      "Sedang mengetik...",
};

// ─── Sub-komponen bubble ──────────────────────────────────────────────────────

function ChatBubble({ msg, isLast }) {
  const [copied, setCopied] = useState(false);
  const isAssistant = msg.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`chat-row chat-row-${msg.role}`}>
      <div className="chat-bubble-wrapper">
        <div className="chat-bubble">
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>
        {isAssistant && (
          <button
            className={`chat-copy-btn${copied ? " chat-copy-btn--done" : ""}`}
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Tersalin" : "Salin pesan"}
            title={copied ? "Tersalin!" : "Salin"}
          >
            {copied ? <FiCheck size={11} /> : <FiCopy size={11} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen,         setIsOpen]         = useState(false);
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState("");
  const [isTyping,       setIsTyping]       = useState(false);
  const [typingLabel,    setTypingLabel]    = useState("Sedang mengetik...");
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentUser,    setCurrentUser]    = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuickReply, setShowQuickReply] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── Cek login ─────────────────────────────────────────────────────────────
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setCurrentUser(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setCurrentUser(data);
    } catch {
      setCurrentUser(false);
    }
  }, []);

  // ── Welcome message (dengan nama user kalau login) ────────────────────────
  const buildWelcomeMsg = useCallback((user) => ({
    id: "welcome",
    role: "assistant",
    text: user
      ? `Halo, **${user.displayName || user.email}**! 👋 Ada yang bisa saya bantu hari ini?\nPilih topik di bawah atau langsung ketik pertanyaanmu.`
      : "Halo! Saya asisten ApengJers 👋\nPilih topik di bawah atau langsung ketik pertanyaanmu.",
  }), []);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser().then(() => {});
    }
  }, [isOpen, fetchCurrentUser]);

  // Update welcome message saat user terdeteksi
  useEffect(() => {
    if (currentUser !== null) {
      setMessages((prev) => {
        if (prev.length === 0 || prev[0].id === "welcome") {
          return [buildWelcomeMsg(currentUser), ...prev.filter((m) => m.id !== "welcome")];
        }
        return prev;
      });
    }
  }, [currentUser, buildWelcomeMsg]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Focus & ESC ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // ── Push pesan ────────────────────────────────────────────────────────────
  const pushMsg = (role, text) =>
    setMessages((prev) => [...prev, { id: `${Date.now()}-${role}`, role, text }]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setMessages([buildWelcomeMsg(currentUser)]);
    setActiveCategory(null);
    setInput("");
    setShowQuickReply(false);
  };

  // ── Klik kategori ─────────────────────────────────────────────────────────
  const handleCategory = async (cat) => {
    setShowQuickReply(false);

    // Statis (cara pesan, pembayaran, faq)
    if (cat.static) {
      setActiveCategory(cat);
      setTypingLabel(TYPING_LABELS[cat.id] || TYPING_LABELS.default);
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 400)); // micro-delay biar natural
      setIsTyping(false);
      pushMsg("assistant", STATIC_CONTENT[cat.id]);
      setShowQuickReply(true);
      return;
    }

    // Cek pesanan — wajib login
    if (cat.requiresAuth) {
      await fetchCurrentUser();
      const token = localStorage.getItem("token");
      if (!token) { setShowLoginModal(true); return; }

      setActiveCategory(cat);
      setTypingLabel(TYPING_LABELS.order);
      setIsTyping(true);
      try {
        const { data } = await api.get("/api/chat/orders");
        if (!data.found) {
          pushMsg("assistant", data.message || "Belum ada pesanan untuk akun ini.");
        } else {
          const lines = data.orders.map((o, i) =>
            `**${i + 1}. ${o.product}**\n📋 \`${o.orderId}\`\n${o.statusLabel} · ${o.harga}\n📅 ${o.createdAt}`
          );
          pushMsg("assistant", `Ini pesanan terakhir kamu:\n\n${lines.join("\n\n---\n\n")}`);
        }
      } catch (err) {
        if (err.response?.status === 401) { setShowLoginModal(true); setActiveCategory(null); }
        else pushMsg("assistant", err.response?.data?.error || "Gagal mengambil data pesanan.");
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Chat LLM (joki-item)
    setActiveCategory(cat);
    pushMsg("assistant", `Oke! Kamu bisa tanya seputar **${cat.hint}** di ApengJers.\nApa yang ingin kamu ketahui?`);
  };

  // ── Kirim chat ke LLM ─────────────────────────────────────────────────────
  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || isTyping) return;

    setShowQuickReply(false);
    const userMsg = { id: `${Date.now()}-user`, role: "user", text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput("");
    setTypingLabel(TYPING_LABELS[activeCategory?.id] || TYPING_LABELS.default);
    setIsTyping(true);

    try {
      const history = nextMsgs
        .filter((m) => m.id !== "welcome")
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }));

      const { data } = await api.post("/api/chat", {
        message: text,
        history,
        category: activeCategory?.hint || null,
      });

      pushMsg("assistant", data.reply || "Maaf, tidak ada respons.");
      setShowQuickReply(true);
    } catch (err) {
      pushMsg("assistant", err.response?.data?.error || "Gagal terhubung. Coba lagi.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    fetchCurrentUser();
  };

  const showCategories = messages.length <= 1 && !activeCategory;
  const isOrderMode    = activeCategory?.requiresAuth;
  const quickReplies   = showQuickReply ? (QUICK_REPLIES[activeCategory?.id] || []) : [];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="chat-widget">
        {isOpen && (
          <section className="chat-panel" aria-label="Chat bantuan ApengJers">

            {/* Header */}
            <header className="chat-header">
              <div className="chat-header-brand">
                <div className="chat-avatar" aria-hidden="true">
                  <FiMessageCircle />
                </div>
                <div>
                  <h2>ApengJers Support</h2>
                  <p>
                    <span className="chat-status-dot" />
                    {currentUser
                      ? `${currentUser.displayName || currentUser.email}`
                      : "Asisten AI · Online"}
                  </p>
                </div>
              </div>
              <div className="chat-header-actions">
                {activeCategory && (
                  <button className="chat-reset" type="button" onClick={handleReset}
                    title="Menu utama" aria-label="Kembali ke menu utama">↩
                  </button>
                )}
                <button className="chat-close" type="button" onClick={() => setIsOpen(false)}
                  aria-label="Tutup chat"><FiX />
                </button>
              </div>
            </header>

            {/* Badge kategori aktif */}
            {activeCategory && (
              <div className="chat-category-badge">{activeCategory.label}</div>
            )}

            {/* Pesan */}
            <div className="chat-messages" aria-live="polite" aria-relevant="additions text">
              <div className="chat-time">BANTUAN APENGJERS</div>

              {messages.map((msg, i) => (
                <ChatBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="chat-row chat-row-assistant" aria-label={typingLabel}>
                  <div className="chat-bubble chat-bubble--typing">
                    <span className="chat-typing-label">{typingLabel}</span>
                    <span className="chat-typing-dots"><span /><span /><span /></span>
                  </div>
                </div>
              )}

              {/* Tombol kategori di welcome screen */}
              {showCategories && (
                <div className="chat-categories" aria-label="Pilih topik">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.id} type="button" className="chat-category-btn"
                      onClick={() => handleCategory(cat)}>
                      {cat.label}
                      {cat.requiresAuth && <span className="chat-lock-badge" title="Perlu login"> 🔒</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick replies setelah LLM jawab */}
              {quickReplies.length > 0 && (
                <div className="chat-quick-replies" aria-label="Pertanyaan lanjutan">
                  {quickReplies.map((qr) => (
                    <button key={qr} type="button" onClick={() => sendMessage(qr)}>{qr}</button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {!isOrderMode && (
              <form className="chat-composer"
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <label className="sr-only" htmlFor="chat-message">Tulis pesan</label>
                <input
                  id="chat-message"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeCategory?.id === "cara-pesan" ? "Tanya lebih lanjut soal cara pesan..." :
                    activeCategory?.id === "pembayaran"  ? "Tanya soal pembayaran..." :
                    activeCategory?.id === "faq"         ? "Ada pertanyaan lain?" :
                    activeCategory?.hint                 ? `Tanya seputar ${activeCategory.hint}...` :
                    "Tulis pertanyaanmu..."
                  }
                  maxLength={500}
                />
                <button type="submit" aria-label="Kirim pesan" disabled={!input.trim() || isTyping}>
                  <FiSend />
                </button>
              </form>
            )}

            <p className="chat-footer-note">
              Asisten hanya membahas produk &amp; layanan ApengJers.
            </p>
          </section>
        )}

        {/* Launcher */}
        <button
          className={`chat-launcher${isOpen ? " chat-launcher-open" : ""}`}
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Tutup chat" : "Buka chat bantuan"}
          aria-expanded={isOpen}
        >
          {isOpen ? <FiX /> : <FiMessageCircle />}
          {!isOpen && <span className="chat-launcher-ping" aria-hidden="true" />}
        </button>
      </div>

      <LoginModal show={showLoginModal} onClose={handleLoginClose} />
    </>
  );
}
