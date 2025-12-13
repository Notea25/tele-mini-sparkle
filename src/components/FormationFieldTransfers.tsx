import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import { X, Plus } from "lucide-react";

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
    case 1: return [50];
    case 2: return [37, 63];
    case 3: return [25, 50, 75];
    case 4: return [12.5, 37.5, 62.5, 87.5];
    case 5: return [10, 30, 50, 70, 90];
    default: return [50];
  }
}

// Get CSS positioning for a player on the field
const getPlayerPosition = (row: number, col: number) => {
  const topPositions: Record<number, string> = {
    1: "2%",
    2: "20%",
    3: "36%",
    4: "52%",
  };

  return {
    top: topPositions[row],
    left: `${col}%`,
  };
};

const truncateName = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
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
    <div
      className="w-[62px] relative flex flex-col items-center cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Delete button - absolute in corner */}
      {onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute top-1 right-1 z-50 w-3 h-3 flex items-center justify-center bg-[#5a7a4a] rounded-full"
        >
          <X className="w-2 h-2 text-[#1a2e1a]" />
        </button>
      )}

      {/* Price centered */}
      <div className="w-full flex items-center justify-center pt-1 pb-0.5">
        <span className="text-white text-[clamp(8px,2.2vw,12px)] font-medium drop-shadow-md whitespace-nowrap leading-tight">
          ${(player.price || 9).toFixed(1)}
        </span>
      </div>

      {/* Jersey - larger size, overlaps name/club below */}
      <img src={playerJerseyNew} alt={player.name} className="w-[130%] h-auto object-contain mb-[-35%] z-0" />

      {/* Player name and club blocks - jersey overlaps from above */}
      <div className="w-full relative z-10">
        <div className="bg-white px-[4%] py-[2%]">
          <span className="text-[clamp(5px,1.8vw,7px)] font-semibold text-black block truncate whitespace-nowrap text-center">
            {truncateName(player.name, 9)}
          </span>
        </div>
        <div className="bg-[#1a1a2e] px-[4%] py-[2%]">
          <span className="text-[clamp(4px,1.5vw,6px)] font-medium block truncate whitespace-nowrap text-center">
            <span className="text-[#7D7A94]">(Д)</span>
            <span className="text-white ml-[2%]">{truncateName(player.team, 7)}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const renderEmptySlot = (position: string, slotIndex: number) => (
    <div
      className="w-[62px] h-[85px] rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center gap-[8%] cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
      onClick={() => onEmptySlotClick?.(position, slotIndex)}
    >
      <span className="text-white font-bold text-[clamp(11px,3vw,17px)]">
        {position}
      </span>
      <div className="w-[28%] aspect-square rounded-full bg-white/90 flex items-center justify-center">
        <Plus className="w-[60%] h-[60%] text-[#3a5a28]" />
      </div>
    </div>
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
        src={footballFieldNew}
        alt="Football field"
        className="w-full"
      />
      
      {allSlots.map((slot, idx) => {
        const style = getPlayerPosition(slot.row, slot.col);
        const player = getPlayerForSlot(slot.position, slot.slotIndex);
        const isOccupied = !!player;

        return (
          <div
            key={idx}
            className={`absolute flex flex-col items-center ${isOccupied ? "z-20" : "z-10"}`}
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