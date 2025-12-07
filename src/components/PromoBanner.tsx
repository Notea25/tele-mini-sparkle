import { useState, useEffect, useCallback } from "react";

import banner1 from "@/assets/beterra-banner.png";
import banner2 from "@/assets/beterra-banner.png";
import banner3 from "@/assets/beterra-banner.png";

const PromoBannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const images = [
    { src: banner1, alt: "Beterra Cup 1", link: "https://pm.by/ru/" },
    { src: banner2, alt: "Beterra Cup 2", link: "https://pm.by/ru/" },
    { src: banner3, alt: "Beterra Cup 3", link: "https://pm.by/ru/" },
  ];

  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleBannerClick = useCallback((e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    window.open(link, "_blank");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="mx-4 mt-4">
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="relative flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <a
                href={image.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
                onClick={(e) => handleBannerClick(e, image.link)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-contain rounded-xl select-none cursor-pointer hover:opacity-95 transition-opacity duration-200"
                  draggable="false"
                />
              </a>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 lg:opacity-70 z-10"
          aria-label="Предыдущий слайд"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 lg:opacity-70 z-10"
          aria-label="Следующий слайд"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
          <div className="flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? "bg-white" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBannerSlider;
