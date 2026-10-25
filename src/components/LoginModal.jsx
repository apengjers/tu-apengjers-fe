import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPackage,
  FiTag,
  FiUser,
  FiX,
  FiZap,
} from 'react-icons/fi';
import api from '../lib/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/* ------------------------------------------------------------------ */
/* Google Identity Services                                            */
/* ------------------------------------------------------------------ */
let gsiPromise = null;
let gsiInitialized = false;
let googleHandler = () => {};

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error('Gagal memuat Google'));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

function GoogleButton({ mode, onCredential, onError }) {
  const holderRef = useRef(null);
  const [status, setStatus] = useState(GOOGLE_CLIENT_ID ? 'loading' : 'missing');

  useEffect(() => {
    googleHandler = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !holderRef.current) return;
        if (!gsiInitialized) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => googleHandler(response.credential),
          });
          gsiInitialized = true;
        }
        const width = Math.min(Math.max(holderRef.current.offsetWidth, 200), 400);
        holderRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(holderRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: mode === 'daftar' ? 'signup_with' : 'signin_with',
          logo_alignment: 'center',
          locale: 'id',
          width,
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('failed');
          onError?.('Google tidak bisa dimuat. Periksa koneksi internet kamu.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode, onError]);

  if (status === 'missing') {
    return (
      <button
        type="button"
        disabled
        title="Isi VITE_GOOGLE_CLIENT_ID di file .env frontend"
        className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400"
      >
        <GoogleLogo muted />
        Google belum dikonfigurasi
      </button>
    );
  }

  return (
    <div className="min-h-[44px]">
      <div ref={holderRef} className="flex justify-center" />
      {status === 'loading' && (
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
      )}
    </div>
  );
}

function GoogleLogo({ muted = false }) {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill={muted ? '#cbd5e1' : '#EA4335'} d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill={muted ? '#cbd5e1' : '#4285F4'} d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.3 5.7c4.3-4 6.9-9.9 7-17.1z" />
      <path fill={muted ? '#cbd5e1' : '#FBBC05'} d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
      <path fill={muted ? '#cbd5e1' : '#34A853'} d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.9 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Komponen kecil                                                      */
/* ------------------------------------------------------------------ */
function Field({ id, label, icon: Icon, error, right, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white py-3 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            right ? 'pr-12' : 'pr-4'
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
              : 'border-slate-300 focus:border-blue-700 focus:ring-blue-700/15'
          }`}
          {...inputProps}
        />
        {right}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
      className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
    >
      {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
    </button>
  );
}

function getStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= MIN_PASSWORD) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length < MIN_PASSWORD) score = Math.min(score, 1);
  const labels = ['', 'Lemah', 'Cukup', 'Bagus', 'Kuat'];
  return { score, label: labels[score] || 'Lemah' };
}

function StrengthMeter({ password }) {
  const { score, label } = getStrength(password);
  if (!password) return null;
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-blue-600', 'bg-emerald-500'];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full ${n <= score ? colors[score] : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Kekuatan kata sandi: <span className="font-semibold text-slate-700">{label}</span>
        {password.length < MIN_PASSWORD && ` (minimal ${MIN_PASSWORD} karakter)`}
      </p>
    </div>
  );
}

function Alert({ type = 'error', children }) {
  const isError = type === 'error';
  const Icon = isError ? FiAlertCircle : FiCheckCircle;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${
        isError
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function SubmitButton({ loading, children, loadingText }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {loading ? loadingText : children}
    </button>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400" role="separator">
      <span className="h-px flex-1 bg-slate-200" />
      atau
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

const PANEL_COPY = {
  login: {
    title: 'Masuk untuk lanjut belanja',
    text: 'Pantau pesanan dan checkout lebih cepat dengan akun kamu.',
  },
  register: {
    title: 'Buat akun ApengJers',
    text: 'Daftar gratis. Cukup nama, email, dan kata sandi.',
  },
  forgot: {
    title: 'Lupa kata sandi?',
    text: 'Tenang, kami kirim tautan ke email supaya kamu bisa membuat yang baru.',
  },
  reset: {
    title: 'Buat kata sandi baru',
    text: 'Pilih kata sandi yang belum pernah kamu pakai di tempat lain.',
  },
  success: {
    title: 'Berhasil masuk',
    text: 'Sebentar, halaman sedang dimuat ulang.',
  },
};

const BENEFITS = [
  { icon: FiPackage, text: 'Pantau status pesanan Joki dan Gift Item' },
  { icon: FiZap, text: 'Masuk sekali, belanja lebih cepat' },
  { icon: FiTag, text: 'Dapat info promo lebih awal' },
];

/* ------------------------------------------------------------------ */
/* Modal utama                                                         */
/* ------------------------------------------------------------------ */
export default function LoginModal({
  show,
  onClose,
  initialView = 'login',
  resetToken = null,
  onResetComplete,
}) {
  const [view, setView] = useState('login'); // login | register | forgot | reset | success
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  const formRef = useRef(null);
  const closeTimer = useRef(null);

  const clearFeedback = () => {
    setErrors({});
    setFormError('');
    setNotice('');
  };

  const goTo = (nextView, { keepEmail = true } = {}) => {
    clearFeedback();
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setForgotSent(false);
    if (!keepEmail) setEmail('');
    setView(nextView);
  };

  // Reset state setiap modal dibuka
  useEffect(() => {
    if (!show) return;
    clearFeedback();
    setName('');
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setForgotSent(false);
    setLoading(false);
    setView(resetToken ? 'reset' : initialView);
    // Sengaja hanya bergantung pada `show`: setelah reset sukses, parameter URL dihapus
    // (resetToken jadi null) dan efek ini tidak boleh menimpa pesan sukses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Esc untuk menutup + kunci scroll halaman di belakang modal
  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && view !== 'success') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [show, view, onClose]);

  // Fokus ke input pertama (hanya di layar besar supaya keyboard HP tidak langsung muncul)
  useEffect(() => {
    if (!show || !window.matchMedia('(min-width: 768px)').matches) return;
    const t = setTimeout(() => formRef.current?.querySelector('input')?.focus(), 50);
    return () => clearTimeout(t);
  }, [show, view]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const finishAuth = useCallback(
    (data) => {
      localStorage.setItem('token', data.token);
      setWelcomeName(data.user?.displayName || data.user?.email || '');
      setLoading(false);
      setView('success');
      closeTimer.current = setTimeout(() => {
        onClose();
        window.location.reload(); // muat ulang agar data user tampil
      }, 1400);
    },
    [onClose]
  );

  const requestError = (err, fallback) =>
    err.response?.data?.message ||
    (err.request ? 'Tidak bisa terhubung ke server. Periksa koneksi kamu.' : fallback);

  const handleGoogleCredential = useCallback(
    async (credential) => {
      if (!credential) return;
      setFormError('');
      setLoading(true);
      try {
        const { data } = await api.post('/auth/google', { credential });
        finishAuth(data);
      } catch (err) {
        setLoading(false);
        setFormError(requestError(err, 'Masuk dengan Google gagal. Coba lagi.'));
      }
    },
    [finishAuth]
  );

  const handleGoogleError = useCallback((message) => setFormError(message), []);

  /* ---------------------------- submit handlers ---------------------------- */
  const submitLogin = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Masukkan email yang valid';
    if (!password) next.password = 'Kata sandi wajib diisi';
    setErrors(next);
    setFormError('');
    setNotice('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      finishAuth(data);
    } catch (err) {
      setLoading(false);
      setFormError(requestError(err, 'Masuk gagal. Coba lagi.'));
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = 'Nama minimal 2 karakter';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Masukkan email yang valid';
    if (password.length < MIN_PASSWORD) next.password = `Kata sandi minimal ${MIN_PASSWORD} karakter`;
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        displayName: name.trim(),
        email: email.trim(),
        password,
      });
      finishAuth(data);
    } catch (err) {
      setLoading(false);
      setFormError(requestError(err, 'Pendaftaran gagal. Coba lagi.'));
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setErrors({ email: 'Masukkan email yang valid' });
      return;
    }
    setErrors({});
    setFormError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setForgotSent(true);
    } catch (err) {
      setFormError(requestError(err, 'Gagal mengirim tautan. Coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    const next = {};
    if (password.length < MIN_PASSWORD) next.password = `Kata sandi minimal ${MIN_PASSWORD} karakter`;
    if (confirm !== password) next.confirm = 'Konfirmasi kata sandi tidak sama';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token: resetToken, password });
      if (data.email) setEmail(data.email);
      onResetComplete?.();
      setPassword('');
      setConfirm('');
      setErrors({});
      setView('login');
      setNotice('Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.');
    } catch (err) {
      setFormError(requestError(err, 'Gagal memperbarui kata sandi. Coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const isAuthTab = view === 'login' || view === 'register';
  const panel = PANEL_COPY[view];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && view !== 'success') onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="modal-pop relative grid max-h-[100dvh] w-full max-w-[880px] overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
      >
        {/* Panel kiri (hanya desktop) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-blue-900 p-9 text-white md:flex">
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-orange-500/90"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -right-16 h-52 w-52 rounded-full border-[28px] border-white/10"
          />
          <div className="relative">
            <div className="mb-8 flex items-center gap-2.5">
              <img src="/logo-apengjers.png" alt="" className="h-10 w-10 rounded-lg bg-white/95 object-contain p-1" />
              <span className="text-lg font-extrabold tracking-tight">
                Apeng<span className="text-orange-400">Jers</span>
              </span>
            </div>
            <h2 className="text-2xl font-extrabold leading-snug">{panel.title}</h2>
            <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-blue-100">{panel.text}</p>
          </div>
          <ul className="relative mb-24 space-y-3.5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium text-blue-50">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </aside>

        {/* Panel form */}
        <section className="relative flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8">
          {view !== 'success' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}

          {/* Header mobile */}
          <div className="mb-5 flex items-center gap-2 md:hidden">
            <img src="/logo-apengjers.png" alt="" className="h-9 w-9 object-contain" />
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Apeng<span className="text-orange-500">Jers</span>
            </span>
          </div>

          {/* Tab Masuk / Daftar */}
          {isAuthTab && (
            <div role="tablist" aria-label="Masuk atau daftar" className="mb-6 flex border-b border-slate-200">
              {[
                { id: 'login', label: 'Masuk' },
                { id: 'register', label: 'Daftar' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={view === tab.id}
                  onClick={() => view !== tab.id && goTo(tab.id)}
                  className={`-mb-px flex-1 border-b-2 px-4 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 ${
                    view === tab.id
                      ? 'border-orange-500 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tombol kembali untuk Lupa / Reset */}
          {(view === 'forgot' || view === 'reset') && (
            <button
              type="button"
              onClick={() => {
                if (view === 'reset') onResetComplete?.();
                goTo('login');
              }}
              className="mb-4 flex w-fit items-center gap-1.5 rounded-lg py-1 pr-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
            >
              <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
              Kembali ke Masuk
            </button>
          )}

          <h2 id="auth-title" className="sr-only md:hidden">
            {panel.title}
          </h2>

          {/* ------------------------------ MASUK ------------------------------ */}
          {view === 'login' && (
            <>
              <h3 className="mb-4 text-xl font-extrabold text-slate-900 md:hidden">{panel.title}</h3>
              {notice && <div className="mb-4"><Alert type="success">{notice}</Alert></div>}
              {formError && <div className="mb-4"><Alert>{formError}</Alert></div>}

              <GoogleButton mode="masuk" onCredential={handleGoogleCredential} onError={handleGoogleError} />
              <Divider />

              <form ref={formRef} onSubmit={submitLogin} noValidate className="space-y-4">
                <Field
                  id="login-email"
                  label="Email"
                  icon={FiMail}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <Field
                  id="login-password"
                  label="Kata sandi"
                  icon={FiLock}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  right={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                />
                <div className="-mt-1 text-right">
                  <button
                    type="button"
                    onClick={() => goTo('forgot')}
                    className="rounded text-sm font-semibold text-orange-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <SubmitButton loading={loading} loadingText="Memproses...">Masuk</SubmitButton>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => goTo('register')}
                  className="rounded font-bold text-orange-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                >
                  Daftar sekarang
                </button>
              </p>
            </>
          )}

          {/* ------------------------------ DAFTAR ----------------------------- */}
          {view === 'register' && (
            <>
              <h3 className="mb-4 text-xl font-extrabold text-slate-900 md:hidden">{panel.title}</h3>
              {formError && <div className="mb-4"><Alert>{formError}</Alert></div>}

              <GoogleButton mode="daftar" onCredential={handleGoogleCredential} onError={handleGoogleError} />
              <Divider />

              <form ref={formRef} onSubmit={submitRegister} noValidate className="space-y-4">
                <Field
                  id="register-name"
                  label="Nama"
                  icon={FiUser}
                  type="text"
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
                <Field
                  id="register-email"
                  label="Email"
                  icon={FiMail}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <div>
                  <Field
                    id="register-password"
                    label="Kata sandi"
                    icon={FiLock}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={`Minimal ${MIN_PASSWORD} karakter`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    right={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  />
                  <StrengthMeter password={password} />
                </div>
                <SubmitButton loading={loading} loadingText="Membuat akun...">Daftar</SubmitButton>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => goTo('login')}
                  className="rounded font-bold text-orange-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                >
                  Masuk
                </button>
              </p>
            </>
          )}

          {/* ------------------------- LUPA KATA SANDI ------------------------- */}
          {view === 'forgot' && (
            <>
              <h3 className="text-xl font-extrabold text-slate-900 md:hidden">{panel.title}</h3>
              <p className="mb-5 mt-1 text-sm leading-relaxed text-slate-600 md:mt-0">
                Masukkan email akun kamu. Kami kirim tautan untuk membuat kata sandi baru.
              </p>

              {forgotSent ? (
                <div className="space-y-4">
                  <Alert type="success">
                    Jika <strong className="break-all">{email.trim()}</strong> terdaftar, tautan reset sudah dikirim.
                    Tautan berlaku 30 menit.
                  </Alert>
                  <p className="text-sm text-slate-600">
                    Belum menerima? Cek folder spam, atau{' '}
                    <button
                      type="button"
                      onClick={() => setForgotSent(false)}
                      className="rounded font-bold text-orange-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
                    >
                      kirim ulang
                    </button>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => goTo('login')}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    Kembali ke Masuk
                  </button>
                </div>
              ) : (
                <>
                  {formError && <div className="mb-4"><Alert>{formError}</Alert></div>}
                  <form ref={formRef} onSubmit={submitForgot} noValidate className="space-y-4">
                    <Field
                      id="forgot-email"
                      label="Email"
                      icon={FiMail}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                    />
                    <SubmitButton loading={loading} loadingText="Mengirim...">Kirim tautan reset</SubmitButton>
                  </form>
                </>
              )}
            </>
          )}

          {/* --------------------------- RESET SANDI --------------------------- */}
          {view === 'reset' && (
            <>
              <h3 className="text-xl font-extrabold text-slate-900 md:hidden">{panel.title}</h3>
              <p className="mb-5 mt-1 text-sm leading-relaxed text-slate-600 md:mt-0">
                Masukkan kata sandi baru untuk akun kamu.
              </p>
              {formError && <div className="mb-4"><Alert>{formError}</Alert></div>}
              <form ref={formRef} onSubmit={submitReset} noValidate className="space-y-4">
                <div>
                  <Field
                    id="reset-password"
                    label="Kata sandi baru"
                    icon={FiLock}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={`Minimal ${MIN_PASSWORD} karakter`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    right={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  />
                  <StrengthMeter password={password} />
                </div>
                <Field
                  id="reset-confirm"
                  label="Ulangi kata sandi baru"
                  icon={FiLock}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ketik ulang kata sandi"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={errors.confirm}
                />
                <SubmitButton loading={loading} loadingText="Menyimpan...">Simpan kata sandi baru</SubmitButton>
              </form>
            </>
          )}

          {/* ------------------------------ SUKSES ----------------------------- */}
          {view === 'success' && (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center" role="status">
              <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <FiCheckCircle aria-hidden="true" className="h-8 w-8" />
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Selamat datang, {welcomeName}</h3>
              <p className="mt-1 text-sm text-slate-600">Kamu berhasil masuk. Halaman sedang dimuat ulang.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}