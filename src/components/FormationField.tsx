import footballFieldAll from "@/assets/field-all-positions.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
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

  // Get assigned player for a formation slot
  const getAssignedPlayer = (formationPos: FormationPosition) => {
    // Find the slot index within the position
    const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      (s) => s.row === formationPos.row && s.col === formationPos.col,
    );

    // Find player assigned to this specific slot
    return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
  };

  const truncateName = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
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
              // Occupied slot with player - matches empty slot size
              <div className="w-[52px] h-[72px] relative flex flex-col items-center cursor-pointer" onClick={() => onPlayerClick?.(assignedPlayer)}>
                {/* Price tag - top center */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e] rounded-full px-2 py-0.5 border border-white whitespace-nowrap">
                  <span className="text-white text-[9px] font-bold">
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
                    className="absolute -top-1 -right-4 z-50 w-5 h-5 flex items-center justify-center bg-[#1a1a2e] rounded-full border border-white"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}

                {/* Jersey - fits the slot size */}
                <img
                  src={playerJerseyNew}
                  alt={assignedPlayer.name}
                  className="w-11 h-11 object-contain mt-1"
                />

                {/* Player name block - white background */}
                <div className="rounded-[4px] overflow-hidden w-full mt-0.5">
                  <div className="flex items-center justify-center bg-white px-1 py-0.5">
                    <span className="text-[8px] font-medium text-black truncate">
                      {truncateName(assignedPlayer.name, 10)}
                    </span>
                  </div>

                  {/* Club name block - dark background */}
                  <div className="bg-[#1a1a2e] px-1 py-0.5 flex items-center justify-center">
                    <span className="text-[7px] font-medium flex items-center gap-0.5">
                      <span className="text-[#7D7A94]">(Д)</span>
                      <span className="text-white">{truncateName(assignedPlayer.team, 8)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Empty slot - invisible clickable area over field design
              <div
                className="w-[52px] h-[72px] cursor-pointer"
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
