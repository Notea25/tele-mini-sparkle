import footballField from "@/assets/football-field.png";
import playerJerseyWhite from "@/assets/player-jersey-white.png";
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
}

interface FormationPosition {
  position: string;
  row: number;
  col: number;
}

interface FormationFieldProps {
  selectedPlayers?: PlayerData[];
  onRemovePlayer?: (playerId: number) => void;
  onPlayerClick?: (player: PlayerData) => void;
  onEmptySlotClick?: (position: string) => void;
}

const FormationField = ({ selectedPlayers = [], onRemovePlayer, onPlayerClick, onEmptySlotClick }: FormationFieldProps) => {
  // Formation: 2 ВР (goalkeepers), 5 ЗЩ (defenders), 5 ПЗ (midfielders), 3 НП (forwards)
  const formation: FormationPosition[] = [
    // Row 1 - Goalkeepers (top)
    { position: "ВР", row: 1, col: 2 },
    { position: "ВР", row: 1, col: 4 },
    // Row 2 - Defenders
    { position: "ЗЩ", row: 2, col: 1 },
    { position: "ЗЩ", row: 2, col: 2 },
    { position: "ЗЩ", row: 2, col: 3 },
    { position: "ЗЩ", row: 2, col: 4 },
    { position: "ЗЩ", row: 2, col: 5 },
    // Row 3 - Midfielders
    { position: "ПЗ", row: 3, col: 1 },
    { position: "ПЗ", row: 3, col: 2 },
    { position: "ПЗ", row: 3, col: 3 },
    { position: "ПЗ", row: 3, col: 4 },
    { position: "ПЗ", row: 3, col: 5 },
    // Row 4 - Forwards (bottom)
    { position: "НП", row: 4, col: 2 },
    { position: "НП", row: 4, col: 3 },
    { position: "НП", row: 4, col: 4 },
  ];

  const getPlayerStyle = (row: number, col: number) => {
    const topPositions: Record<number, string> = {
      1: "4%",
      2: "20%",
      3: "36%",
      4: "52%",
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: "37%", 4: "63%" },
      2: { 1: "14%", 2: "30%", 3: "50%", 4: "70%", 5: "86%" },
      3: { 1: "14%", 2: "30%", 3: "50%", 4: "70%", 5: "86%" },
      4: { 2: "30%", 3: "50%", 4: "70%" },
    };

    return {
      top: topPositions[row],
      left: leftPositions[row][col],
    };
  };

  // Map position abbreviations
  const positionMap: Record<string, string> = {
    "ВР": "ВР",
    "ЗЩ": "ЗЩ",
    "ПЗ": "ПЗ",
    "НП": "НП",
  };

  // Get assigned player for a formation slot
  const getAssignedPlayer = (formationPos: FormationPosition, globalSlotIndex: number) => {
    // Find the slot index within the position
    const slotsForPosition = formation.filter(f => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      s => s.row === formationPos.row && s.col === formationPos.col
    );
    
    // Find player assigned to this specific slot
    return selectedPlayers.find(p => 
      p.position === formationPos.position && p.slotIndex === slotPositionIndex
    );
  };

  return (
    <div className="relative w-full">
      <img
        src={footballField}
        alt="Football field"
        className="w-full rounded-2xl"
      />
      {formation.map((slot, idx) => {
        const style = getPlayerStyle(slot.row, slot.col);
        const assignedPlayer = getAssignedPlayer(slot, idx);
        const isOccupied = !!assignedPlayer;

        return (
          <div
            key={idx}
            className={`absolute flex flex-col items-center ${isOccupied ? 'z-20' : 'z-10'}`}
            style={{
              top: style.top,
              left: style.left,
              transform: "translateX(-50%)",
            }}
          >
          {isOccupied ? (
              // Occupied slot with player
              <div className="relative flex flex-col items-center">
                {/* Delete button */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(assignedPlayer.id);
                    }}
                    className="absolute -top-1 -right-1 z-50 w-4 h-4 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
                
                {/* Jersey */}
                <div className="relative">
                  <img
                    src={playerJerseyTeam}
                    alt={assignedPlayer.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                  {/* Price tag */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#B855E4] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <span className="text-[6px]">•</span>
                    <span>{(assignedPlayer.price || 9).toFixed(1).replace('.', ',')}</span>
                    <span className="text-[6px]">•</span>
                  </div>
                </div>
                
                {/* Position and name */}
                <div 
                  className="flex items-center gap-1 mt-1.5 cursor-pointer hover:opacity-80"
                  onClick={() => onPlayerClick?.(assignedPlayer)}
                >
                  <span className="text-muted-foreground text-[10px] font-medium">
                    {assignedPlayer.position}
                  </span>
                  <span className="text-white text-[10px] font-medium">
                    {assignedPlayer.name}
                  </span>
                </div>
                
                {/* Club badge */}
                <div className="bg-primary text-primary-foreground text-[8px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 mt-0.5">
                  <span className="text-[8px]">(Д)</span>
                  <span>{assignedPlayer.team}</span>
                </div>
              </div>
            ) : (
              // Empty slot
              <div 
                className="relative cursor-pointer hover:opacity-80"
                onClick={() => onEmptySlotClick?.(slot.position)}
              >
                <img
                  src={playerJerseyWhite}
                  alt="Player"
                  className="w-8 h-8 sm:w-9 sm:h-9"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[#8B8B8B] text-[11px] font-medium -translate-x-0.5">
                  {slot.position}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormationField;
