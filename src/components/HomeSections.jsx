// src/components/HomeSections.jsx
import { FaGamepad, FaWallet, FaMobileAlt, FaThLarge } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const categories = [
  { icon: <FaWallet />, label: 'E-Wallet', link: '/ewallet' },
  { icon: <FaMobileAlt />, label: 'Pulsa', link: '/pulsa' },
  { icon: <FaGamepad />, label: 'Game', link: '/game' },
  { icon: <FaThLarge />, label: 'Aplikasi', link: '/aplikasi' },
];

const gameList = [
  { image: '/moleg.jpg', name: 'Mobile Legends', diskon: '15%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Magic Chess Go Go', diskon: '15%', sold: '3.8rb+' },
  { image: '/moleg.jpg', name: 'Free Fire', diskon: '15%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Honor of Kings', diskon: '20%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'PUBGM Global', diskon: '10%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Honkai: Star Rail', diskon: '25%', sold: '10rb+' },
];

const trendingList = [
  { image: '/moleg.jpg', name: 'Dana', diskon: null, sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Zepeto', diskon: '10%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Blood Strike', diskon: '25%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Point Blank', diskon: '15%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Genshin Impact', diskon: '25%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Call of Duty Mobile', diskon: '25%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Telkomsel', diskon: null, sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Eggy Party', diskon: '10%', sold: '6.6rb+' },
  { image: '/moleg.jpg', name: 'Valorant', diskon: '10%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Bigo Live', diskon: '15%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Garena Undawn', diskon: '25%', sold: '2.6rb+' },
  { image: '/moleg.jpg', name: 'Super Sus', diskon: '15%', sold: '10rb+' },
  { image: '/moleg.jpg', name: 'Garena Free Fire', diskon: '15%', sold: '10rb+' },
];

function CategoryMenu() {
  return (
    <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-md shadow">
      {categories.map((item, i) => (
        <Link
          key={i}
          to={item.link || `/category/${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-500">
          {item.icon}
          <span className="mt-1">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}


function ProductGrid({ title, list }) {
  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {list.map((item, i) => {
          const slug = item.name.toLowerCase().replace(/\s+/g, '-'); // buat slug dari nama

          return (
            <Link to={`/product/${item.name.replace(/\s+/g, "-").toLowerCase()}`} key={i}>
              <div className="border p-3 rounded-md bg-white shadow hover:shadow-md transition-all">
                <div className="h-24 bg-gray-100 rounded mb-2"><img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" /></div> {/* Placeholder gambar */}
                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                {item.diskon && <span className="text-xs text-red-600">-{item.diskon}</span>}
                <div className="text-xs text-gray-500">Terjual {item.sold}</div>
              </div>
            </Link>
        
          );
        })}
      </div>
    </div>
  );
}


export default function HomeSections() {
  return (
    <>
    <Helmet>
      <title>Top Up Game - Beranda</title>
    </Helmet>
    <div className="p-4 max-w-screen-xl mx-auto">
      <CategoryMenu />
      <ProductGrid title="Game Populer" list={gameList} />
      <ProductGrid title="Produk Trending" list={trendingList} />
    </div>
    </>
  );
}
