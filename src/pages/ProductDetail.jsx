import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { productId } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const paymentOptions = [
    { label: "E-wallet", method: "ewallet" },
    { label: "Transfer Bank", method: "bank_transfer" },
    { label: "Pulsa", method: "pulsa" },
  ];

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${productId}`)
      .then((res) => {
        setProducts(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [productId]);

  const handleSubmit = async () => {
    if (!selectedProduct || !paymentMethod || !userId || !zoneId) return;

    try {
      const res = await axios.post("/api/transactions", {
        productId: selectedProduct._id,
        paymentMethod: paymentMethod.method,
        userId,
        zoneId,
        email,
      });

      const snapToken = res.data.token;
      window.snap.pay(snapToken, {
        onSuccess: () => alert("Pembayaran berhasil"),
        onPending: () => alert("Menunggu pembayaran"),
        onError: () => alert("Pembayaran gagal"),
      });
    } catch (err) {
      console.error("Gagal memulai transaksi:", err);
      alert("Gagal memulai transaksi");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* KIRI */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 space-y-6"
      >
          {/* KIRI */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-bold text-gray-800">
                {productId?.replace(/-/g, " ").toUpperCase()}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Masukkan ID pengguna & pilih jumlah top up
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">ID Pengguna</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 mt-1 text-sm"
                  placeholder="Masukkan ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Zona</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 mt-1 text-sm"
                  placeholder="Zona"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-2">Pilih Jumlah</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((item) => (
                  <motion.div
                    key={item._id}
                    whileTap={{ scale: 0.95 }}
                    className={`border p-3 rounded-lg text-sm cursor-pointer transition-all ${selectedProduct?._id === item._id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"}`}
                    onClick={() => setSelectedProduct(item)}
                  >
                    {item.name} <br />
                    <span className="text-xs text-gray-500">IDR {item.price.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-2">Pilih Pembayaran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentOptions.map((method, i) => (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPaymentMethod(method)}
                    className={`border p-3 rounded-lg text-sm cursor-pointer transition-all ${paymentMethod?.method === method.method
                      ? "border-green-500 bg-green-50"
                      : "hover:border-gray-400"}`}
                  >
                    {method.label}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <label className="block text-sm font-medium mb-1">Email (opsional)</label>
              <input
                type="email"
                className="w-full border rounded p-2 text-sm"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

          {/* KANAN */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full md:w-80 sticky top-20 self-start"
          >
          <div className="w-full md:w-80 sticky top-20 self-start">
            <div className="bg-white rounded-xl shadow p-4 space-y-2">
              <h4 className="text-md font-bold text-gray-800">Checkout</h4>
              <div className="text-sm text-gray-600">
                <p>Item: {selectedProduct?.name || "-"}</p>
                <p>Payment: {paymentMethod?.label || "-"}</p>
                <p className="font-semibold mt-2">
                  Total:{" "}
                  {selectedProduct
                    ? `IDR ${selectedProduct.price.toLocaleString()}`
                    : "-"}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-orange-500 text-white rounded py-2 mt-3 hover:bg-orange-600 disabled:opacity-50"
                disabled={!selectedProduct || !paymentMethod || !userId || !zoneId}
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </motion.div>
    </div>
  );
}
