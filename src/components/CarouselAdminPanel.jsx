import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";
import CarouselSlideForm from "./CarouselSlideForm";
import { FiAlertCircle, FiEdit2, FiImage, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";

export default function CarouselAdminPanel() {
  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSlides = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { data } = await api.get("/api/carousel/admin");
      setSlides(Array.isArray(data) ? data : []);
    } catch {
      setErrorMessage("Slide carousel gagal dimuat. Pastikan backend dan database berjalan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadSlides(); }, [loadSlides]);

  const saveSlide = async () => {
    setIsFormOpen(false);
    setSelectedSlide(null);
    await loadSlides();
  };

  const toggleActive = async (slide) => {
    try {
      await api.put(`/api/carousel/${slide._id}`, { ...slide, isActive: !slide.isActive });
      await loadSlides();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Status slide gagal diubah.");
    }
  };

  const deleteSlide = async (slide) => {
    if (!window.confirm(`Hapus slide “${slide.title}” beserta gambar cloud-nya?`)) return;
    try {
      await api.delete(`/api/carousel/${slide._id}`);
      await loadSlides();
    } catch {
      setErrorMessage("Slide gagal dihapus.");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-base font-extrabold text-slate-900">Carousel beranda</h2><p className="mt-1 text-xs text-slate-500">Atur gambar, isi, tautan, dan urutan slide.</p></div>
        <div className="flex gap-2"><button type="button" onClick={loadSlides} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} /> Muat ulang</button><button type="button" onClick={() => { setSelectedSlide(null); setIsFormOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-800"><FiPlus /> Tambah slide</button></div>
      </div>
      {errorMessage && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><FiAlertCircle />{errorMessage}</p>}
      {isLoading ? <div className="py-16 text-center text-sm text-slate-500">Memuat slide…</div> : slides.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {slides.map((slide) => <article key={slide._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative h-44 bg-slate-100"><img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" /><span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${slide.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{slide.isActive ? "AKTIF" : "NONAKTIF"}</span><span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-700">Urutan {slide.sortOrder}</span></div>
            <div className="p-4"><h3 className="font-extrabold text-slate-900">{slide.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{slide.description || "Tanpa deskripsi"}</p><p className="mt-2 text-[10px] font-semibold text-blue-800">{slide.href || "Tanpa tombol tautan"}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => toggleActive(slide)} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50">{slide.isActive ? "Nonaktifkan" : "Aktifkan"}</button><button type="button" onClick={() => { setSelectedSlide(slide); setIsFormOpen(true); }} aria-label={`Edit ${slide.title}`} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50"><FiEdit2 /></button><button type="button" onClick={() => deleteSlide(slide)} aria-label={`Hapus ${slide.title}`} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50"><FiTrash2 /></button></div></div>
          </article>)}
        </div>
      ) : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center"><FiImage className="mx-auto h-7 w-7 text-slate-400" /><h3 className="mt-3 text-sm font-extrabold text-slate-800">Belum ada slide</h3><p className="mt-1 text-xs text-slate-500">Unggah gambar untuk mulai menampilkan carousel di beranda.</p></div>}
      {isFormOpen && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}><CarouselSlideForm initialData={selectedSlide} onSuccess={saveSlide} onCancel={() => setIsFormOpen(false)} /></div>}
    </>
  );
}
