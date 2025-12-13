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
              <div className="relative flex flex-col items-center">
                {/* Top row: Price + Delete button */}
                <div className="flex items-center gap-1 mb-1">
                  {/* Price tag */}
                  <span className="bg-[#E855B0] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    $ {(assignedPlayer.price || 6.5).toFixed(1).replace(".", ",")}
                  </span>
                  
                  {/* Delete button */}
                  {onRemovePlayer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePlayer(assignedPlayer.id);
                      }}
                      className="w-5 h-5 flex items-center justify-center bg-primary rounded-full"
                    >
                      <X className="w-3 h-3 text-primary-foreground" />
                    </button>
                  )}
                </div>

                {/* Jersey */}
                <img
                  src={playerJerseyTeam}
                  alt={assignedPlayer.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />

                {/* Player info card */}
                <div
                  className="mt-1 cursor-pointer hover:opacity-80 rounded-lg overflow-hidden"
                  onClick={() => onPlayerClick?.(assignedPlayer)}
                >
                  <div className="flex items-center justify-center bg-white px-3 py-1 min-w-[70px]">
                    <span className="text-[10px] font-bold truncate text-[#1a1a1a]">
                      {assignedPlayer.name}
                    </span>
                  </div>

                  <div className="bg-[#2a2a2e] px-3 py-1 flex items-center justify-center min-w-[70px]">
                    <span className="text-[9px] font-semibold flex items-center gap-1">
                      <span className="text-[#7a7a7a]">(Д)</span>
                      <span className="text-white">{lengthCorrectFoo(assignedPlayer.team, 10, 9)}</span>
                    </span>
                  </div>
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
