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
        <span className="w-8 flex-shrink-0"></span>
        <span className="flex-1">Игрок</span>
        <span className="w-6 flex-shrink-0"></span>
        <span className="w-12 flex-shrink-0 text-right">Очки</span>
        <span className="w-10 flex-shrink-0 text-right">Цена</span>
        <span className="w-6 ml-2 flex-shrink-0"></span>
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
                {/* Position badge */}
                <span className="w-8 flex-shrink-0 text-xs text-muted-foreground font-medium">
                  ({slot.position})
                </span>
                
                {/* Player name - flexible */}
                <div 
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                  onClick={() => onPlayerClick?.(slot.player!)}
                >
                  <span className="text-foreground font-medium truncate">{slot.player.name}</span>
                </div>
                
                
                {/* Club icon - fixed width */}
                <div className="w-6 flex-shrink-0 flex justify-center">
                  {clubIcons[slot.player.team] && (
                    <img 
                      src={clubIcons[slot.player.team]} 
                      alt={slot.player.team}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                </div>
                
                {/* Points - fixed width */}
                <div className="w-12 flex-shrink-0 flex items-center justify-end gap-1 text-primary">
                  <span className="text-sm font-medium">{slot.player.points}</span>
                </div>
                
                {/* Price - fixed width */}
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-right">
                  {slot.player.price?.toFixed(1)}
                </span>
                
                {/* Remove button - fixed width */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(slot.player!.id);
                    }}
                    className="w-6 h-6 ml-2 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Empty slot label - flexible */}
                <div 
                  className="flex-1 cursor-pointer hover:opacity-80"
                  onClick={() => onEmptySlotClick?.(slot.position)}
                >
                  <span className="text-muted-foreground text-sm">{slot.label}</span>
                </div>
                
                
                {/* Add button */}
                <button
                  onClick={() => onEmptySlotClick?.(slot.position)}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  <Plus className="w-3 h-3 text-primary-foreground" />
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
