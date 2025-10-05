import { useEffect, useState } from 'react';
import { FaMoon, FaSun, FaUser, FaSearch } from "react-icons/fa";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { FiDollarSign } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { TbHomeShield } from "react-icons/tb";
import LoginModal from './LoginModal';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <>
      <header
        className={`w-full bg-white shadow-md fixed top-0 z-50 transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >

        <div className="w-full px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo-apengjers.png" alt="logo" className="w-15 h-15" />
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-gray-700 relative">
            <a href="/" className="flex items-center gap-1 hover:text-blue-500 size text-xl">
              <TbHomeShield />Beranda</a>
            <a href="/cek-transaksi" className="flex items-center gap-1 hover:text-blue-500 size text-xl">
              <FiDollarSign /> Cek Transaksi
            </a>

            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-1 hover:text-blue-500 size text-xl"
              >
                <FaUser /> Akun Saya
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white border shadow-md rounded-md z-20"
                  >
                    <button onClick={() => setShowLoginModal(true)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Login</button>
                    <button onClick={() => setShowLoginModal(true)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Register</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleSearch} className="text-gray-500 hover:text-blue-500">
              <FaSearch />
            </button>
          </nav>

          <button className="md:hidden text-gray-700" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white shadow-md px-4 py-3"
            >
              <div className="max-w-full mx-auto">
                <input
                  type="text"
                  placeholder="Cari berita, promo, atau game..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white px-4 pb-4 shadow flex flex-col items-center text-center">
            <a href="/" className="block py-2 text-gray-700 hover:text-blue-500">Beranda</a>
            <a href="/cek-transaksi" className="block py-2 text-gray-700 hover:text-blue-500">Cek Transaksi</a>
            <button
              onClick={() => {
                setShowLoginModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-center py-2 text-gray-700 hover:text-blue-500"
            >
              Login / Register
            </button>
            <button 
              className="w-full flex flex-row items-center justify-center gap-2 py-2 text-gray-700 hover:text-blue-500" 
              onClick={toggleSearch}
            >
              Cari <FaSearch />
            </button>

          </div>
        )}
      </header>

      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Navbar;
