import footballFieldAll from "@/assets/field-all-positions.png";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import { X } from "lucide-react";

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price?: number;
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

interface FormationFieldTransfersProps {
  players: PlayerData[];
  onPlayerClick?: (player: PlayerData) => void;
  onRemovePlayer?: (playerId: number) => void;
  onEmptySlotClick?: (position: string, slotIndex: number) => void;
}

// Fixed formation for transfers: 2 GK, 5 DEF, 5 MID, 3 FWD = 15 players
const TRANSFERS_FORMATION = {
  "ВР": { count: 2, row: 1 },
  "ЗЩ": { count: 5, row: 2 },
  "ПЗ": { count: 5, row: 3 },
  "НП": { count: 3, row: 4 },
};

// Get left percentage positions based on number of players in a row - uniform spacing
function getColumnPositions(count: number): number[] {
  switch (count) {
    case 1: return [50]; // Center
    case 2: return [37, 63]; // Symmetric around center
    case 3: return [25, 50, 75]; // Equal thirds
    case 4: return [12.5, 37.5, 62.5, 87.5]; // Equal quarters
    case 5: return [10, 30, 50, 70, 90]; // Equal fifths
    default: return [50];
  }
}

// Get CSS positioning for a player on the field
const getPlayerPosition = (row: number, col: number) => {
  const topPositions: Record<number, string> = {
    1: "2%",
    2: "24%",
    3: "48%",
    4: "72%",
  };

  return {
    top: topPositions[row],
    left: `${col}%`,
  };
};

const FormationFieldTransfers = ({ 
  players,
  onPlayerClick, 
  onRemovePlayer,
  onEmptySlotClick
}: FormationFieldTransfersProps) => {
  
  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return players.find(p => p.position === position && p.slotIndex === slotIndex);
  };

  const renderPlayer = (player: PlayerData) => (
    <div className="relative flex flex-col items-center">
      {/* Remove button */}
      {onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute -top-1 -right-1 z-50 w-4 h-4 flex items-center justify-center bg-white/60 rounded-full"
        >
          <X className="w-2.5 h-2.5 text-black/70" />
        </button>
      )}
      
      {/* Jersey */}
      <div className="relative">
        <img
          src={playerJerseyTeam}
          alt={player.name}
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
        />
      </div>
      
      {/* Player info card */}
      <div 
        className="mt-0.5 cursor-pointer hover:opacity-80 rounded-md shadow-sm overflow-hidden"
        onClick={() => onPlayerClick?.(player)}
      >
        <div className="flex items-center justify-center bg-white px-2 py-1 min-w-[60px]">
          <span className="text-[9px] font-bold truncate text-[#212121]">
            {player.name}
          </span>
        </div>

        <div className="bg-secondary px-2 py-1 flex items-center justify-center min-w-[60px]">
          <span className="text-[8px] font-bold flex items-center gap-0.5">
            <span className="text-muted-foreground">(Д)</span>
            <span className="text-foreground">{player.team.length > 9 ? player.team.substring(0, 8) + "..." : player.team}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const renderEmptySlot = (position: string, slotIndex: number) => (
    <div
      className="w-12 h-16 cursor-pointer"
      onClick={() => onEmptySlotClick?.(position, slotIndex)}
    />
  );

  // Generate all slots for the fixed formation
  const generateSlots = () => {
    const slots: { position: string; row: number; col: number; slotIndex: number }[] = [];
    
    for (const [position, config] of Object.entries(TRANSFERS_FORMATION)) {
      const cols = getColumnPositions(config.count);
      for (let i = 0; i < config.count; i++) {
        slots.push({ position, row: config.row, col: cols[i], slotIndex: i });
      }
    }
    
    return slots;
  };

  const allSlots = generateSlots();

  return (
    <div className="relative w-full">
      <img
        src={footballFieldAll}
        alt="Football field"
        className="w-full"
      />
      
      {allSlots.map((slot, idx) => {
        const style = getPlayerPosition(slot.row, slot.col);
        const player = getPlayerForSlot(slot.position, slot.slotIndex);

        return (
          <div
            key={idx}
            className="absolute flex flex-col items-center z-20"
            style={{
              top: style.top,
              left: style.left,
              transform: "translateX(-50%)",
            }}
          >
            {player ? renderPlayer(player) : renderEmptySlot(slot.position, slot.slotIndex)}
          </div>
        );
      })}
    </div>
  );
};

export default FormationFieldTransfers;
