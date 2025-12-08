import footballField from "@/assets/football-field.png";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import { ArrowLeftRight } from "lucide-react";

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

interface FormationFieldManagementProps {
  mainSquadPlayers: PlayerData[];
  benchPlayers: PlayerData[];
  onPlayerClick?: (player: PlayerData) => void;
  onSwapPlayer?: (playerId: number) => void;
}

const FormationFieldManagement = ({ 
  mainSquadPlayers, 
  benchPlayers,
  onPlayerClick, 
  onSwapPlayer 
}: FormationFieldManagementProps) => {
  // Formation 1-4-4-2: 1 GK, 4 DEF, 4 MID, 2 FWD = 11 players
  const formation = [
    // Row 1 - Goalkeeper (1)
    { position: "ВР", row: 1, col: 3, slotIndex: 0 },
    // Row 2 - Defenders (4)
    { position: "ЗЩ", row: 2, col: 1, slotIndex: 0 },
    { position: "ЗЩ", row: 2, col: 2, slotIndex: 1 },
    { position: "ЗЩ", row: 2, col: 4, slotIndex: 2 },
    { position: "ЗЩ", row: 2, col: 5, slotIndex: 3 },
    // Row 3 - Midfielders (4)
    { position: "ПЗ", row: 3, col: 1, slotIndex: 0 },
    { position: "ПЗ", row: 3, col: 2, slotIndex: 1 },
    { position: "ПЗ", row: 3, col: 4, slotIndex: 2 },
    { position: "ПЗ", row: 3, col: 5, slotIndex: 3 },
    // Row 4 - Forwards (2)
    { position: "НП", row: 4, col: 2, slotIndex: 0 },
    { position: "НП", row: 4, col: 4, slotIndex: 1 },
  ];

  const getPlayerStyle = (row: number, col: number) => {
    const topPositions: Record<number, string> = {
      1: "4%",
      2: "22%",
      3: "44%",
      4: "66%",
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 3: "50%" },
      2: { 1: "12%", 2: "32%", 4: "68%", 5: "88%" },
      3: { 1: "12%", 2: "32%", 4: "68%", 5: "88%" },
      4: { 2: "32%", 4: "68%" },
    };

    return {
      top: topPositions[row],
      left: leftPositions[row][col],
    };
  };

  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return mainSquadPlayers.find(p => p.position === position && p.slotIndex === slotIndex);
  };

  const renderPlayer = (player: PlayerData, showSwapButton = true) => (
    <div className="relative flex flex-col items-center">
      {/* Swap button */}
      {showSwapButton && onSwapPlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwapPlayer(player.id);
          }}
          className="absolute -top-1 -right-1 z-50 w-5 h-5 flex items-center justify-center bg-card rounded-md"
        >
          <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      
      {/* Jersey */}
      <div className="relative">
        <img
          src={playerJerseyTeam}
          alt={player.name}
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
        />
        {/* Price and points tag */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
          <span className="bg-[#B855E4] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {(player.price || 6.5).toFixed(1).replace('.', ',')}
          </span>
          <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {player.points}
          </span>
        </div>
      </div>
      
      {/* Position and name */}
      <div 
        className="flex items-center gap-0.5 mt-1.5 cursor-pointer hover:opacity-80 bg-white rounded-full px-2 py-0.5 min-w-max"
        onClick={() => onPlayerClick?.(player)}
      >
        <span className="text-black/60 text-[9px] font-medium">
          {player.position}
        </span>
        <span className="text-black text-[9px] font-medium whitespace-nowrap">
          {player.name}
        </span>
      </div>
      
      {/* Club badge */}
      <div className="bg-primary text-primary-foreground text-[8px] font-medium px-1.5 py-0.5 rounded-full flex items-center justify-center gap-0.5 mt-0.5">
        <span>(Д)</span>
        <span className="whitespace-nowrap">{player.team.length > 8 ? player.team.substring(0, 8) : player.team}</span>
      </div>
    </div>
  );

  return (
    <div className="px-4">
      {/* Football Field */}
      <div className="relative w-full">
        <img
          src={footballField}
          alt="Football field"
          className="w-full rounded-2xl"
        />
        
        {formation.map((slot, idx) => {
          const style = getPlayerStyle(slot.row, slot.col);
          const player = getPlayerForSlot(slot.position, slot.slotIndex);

          if (!player) return null;

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
              {renderPlayer(player)}
            </div>
          );
        })}
      </div>

      {/* Bench section */}
      <div className="-mt-2 pb-6">
        <div className="bg-card/50 rounded-2xl p-4">
          <div className="flex gap-2 justify-between">
            {benchPlayers.map((player) => (
              <div key={player.id} className="flex flex-col items-center flex-1">
                {renderPlayer(player)}
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4">Замены</p>
        </div>
      </div>
    </div>
  );
};

export default FormationFieldManagement;
