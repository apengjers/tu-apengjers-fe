import { useState, useEffect, useRef } from 'react';
import './Carousel3D.css';

const images = [
  "/contohuni.jpg",
  "/contohupo.jpg",
  "/contohuni.jpg",
  "/contohupo.jpg",
];

export default function Carousel3D() {
  const [current, setCurrent] = useState(1); // Start from index 1 (karena displayImages offset)
  const intervalRef = useRef(null);
  const [isResetting, setIsResetting] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);


  const displayImages = [images[images.length - 1], ...images, images[0]]; // [last, ...images, first]
  const len = displayImages.length;

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [current]);

  const startAutoSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const nextSlide = () => {
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrent((prev) => prev - 1);
  };

  useEffect(() => {
    if (current === len - 1) {
      setTimeout(() => {
        setIsResetting(true);
        setCurrent(1);
        setTimeout(() => setIsResetting(false), 50);
      }, 600); // waktu sama kayak transition di CSS
    } else if (current === 0) {
      setTimeout(() => {
        setIsResetting(true);
        setCurrent(len - 2);
        setTimeout(() => setIsResetting(false), 50);
      }, 600);
    }
  }, [current]);

  const handleManualSlide = (newIndex) => {
    setPrevIndex((current - 1 + images.length) % images.length); // simpen yang lama
    setCurrent(newIndex + 1);
    startAutoSlide();
  };
  

  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden py-2 sm:py-5">
      {/* Carousel Image Wrapper */}
      <div className="relative flex h-[clamp(170px,48vw,250px)] items-center justify-center gap-4 perspective-1000">
        {displayImages.map((img, index) => {
          const realIndex = index;
          const position = realIndex - current;
          let scale = 0.8;
          let translateX = `${position * 350}px`;
          let rotateY = `${position * -45}deg`;
          let zIndex = -Math.abs(position);

          if (position === 0) {
            scale = 1;
            zIndex = 10;
          }

          return (
            <img
              key={index}
              src={img}
              alt={`Slide ${index}`}
              className="carousel-image"
              style={{
                transform: `translateX(${translateX}) scale(${scale}) rotateY(${rotateY})`,
                zIndex,
                opacity: Math.abs(position) > 1 ? 0 : position === 0 ? 1 : 0.5,
                transition: isResetting ? 'none' : undefined,
              }}
            />
          );
        })}
        {/* Panah diposisikan terhadap area gambar, bukan seluruh carousel */}
        <button
          type="button"
          aria-label="Slide sebelumnya"
          onClick={prevSlide}
          className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-2 text-black shadow sm:left-3"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Slide berikutnya"
          onClick={nextSlide}
          className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-2 text-black shadow sm:right-3"
        >
          ›
      </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-8">
      {images.map((_, index) => {
        const realIndex = (current - 1 + images.length) % images.length;
        const distance = Math.abs(index - prevIndex);
        const isActive = index === realIndex;

        // Delay berdasarkan jarak
        const delay = distance * 75; // ms

        return (
          <button
            key={index}
            onClick={() => handleManualSlide(index)}
            className={`w-3 h-3 rounded-full transform transition-transform duration-300 ease-out
              ${isActive ? 'bg-orange-500 scale-125' : 'bg-gray-400 scale-100'}
            `}
            style={{
              transitionDelay: `${delay}ms`,
            }}
          />
        );
      })}
      </div>
    </div>
  );
}
