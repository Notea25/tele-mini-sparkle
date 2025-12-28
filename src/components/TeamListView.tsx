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

// Position sections config
const POSITION_SECTIONS = [
  { position: "ВР", title: "Вратари", count: 2 },
  { position: "ЗЩ", title: "Защита", count: 5 },
  { position: "ПЗ", title: "Полузащита", count: 5 },
  { position: "НП", title: "Нападение", count: 3 },
];

const TeamListView = ({
  selectedPlayers,
  onRemovePlayer,
  onPlayerClick,
  onEmptySlotClick,
  clubIcons,
}: TeamListViewProps) => {
  // Get player for specific position and slot
  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return selectedPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
  };

  // Generate slots for a specific position
  const getSlotsForPosition = (position: string, count: number) => {
    const slots = [];
    for (let i = 0; i < count; i++) {
      const player = getPlayerForSlot(position, i);
      slots.push({ slotIndex: i, player });
    }
    return slots;
  };

  return (
    <div className="px-4 mt-4 space-y-6">
      {POSITION_SECTIONS.map((section) => {
        const slots = getSlotsForPosition(section.position, section.count);

        return (
          <div key={section.position}>
            {/* Section Title */}
            <h3 className="text-primary font-semibold text-lg mb-2">{section.title}</h3>

            {/* Column Headers */}
            <div className="flex items-center px-4 py-1 text-xs text-muted-foreground mb-1">
              <span className="flex-1">Игрок</span>
              <span className="w-12 text-center">Очки</span>
              <span className="w-10 text-center mr-10">Цена</span>
            </div>

            {/* Players */}
            <div className="space-y-2">
              {slots.map((slot) => {
                const isOccupied = !!slot.player;

                return (
                  <div
                    key={`${section.position}-${slot.slotIndex}`}
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
                          <span className="text-muted-foreground text-xs">{section.position}</span>
                        </div>

                        {/* Points */}
                        <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">
                          {slot.player.points}
                        </span>

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
                          onClick={() => onEmptySlotClick?.(section.position)}
                        >
                          <span className="text-muted-foreground text-sm">{section.title}</span>
                        </div>

                        {/* Placeholder for points and price columns */}
                        <span className="w-12 flex-shrink-0"></span>
                        <span className="w-10 flex-shrink-0"></span>

                        {/* Add button */}
                        <button
                          onClick={() => onEmptySlotClick?.(section.position)}
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
          </div>
        );
      })}
    </div>
  );
};

export default TeamListView;
