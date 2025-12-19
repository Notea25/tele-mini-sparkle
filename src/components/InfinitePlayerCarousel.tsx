import { useRef, useState } from "react";
import playerPlotnikov from "@/assets/player-plotnikov.png";
import clubSlavia from "@/assets/club-slavia.png";
import playerKozlov from "@/assets/players/michailKozlov.png";
import clubNeman from "@/assets/club-neman.png";
import playerBykov from "@/assets/player-bykov.png";
import clubDinamoBrest from "@/assets/club-dinamo-brest.png";

// Configurable settings
const CONFIG = {
  itemGap: 16, // gap between items in pixels
  itemWidth: 160, // card width in pixels
  itemHeight: 200, // card height in pixels
};

interface Player {
  id: number;
  name: string;
  points: number;
  position: string;
  clubBadge: string;
  photo: string;
}

// Mock player data - can be replaced with real data
const players: Player[] = [
  { id: 1, name: "Плотников", points: 9, position: "ВР", clubBadge: clubSlavia, photo: playerPlotnikov },
  { id: 3, name: "Козлов", points: 7, position: "ПЗ", clubBadge: clubNeman, photo: playerKozlov },
  { id: 4, name: "Быков", points: 9, position: "ПЗ", clubBadge: clubDinamoBrest, photo: playerBykov },
  { id: 5, name: "Бруй", points: 9, position: "ЗЩ", clubBadge: "", photo: "" },
  { id: 6, name: "Зубович", points: 9, position: "НП", clubBadge: "", photo: "" },
  { id: 7, name: "Савицкий", points: 8, position: "ПЗ", clubBadge: "", photo: "" },
  { id: 8, name: "Громыко", points: 7, position: "ЗЩ", clubBadge: "", photo: "" },
];

const InfinitePlayerCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  // Handle touch/mouse start
  const handleDragStart = (clientX: number) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeftStart(containerRef.current.scrollLeft);
  };

  // Handle touch/mouse move
  const handleDragMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const walk = startX - clientX;
    containerRef.current.scrollLeft = scrollLeftStart + walk;
  };

  // Handle touch/mouse end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
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

  // Touch events
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
        {players.map((player) => (
          <div
            key={player.id}
            className="relative flex-shrink-0 rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            style={{
              width: `${CONFIG.itemWidth}px`,
              height: `${CONFIG.itemHeight}px`,
            }}
          >
            {/* Club Badge - top right */}
            <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center overflow-hidden">
              {player.clubBadge ? (
                <img src={player.clubBadge} alt="Club" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-sm">🛡️</span>
              )}
            </div>

            {/* Player Photo */}
            <div className="w-full flex-1 flex items-center justify-center">
              {player.photo ? (
                <img src={player.photo} alt={player.name} className="w-full h-full object-contain object-bottom" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground">👤</span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="px-3 py-2">
              <p className="text-foreground font-semibold text-sm truncate">{player.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground text-xs">{player.points} очков</span>
                <span className="text-muted-foreground text-xs">{player.position}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfinitePlayerCarousel;
