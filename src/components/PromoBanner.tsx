import { useState, useEffect, useCallback } from "react";

import bannerTelegram from "@/assets/banner-telegram.png";
import bannerInstagram from "@/assets/banner-instagram.png";

const PromoBannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const images = [
    { src: bannerTelegram, alt: "Наш Телеграм", link: "https://t.me/fantasysportsmain" },
    { src: bannerInstagram, alt: "Наш Инстаграм", link: "https://www.instagram.com/fantasysports.world?igsh=MTU2ajNsZTFseW15Mg%3D%3D&utm_source=qr" },
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
    <div className="mt-[1px]">
      <div className="flex items-center">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="flex-shrink-0 px-1 flex items-center justify-center transition-opacity hover:opacity-70 mt-[25px]"
          aria-label="Предыдущий слайд"
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carousel */}
        <div className="relative overflow-hidden rounded-xl flex-1 min-w-0">
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
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="flex-shrink-0 px-1 flex items-center justify-center transition-opacity hover:opacity-70 mt-[25px]"
          aria-label="Следующий слайд"
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress bar indicator - below the images */}
      <div className="flex justify-center mt-3">
        <div 
          className="w-24 h-1 bg-muted/50 rounded-full overflow-hidden cursor-pointer"
          onClick={() => setCurrentSlide(currentSlide === 0 ? 1 : 0)}
        >
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: '50%',
              transform: currentSlide === 0 ? 'translateX(0%)' : 'translateX(100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PromoBannerSlider;
