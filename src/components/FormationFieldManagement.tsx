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
      </div>
      
      {/* Player info card */}
      <div 
        className="mt-0.5 cursor-pointer hover:opacity-80 rounded-lg overflow-hidden"
        onClick={() => onPlayerClick?.(player)}
      >
        <div className="flex items-center justify-center bg-white px-3 py-1.5 min-w-[70px]">
          <span className="text-[10px] font-bold truncate text-[#1a1a1a]">
            {player.name}
          </span>
        </div>

        <div className="bg-[#2a2a2e] px-3 py-1.5 flex items-center justify-center min-w-[70px]">
          <span className="text-[9px] font-semibold flex items-center gap-1">
            <span className="text-[#7a7a7a]">(Д)</span>
            <span className="text-white">{player.team.length > 10 ? player.team.substring(0, 9) + "..." : player.team}</span>
          </span>
        </div>
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
