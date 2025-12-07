import { X, Plus, Flame } from "lucide-react";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import playerJerseyWhite from "@/assets/player-jersey-white.png";

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
      {allSlots.map((slot, idx) => {
        const isOccupied = !!slot.player;
        
        return (
          <div
            key={`${slot.position}-${slot.slotIndex}`}
            className="bg-card rounded-xl p-3 flex items-center gap-3"
          >
            {/* Jersey Icon */}
            <div className="relative flex-shrink-0">
              <img
                src={isOccupied ? playerJerseyTeam : playerJerseyWhite}
                alt={isOccupied ? slot.player?.name : "Empty"}
                className="w-10 h-10 object-contain"
              />
              {isOccupied && slot.player?.price && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-[#B855E4] text-white text-[8px] font-bold px-1.5 py-px rounded-full flex items-center gap-0.5">
                  <span className="text-[5px]">•</span>
                  <span>{slot.player.price.toFixed(1).replace('.', ',')}</span>
                  <span className="text-[5px]">•</span>
                </div>
              )}
              {!isOccupied && (
                <span className="absolute inset-0 flex items-center justify-center text-[#8B8B8B] text-[10px] font-medium">
                  {slot.position}
                </span>
              )}
            </div>

            {/* Player Info or Empty Slot */}
            <div className="flex-1 min-w-0">
              {isOccupied && slot.player ? (
                <div 
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => onPlayerClick?.(slot.player!)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">{slot.position}</span>
                    <span className="text-foreground font-medium truncate">{slot.player.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      {clubIcons[slot.player.team] && (
                        <img 
                          src={clubIcons[slot.player.team]} 
                          alt={slot.player.team}
                          className="w-4 h-4 object-contain"
                        />
                      )}
                      <span className="text-muted-foreground text-xs">{slot.player.team}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => onEmptySlotClick?.(slot.position)}
                >
                  <span className="text-muted-foreground text-sm">
                    {slot.label} {slot.slotIndex + 1}
                  </span>
                  <p className="text-muted-foreground/60 text-xs">Нажмите чтобы выбрать</p>
                </div>
              )}
            </div>

            {/* Points or Add Button */}
            {isOccupied && slot.player ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-primary">
                  <Flame className="w-4 h-4" />
                  <span className="font-medium">{slot.player.points}</span>
                </div>
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(slot.player!.id);
                    }}
                    className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onEmptySlotClick?.(slot.position)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 text-primary-foreground" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamListView;
