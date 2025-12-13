import field1343 from "@/assets/field-1-3-4-3.png";
import field1352 from "@/assets/field-1-3-5-2.png";
import field1433 from "@/assets/field-1-4-3-3.png";
import field1442 from "@/assets/field-1-4-4-2.png";
import field1451 from "@/assets/field-1-4-5-1.png";
import field1523 from "@/assets/field-1-5-2-3.png";
import field1532 from "@/assets/field-1-5-3-2.png";
import field1541 from "@/assets/field-1-5-4-1.png";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import { X, ArrowLeftRight } from "lucide-react";
import { getFormationSlots, getPlayerPosition, detectFormation, FormationKey } from "@/lib/formationUtils";

const FIELD_IMAGES: Record<string, string> = {
  "1-3-4-3": field1343,
  "1-3-5-2": field1352,
  "1-4-3-3": field1433,
  "1-4-4-2": field1442,
  "1-4-5-1": field1451,
  "1-5-2-3": field1523,
  "1-5-3-2": field1532,
  "1-5-4-1": field1541,
};

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

  const truncateName = (text: string, maxLen: number) => {
    return text.length > maxLen ? text.slice(0, maxLen - 1) + "..." : text;
  };

  const renderPlayer = (player: PlayerData, showActionButton = true) => (
    <div className="relative flex flex-col items-center">
      {/* Price badge - top left */}
      <div className="absolute -top-1 -left-2 z-30 bg-[#00C853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        $ {(player.price || 6.5).toFixed(1).replace('.', ',')}
      </div>
      
      {/* Action button - Delete if onRemovePlayer provided, otherwise Swap - top right */}
      {showActionButton && onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute -top-1 -right-2 z-50 w-5 h-5 flex items-center justify-center bg-[#00C853] rounded-full"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
      {showActionButton && !onRemovePlayer && onSwapPlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwapPlayer(player.id);
          }}
          className="absolute -top-1 -right-2 z-50 w-5 h-5 flex items-center justify-center bg-[#00C853] rounded-full"
        >
          <ArrowLeftRight className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Jersey */}
      <img
        src={playerJerseyTeam}
        alt={player.name}
        className="w-14 h-14 sm:w-16 sm:h-16 object-contain mt-2"
        onClick={() => onPlayerClick?.(player)}
      />

      {/* Player name */}
      <div 
        className="mt-1 cursor-pointer hover:opacity-80"
        onClick={() => onPlayerClick?.(player)}
      >
        <span className="text-white text-[11px] font-bold">
          {player.name}
        </span>
      </div>
      
      {/* Position and team - bottom badge */}
      <div className="bg-[#1A1A2E] px-2 py-0.5 rounded-full flex items-center justify-center gap-1 mt-0.5">
        <span className="text-[#7D7A94] text-[9px] font-medium">
          (Д)
        </span>
        <span className="text-white text-[9px] font-medium">
          {truncateName(player.team, 10)}
        </span>
      </div>
    </div>
  );

  const renderEmptySlot = (position: string, isOnBench: boolean, slotIndex: number) => (
    <div
      className="w-12 h-16 cursor-pointer"
      onClick={() => onEmptySlotClick?.(position, isOnBench, slotIndex)}
    />
  );

  return (
    <div>
      {/* Football Field */}
      <div className="relative w-full">
        <img
          src={FIELD_IMAGES[currentFormation] || field1442}
          alt="Football field"
          className="w-full"
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
