# tu-apengjers-fe

Frontend website **ApengJers** — toko top-up game (Joki Roblox & Gift Item). Dibangun dengan React + Vite dan terhubung ke backend Express.

## Teknologi

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com) + [Flowbite React](https://flowbite-react.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [React Icons](https://react-icons.github.io/react-icons/)

## Instalasi & Menjalankan

```powershell
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Pastikan backend sudah berjalan di `http://localhost:3001`. Permintaan `/api` dan `/auth` diteruskan oleh Vite ke backend.

## Konfigurasi

Konfigurasi aplikasi berada di `backend/.env`; frontend tidak memerlukan file `.env` sendiri. Untuk mengubah alamat backend yang dipakai proxy Vite, atur `API_PROXY_TARGET` di `backend/.env`:

```env
API_PROXY_TARGET=http://localhost:3001
```

Nilai default proxy adalah `http://localhost:3001` jika variabel tersebut tidak diset. Setelah mengubahnya, restart Vite.

## Struktur Halaman

| Path | Halaman |
| --- | --- |
| `/` | Beranda |
| `/joki-roblox` | Halaman Joki Roblox |
| `/gift-item` | Halaman Gift Item |
| `/cara-order` | Panduan cara order |
| `/cek-transaksi` | Cek status transaksi |
| `/product/:id` | Detail produk |
| `/adminproduct` | Panel admin produk (perlu login admin) |

---

## Fitur Chatbot AI

Widget chatbot tersedia di semua halaman (pojok kanan bawah). Chatbot menggunakan **Groq API** via backend dan hanya menjawab berdasarkan data dari database toko.

### Tampilan & Navigasi

Klik ikon chat oranye di pojok kanan bawah untuk membuka chatbot. Tekan `Esc` untuk menutup.

### Kategori Topik

Di welcome screen terdapat 5 tombol kategori:

| Tombol | Keterangan | Perlu Login? |
| --- | --- | --- |
| 🎮 Joki & Item | Tanya harga, stok, info produk joki/item via LLM | Tidak |
| 📖 Cara Pesan | Panduan 4 langkah cara memesan | Tidak |
| 💳 Pembayaran | Info metode pembayaran yang tersedia | Tidak |
| ❓ FAQ | Pertanyaan yang sering ditanyakan | Tidak |
| 📦 Cek Pesanan 🔒 | Lihat daftar pesanan milik akun yang login | **Ya** |

### Cara Menggunakan

**Tanya produk / harga:**
1. Klik **🎮 Joki & Item**
2. Ketik pertanyaan, contoh: *"Ada joki untuk game apa saja?"* atau *"Berapa harga item X?"*
3. Chatbot menjawab berdasarkan data produk di database
4. Setelah jawaban muncul, tersedia tombol quick reply sebagai pertanyaan lanjutan

**Lihat info statis (cara pesan, pembayaran, FAQ):**
1. Klik salah satu tombol: **📖 Cara Pesan**, **💳 Pembayaran**, atau **❓ FAQ**
2. Informasi langsung ditampilkan tanpa perlu mengetik
3. Tetap bisa melanjutkan tanya-jawab lewat input di bawah

**Cek pesanan:**
1. Klik **📦 Cek Pesanan 🔒**
2. Jika belum login → modal login muncul otomatis
3. Setelah login → daftar pesanan terakhir (maks 10) ditampilkan otomatis berdasarkan email akun

**Tombol lainnya:**
- **↩** di header — kembali ke menu utama (welcome screen)
- **Ikon copy** di bawah setiap bubble assistant — salin isi pesan ke clipboard

### Batasan Chatbot

- Hanya menjawab seputar produk dan layanan ApengJers
- Tidak bisa menjawab topik di luar toko (berita, pelajaran, dll)
- Jawaban berdasarkan data real-time dari MongoDB — jika produk belum ditambahkan ke DB, chatbot tidak akan mengetahuinya
- Cek pesanan hanya menampilkan pesanan milik akun yang sedang login

### Komponen Terkait

```text
frontend/src/
├── components/
│   ├── ChatWidget.jsx   # Komponen utama chatbot
│   └── ChatWidget.css   # Styling chatbot
└── lib/
    └── api.js           # Axios instance (baseURL ke backend)
```

---

## Status

🚧 Masih dalam tahap pengembangan aktif.
