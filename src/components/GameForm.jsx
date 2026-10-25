import { useState } from "react";
import api from "../lib/api";
import { FiX } from "react-icons/fi";

const slugify = (value) => value.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function GameForm({ initialData, onSuccess, onCancel }) {
  const [formData, setFormData] = useState(() => ({ nama: initialData?.nama || "", slug: initialData?.slug || "", gambar: initialData?.gambar || "", jenis: initialData?.jenis || "joki", isFeatured: initialData?.isFeatured || false, featuredOrder: initialData?.featuredOrder || 0 }));
  const [slugEdited, setSlugEdited] = useState(Boolean(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "nama" && !slugEdited ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);
    setFormData((current) => ({ ...current, slug: slugify(event.target.value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    const payload = { nama: formData.nama.trim(), slug: formData.slug.trim(), gambar: formData.gambar.trim(), jenis: formData.jenis, isFeatured: formData.isFeatured, featuredOrder: Number(formData.featuredOrder) || 0 };
    try {
      if (initialData?._id) await api.put(`/api/games/${initialData._id}`, payload);
      else await api.post("/api/games", payload);
      await onSuccess();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Game belum tersimpan. Periksa koneksi backend lalu coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-orange-600">Katalog game</p><h2 className="mt-1 text-xl font-black text-slate-900">{initialData ? "Edit game" : "Tambah game"}</h2></div>
        <button type="button" onClick={onCancel} aria-label="Tutup form" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><FiX aria-hidden="true" /></button>
      </div>
      <div className="space-y-4">
        <div><label htmlFor="gameName" className="mb-1.5 block text-xs font-bold text-slate-700">Nama game <span className="text-rose-500">*</span></label><input id="gameName" name="nama" value={formData.nama} onChange={handleChange} required maxLength={100} placeholder="Blox Fruits" className={inputClass} /></div>
        <div><label htmlFor="gameSlug" className="mb-1.5 block text-xs font-bold text-slate-700">{formData.jenis === "gift" ? "Slug game" : "Slug rute"} <span className="text-rose-500">*</span></label><input id="gameSlug" name="slug" value={formData.slug} onChange={handleSlugChange} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={60} placeholder="grow-a-garden" className={inputClass} /><p className="mt-1 text-[11px] text-slate-500">{formData.jenis === "gift" ? "Slug ini digunakan sebagai identitas game Gift Item." : `Route game: /joki-roblox/${formData.slug || "slug-game"}`}</p></div>
        <div><label htmlFor="gameImage" className="mb-1.5 block text-xs font-bold text-slate-700">URL gambar game</label><input id="gameImage" name="gambar" type="url" value={formData.gambar} onChange={handleChange} placeholder="https://..." className={inputClass} /></div>
        <div><label htmlFor="gameType" className="mb-1.5 block text-xs font-bold text-slate-700">Dipakai untuk katalog <span className="text-rose-500">*</span></label><select id="gameType" name="jenis" value={formData.jenis} onChange={handleChange} required className={inputClass}><option value="joki">Joki Roblox</option><option value="gift">Gift Item</option></select><p className="mt-1 text-[11px] text-slate-500">Kategori ini menentukan dropdown produk tempat game muncul.</p></div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="h-4 w-4 accent-blue-800" /><span className="text-xs font-bold text-slate-700">Tampilkan di Hot Games beranda</span></label>
        {formData.isFeatured && <div><label htmlFor="featuredOrder" className="mb-1.5 block text-xs font-bold text-slate-700">Urutan Hot Games</label><input id="featuredOrder" name="featuredOrder" type="number" min="0" step="1" value={formData.featuredOrder} onChange={handleChange} className={inputClass} /></div>}
      </div>
      {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-800">{errorMessage}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Batal</button>
        <button type="submit" disabled={isSaving} className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Menyimpan…" : initialData ? "Simpan perubahan" : "Tambah game"}</button>
      </div>
    </form>
  );
}
