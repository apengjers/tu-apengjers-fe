// src/components/Layout.jsx
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="w-full bg-blue-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
