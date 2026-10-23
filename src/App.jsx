import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import HomeSections from './components/HomeSections';
import ProductDetail from './pages/ProductDetail';
import NotFound from './components/NotFound';
import GamePage from './pages/GamePage';
import EwalletPage from './pages/EwalletPage';
import PulsaPage from './pages/PulsaPage';
import AplikasiPage from './pages/AplikasiPage';
import CekTransaksi from './pages/CekTransaksi';
import AdminProduct from './pages/AdminProduct';
import JokiRobloxPage from './pages/JokiRobloxPage';
import GiftItemPage from './pages/GiftItemPage';
import OrderFormPage from './pages/OrderFormPage';
import CaraOrderPage from './pages/CaraOrderPage';


function HomePage() {
  return <HomeSections />;
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
            element={<JokiRobloxPage />}
          />
          <Route path="joki-roblox/:gameSlug" element={<JokiRobloxPage />} />
          <Route
            path="gift-item"
            element={<GiftItemPage />}
          />
          <Route path="gift-item/:gameSlug" element={<GiftItemPage />} />
          <Route path="pesan/joki-roblox" element={<OrderFormPage orderType="joki" />} />
          <Route path="pesan/gift-item" element={<OrderFormPage orderType="gift" />} />
          <Route path="cara-order" element={<CaraOrderPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="cek-transaksi" element={<CekTransaksi />} />
          <Route path="adminproduct" element={<AdminProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
