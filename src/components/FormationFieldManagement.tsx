import footballField from "@/assets/football-field.png";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import playerJerseyWhite from "@/assets/player-jersey-white.png";
import { X, ArrowLeftRight } from "lucide-react";
import { getFormationSlots, getPlayerPosition, detectFormation, FormationKey } from "@/lib/formationUtils";

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
  maxBenchSize?: number;
  onPlayerClick?: (player: PlayerData) => void;
  onRemovePlayer?: (playerId: number) => void;
  onSwapPlayer?: (playerId: number) => void;
  onEmptySlotClick?: (position: string, isOnBench: boolean, slotIndex: number) => void;
}

const FormationFieldManagement = ({ 
  mainSquadPlayers, 
  benchPlayers,
  maxBenchSize = 4,
  onPlayerClick, 
  onRemovePlayer,
  onSwapPlayer,
  onEmptySlotClick
}: FormationFieldManagementProps) => {
  // Detect current formation based on players
  const currentFormation = detectFormation(mainSquadPlayers) || "1-4-4-2";
  const formation = getFormationSlots(currentFormation);

  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return mainSquadPlayers.find(p => p.position === position && p.slotIndex === slotIndex);
  };

  const renderPlayer = (player: PlayerData, showActionButton = true) => (
    <div className="relative flex flex-col items-center">
      {/* Action button - Delete if onRemovePlayer provided, otherwise Swap */}
      {showActionButton && onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute -top-1 -right-1 z-50 w-4 h-4 flex items-center justify-center bg-white/60 rounded-full"
        >
          <X className="w-2.5 h-2.5 text-black/70" />
        </button>
      )}
      {showActionButton && !onRemovePlayer && onSwapPlayer && (
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

  const renderEmptySlot = (position: string, isOnBench: boolean, slotIndex: number) => (
    <div
      className="relative cursor-pointer hover:opacity-80"
      onClick={() => onEmptySlotClick?.(position, isOnBench, slotIndex)}
    >
      <img src={playerJerseyWhite} alt="Empty slot" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
      <span className="absolute inset-0 flex items-center justify-center text-[#8B8B8B] text-[11px] font-medium">
        {position}
      </span>
    </div>
  );

  return (
    <div>
      {/* Football Field */}
      <div className="relative w-full">
        <img
          src={footballField}
          alt="Football field"
          className="w-full rounded-2xl"
        />
        
        {formation.map((slot, idx) => {
          const style = getPlayerPosition(slot.row, slot.col);
          const player = getPlayerForSlot(slot.position, slot.slotIndex);

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
              {player ? renderPlayer(player) : renderEmptySlot(slot.position, false, slot.slotIndex)}
            </div>
          );
        })}
      </div>

      {/* Bench section */}
      <div className="-mt-8 pb-6">
        <div className="bg-card/50 rounded-2xl p-4">
          <div className="flex gap-2 justify-between">
            {Array.from({ length: maxBenchSize }).map((_, idx) => {
              const player = benchPlayers[idx];
              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  {player ? renderPlayer(player) : renderEmptySlot("ЗАМ", true, idx)}
                </div>
              );
            })}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4">Замены</p>
        </div>
      </div>
    </div>
  );
};

export default FormationFieldManagement;
