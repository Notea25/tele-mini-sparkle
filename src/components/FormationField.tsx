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

const FormationField = ({
  selectedPlayers = [],
  onRemovePlayer,
  onPlayerClick,
  onEmptySlotClick,
}: FormationFieldProps) => {
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
      2: "20%",
      3: "36%",
      4: "52%",
    };

    // Uniform spacing based on player count per row
    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: "37%", 4: "63%" }, // 2 players: symmetric around center
      2: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
      3: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
      4: { 2: "25%", 3: "50%", 4: "75%" }, // 3 players: equal thirds
    };

    return {
      top: topPositions[row],
      left: leftPositions[row][col],
    };
  };

  // Map position abbreviations
  const positionMap: Record<string, string> = {
    ВР: "ВР",
    ЗЩ: "ЗЩ",
    ПЗ: "ПЗ",
    НП: "НП",
  };

  // Get assigned player for a formation slot
  const getAssignedPlayer = (formationPos: FormationPosition, globalSlotIndex: number) => {
    // Find the slot index within the position
    const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      (s) => s.row === formationPos.row && s.col === formationPos.col,
    );

    // Find player assigned to this specific slot
    return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
  };

  return (
    <div className="relative w-full">
      <img src={footballFieldAll} alt="Football field" className="w-full" />
      {formation.map((slot, idx) => {
        const style = getPlayerStyle(slot.row, slot.col);
        const assignedPlayer = getAssignedPlayer(slot, idx);
        const isOccupied = !!assignedPlayer;
        const lengthCorrectFoo = (text: string, length: number, newLength) => {
          if (text.length > length) {
            return text.slice(0, newLength) + "...";
          } else {
            return text;
          }
        };

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
          {isOccupied ? (
              // Occupied slot with player
              <div className="relative w-12 h-16 flex flex-col items-center cursor-pointer" onClick={() => onPlayerClick?.(assignedPlayer)}>
                {/* Price tag - top left */}
                <div className="absolute -top-1 -left-1 z-30 bg-primary rounded px-1 py-0.5">
                  <span className="text-white text-[7px] font-bold">
                    {(assignedPlayer.price || 9).toFixed(1).replace(".", ",")}
                  </span>
                </div>
                
                {/* Delete button - top right */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(assignedPlayer.id);
                    }}
                    className="absolute -top-1 -right-1 z-50 w-4 h-4 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white/60" />
                  </button>
                )}

                {/* Jersey */}
                <img
                  src={playerJerseyTeam}
                  alt={assignedPlayer.name}
                  className="w-8 h-8 object-contain"
                />

                {/* Player name */}
                <div className="w-full text-center mt-0.5">
                  <span className="text-white text-[7px] font-medium truncate block">
                    {lengthCorrectFoo(assignedPlayer.name, 8, 7)}
                  </span>
                </div>

                {/* Team name */}
                <div className="bg-primary rounded-sm px-1 py-px">
                  <span className="text-[6px] font-medium flex items-center gap-0.5">
                    <span className="text-white/60">(Д)</span>
                    <span className="text-white">{lengthCorrectFoo(assignedPlayer.team, 7, 6)}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="w-12 h-16 cursor-pointer"
                onClick={() => onEmptySlotClick?.(slot.position)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormationField;
