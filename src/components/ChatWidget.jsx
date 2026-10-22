import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import "./ChatWidget.css";

const starterMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hai! Ada yang bisa kami bantu? Pilih topik di bawah atau tulis pertanyaanmu.",
};

const quickReplies = ["Cara top up", "Cek transaksi", "Metode pembayaran"];

function getReply(message) {
  const text = message.toLowerCase();

  if (text.includes("top up") || text.includes("topup")) {
    return "Pilih kategori dan produk yang kamu inginkan, lalu ikuti instruksi pada halaman produk. Pastikan data tujuan sudah benar sebelum melanjutkan.";
  }

  if (text.includes("transaksi") || text.includes("pesanan")) {
    return "Untuk melihat status pesanan, buka menu Cek Transaksi dan masukkan ID transaksi.";
  }

  if (text.includes("bayar") || text.includes("pembayaran") || text.includes("metode")) {
    return "Pilihan pembayaran akan ditampilkan saat checkout. Metode yang tersedia mengikuti produk dan konfigurasi toko.";
  }

  return "Terima kasih sudah mengirim pertanyaan. Chat ini masih dalam tahap pengembangan, jadi pesanmu belum diteruskan ke admin.";
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([starterMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return undefined;

    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const sendMessage = (value = input) => {
    const text = value.trim();
    if (!text || isTyping) return;

    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", text },
    ]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-assistant`, role: "assistant", text: getReply(text) },
      ]);
      setIsTyping(false);
    }, 550);
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <section className="chat-panel" aria-label="Chat bantuan ApengJers">
          <header className="chat-header">
            <div className="chat-header-brand">
              <div className="chat-avatar" aria-hidden="true">
                <FiMessageCircle />
              </div>
              <div>
                <h2>ApengJers Support</h2>
                <p><span className="chat-status-dot" /> Asisten otomatis</p>
              </div>
            </div>
            <button
              className="chat-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup chat"
            >
              <FiX />
            </button>
          </header>

          <div className="chat-notice">
            Chatbot masih tahap pengembangan. Pesan belum diteruskan ke admin.
          </div>

          <div className="chat-messages" aria-live="polite" aria-relevant="additions text">
            <div className="chat-time">BANTUAN APENGJERS</div>
            {messages.map((message) => (
              <div className={`chat-row chat-row-${message.role}`} key={message.id}>
                <p className="chat-bubble">{message.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="chat-row chat-row-assistant" aria-label="Asisten sedang mengetik">
                <p className="chat-bubble chat-typing"><span /><span /><span /></p>
              </div>
            )}
            {messages.length === 1 && (
              <div className="chat-quick-replies" aria-label="Pertanyaan cepat">
                {quickReplies.map((reply) => (
                  <button key={reply} type="button" onClick={() => sendMessage(reply)}>
                    {reply}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <label className="sr-only" htmlFor="chat-message">Tulis pesan</label>
            <input
              id="chat-message"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tulis pesan..."
              maxLength={500}
            />
            <button type="submit" aria-label="Kirim pesan" disabled={!input.trim() || isTyping}>
              <FiSend />
            </button>
          </form>
          <p className="chat-footer-note">Jangan kirim password atau kode OTP.</p>
        </section>
      )}

      <button
        className={`chat-launcher${isOpen ? " chat-launcher-open" : ""}`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Tutup chat bantuan" : "Buka chat bantuan"}
        aria-expanded={isOpen}
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
        {!isOpen && <span className="chat-launcher-ping" aria-hidden="true" />}
      </button>
    </div>
  );
}
