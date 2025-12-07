import { useState, useEffect, useCallback } from "react";

import banner1 from "@/assets/beterra-banner.png";
import banner2 from "@/assets/beterra-banner.png";
import banner3 from "@/assets/beterra-banner.png";

const PromoBannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const images = [
    { src: banner1, alt: "Beterra Cup 1" },
    { src: banner2, alt: "Beterra Cup 2" },
    { src: banner3, alt: "Beterra Cup 3" },
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

  // Автопрокрутка каждые 5 секунд
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
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-contain rounded-xl select-none"
                draggable="false"
              />
            </div>
          ))}
        </div>

        {/* Кнопки навигации */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 lg:opacity-70"
          aria-label="Предыдущий слайд"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 lg:opacity-70"
          aria-label="Следующий слайд"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Точки-индикаторы */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
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

      {/* Мобильные контролы */}
      <div className="flex items-center justify-center mt-4 space-x-4 md:hidden">
        <button
          onClick={prevSlide}
          className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white w-10 h-10 rounded-full shadow"
          aria-label="Предыдущий слайд"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-sm text-gray-600 font-medium">
          {currentSlide + 1} / {images.length}
        </div>

        <button
          onClick={nextSlide}
          className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white w-10 h-10 rounded-full shadow"
          aria-label="Следующий слайд"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PromoBannerSlider;
