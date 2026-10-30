// src/components/Layout.jsx
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import api from "../lib/api";

export default function Layout() {
  const location = useLocation();
  const skipScrollReveal = location.pathname === "/cek-transaksi";
  const pageContentRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Cek role user — kalau admin, sembunyikan chatbot user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setIsAdmin(false); return; }
    api.get("/auth/me")
      .then(({ data }) => setIsAdmin(data?.role === "admin"))
      .catch(() => setIsAdmin(false));
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (skipScrollReveal) return undefined;

    let observer;
    const observeMainSections = () => {
      const main = pageContentRef.current?.querySelector("main");
      if (!main) return;

      const revealTargets = [];
      Array.from(main.children).forEach((child) => {
        const nestedSections = Array.from(child.children).filter((nested) =>
          ["SECTION", "ARTICLE", "ASIDE"].includes(nested.tagName),
        );
        if (child.tagName === "DIV" && nestedSections.length) {
          revealTargets.push(...nestedSections);
        } else if (child.tagName !== "NAV") {
          revealTargets.push(child);
        }
      });

      revealTargets.forEach((element, index) => {
        if (!element.classList.contains("page-section-reveal")) {
          const direction = index === 0 ? "top" : index % 2 === 0 ? "right" : "left";
          element.dataset.scrollReveal = direction;
          element.classList.add("page-section-reveal");
          // Compute the hidden start state before revealing on-screen content.
          void element.offsetHeight;
        }
        if (element.classList.contains("is-visible")) return;

        const bounds = element.getBoundingClientRect();
        const isInViewport = bounds.bottom > 0 && bounds.top < window.innerHeight * 0.94;
        if (!observer || isInViewport) {
          element.classList.add("is-visible");
          return;
        }
        observer.observe(element);
      });
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    }

    observeMainSections();
    const mutationObserver = new MutationObserver(observeMainSections);
    if (pageContentRef.current) {
      mutationObserver.observe(pageContentRef.current, { childList: true, subtree: true });
    }

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, [location.pathname, skipScrollReveal]);

  return (
    <div className="w-full bg-blue-50 min-h-screen flex flex-col">
      <Navbar />
      <div ref={pageContentRef} className="flex-1 pt-20"><Outlet /></div>
      <Footer />
      {!isAdmin && <ChatWidget />}
    </div>
  );
}
