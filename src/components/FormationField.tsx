import footballFieldAll from "@/assets/field-all-positions.png";
import playerJerseyWhite from "@/assets/player-jersey-white.png";
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

  // Get position abbreviation for display
  const getPositionAbbr = (position: string) => {
    const map: Record<string, string> = {
      "ВР": "Г",
      "ЗЩ": "Д",
      "ПЗ": "П",
      "НП": "Н",
    };
    return map[position] || "Д";
  };

  // Get assigned player for a formation slot
  const getAssignedPlayer = (formationPos: FormationPosition) => {
    const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      (s) => s.row === formationPos.row && s.col === formationPos.col,
    );
    return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength - 1) + "...";
    }
    return text;
  };

  return (
    <div className="relative w-full">
      <img src={footballFieldAll} alt="Football field" className="w-full" />
      {formation.map((slot, idx) => {
        const style = getPlayerStyle(slot.row, slot.col);
        const assignedPlayer = getAssignedPlayer(slot);
        const isOccupied = !!assignedPlayer;

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
              // Occupied slot with player - matching reference design
              <div 
                className="relative flex flex-col items-center cursor-pointer"
                onClick={() => onPlayerClick?.(assignedPlayer)}
              >
                {/* Price badge - top left */}
                <div className="absolute -top-2 left-0 z-50 bg-primary rounded-full px-2 py-1 min-w-[40px] flex items-center justify-center">
                  <span className="text-xs font-bold text-white whitespace-nowrap">
                    $ {(assignedPlayer.price || 9).toFixed(1).replace(".", ",")}
                  </span>
                </div>

                {/* Delete button - top right */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(assignedPlayer.id);
                    }}
                    className="absolute -top-2 right-0 z-50 w-7 h-7 flex items-center justify-center bg-[#2d2d3a] rounded-full"
                  >
                    <X className="w-4 h-4 text-[#6b7280]" />
                  </button>
                )}

                {/* Jersey - larger size */}
                <img
                  src={playerJerseyWhite}
                  alt={assignedPlayer.name}
                  className="w-20 h-20 object-contain"
                />

                {/* Player name - white text */}
                <span className="text-white text-sm font-bold mt-1 text-center">
                  {assignedPlayer.name}
                </span>

                {/* Position and team badge - dark rounded background */}
                <div className="bg-[#1a1a2e] rounded-full px-3 py-1 mt-1">
                  <span className="text-sm font-medium">
                    <span className="text-[#7D7A94]">({getPositionAbbr(assignedPlayer.position)})</span>{" "}
                    <span className="text-white">{truncateText(assignedPlayer.team, 10)}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="w-20 h-28 cursor-pointer"
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
