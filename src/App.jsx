import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import Carousel from './components/Carousel'; 
import HomeSections from './components/HomeSections';
import ProductDetail from './pages/ProductDetail';
import NotFound from './components/NotFound';
import GamePage from './pages/GamePage';
import EwalletPage from './pages/EwalletPage';
import PulsaPage from './pages/PulsaPage';
import AplikasiPage from './pages/AplikasiPage';
import CekTransaksi from './pages/CekTransaksi';
import AdminProduct from './pages/AdminProduct';
import StorefrontPlaceholder from './components/StorefrontPlaceholder';


function HomePage() {
  return (
    <>   
      <div className="max-w-7xl mx-auto px-1 py-1">
      <Carousel />
      <div className="max-w-7xl mx-auto px-1 py-2">
        <HomeSections />
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="product/:productId" element={<ProductDetail />} />
          <Route path="game" element={<GamePage />} />
          <Route path="ewallet" element={<EwalletPage />} />
          <Route path="pulsa" element={<PulsaPage />} /> 
          <Route path="aplikasi" element={<AplikasiPage />} /> 
          <Route
            path="joki-roblox"
            element={
              <StorefrontPlaceholder
                eyebrow="Layanan Roblox"
                title="Joki Roblox"
                description="Pilih layanan joki sesuai game dan target yang kamu inginkan. Katalog paket akan segera hadir."
              />
            }
          />
          <Route
            path="gift-item"
            element={
              <StorefrontPlaceholder
                eyebrow="Gift Item"
                title="Kirim item game sebagai hadiah"
                description="Temukan item gift yang tersedia dan kirimkan ke username penerima. Katalog gift sedang disiapkan."
              />
            }
          />
          <Route
            path="cara-order"
            element={
              <StorefrontPlaceholder
                eyebrow="Panduan Pemesanan"
                title="Cara order di ApengJers"
                description="Panduan memilih layanan, mengisi detail pesanan, membayar, dan memantau progres akan tersedia di sini."
              />
            }
          />
          <Route path="*" element={<NotFound />} />
          <Route path="cek-transaksi" element={<CekTransaksi />} />
          <Route path="adminproduct" element={<AdminProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
