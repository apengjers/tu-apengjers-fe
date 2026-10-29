import { useEffect, useRef, useState } from "react";
import { FiCamera, FiLock } from "react-icons/fi";
import api from "../lib/api";
import { UserAvatar } from "../components/UserMenu";

const openLogin = () => window.dispatchEvent(new Event("open-login"));
const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500";

function Notice({ notice }) {
  if (!notice) return null;
  return (
    <p
      role="status"
      className={`mt-4 rounded-xl p-3 text-xs font-semibold ${notice.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}
    >
      {notice.text}
    </p>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [needLogin, setNeedLogin] = useState(!localStorage.getItem("token"));
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ displayName: "", phone: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwNotice, setPwNotice] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) return undefined;
    let active = true;
    api
      .get("/api/users/me")
      .then(({ data }) => {
        if (!active) return;
        setProfile(data);
        setForm({ displayName: data.displayName || "", phone: data.phone || "" });
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 401) setNeedLogin(true);
        else setLoadError("Profil gagal dimuat. Coba lagi sebentar.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => photoPreview && URL.revokeObjectURL(photoPreview), [photoPreview]);

  const onPickPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setProfileNotice({ type: "err", text: "Foto harus JPG, PNG, atau WebP." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileNotice({ type: "err", text: "Ukuran foto maksimal 5 MB." });
      return;
    }
    setProfileNotice(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setProfileNotice(null);
    try {
      const body = new FormData();
      body.append("displayName", form.displayName.trim());
      body.append("phone", form.phone.trim());
      if (photoFile) body.append("photo", photoFile);
      const { data } = await api.patch("/api/users/me", body);
      setProfile(data);
      setPhotoFile(null);
      setPhotoPreview("");
      if (fileRef.current) fileRef.current.value = "";
      setProfileNotice({ type: "ok", text: "Profil berhasil diperbarui." });
      window.dispatchEvent(new CustomEvent("user:updated", { detail: data }));
    } catch (err) {
      setProfileNotice({ type: "err", text: err.response?.data?.message || "Profil belum berhasil disimpan." });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPwNotice(null);
    if (pw.newPassword.length < 8) return setPwNotice({ type: "err", text: "Kata sandi baru minimal 8 karakter." });
    if (pw.newPassword !== pw.confirm) return setPwNotice({ type: "err", text: "Konfirmasi kata sandi tidak sama." });
    setPwSaving(true);
    try {
      await api.patch("/api/users/me/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setProfile((prev) => (prev ? { ...prev, hasPassword: true } : prev));
      setPwNotice({ type: "ok", text: "Kata sandi berhasil diubah." });
    } catch (err) {
      setPwNotice({ type: "err", text: err.response?.data?.message || "Kata sandi belum berhasil diubah." });
    } finally {
      setPwSaving(false);
    }
  };

  if (needLogin) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-800">
            <FiLock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-base font-extrabold text-slate-900">Masuk untuk mengelola profil</h1>
          <button type="button" onClick={openLogin} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900">
            Masuk
          </button>
        </div>
      </main>
    );
  }

  if (loadError) return <main className="mx-auto max-w-xl px-4 py-12"><p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{loadError}</p></main>;
  if (!profile) return <main className="mx-auto max-w-xl px-4 py-12"><div className="h-64 animate-pulse rounded-2xl bg-white/70" /></main>;

  const avatarUser = photoPreview ? { ...profile, photo: photoPreview } : profile;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Akun</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Pengaturan Profil</h1>
      </div>

      <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar user={avatarUser} className="h-20 w-20" textClass="text-2xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Ganti foto profil"
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-blue-900 text-white shadow transition hover:bg-blue-700"
            >
              <FiCamera className="h-4 w-4" aria-hidden="true" />
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickPhoto} className="hidden" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900">{profile.displayName}</p>
            <p className="truncate text-xs text-slate-500">{profile.email}</p>
            <p className="mt-1 text-[11px] text-slate-400">JPG, PNG, atau WebP, maks. 5 MB</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-slate-700">
            Nama tampilan
            <input
              className={inputClass}
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
              minLength={2}
              maxLength={60}
            />
          </label>
          <label className="block text-xs font-bold text-slate-700">
            Nomor WhatsApp
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
            />
          </label>
          <label className="block text-xs font-bold text-slate-700 sm:col-span-2">
            Email
            <input className={inputClass} value={profile.email} disabled />
          </label>
        </div>

        <Notice notice={profileNotice} />
        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition enabled:hover:bg-blue-900 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </form>

      <form onSubmit={savePassword} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-extrabold text-slate-900">{profile.hasPassword ? "Ubah kata sandi" : "Buat kata sandi"}</h2>
        {!profile.hasPassword && (
          <p className="mt-1 text-xs text-slate-500">Akunmu masuk lewat Google. Buat kata sandi kalau ingin bisa login dengan email juga.</p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {profile.hasPassword && (
            <label className="block text-xs font-bold text-slate-700 sm:col-span-2">
              Kata sandi saat ini
              <input type="password" autoComplete="current-password" className={inputClass} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
            </label>
          )}
          <label className="block text-xs font-bold text-slate-700">
            Kata sandi baru
            <input type="password" autoComplete="new-password" className={inputClass} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} />
          </label>
          <label className="block text-xs font-bold text-slate-700">
            Ulangi kata sandi baru
            <input type="password" autoComplete="new-password" className={inputClass} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required minLength={8} />
          </label>
        </div>
        <Notice notice={pwNotice} />
        <button
          type="submit"
          disabled={pwSaving}
          className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-800 transition enabled:hover:bg-blue-50 disabled:opacity-60"
        >
          {pwSaving ? "Menyimpan..." : "Simpan kata sandi"}
        </button>
      </form>
    </main>
  );
}