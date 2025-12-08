import footballField from "@/assets/football-field.png";
import playerJerseyWhite from "@/assets/player-jersey-white.png";
import playerJerseyTeamNew from "@/assets/player-jersey-team-new.png";
import { X } from "lucide-react";
import clubLogo from "@/assets/club-logo.png";

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
      1: "2%",
      2: "24%",
      3: "46%",
      4: "68%",
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: "33%", 4: "67%" },
      2: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" },
      3: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" },
      4: { 2: "25%", 3: "50%", 4: "75%" },
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
              // Occupied slot with player - new design matching reference
              <div className="relative flex flex-col items-center">
                {/* Delete button */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(assignedPlayer.id);
                    }}
                    className="absolute -top-1 -right-3 z-50 w-5 h-5 flex items-center justify-center bg-card rounded-md shadow-sm"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
                
                {/* Jersey with price and points badges */}
                <div className="relative">
                  <img
                    src={playerJerseyTeamNew}
                    alt={assignedPlayer.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  {/* Price badge (left - green) */}
                  <div className="absolute bottom-0 left-0 -translate-x-1/4 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[28px] text-center">
                    {(assignedPlayer.price || 6.5).toFixed(1).replace('.', ',')}
                  </div>
                  {/* Points badge (right - with icon) */}
                  <div className="absolute bottom-0 right-0 translate-x-1/4 bg-[#2D3748] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 min-w-[28px] justify-center">
                    <img src={clubLogo} alt="" className="w-3 h-3" />
                    <span>{assignedPlayer.points}</span>
                  </div>
                </div>
                
                {/* Position and name - white rounded pill */}
                <div 
                  className="flex items-center gap-1 mt-1 cursor-pointer hover:opacity-80 bg-white rounded-full px-2 py-0.5 shadow-sm"
                  onClick={() => onPlayerClick?.(assignedPlayer)}
                >
                  <span className="text-muted-foreground text-[9px] font-medium">
                    {assignedPlayer.position}
                  </span>
                  <span className="text-foreground text-[9px] font-semibold whitespace-nowrap">
                    {assignedPlayer.name.length > 10 ? assignedPlayer.name.substring(0, 10) : assignedPlayer.name}
                  </span>
                </div>
                
                {/* Club badge - green rounded pill */}
                <div className="bg-primary text-primary-foreground text-[8px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5 mt-0.5">
                  <span>(Д)</span>
                  <span className="whitespace-nowrap">{assignedPlayer.team.length > 10 ? assignedPlayer.team.substring(0, 10) : assignedPlayer.team}</span>
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
