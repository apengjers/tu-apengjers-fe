import { useState } from "react";
import api from "../lib/api";
import { FiX } from "react-icons/fi";

const emptyProduct = { nama: "", jenis: "gift", harga: "", kategori: "", game: "", stok: "", gambar: "", deskripsi: "" };

export default function ProductForm({ initialData, games = [], onSuccess, onCancel }) {
  const [formData, setFormData] = useState(() => ({ ...emptyProduct, ...(initialData || {}), game: initialData?.game?._id || initialData?.game || "" }));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isEditing = Boolean(initialData?._id);
  const availableGames = games.filter((game) => formData.jenis === "joki" ? (!game.jenis || game.jenis === "joki") : game.jenis === "gift");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value, ...(name === "jenis" ? { game: "" } : {}) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    const payload = {
      nama: formData.nama.trim(),
      jenis: formData.jenis,
      harga: Number(formData.harga),
      kategori: (availableGames.find((game) => game._id === formData.game)?.nama || formData.kategori || "").trim(),
      stok: Number(formData.stok) || 0,
      gambar: formData.gambar.trim(),
      deskripsi: formData.deskripsi.trim(),
    };
    if (formData.jenis === "joki" || (formData.jenis === "gift" && formData.game)) payload.game = formData.game;

    try {
      if (isEditing) await api.put(`/api/products/${initialData._id}`, payload);
      else await api.post("/api/products", payload);
      await onSuccess();
    } catch {
      setErrorMessage("Produk belum tersimpan. Periksa koneksi backend dan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-xs font-bold text-slate-700";
  return (
    <form onSubmit={handleSubmit} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-orange-600">Katalog toko</p><h2 className="mt-1 text-xl font-black text-slate-900">{isEditing ? "Edit produk" : "Tambah produk"}</h2></div>
        <button type="button" onClick={onCancel} aria-label="Tutup form" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><FiX aria-hidden="true" /></button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="nama" className={labelClass}>Nama produk <span className="text-rose-500">*</span></label><input id="nama" name="nama" value={formData.nama} onChange={handleChange} required maxLength={100} placeholder={formData.jenis === "joki" ? "Contoh: Level 1–100" : "Contoh: Gift item Grow a Garden"} className={inputClass} /></div>
        <div><label htmlFor="harga" className={labelClass}>Harga (Rp) <span className="text-rose-500">*</span></label><input id="harga" name="harga" type="number" min="0" step="1" value={formData.harga} onChange={handleChange} required placeholder="25000" className={inputClass} /></div>
        <div><label htmlFor="stok" className={labelClass}>Stok tersedia</label><input id="stok" name="stok" type="number" min="0" step="1" value={formData.stok} onChange={handleChange} placeholder="0" className={inputClass} /></div>
        <div><label htmlFor="jenis" className={labelClass}>Jenis katalog</label><select id="jenis" name="jenis" value={formData.jenis || "topup"} onChange={handleChange} className={inputClass}><option value="gift">Gift Item Roblox</option><option value="joki">Paket Joki Roblox</option><option value="topup">Produk katalog lain</option></select></div>
        {formData.jenis === "joki" || formData.jenis === "gift" ? <div className="sm:col-span-2"><label htmlFor="game" className={labelClass}>Nama game <span className="text-rose-500">*</span></label><select id="game" name="game" value={formData.game} onChange={handleChange} required={formData.jenis === "joki" || !isEditing} className={inputClass}><option value="">Pilih game yang sudah ditambahkan</option>{availableGames.map((game) => <option key={game._id} value={game._id}>{game.nama}</option>)}</select>{availableGames.length === 0 && <p className="mt-1 text-xs text-amber-700">Tambahkan game dengan kategori {formData.jenis === "joki" ? "Joki Roblox" : "Gift Item"} terlebih dahulu dari tab Game.</p>}</div> : <div><label htmlFor="kategori" className={labelClass}>Kategori / experience</label><input id="kategori" name="kategori" value={formData.kategori} onChange={handleChange} maxLength={60} placeholder="Grow a Garden" className={inputClass} /></div>}
        <div><label htmlFor="gambar" className={labelClass}>URL gambar</label><input id="gambar" name="gambar" type="url" value={formData.gambar} onChange={handleChange} placeholder="https://..." className={inputClass} /></div>
        <div className="sm:col-span-2"><label htmlFor="deskripsi" className={labelClass}>Deskripsi</label><textarea id="deskripsi" name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows={4} maxLength={1000} placeholder="Jelaskan isi atau syarat produk" className={`${inputClass} resize-y`} /></div>
      </div>

      {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-800">{errorMessage}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Batal</button>
        <button type="submit" disabled={isSaving} className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Menyimpan…" : isEditing ? "Simpan perubahan" : "Tambah produk"}</button>
      </div>
    </form>
  );
}
