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
}

interface FormationPosition {
  position: string;
  row: number;
  col: number;
}

interface FormationFieldProps {
  selectedPlayers?: PlayerData[];
  onRemovePlayer?: (playerId: number) => void;
}

const FormationField = ({ selectedPlayers = [], onRemovePlayer }: FormationFieldProps) => {
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
      1: "8%",
      2: "28%",
      3: "52%",
      4: "78%",
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: "38%", 4: "62%" },
      2: { 1: "15%", 2: "30%", 3: "50%", 4: "70%", 5: "85%" },
      3: { 1: "15%", 2: "30%", 3: "50%", 4: "70%", 5: "85%" },
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
  const getAssignedPlayer = (formationPos: FormationPosition, slotIndex: number) => {
    // Filter selected players by position
    const positionPlayers = selectedPlayers.filter(p => p.position === formationPos.position);
    // Get the player for this specific slot based on slot index within the position
    const slotsForPosition = formation.filter(f => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      s => s.row === formationPos.row && s.col === formationPos.col
    );
    return positionPlayers[slotPositionIndex];
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
            className="absolute flex flex-col items-center"
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
                    onClick={() => onRemovePlayer(assignedPlayer.id)}
                    className="absolute -top-1 -right-3 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-primary-foreground" />
                  </button>
                )}
                
                {/* Jersey with price tag */}
                <div className="relative">
                  <img
                    src={playerJerseyTeam}
                    alt={assignedPlayer.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  />
                  {/* Price tag */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {assignedPlayer.price || 9}
                  </div>
                </div>
                
                {/* Position and name */}
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-primary text-xs font-bold">
                    {assignedPlayer.position}
                  </span>
                  <span className="text-white text-xs font-semibold">
                    {assignedPlayer.name}
                  </span>
                </div>
              </div>
            ) : (
              // Empty slot
              <>
                <img
                  src={playerJerseyWhite}
                  alt="Player"
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
                <span className="text-white text-xs font-bold mt-0.5 drop-shadow-md">
                  {slot.position}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormationField;
