import { useEffect, useState } from "react";
import api from "../lib/api";
import "./Carousel3D.css";

const fallbackSlides = [
  { imageUrl: "/contohuni.jpg", title: "Joki Roblox", description: "Bantuan progress untuk experience pilihanmu.", href: "/joki-roblox" },
  { imageUrl: "/contohupo.jpg", title: "Gift Item", description: "Cari item Roblox untuk dikirim ke teman.", href: "/gift-item" },
  { imageUrl: "/contohuni.jpg", title: "Pilih layanan", description: "Temukan layanan yang sesuai kebutuhanmu.", href: "/cara-order" },
];

export default function Carousel() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let isActive = true;
    api.get("/api/carousel")
      .then(({ data }) => {
        if (isActive && Array.isArray(data)) {
          setSlides(data);
          setCurrent(0);
        }
      })
      .catch(() => {});
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const interval = window.setInterval(() => setCurrent((index) => (index + 1) % slides.length), 5000);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  const move = (direction) => setCurrent((index) => (index + direction + slides.length) % slides.length);
  if (!slides.length) return <div className="grid min-h-52 place-items-center rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center text-sm text-blue-100">Carousel belum diatur admin.</div>;
  return (
    <div className="carousel-shell mx-auto w-full max-w-[520px] py-2 sm:py-4">
      <div className="carousel-stage" aria-roledescription="carousel" aria-label="Sorotan ApengJers">
        {slides.map((slide, index) => {
          const rawPosition = index - current;
          const position = rawPosition > slides.length / 2
            ? rawPosition - slides.length
            : rawPosition < -slides.length / 2
              ? rawPosition + slides.length
              : rawPosition;
          const isActive = index === current;

          return (
            <div
              key={slide._id || `${slide.title}-${index}`}
              className="carousel-slide"
              aria-hidden={!isActive}
              style={{
                transform: `translate(-50%, -50%) translateX(${position * 72}%) scale(${isActive ? 1 : 0.78}) rotateY(${position * -24}deg)`,
                zIndex: isActive ? 3 : Math.max(0, 2 - Math.abs(position)),
                opacity: Math.abs(position) > 1 ? 0 : isActive ? 1 : 0.58,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <img src={slide.imageUrl} alt={isActive ? slide.title : ""} className="carousel-image" />
            </div>
          );
        })}
        {slides.length > 1 && <>
          <button type="button" aria-label="Slide sebelumnya" onClick={() => move(-1)} className="carousel-arrow carousel-arrow-prev">‹</button>
          <button type="button" aria-label="Slide berikutnya" onClick={() => move(1)} className="carousel-arrow carousel-arrow-next">›</button>
        </>}
      </div>
      {slides.length > 1 && <div className="mt-3 flex justify-center gap-2" aria-label="Pilih slide">
        {slides.map((slide, index) => <button key={slide._id || `${slide.title}-dot-${index}`} type="button" aria-label={`Tampilkan slide ${index + 1}: ${slide.title}`} aria-current={current === index ? "true" : undefined} onClick={() => setCurrent(index)} className={`h-2.5 w-2.5 rounded-full transition ${current === index ? "scale-125 bg-orange-500" : "bg-slate-300 hover:bg-slate-400"}`} />)}
      </div>}
    </div>
  );
}
