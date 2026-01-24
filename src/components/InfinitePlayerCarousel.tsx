import { useRef, useState } from "react";
import vakulichCard from "@/assets/cards/vakulich-card.png";
import kozlovCard from "@/assets/cards/kozlov-card.png";
import bykovCard from "@/assets/cards/bykov-card.png";
import karpovichCard from "@/assets/cards/karpovich-card.png";
import khvashchinskyCard from "@/assets/cards/khvashchinsky-card.png";
import gutorCard from "@/assets/cards/gutor-card.png";

// Configurable settings
const CONFIG = {
  itemGap: 12,
  itemWidth: 180,
};

interface PlayerCard {
  id: number;
  image: string;
}

// Player card images
const playerCards: PlayerCard[] = [
  { id: 1, image: gutorCard },
  { id: 2, image: khvashchinskyCard },
  { id: 3, image: karpovichCard },
  { id: 4, image: bykovCard },
  { id: 5, image: kozlovCard },
  { id: 6, image: vakulichCard },
];

const InfinitePlayerCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const handleDragStart = (clientX: number) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeftStart(containerRef.current.scrollLeft);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const walk = startX - clientX;
    containerRef.current.scrollLeft = scrollLeftStart + walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  return (
    <div
      className="overflow-x-auto cursor-grab active:cursor-grabbing select-none scrollbar-hide"
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div
        className="flex"
        style={{
          gap: `${CONFIG.itemGap}px`,
        }}
      >
        {playerCards.map((card) => (
          <div
            key={card.id}
            className="relative flex-shrink-0 rounded-xl overflow-hidden"
            style={{
              width: `${CONFIG.itemWidth}px`,
            }}
          >
            <img 
              src={card.image} 
              alt="Player card" 
              className="w-full h-auto object-contain rounded-xl"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfinitePlayerCarousel;
