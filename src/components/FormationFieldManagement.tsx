import footballField from "@/assets/football-field.png";
import playerJerseyTeamNew from "@/assets/player-jersey-team-new.png";
import clubLogo from "@/assets/club-logo.png";
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
      1: "2%",
      2: "24%",
      3: "46%",
      4: "68%",
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 3: "50%" },
      2: { 1: "10%", 2: "30%", 4: "70%", 5: "90%" },
      3: { 1: "10%", 2: "30%", 4: "70%", 5: "90%" },
      4: { 2: "33%", 4: "67%" },
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
          className="absolute -top-1 -right-3 z-50 w-5 h-5 flex items-center justify-center bg-card rounded-md shadow-sm"
        >
          <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      
      {/* Jersey with price and points badges */}
      <div className="relative">
        <img
          src={playerJerseyTeamNew}
          alt={player.name}
          className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
        />
        {/* Price badge (left - green) */}
        <div className="absolute bottom-0 left-0 -translate-x-1/4 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[28px] text-center">
          {(player.price || 6.5).toFixed(1).replace('.', ',')}
        </div>
        {/* Points badge (right - with icon) */}
        <div className="absolute bottom-0 right-0 translate-x-1/4 bg-[#2D3748] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 min-w-[28px] justify-center">
          <img src={clubLogo} alt="" className="w-3 h-3" />
          <span>{player.points}</span>
        </div>
      </div>
      
      {/* Position and name - white rounded pill */}
      <div 
        className="flex items-center gap-1 mt-1 cursor-pointer hover:opacity-80 bg-white rounded-full px-2 py-0.5 shadow-sm"
        onClick={() => onPlayerClick?.(player)}
      >
        <span className="text-muted-foreground text-[9px] font-medium">
          {player.position}
        </span>
        <span className="text-foreground text-[9px] font-semibold whitespace-nowrap">
          {player.name.length > 10 ? player.name.substring(0, 10) : player.name}
        </span>
      </div>
      
      {/* Club badge - green rounded pill */}
      <div className="bg-primary text-primary-foreground text-[8px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5 mt-0.5">
        <span>(Д)</span>
        <span className="whitespace-nowrap">{player.team.length > 10 ? player.team.substring(0, 10) : player.team}</span>
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
      <div className="mt-4 pb-6">
        <div className="bg-card/50 rounded-2xl p-4">
          <div className="flex gap-2 justify-between">
            {benchPlayers.map((player) => (
              <div key={player.id} className="flex flex-col items-center flex-1">
                {renderPlayer(player)}
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4 italic">Замены</p>
        </div>
      </div>
    </div>
  );
};

export default FormationFieldManagement;
