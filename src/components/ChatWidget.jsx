import { useEffect, useRef, useState, useCallback } from "react";
import { FiMessageCircle, FiSend, FiX, FiCopy, FiCheck, FiArrowRight, FiSearch } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import LoginModal from "./LoginModal";
import "./ChatWidget.css";

// ─── Navigasi intent ──────────────────────────────────────────────────────────
// Keyword → tombol halaman yang ditampilkan setelah LLM jawab
const NAV_INTENTS = [
  {
    keywords: [
      "pesan joki", "order joki", "beli joki", "cara pesan joki",
      "mau joki", "ingin joki", "daftar joki", "joki roblox",
    ],
    links: [
      { label: "Lihat Joki Roblox", to: "/joki-roblox" },
      { label: "Pesan Joki Sekarang", to: "/pesan/joki-roblox" },
    ],
  },
  {
    keywords: [
      "pesan item", "beli item", "order item", "mau item", "ingin item",
      "pesan gift", "beli gift", "order gift", "gift item", "cara pesan item",
      "cara beli item", "cara order item",
    ],
    links: [
      { label: "Lihat Gift Item", to: "/gift-item" },
      { label: "Pesan Item Sekarang", to: "/pesan/gift-item" },
    ],
  },
  {
    keywords: [
      "cara pesan", "cara order", "gimana pesan", "gimana cara", "gimana order",
      "bagaimana cara", "bagaimana pesan", "bagaimana order", "langkah pesan",
      "tutorial pesan", "mau beli", "mau order", "ingin beli", "ingin order",
      "cara beli", "cara daftar", "cara transaksi",
    ],
    links: [
      { label: "Panduan Cara Order", to: "/cara-order" },
      { label: "Joki Roblox", to: "/joki-roblox" },
      { label: "Gift Item", to: "/gift-item" },
    ],
  },
  {
    keywords: [
      "cek transaksi", "cek pesanan", "status pesanan", "status order",
      "lihat pesanan", "lacak pesanan", "nomor order",
      "pesanan aku", "pesanan saya", "pesanan ku", "order aku", "order saya",
      "sudah masuk", "sudah diterima", "sudah diproses", "pesanan masuk",
      "transaksi saya", "transaksi aku", "history pesanan", "riwayat pesanan",
    ],
    links: [
      { label: "Cek Transaksi", to: "/cek-transaksi" },
    ],
  },
];

function detectNavIntent(text) {
  const lower = text.toLowerCase();
  for (const intent of NAV_INTENTS) {
    if (intent.keywords.some((kw) => lower.includes(kw))) return intent.links;
  }
  return null;
}

// Keyword yang menandakan user mau langsung order
// Keyword order trigger — dua kategori:
// 1. Strong trigger: langsung trigger tanpa perlu konteks tambahan
// 2. Weak trigger: hanya trigger kalau ada juga kata konteks item/joki/gift
const ORDER_STRONG_KEYWORDS = [
  "orderin", "pesenin", "pesankan", "tolong pesankan", "tolong orderkan",
  "langsung order", "langsung pesan", "langsung beli",
  "tolong order", "tolong pesan", "tolong beli",
  "bikinin order", "buatin order", "buatkan order",
  "beli item", "beli joki", "beli gift",
  "order item", "order joki", "order gift",
  "pesan item", "pesan joki", "pesan gift",
];

const ORDER_WEAK_KEYWORDS = [
  "aku mau", "aku ingin", "aku pengen", "aku pesan",
  "saya mau", "saya ingin", "saya pesan",
  "mau beli", "ingin beli", "pengen beli",
  "mau order", "ingin order", "pengen order",
];

const ORDER_CONTEXT_KEYWORDS = [
  "item", "joki", "gift", "lochness", "monster", "roblox",
  "afk", "mancing", "rank", "level", "boost",
];

function detectOrderTrigger(text) {
  const lower = text.toLowerCase();
  // Strong keyword langsung trigger
  if (ORDER_STRONG_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  // Weak keyword hanya trigger kalau ada konteks item/joki
  if (ORDER_WEAK_KEYWORDS.some((kw) => lower.includes(kw))) {
    return ORDER_CONTEXT_KEYWORDS.some((ctx) => lower.includes(ctx));
  }
  return false;
}
// ─── Kategori ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "joki-item",   label: "🎮 Joki & Item",    hint: "jasa joki dan item/gift game" },
  { id: "cara-pesan",  label: "📖 Cara Pesan",     hint: null, static: true },
  { id: "pembayaran",  label: "💳 Pembayaran",     hint: null, static: true },
  { id: "faq",         label: "❓ FAQ",             hint: null, static: true },
  { id: "track",       label: "🔍 Track Order",    hint: null, trackOrder: true },
  { id: "order",       label: "📦 Cek Pesanan",    hint: null, requiresAuth: true },
];

// ─── Konten statis ────────────────────────────────────────────────────────────
const STATIC_CONTENT = {
  "cara-pesan": `**Cara Pesan di ApengJers**

**01 · Pilih layanan**
Buka halaman Joki Roblox atau Gift Item, lalu pilih paket yang sesuai.

**02 · Isi detail**
Masukkan username Roblox penerima dan detail target yang diminta. Jangan kirim password, OTP, cookie, atau kode pemulihan akun.

**03 · Konfirmasi & bayar**
Harga dan metode pembayaran dikonfirmasi penjual sebelum transaksi diproses.

**04 · Pantau pesanan**
Penjual akan memberi konfirmasi dan update progres lewat kanal kontak yang tersedia.

---
⚠️ Penjual tidak perlu password akun Roblox-mu. Jangan bagikan info sensitif kepada siapa pun.`,

  "pembayaran": `**Metode Pembayaran ApengJers**

Pembayaran diproses melalui **Midtrans** dengan pilihan:

- 💰 Transfer Bank (BCA, BNI, BRI, Mandiri)
- 📱 E-Wallet (GoPay, OVO, DANA, ShopeePay)
- 🏪 Minimarket (Alfamart, Indomaret)
- 💳 Kartu Kredit / Debit

**Langkah bayar:**
1. Pilih produk dan isi form order
2. Pilih metode pembayaran saat checkout
3. Selesaikan pembayaran sesuai instruksi
4. Status pesanan diperbarui otomatis

---
⚠️ Jangan transfer ke rekening pribadi. Semua pembayaran lewat sistem resmi ApengJers.`,

  "faq": `**Pertanyaan yang Sering Ditanyakan**

**Berapa lama proses joki?**
Tergantung paket yang dipilih. Estimasi tertera di halaman produk.

**Apakah akun Roblox saya aman?**
Ya. Penjual tidak memerlukan password. Proses dilakukan dari akun penjual sendiri.

**Ada garansi tidak?**
Setiap pesanan memiliki garansi sesuai deskripsi produk yang dipilih.

**Bagaimana kalau pesanan belum selesai?**
Hubungi penjual lewat kanal kontak yang tersedia dengan nomor pesananmu.

**Bisa refund?**
Kebijakan refund berlaku jika layanan tidak terpenuhi. Hubungi admin.

**Perlu buat akun untuk pesan?**
Tidak wajib, tapi disarankan agar kamu bisa melacak pesanan lebih mudah.`,
};

// Nav links untuk kategori statis
const STATIC_NAV = {
  "cara-pesan": [
    { label: "Joki Roblox", to: "/joki-roblox" },
    { label: "Gift Item", to: "/gift-item" },
    { label: "Panduan Lengkap", to: "/cara-order" },
  ],
  "pembayaran": [
    { label: "Pesan Joki", to: "/pesan/joki-roblox" },
    { label: "Pesan Item", to: "/pesan/gift-item" },
  ],
  "faq": [
    { label: "Cara Order", to: "/cara-order" },
    { label: "Joki Roblox", to: "/joki-roblox" },
    { label: "Gift Item", to: "/gift-item" },
  ],
};

// Quick reply per kategori
const QUICK_REPLIES = {
  "joki-item":  ["Lihat daftar harga", "Ada stok kosong?", "Cara pesan joki"],
  "cara-pesan": ["Info pembayaran", "Cek pesanan saya", "Berapa lama proses?"],
  "pembayaran": ["Cara pesan", "Cek pesanan saya"],
  "faq":        ["Cara pesan", "Info pembayaran"],
};

// Typing label
const TYPING_LABELS = {
  "joki-item":  "Mencari info produk...",
  "cara-pesan": "Memuat panduan...",
  "pembayaran": "Memuat info pembayaran...",
  "faq":        "Memuat FAQ...",
  "order":      "Mengambil data pesanan...",
  default:      "Sedang mengetik...",
};

// ─── Welcome message ──────────────────────────────────────────────────────────
function buildWelcomeMsg(user) {
  return {
    id: "welcome",
    role: "assistant",
    text: user
      ? `Halo, **${user.displayName || user.email}**! 👋 Ada yang bisa saya bantu hari ini?\nPilih topik di bawah atau langsung ketik pertanyaanmu.`
      : "Halo! Saya asisten ApengJers 👋\nPilih topik di bawah atau langsung ketik pertanyaanmu.",
  };
}

// ─── Sub-komponen bubble ──────────────────────────────────────────────────────
function ChatBubble({ msg }) {
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
  // Init langsung dengan welcome message default — tidak pernah kosong
  const [messages,       setMessages]       = useState([buildWelcomeMsg(null)]);
  const [isOpen,         setIsOpen]         = useState(false);
  const [input,          setInput]          = useState("");
  const [isTyping,       setIsTyping]       = useState(false);
  const [typingLabel,    setTypingLabel]    = useState("Sedang mengetik...");
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentUser,    setCurrentUser]    = useState(null); // null=belum cek, false=tidak login
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [navLinks,       setNavLinks]       = useState(null);
  const [pendingOrder,   setPendingOrder]   = useState(null);
  const [trackMode,      setTrackMode]      = useState(false); // mode input order code
  const [trackInput,     setTrackInput]     = useState("");

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const trackInputRef  = useRef(null);
  const navigate       = useNavigate();

  // ── Cek login ─────────────────────────────────────────────────────────────
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(false);
      return false;
    }
    try {
      const { data } = await api.get("/auth/me");
      setCurrentUser(data);
      return data;
    } catch {
      setCurrentUser(false);
      return false;
    }
  }, []);

  // Cek login saat widget pertama dibuka, update welcome message
  useEffect(() => {
    if (!isOpen) return;
    fetchCurrentUser().then((user) => {
      // Update welcome message hanya jika masih di welcome screen
      setMessages((prev) => {
        const isWelcomeOnly = prev.length === 1 && prev[0].id === "welcome";
        if (isWelcomeOnly) return [buildWelcomeMsg(user || null)];
        // Kalau sudah ada percakapan, update welcome message di posisi pertama saja
        if (prev[0]?.id === "welcome") {
          return [buildWelcomeMsg(user || null), ...prev.slice(1)];
        }
        return prev;
      });
    });
  }, [isOpen, fetchCurrentUser]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Focus & ESC ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (trackMode) {
      trackInputRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, trackMode]);

  // ── Push pesan ────────────────────────────────────────────────────────────
  const pushMsg = (role, text) =>
    setMessages((prev) => [...prev, { id: `${Date.now()}-${role}`, role, text }]);

  // ── Reset ke welcome ──────────────────────────────────────────────────────
  const handleReset = () => {
    setMessages([buildWelcomeMsg(currentUser || null)]);
    setActiveCategory(null);
    setInput("");
    setShowQuickReply(false);
    setNavLinks(null);
    setTrackMode(false);
    setTrackInput("");
  };

  // ── Klik kategori ─────────────────────────────────────────────────────────
  const handleCategory = async (cat) => {
    setShowQuickReply(false);
    setNavLinks(null);

    // Statis: cara pesan, pembayaran, faq
    if (cat.static) {
      setActiveCategory(cat);
      setTypingLabel(TYPING_LABELS[cat.id] || TYPING_LABELS.default);
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 350));
      setIsTyping(false);
      pushMsg("assistant", STATIC_CONTENT[cat.id]);
      setShowQuickReply(true);
      if (STATIC_NAV[cat.id]) setNavLinks(STATIC_NAV[cat.id]);
      return;
    }

    // Track order — wajib login, lalu input order code
    if (cat.trackOrder) {
      const user = await fetchCurrentUser();
      if (!user) {
        pushMsg("assistant", "Untuk track order, kamu perlu login dulu ya! 🔒");
        setShowLoginModal(true);
        return;
      }
      setActiveCategory(cat);
      setTrackMode(true);
      pushMsg("assistant", "Masukkan kode order kamu (contoh: `ORD-XXXXXXXXXX`) untuk melihat status pesanan.");
      return;
    }
    if (cat.requiresAuth) {
      const user = await fetchCurrentUser();
      if (!user) { setShowLoginModal(true); return; }

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

  // ── Track order by order code ─────────────────────────────────────────────
  const submitTrackOrder = async (e) => {
    e.preventDefault();
    const code = trackInput.trim();
    if (!code || isTyping) return;

    pushMsg("user", `Track order: ${code}`);
    setTrackInput("");
    setTypingLabel("Mengambil status pesanan...");
    setIsTyping(true);

    try {
      const { data } = await api.get(`/api/orders/mine/${code}`);
      const o = data;

      const statusMap = {
        new:        "🆕 Baru masuk",
        confirmed:  "✅ Dikonfirmasi",
        processing: "⚙️ Sedang diproses",
        completed:  "🎉 Selesai",
        cancelled:  "❌ Dibatalkan",
      };
      const payMap = {
        unpaid:   "⏳ Belum dibayar",
        paid:     "✅ Sudah dibayar",
        refunded: "↩️ Direfund",
      };

      pushMsg("assistant",
        `**Detail Order ${o.orderCode}**\n\n` +
        `📦 Produk: ${o.productName}\n` +
        `🎮 Game: ${o.gameName || "-"}\n` +
        `📊 Status: ${statusMap[o.status] || o.status}\n` +
        `💳 Pembayaran: ${payMap[o.paymentStatus] || o.paymentStatus}\n` +
        `💰 Total: Rp${o.totalPrice?.toLocaleString("id-ID")}\n` +
        `📅 Tanggal: ${new Date(o.createdAt).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
      );
    } catch (err) {
      if (err.response?.status === 404) {
        pushMsg("assistant", `Order dengan kode **${code}** tidak ditemukan. Pastikan kode sudah benar dan order milik akun kamu.`);
      } else if (err.response?.status === 401) {
        pushMsg("assistant", "Sesi login habis. Silakan login ulang.");
        setShowLoginModal(true);
      } else {
        pushMsg("assistant", "Gagal mengambil data order. Coba lagi.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  // ── Kirim chat ke LLM ─────────────────────────────────────────────────────
  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || isTyping) return;

    setShowQuickReply(false);
    setNavLinks(null);

    // Cek apakah user mau langsung order
    if (detectOrderTrigger(text)) {
      const userMsg = { id: `${Date.now()}-user`, role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      // Wajib login dulu
      const user = await fetchCurrentUser();
      if (!user) {
        pushMsg("assistant", "Untuk order, kamu perlu login dulu ya! 🔒\nSetelah login, ordermu akan langsung diproses.");
        setPendingOrder(text); // simpan pesan untuk diproses setelah login
        setShowLoginModal(true);
        return;
      }

      setTypingLabel("Memproses permintaan order...");
      setIsTyping(true);
      try {
        const { data } = await api.post("/api/chat/extract-order", { message: text });
        const extracted = data.extracted;

        if (extracted?.orderType === "joki") {
          pushMsg("assistant", "Oke! Saya akan arahkan kamu ke form order Joki Roblox dengan detail yang sudah diisi otomatis. 🎮");
          setTimeout(() => {
            setIsOpen(false);
            navigate("/pesan/joki-roblox", {
              state: {
                experience: { name: "Joki Roblox", id: "chatbot" },
                package: { name: "Pilihan dari chatbot", detail: extracted.targetDetails || "Sesuai permintaan" },
                prefill: {
                  robloxUsername: extracted.robloxUsername || "",
                  targetDetails:  extracted.targetDetails  || "",
                  notes:          extracted.notes          || "",
                },
              },
            });
          }, 1200);
        } else if (extracted?.orderType === "gift") {
          pushMsg("assistant", "Oke! Saya akan arahkan kamu ke form order Gift Item dengan detail yang sudah diisi otomatis. 🎁");
          setTimeout(async () => {
            setIsOpen(false);

            // Cari produk gift yang cocok dengan nama yang disebutkan
            let itemData = { itemName: extracted.itemName || "Gift Item", price: 0, id: "chatbot", stock: 99, options: [], requirements: [], experience: "Gift Roblox", kind: "Gift Item", description: "" };
            if (extracted.itemName) {
              try {
                const { data: products } = await api.get("/api/products?jenis=gift");
                const match = products.find((p) =>
                  p.nama.toLowerCase().includes(extracted.itemName.toLowerCase()) ||
                  extracted.itemName.toLowerCase().includes(p.nama.toLowerCase())
                );
                if (match) {
                  itemData = {
                    id: match._id,
                    itemName: match.nama,
                    price: match.harga,
                    stock: match.stok || 0,
                    experience: match.game?.nama || match.kategori || "Gift Roblox",
                    kind: match.kategori || "Gift Item",
                    description: match.deskripsi || "",
                    options: [],
                    requirements: [],
                  };
                }
              } catch { /* pakai itemData default */ }
            }

            navigate("/pesan/gift-item", {
              state: {
                item: itemData,
                option: extracted.targetDetails || "Sesuai permintaan",
                prefill: {
                  recipientUsername: extracted.recipientUsername || "",
                  notes:             extracted.notes             || "",
                },
              },
            });
          }, 1200);
        } else {
          // Tidak bisa detect jenis order, tanya ke LLM biasa
          pushMsg("assistant", "Mau order joki atau gift item? Sebutkan juga username Roblox dan targetnya ya!");
          setShowQuickReply(true);
          setNavLinks([
            { label: "Form Joki Roblox", to: "/pesan/joki-roblox" },
            { label: "Form Gift Item", to: "/pesan/gift-item" },
          ]);
        }
      } catch {
        pushMsg("assistant", "Gagal memproses permintaan order. Coba ke halaman langsung ya!");
        setNavLinks([
          { label: "Form Joki Roblox", to: "/pesan/joki-roblox" },
          { label: "Form Gift Item", to: "/pesan/gift-item" },
        ]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    const userMsg = { id: `${Date.now()}-user`, role: "user", text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput("");
    setTypingLabel(TYPING_LABELS[activeCategory?.id] || TYPING_LABELS.default);
    setIsTyping(true);

    const detectedLinks = detectNavIntent(text);

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
      if (detectedLinks) setNavLinks(detectedLinks);
    } catch (err) {
      pushMsg("assistant", err.response?.data?.error || "Gagal terhubung. Coba lagi.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    fetchCurrentUser().then((user) => {
      if (user) {
        setMessages((prev) => {
          if (prev[0]?.id === "welcome") return [buildWelcomeMsg(user), ...prev.slice(1)];
          return prev;
        });
        // Kalau ada pending order, proses sekarang
        if (pendingOrder) {
          const orderText = pendingOrder;
          setPendingOrder(null);
          setTimeout(() => sendMessage(orderText), 300);
        }
      }
    });
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
                <div className="chat-avatar" aria-hidden="true"><FiMessageCircle /></div>
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
                {(activeCategory || messages.length > 1) && (
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

              {messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
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
                      {cat.requiresAuth && (
                        <span className="chat-lock-badge" title="Perlu login"> 🔒</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick replies */}
              {quickReplies.length > 0 && (
                <div className="chat-quick-replies" aria-label="Pertanyaan lanjutan">
                  {quickReplies.map((qr) => (
                    <button key={qr} type="button" onClick={() => sendMessage(qr)}>{qr}</button>
                  ))}
                </div>
              )}

              {/* Tombol navigasi halaman */}
              {navLinks && navLinks.length > 0 && (
                <div className="chat-nav-links" aria-label="Halaman terkait">
                  <p className="chat-nav-label">🔗 Langsung ke halaman:</p>
                  <div className="chat-nav-buttons">
                    {navLinks.map((link) => (
                      <button
                        key={link.to}
                        type="button"
                        className="chat-nav-btn"
                        onClick={() => { setIsOpen(false); navigate(link.to); }}
                      >
                        {link.label} <FiArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {!isOrderMode && !trackMode && (
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

            {/* Form track order */}
            {trackMode && (
              <form className="chat-composer" onSubmit={submitTrackOrder}>
                <label className="sr-only" htmlFor="track-input">Kode Order</label>
                <input
                  id="track-input"
                  ref={trackInputRef}
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder="Contoh: ORD-XXXXXXXXXX"
                  maxLength={50}
                />
                <button type="submit" aria-label="Cek order" disabled={!trackInput.trim() || isTyping}>
                  <FiSearch />
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
