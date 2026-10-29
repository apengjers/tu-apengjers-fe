import { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiCheck, FiChevronDown, FiEdit2, FiPlus, FiRefreshCw, FiTag, FiToggleLeft, FiToggleRight, FiX } from "react-icons/fi";
import api from "../lib/api";

const emptyVoucher = {
  code: "",
  title: "",
  description: "",
  discountType: "percent",
  discountValue: "10",
  maxDiscount: "",
  minimumPurchase: "0",
  scope: "all",
  eligibleGames: [],
  oneUsePerUser: true,
  startsAt: "",
  expiresAt: "",
  active: true,
};

const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
const dateInputValue = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";

export default function VouchersAdminPanel() {
  const [vouchers, setVouchers] = useState([]);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState(emptyVoucher);
  const [isSaving, setIsSaving] = useState(false);

  const loadVouchers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [voucherResponse, gamesResponse] = await Promise.all([
        api.get("/api/vouchers/admin"),
        api.get("/api/games"),
      ]);
      setVouchers(Array.isArray(voucherResponse.data) ? voucherResponse.data : []);
      setGames(Array.isArray(gamesResponse.data) ? gamesResponse.data : []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Daftar voucher gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadVouchers(); }, [loadVouchers]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingVoucher(null);
    setFormData(emptyVoucher);
    setErrorMessage("");
  };

  const openEditForm = (voucher) => {
    setIsFormOpen(true);
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code || "",
      title: voucher.title || "",
      description: voucher.description || "",
      discountType: voucher.discountType || "percent",
      discountValue: String(voucher.discountValue ?? ""),
      maxDiscount: voucher.maxDiscount == null ? "" : String(voucher.maxDiscount),
      minimumPurchase: String(voucher.minimumPurchase ?? 0),
      scope: voucher.scope || "all",
      eligibleGames: (voucher.eligibleGames || []).map((game) => String(game._id || game)),
      oneUsePerUser: voucher.oneUsePerUser !== false,
      startsAt: dateInputValue(voucher.startsAt),
      expiresAt: dateInputValue(voucher.expiresAt),
      active: Boolean(voucher.active),
    });
    setErrorMessage("");
  };

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "scope" && value !== "game" ? { eligibleGames: [] } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.scope === "game" && !formData.eligibleGames.length) {
      setErrorMessage("Pilih setidaknya satu game untuk cakupan voucher ini.");
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      discountValue: Number(formData.discountValue),
      maxDiscount: formData.discountType === "percent" && formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      minimumPurchase: Number(formData.minimumPurchase),
      eligibleGames: formData.scope === "game" ? formData.eligibleGames : [],
      startsAt: formData.startsAt || undefined,
      expiresAt: formData.expiresAt || undefined,
    };

    try {
      if (editingVoucher) await api.put(`/api/vouchers/${editingVoucher._id}`, payload);
      else await api.post("/api/vouchers", payload);
      closeForm();
      setSuccessMessage(editingVoucher ? "Voucher berhasil diperbarui." : "Voucher berhasil dibuat.");
      await loadVouchers();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Voucher gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVoucher = async (voucher) => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await api.patch(`/api/vouchers/${voucher._id}/active`, { active: !voucher.active });
      setSuccessMessage(`Voucher ${voucher.code} ${voucher.active ? "dinonaktifkan" : "diaktifkan"}.`);
      await loadVouchers();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Status voucher gagal diperbarui.");
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-xs font-bold text-slate-700";

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-base font-extrabold text-slate-900">Voucher & promo</h2><p className="mt-1 text-xs text-slate-500">Atur kode, syarat, masa berlaku, dan status promo di checkout.</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={loadVouchers} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><FiRefreshCw className={isLoading ? "animate-spin" : ""} /> Muat ulang</button>
          <button type="button" onClick={() => { setEditingVoucher(null); setFormData(emptyVoucher); setErrorMessage(""); setSuccessMessage(""); setIsFormOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-blue-800"><FiPlus /> Tambah voucher</button>
        </div>
      </div>

      {errorMessage && !editingVoucher && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{errorMessage}</p>}
      {successMessage && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{successMessage}</p>}

      {isLoading ? <p className="py-12 text-center text-sm text-slate-500">Memuat voucher…</p> : vouchers.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vouchers.map((voucher) => {
          const discountLabel = voucher.discountType === "percent" ? `${voucher.discountValue}%${voucher.maxDiscount ? ` · maks ${money(voucher.maxDiscount)}` : ""}` : money(voucher.discountValue);
          const scopeLabel = voucher.scope === "joki" ? "Joki Roblox" : voucher.scope === "gift" ? "Gift Item" : voucher.scope === "game" ? `Game: ${(voucher.eligibleGames || []).map((game) => game.nama || "Game").join(", ")}` : "Semua produk";
          return <article key={voucher._id} className={`rounded-2xl border p-5 ${voucher.active ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-75"}`}>
            <div className="flex items-start justify-between gap-3"><div><span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-orange-700"><FiTag /> {voucher.code}</span><h3 className="mt-3 text-base font-black text-slate-900">{voucher.title}</h3></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${voucher.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{voucher.active ? "AKTIF" : "NONAKTIF"}</span></div>
            <p className="mt-2 min-h-10 text-xs leading-5 text-slate-600">{voucher.description || "Tidak ada deskripsi promo."}</p>
            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-500">Diskon</dt><dd className="text-right font-extrabold text-slate-800">{discountLabel}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Berlaku untuk</dt><dd className="max-w-[65%] text-right font-bold text-slate-800">{scopeLabel}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Batas per pengguna</dt><dd className="text-right font-bold text-slate-800">{voucher.oneUsePerUser === false ? "Tanpa batas" : "Maks. 1x per user"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Minimum belanja</dt><dd className="font-bold text-slate-800">{money(voucher.minimumPurchase)}</dd></div><div className="flex items-center justify-between gap-3"><dt className="inline-flex items-center gap-1 text-slate-500"><FiCalendar /> Masa berlaku</dt><dd className="text-right font-bold text-slate-800">{new Date(voucher.startsAt).toLocaleDateString("id-ID")} – {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString("id-ID") : "Tanpa batas"}</dd></div></dl>
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => openEditForm(voucher)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><FiEdit2 /> Edit</button><button type="button" onClick={() => toggleVoucher(voucher)} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${voucher.active ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>{voucher.active ? <FiToggleRight /> : <FiToggleLeft />}{voucher.active ? "Nonaktifkan" : "Aktifkan"}</button></div>
          </article>;
        })}
      </div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center"><FiTag className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-800">Belum ada voucher.</p><p className="mt-1 text-xs text-slate-500">Tambahkan promo agar pelanggan bisa menggunakannya saat checkout.</p></div>}

      {isFormOpen && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
        <form onSubmit={handleSubmit} className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-orange-600">Promo checkout</p><h2 className="mt-1 text-xl font-black text-slate-900">{editingVoucher ? "Edit voucher" : "Tambah voucher"}</h2></div><button type="button" onClick={closeForm} aria-label="Tutup form" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><FiX /></button></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelClass} htmlFor="voucher-admin-code">Kode voucher</label><input id="voucher-admin-code" name="code" value={formData.code} onChange={updateField} required minLength={3} maxLength={24} pattern="[A-Za-z0-9-]+" placeholder="HEMAT10" className={`${inputClass} font-bold uppercase`} /></div>
            <div><label className={labelClass} htmlFor="voucher-admin-title">Nama promo</label><input id="voucher-admin-title" name="title" value={formData.title} onChange={updateField} required maxLength={80} placeholder="Hemat 10%" className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass} htmlFor="voucher-admin-description">Deskripsi untuk pelanggan</label><textarea id="voucher-admin-description" name="description" value={formData.description} onChange={updateField} maxLength={240} rows={2} placeholder="Jelaskan nilai diskon dan syarat promo" className={`${inputClass} resize-y`} /></div>
            <div><label className={labelClass} htmlFor="voucher-admin-type">Jenis diskon</label><select id="voucher-admin-type" name="discountType" value={formData.discountType} onChange={updateField} className={inputClass}><option value="percent">Persentase (%)</option><option value="fixed">Potongan nominal (Rp)</option></select></div>
            <div><label className={labelClass} htmlFor="voucher-admin-value">Nilai diskon</label><input id="voucher-admin-value" name="discountValue" type="number" min="1" max={formData.discountType === "percent" ? "100" : undefined} step="1" value={formData.discountValue} onChange={updateField} required className={inputClass} /></div>
            {formData.discountType === "percent" && <div><label className={labelClass} htmlFor="voucher-admin-max">Batas diskon (Rp, opsional)</label><input id="voucher-admin-max" name="maxDiscount" type="number" min="1" step="1" value={formData.maxDiscount} onChange={updateField} placeholder="15000" className={inputClass} /></div>}
            <div><label className={labelClass} htmlFor="voucher-admin-min">Minimum belanja (Rp)</label><input id="voucher-admin-min" name="minimumPurchase" type="number" min="0" step="1" value={formData.minimumPurchase} onChange={updateField} required className={inputClass} /></div>
            <div><label className={labelClass} htmlFor="voucher-admin-scope">Berlaku untuk</label><select id="voucher-admin-scope" name="scope" value={formData.scope} onChange={updateField} className={inputClass}><option value="all">Semua produk</option><option value="joki">Produk Joki Roblox</option><option value="gift">Produk Gift Item</option><option value="game">Game tertentu</option></select></div>
            {formData.scope === "game" && <div className="relative">
              <span className={labelClass}>Pilih game (bisa lebih dari satu)</span>
              <details className="group">
                <summary className={`${inputClass} flex cursor-pointer list-none items-center justify-between gap-3 text-left marker:hidden`}>
                  <span className={`min-w-0 truncate ${formData.eligibleGames.length ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                    {formData.eligibleGames.length ? `${formData.eligibleGames.length} game dipilih` : "Pilih game"}
                  </span>
                  <FiChevronDown className="shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {games.length ? games.map((game) => {
                    const isSelected = formData.eligibleGames.includes(game._id);
                    return <label key={game._id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-700 hover:bg-blue-50">
                      <input type="checkbox" checked={isSelected} onChange={() => setFormData((current) => ({
                        ...current,
                        eligibleGames: isSelected
                          ? current.eligibleGames.filter((gameId) => gameId !== game._id)
                          : [...current.eligibleGames, game._id],
                      }))} className="h-4 w-4 accent-blue-800" />
                      <span className="min-w-0 flex-1 truncate font-semibold">{game.nama}</span>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">{game.jenis === "gift" ? "Gift" : "Joki"}</span>
                    </label>;
                  }) : <p className="px-3 py-4 text-xs text-slate-500">Belum ada game di katalog.</p>}
                </div>
              </details>
              <p className="mt-1 text-[10px] text-slate-500">{formData.eligibleGames.length ? "Game yang dipilih akan memenuhi syarat voucher." : "Pilih minimal satu game."}</p>
            </div>}
            <div><label className={labelClass} htmlFor="voucher-admin-start">Tanggal mulai (opsional)</label><input id="voucher-admin-start" name="startsAt" type="date" value={formData.startsAt} onChange={updateField} className={inputClass} /></div>
            <div><label className={labelClass} htmlFor="voucher-admin-expiry">Tanggal berakhir (opsional)</label><input id="voucher-admin-expiry" name="expiresAt" type="date" value={formData.expiresAt} onChange={updateField} className={inputClass} /></div>
            <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" name="active" checked={formData.active} onChange={updateField} className="h-4 w-4 accent-blue-800" /><span className="text-xs font-bold text-slate-700">Voucher langsung aktif setelah disimpan</span></label>
            <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" name="oneUsePerUser" checked={formData.oneUsePerUser} onChange={updateField} className="h-4 w-4 accent-blue-800" /><span className="text-xs font-bold text-slate-700">Voucher hanya dapat digunakan 1x per user</span></label>
          </div>
          {errorMessage && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800">{errorMessage}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Batal</button><button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-800 disabled:opacity-60">{isSaving ? "Menyimpan…" : <><FiCheck /> Simpan voucher</>}</button></div>
        </form>
      </div>}
    </div>
  );
}
