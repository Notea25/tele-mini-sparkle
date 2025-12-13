import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import { X, ArrowLeftRight, Plus } from "lucide-react";
import { getFormationSlots, getPlayerPosition, detectFormation } from "@/lib/formationUtils";

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

const truncateName = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

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
    <div
      className="w-[52px] aspect-[52/72] relative flex flex-col items-center cursor-pointer border border-white rounded-lg overflow-hidden"
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Price tag - top, no background */}
      <span className="text-white text-[clamp(6px,2vw,10px)] font-bold drop-shadow-md whitespace-nowrap leading-tight">
        $ {(player.price || 9).toFixed(1).replace(".", ",")}
      </span>

      {/* Action button - Delete if onRemovePlayer provided, otherwise Swap */}
      {showActionButton && onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute top-1 right-1 z-50 w-3 h-3 flex items-center justify-center bg-[#4a4a5a] rounded-full"
        >
          <X className="w-2 h-2 text-white" />
        </button>
      )}
      {showActionButton && !onRemovePlayer && onSwapPlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwapPlayer(player.id);
          }}
          className="absolute top-1 right-1 z-50 w-4 h-4 flex items-center justify-center bg-card rounded-md"
        >
          <ArrowLeftRight className="w-2.5 h-2.5 text-muted-foreground" />
        </button>
      )}

      {/* Jersey */}
      <img src={playerJerseyNew} alt={player.name} className="w-[80%] aspect-square object-contain" />

      {/* Player name and club blocks - overlapping jersey bottom */}
      <div className="rounded-[3px] overflow-hidden w-full -mt-[12%] relative z-10">
        <div className="bg-white px-[4%] py-[2%]">
          <span className="text-[clamp(5px,1.8vw,7px)] font-semibold text-black block truncate whitespace-nowrap text-center">
            {truncateName(player.name, 9)}
          </span>
        </div>
        <div className="bg-[#1a1a2e] px-[4%] py-[2%]">
          <span className="text-[clamp(4px,1.5vw,6px)] font-medium block truncate whitespace-nowrap text-center">
            <span className="text-[#7D7A94]">(Д)</span>
            <span className="text-white ml-[2%]">{truncateName(player.team, 7)}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const renderEmptySlot = (position: string, isOnBench: boolean, slotIndex: number) => (
    <div
      className="w-[52px] aspect-[3/4] rounded-lg border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center gap-[8%] cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
      onClick={() => onEmptySlotClick?.(position, isOnBench, slotIndex)}
    >
      <span className="text-white font-bold text-[clamp(10px,3vw,16px)]">
        {position}
      </span>
      <div className="w-[28%] aspect-square rounded-full bg-white/90 flex items-center justify-center">
        <Plus className="w-[60%] h-[60%] text-[#3a5a28]" />
      </div>
    </div>
  );

  return (
    <div>
      {/* Football Field */}
      <div className="relative w-full">
        <img
          src={footballFieldNew}
          alt="Football field"
          className="w-full"
        />
        
        {formation.map((slot, idx) => {
          const style = getPlayerPosition(slot.row, slot.col);
          const player = getPlayerForSlot(slot.position, slot.slotIndex);
          const isOccupied = !!player;

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