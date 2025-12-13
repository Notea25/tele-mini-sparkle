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

  const truncateName = (text: string, maxLen: number) => {
    return text.length > maxLen ? text.slice(0, maxLen - 1) + "..." : text;
  };

  const renderPlayer = (player: PlayerData) => (
    <div className="relative flex flex-col items-center">
      {/* Price badge - top left */}
      <div className="absolute -top-1 -left-2 z-30 bg-[#00C853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        $ {(player.price || 6.5).toFixed(1).replace('.', ',')}
      </div>
      
      {/* Remove button - top right */}
      {onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute -top-1 -right-2 z-50 w-5 h-5 flex items-center justify-center bg-[#00C853] rounded-full"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Jersey */}
      <img
        src={playerJerseyTeam}
        alt={player.name}
        className="w-14 h-14 sm:w-16 sm:h-16 object-contain mt-2"
        onClick={() => onPlayerClick?.(player)}
      />

      {/* Player name */}
      <div 
        className="mt-1 cursor-pointer hover:opacity-80"
        onClick={() => onPlayerClick?.(player)}
      >
        <span className="text-white text-[11px] font-bold">
          {player.name}
        </span>
      </div>
      
      {/* Position and team - bottom badge */}
      <div className="bg-[#1A1A2E] px-2 py-0.5 rounded-full flex items-center justify-center gap-1 mt-0.5">
        <span className="text-[#7D7A94] text-[9px] font-medium">
          (Д)
        </span>
        <span className="text-white text-[9px] font-medium">
          {truncateName(player.team, 10)}
        </span>
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
