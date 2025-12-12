import footballField from "@/assets/football-field.png";
import playerJerseyWhite from "@/assets/player-jersey-white.png";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import { X } from "lucide-react";
import tag from "@/assets/tag.webp";

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
      1: "4%",
      2: "20%",
      3: "36%",
      4: "52%",
    };

    // Equal spacing: columns 1-5, converted to 10%-90% range
    const getLeftPosition = (row: number, col: number, count: number): string => {
      if (count === 1) return "50%";
      const minCol = 1;
      const maxCol = 5;
      const gap = (maxCol - minCol) / (count - 1);
      const actualCol = minCol + (col - 1) * gap;
      const leftPercent = 10 + ((actualCol - 1) / 4) * 80;
      return `${leftPercent}%`;
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: getLeftPosition(1, 1, 2), 4: getLeftPosition(1, 2, 2) },
      2: { 1: getLeftPosition(2, 1, 5), 2: getLeftPosition(2, 2, 5), 3: getLeftPosition(2, 3, 5), 4: getLeftPosition(2, 4, 5), 5: getLeftPosition(2, 5, 5) },
      3: { 1: getLeftPosition(3, 1, 5), 2: getLeftPosition(3, 2, 5), 3: getLeftPosition(3, 3, 5), 4: getLeftPosition(3, 4, 5), 5: getLeftPosition(3, 5, 5) },
      4: { 2: getLeftPosition(4, 1, 3), 3: getLeftPosition(4, 2, 3), 4: getLeftPosition(4, 3, 3) },
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
      <img src={footballField} alt="Football field" className="w-full rounded-2xl" />
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
                {/* Delete button */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(assignedPlayer.id);
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
                    alt={assignedPlayer.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                  {/* Price tag */}
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <div className="relative">
                      <img src={tag} alt="price tag" className="w-auto h-5 object-contain" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">
                          {(assignedPlayer.price || 9).toFixed(1).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-0.5 cursor-pointer hover:opacity-80 rounded-[4.52px] shadow-sm overflow-hidden"
                  onClick={() => onPlayerClick?.(assignedPlayer)}
                >
                  <div className="flex items-center justify-center bg-white px-1.5 py-px w-[55px]">
                    <span className="text-[8px] font-bold truncate" style={{ color: "#212121" }}>
                      {assignedPlayer.name}
                    </span>
                  </div>

                  <div className="bg-primary px-1.5 py-px flex items-center justify-center w-[55px]">
                    <span className="text-white text-[8px] font-bold flex items-center gap-0.5">
                      <span className="text-[7px]" style={{ color: "#7D7A94" }}>
                        (Д)
                      </span>
                      <span style={{ color: "#212121" }}>{lengthCorrectFoo(assignedPlayer.team, 6, 5)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative cursor-pointer hover:opacity-80"
                onClick={() => onEmptySlotClick?.(slot.position)}
              >
                <img src={playerJerseyWhite} alt="Player" className="w-8 h-8 sm:w-9 sm:h-9" />
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
