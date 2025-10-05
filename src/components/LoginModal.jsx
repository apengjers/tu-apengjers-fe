import React, { useState } from 'react';
import axios from 'axios';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi'; // ← tambahkan FiEye dan FiEyeOff
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function LoginModal({ show, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ← tambahan

  if (!show) return null;

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3001/auth/login', {
        email,
        password
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);

      toast.success(`Login berhasil, selamat datang ${user.displayName || user.email}`, {
        position: "top-center"
      });

      setTimeout(() => {
        onClose();
        window.location.reload(); // refresh biar data user tampil kalau perlu
      }, 2000);
    } catch (err) {
      toast.error('Login gagal: ' + (err.response?.data?.message || 'Terjadi kesalahan'), {
        position: "top-center"
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
        <div className="relative bg-white rounded-2xl shadow-lg flex flex-col md:flex-row w-[90%] max-w-3xl overflow-hidden">
          <div className="bg-blue-500 text-white p-6 md:p-10 flex flex-col justify-center md:w-1/2 w-full">
            <button onClick={onClose} className="mb-4 text-2xl text-white hover:text-gray-300 self-start">
              <FiArrowLeft />
            </button>
            <h2 className="text-3xl font-bold mb-2">Masuk</h2>
            <p className="text-lg">Masuk ke tu.apengjers</p>
          </div>

          <div className="p-6 md:p-10 flex-1 relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 p-3 border rounded"
            />

            <div className="relative mb-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="text-right text-sm text-orange-600 mb-4 cursor-pointer hover:underline">
              Tidak ingat kata sandi?
            </div>

            <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 mb-4">
              Masuk
            </button>

            <p className="text-center my-2 text-gray-600">ATAU</p>

            <button disabled className="w-full bg-gray-200 text-gray-600 p-3 rounded cursor-not-allowed">
              Masuk dengan Google (dinonaktifkan)
            </button>

            <p className="mt-4 text-center text-sm">
              Belum punya akun?{' '}
              <a href="#" className="text-orange-600 hover:underline">Daftar sekarang</a>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}
