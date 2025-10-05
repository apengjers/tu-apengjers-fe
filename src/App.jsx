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
          <Route path="*" element={<NotFound />} />
          <Route path="cek-transaksi" element={<CekTransaksi />} />
          <Route path="adminproduct" element={<AdminProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
