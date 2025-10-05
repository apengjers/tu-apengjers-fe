import { Helmet } from 'react-helmet';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-center px-4">
      <Helmet>
        <title>Top Up Game - Halaman tidak ditemukan</title>
        <meta name="description" content="Halaman tidak tersedia." />
      </Helmet>

      <div className="text-8xl mb-4"></div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Maaf, halaman yang kamu cari tidak tersedia atau telah dipindahkan.
      </p>

      <a
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all"
      >
        ⬅️ Kembali ke Beranda
      </a>
    </div>
  );
}

export default NotFound;
