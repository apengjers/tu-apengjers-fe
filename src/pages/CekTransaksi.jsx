import { useState } from 'react';
import { motion } from 'framer-motion';

function CekTransaksi() {
  const [transactionId, setTransactionId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckTransaction = async () => {
    if (!transactionId) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.example.com/transaksi/${transactionId}`);
      if (!response.ok) throw new Error('Transaksi tidak ditemukan');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-50 p-6 sm:p-10">
      {/* Judul masuk dari atas */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-center">Cek Status Transaksi</h1>
      </motion.div>

      {/* Input dan tombol masuk dari kiri */}
      <motion.div
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Masukkan ID Transaksi"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="flex-grow px-4 py-2 border rounded shadow-sm"
        />
        <button
          onClick={handleCheckTransaction}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Memproses...' : 'Cek'}
        </button>
      </motion.div>

      {/* Hasil */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4"
        >
          {result.error ? (
            <p className="text-red-500 text-center">{result.error}</p>
          ) : (
            <div className="p-4 border rounded bg-gray-50 shadow-sm">
              <p><strong>ID:</strong> {result.id}</p>
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Nominal:</strong> Rp{result.amount}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default CekTransaksi;
