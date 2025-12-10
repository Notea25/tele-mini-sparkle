import { useRef, useEffect, useState } from "react";

// Configurable settings
const CONFIG = {
  autoScrollSpeed: 0.5, // pixels per frame
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
  { id: 1, name: "Плотников", points: 9, position: "ВР", clubBadge: "🛡️", photo: "" },
  { id: 2, name: "Гиберо", points: 6, position: "НП", clubBadge: "🛡️", photo: "" },
  { id: 3, name: "Козлов", points: 7, position: "ПЗ", clubBadge: "🛡️", photo: "" },
  { id: 4, name: "Быков", points: 9, position: "ПЗ", clubBadge: "🛡️", photo: "" },
  { id: 5, name: "Бруй", points: 9, position: "ЗЩ", clubBadge: "🛡️", photo: "" },
  { id: 6, name: "Зубович", points: 9, position: "НП", clubBadge: "🛡️", photo: "" },
  { id: 7, name: "Савицкий", points: 8, position: "ПЗ", clubBadge: "🛡️", photo: "" },
  { id: 8, name: "Громыко", points: 7, position: "ЗЩ", clubBadge: "🛡️", photo: "" },
];

const InfinitePlayerCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Triple the items for seamless looping
  const extendedPlayers = [...players, ...players, ...players];
  const singleSetWidth = players.length * (CONFIG.itemWidth + CONFIG.itemGap);

  // Auto-scroll animation
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
        // Reset position when we've scrolled past one full set
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

  // Handle touch/mouse start
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setScrollLeft(scrollPosition);
    lastTimeRef.current = 0;
  };

  // Handle touch/mouse move
  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const x = clientX;
    const walk = startX - x;
    let newPos = scrollLeft + walk;
    
    // Handle wrapping
    if (newPos < 0) {
      newPos = singleSetWidth + newPos;
    } else if (newPos >= singleSetWidth) {
      newPos = newPos - singleSetWidth;
    }
    
    setScrollPosition(newPos);
  };

  // Handle touch/mouse end
  const handleDragEnd = () => {
    setIsDragging(false);
    lastTimeRef.current = 0;
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
      className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
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
        {extendedPlayers.map((player, index) => (
          <div
            key={`${player.id}-${index}`}
            className="flex-shrink-0 rounded-2xl bg-card border border-border overflow-hidden"
            style={{
              width: `${CONFIG.itemWidth}px`,
              height: `${CONFIG.itemHeight}px`,
            }}
          >
            {/* Club Badge */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
              {player.clubBadge}
            </div>
            
            {/* Player Photo Placeholder */}
            <div 
              className="w-full bg-gradient-to-b from-muted/30 to-card flex items-center justify-center"
              style={{ height: `${CONFIG.itemHeight - 60}px` }}
            >
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
                <span className="text-3xl text-muted-foreground">👤</span>
              </div>
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
