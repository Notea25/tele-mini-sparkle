import { X, Plus } from "lucide-react";


interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price?: number;
  slotIndex?: number;
}

interface TeamListViewProps {
  selectedPlayers: PlayerData[];
  onRemovePlayer?: (playerId: number) => void;
  onPlayerClick?: (player: PlayerData) => void;
  onEmptySlotClick?: (position: string) => void;
  clubIcons: Record<string, string>;
}

// Formation slots per position
const POSITION_CONFIG = [
  { position: "ВР", label: "Вратарь", count: 2 },
  { position: "ЗЩ", label: "Защитник", count: 5 },
  { position: "ПЗ", label: "Полузащитник", count: 5 },
  { position: "НП", label: "Нападающий", count: 3 },
];

const TeamListView = ({ 
  selectedPlayers, 
  onRemovePlayer, 
  onPlayerClick, 
  onEmptySlotClick,
  clubIcons 
}: TeamListViewProps) => {
  
  // Get player for specific position and slot
  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return selectedPlayers.find(p => p.position === position && p.slotIndex === slotIndex);
  };

  // Generate all slots
  const allSlots: { position: string; label: string; slotIndex: number; player?: PlayerData }[] = [];
  
  POSITION_CONFIG.forEach(config => {
    for (let i = 0; i < config.count; i++) {
      const player = getPlayerForSlot(config.position, i);
      allSlots.push({
        position: config.position,
        label: config.label,
        slotIndex: i,
        player,
      });
    }
  });

  return (
    <div className="px-4 mt-4 space-y-2">
      {/* Column Headers */}
      <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
        <span className="flex-1">Игрок</span>
        <span className="w-12 text-right mr-2">Очки</span>
        <span className="w-10 text-right mr-8">Цена</span>
      </div>
      
      {allSlots.map((slot, idx) => {
        const isOccupied = !!slot.player;
        
        return (
          <div
            key={`${slot.position}-${slot.slotIndex}`}
            className="bg-card rounded-full px-4 py-2 flex items-center"
          >
            {isOccupied && slot.player ? (
              <>
                {/* Club logo + Player name + position */}
                <div 
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                  onClick={() => onPlayerClick?.(slot.player!)}
                >
                  {clubIcons[slot.player.team] && (
                    <img 
                      src={clubIcons[slot.player.team]} 
                      alt={slot.player.team}
                      className="w-5 h-5 object-contain flex-shrink-0"
                    />
                  )}
                  <span className="text-foreground font-medium truncate">{slot.player.name}</span>
                  <span className="text-muted-foreground text-xs">{slot.position}</span>
                </div>
                
                {/* Points */}
                <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">{slot.player.points}</span>
                
                {/* Price */}
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">
                  {slot.player.price?.toFixed(1)}
                </span>
                
                {/* Remove button */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(slot.player!.id);
                    }}
                    className="w-8 h-8 ml-2 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Empty slot label */}
                <div 
                  className="flex-1 cursor-pointer hover:opacity-80"
                  onClick={() => onEmptySlotClick?.(slot.position)}
                >
                  <span className="text-muted-foreground text-sm">{slot.label}</span>
                </div>
                
                {/* Placeholder for points and price columns */}
                <span className="w-12 flex-shrink-0"></span>
                <span className="w-10 flex-shrink-0"></span>
                
                {/* Add button */}
                <button
                  onClick={() => onEmptySlotClick?.(slot.position)}
                  className="w-8 h-8 ml-2 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamListView;
