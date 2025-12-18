import { useRef, useEffect, useState } from "react";

import arsenal from "@/assets/clubs/arsenalLogo.png";
import baranovichi from "@/assets/clubs/baranovichiLogo.png";
import bate from "@/assets/clubs/bateLogo.png";
import belshina from "@/assets/clubs/belshinaLogo.png";
import vitebsk from "@/assets/clubs/vitebskLogo.png";
import gomel from "@/assets/clubs/gomelLogo.png";
import dinamoBrest from "@/assets/clubs/brestLogo.png";
import dinamoMinsk from "@/assets/clubs/dinamoLogo.png";
import dnepr from "@/assets/clubs/dneprLogo.png";
import isloch from "@/assets/clubs/islochLogo.png";
import minsk from "@/assets/clubs/minskLogo.png";
import mlVitebsk from "@/assets/clubs/mlLogo.png";
import naftan from "@/assets/clubs/naftanLogo.png";
import neman from "@/assets/clubs/nemanLogo.png";
import slavia from "@/assets/clubs/slaviaLogo.png";
import torpedo from "@/assets/clubs/torpedoLogo.png";

// Конфигурация
const CONFIG = {
  autoScrollSpeed: 0.8,
  itemGap: 6.67,
  itemWidth: 61.33,
  itemHeight: 45.33,
};

interface Club {
  id: number;
  name: string;
  logo: string;
  shortName: string;
}

const clubs: Club[] = [
  { id: 1, name: "Арсенал", logo: arsenal, shortName: "ARS" },
  { id: 2, name: "Барановичи", logo: baranovichi, shortName: "BAR" },
  { id: 3, name: "БАТЭ", logo: bate, shortName: "BAT" },
  { id: 4, name: "Белшина", logo: belshina, shortName: "BEL" },
  { id: 5, name: "Витебск", logo: vitebsk, shortName: "VIT" },
  { id: 6, name: "Гомель", logo: gomel, shortName: "GOM" },
  { id: 7, name: "Динамо-Брест", logo: dinamoBrest, shortName: "DBR" },
  { id: 8, name: "Динамо-Минск", logo: dinamoMinsk, shortName: "DMI" },
  { id: 9, name: "Днепр-Могилев", logo: dnepr, shortName: "DNE" },
  { id: 10, name: "Ислочь", logo: isloch, shortName: "ISL" },
  { id: 11, name: "Минск", logo: minsk, shortName: "MIN" },
  { id: 12, name: "МЛ Витебск", logo: mlVitebsk, shortName: "MLV" },
  { id: 13, name: "Нафтан-Новополоцк", logo: naftan, shortName: "NAF" },
  { id: 14, name: "Неман", logo: neman, shortName: "NEM" },
  { id: 15, name: "Славия-Мозырь", logo: slavia, shortName: "SLA" },
  { id: 16, name: "Торпедо-БелАЗ", logo: torpedo, shortName: "TOR" },
];

const InfiniteClubCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const extendedClubs = [...clubs, ...clubs, ...clubs];
  const singleSetWidth = clubs.length * (CONFIG.itemWidth + CONFIG.itemGap);

  useEffect(() => {
    if (isDragging) return;

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      setScrollPosition((prev) => {
        let newPos = prev + (CONFIG.autoScrollSpeed * deltaTime) / 16;
        if (newPos >= singleSetWidth) {
          newPos = newPos - singleSetWidth;
        }
        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, singleSetWidth]);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeft(scrollPosition);
    lastTimeRef.current = 0;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const x = clientX;
    const walk = startX - x;
    let newPos = scrollLeft + walk;

    if (newPos < 0) {
      newPos = singleSetWidth + newPos;
    } else if (newPos >= singleSetWidth) {
      newPos = newPos - singleSetWidth;
    }

    setScrollPosition(newPos);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    lastTimeRef.current = 0;
  };

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  return (
    <div
      className="overflow-hidden cursor-grab active:cursor-grabbing select-none py-4"
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(-${scrollPosition}px)`,
          gap: `${CONFIG.itemGap}px`,
          transition: isDragging ? "none" : undefined,
        }}
      >
        {extendedClubs.map((club, index) => (
          <div
            key={`${club.id}-${index}`}
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: `${CONFIG.itemWidth}px`,
              height: `${CONFIG.itemHeight}px`,
              background: "#1A1924",
              border: "0.67px solid #363546",
              borderRadius: "12px",
              padding: "2.67px 10.67px",
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              {club.logo ? (
                <img src={club.logo} alt={club.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 rounded-[8px] flex items-center justify-center">
                  <span className="text-white text-[10px] font-medium">{club.shortName}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteClubCarousel;
