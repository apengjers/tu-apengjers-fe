import { useEffect, useState } from "react";
import api from "../lib/api";
import { FiX } from "react-icons/fi";

export default function CarouselSlideForm({ initialData, onSuccess, onCancel }) {
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || "",
    description: initialData?.description || "",
    href: initialData?.href || "",
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
  }));
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!file) return undefined;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(selected.type)) {
      setErrorMessage("Pilih gambar JPG, PNG, WebP, atau GIF.");
      event.target.value = "";
      return;
    }
    if (selected.size > 15 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 15 MB.");
      event.target.value = "";
      return;
    }
    setErrorMessage("");
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!initialData && !file) {
      setErrorMessage("Pilih gambar untuk slide ini.");
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, String(value)));
    if (file) payload.append("image", file);
    try {
      if (initialData?._id) await api.put(`/api/carousel/${initialData._id}`, payload);
      else await api.post("/api/carousel", payload);
      await onSuccess();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Slide belum tersimpan. Periksa koneksi dan konfigurasi cloud storage.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-xs font-bold text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-orange-600">Carousel beranda</p><h2 className="mt-1 text-xl font-black text-slate-900">{initialData ? "Edit slide" : "Tambah slide"}</h2></div>
        <button type="button" onClick={onCancel} aria-label="Tutup form" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><FiX aria-hidden="true" /></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="slideTitle" className={labelClass}>Judul <span className="text-rose-500">*</span></label><input id="slideTitle" name="title" value={formData.title} onChange={updateField} required maxLength={120} className={inputClass} /></div>
        <div className="sm:col-span-2"><label htmlFor="slideDescription" className={labelClass}>Deskripsi singkat</label><textarea id="slideDescription" name="description" value={formData.description} onChange={updateField} rows={3} maxLength={240} className={`${inputClass} resize-y`} /></div>
        <div><label htmlFor="slideHref" className={labelClass}>Tautan tombol (opsional)</label><input id="slideHref" name="href" value={formData.href} onChange={updateField} placeholder="/gift-item" className={inputClass} /></div>
        <div><label htmlFor="slideOrder" className={labelClass}>Urutan tampil</label><input id="slideOrder" name="sortOrder" type="number" min="0" step="1" value={formData.sortOrder} onChange={updateField} className={inputClass} /></div>
        <div className="sm:col-span-2"><label htmlFor="slideImage" className={labelClass}>Gambar carousel {initialData ? "(pilih jika ingin mengganti)" : <span className="text-rose-500">*</span>}</label><input id="slideImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-800" /><p className="mt-1.5 text-[11px] text-slate-500">JPG, PNG, WebP, atau GIF · maksimal 15 MB. Disarankan banner landscape rasio 16:9, minimal 1200 × 675 px (ideal 1600 × 900 px). Gambar ditampilkan utuh dan dipusatkan, tanpa dipotong.</p></div>
        {previewUrl && <div className="sm:col-span-2"><img src={previewUrl} alt="Pratinjau slide" className="max-h-64 w-full rounded-2xl bg-slate-100 object-contain" /></div>}
        <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={updateField} className="h-4 w-4 accent-blue-800" /><span className="text-xs font-bold text-slate-700">Tampilkan slide di beranda</span></label>
      </div>
      {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-800">{errorMessage}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Batal</button><button type="submit" disabled={isSaving} className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Mengunggah…" : "Simpan slide"}</button></div>
    </form>
  );
}
