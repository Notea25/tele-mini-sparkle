import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import jerseyDinamoMinsk from "@/assets/jersey-dinamo-minsk.png";
import jerseyBate from "@/assets/jersey-bate.png";
import jerseyDinamoBrest from "@/assets/jersey-dinamo-brest.png";
import jerseyMlVitebsk from "@/assets/jersey-ml-vitebsk.png";
import jerseySlavia from "@/assets/jersey-slaviya.png";
import jerseyVitebsk from "@/assets/jersey-vitebsk.png";
import captainBadge from "@/assets/captain-badge.png";
import viceCaptainBadge from "@/assets/vice-captain-badge.png";
import swapArrows from "@/assets/swap-arrows.png";
import iconBench from "@/assets/icon-bench.png";
import icon2x from "@/assets/icon-2x-new.png";
import icon3x from "@/assets/icon-3x-new.png";
import redCardBadge from "@/assets/red-card-badge.png";
import injuryBadge from "@/assets/injury-badge.png";
import bannerLeft from "@/assets/banner-left.png";
import bannerRight from "@/assets/banner-right.png";
import { Plus } from "lucide-react";
import { getFormationSlots, getPlayerPosition, detectFormation } from "@/lib/formationUtils";

// Helper function to get jersey based on team
const getJerseyForTeam = (team: string) => {
  switch (team) {
    case "Динамо-Минск": return jerseyDinamoMinsk;
    case "БАТЭ": return jerseyBate;
    case "Динамо-Брест": return jerseyDinamoBrest;
    case "МЛ Витебск": return jerseyMlVitebsk;
    case "Славия-Мозырь": return jerseySlavia;
    case "Витебск": return jerseyVitebsk;
    default: return playerJerseyNew;
  }
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
  hasRedCard?: boolean;
  isInjured?: boolean;
}

interface FormationFieldManagementProps {
  mainSquadPlayers: PlayerData[];
  benchPlayers: PlayerData[];
  maxBenchSize?: number;
  onPlayerClick?: (player: PlayerData) => void;
  onRemovePlayer?: (playerId: number) => void;
  onSwapPlayer?: (playerId: number) => void;
  onEmptySlotClick?: (position: string, isOnBench: boolean, slotIndex: number) => void;
  captain?: number | null;
  viceCaptain?: number | null;
  isBenchBoostActive?: boolean;
  isDoublePowerBoostActive?: boolean;
  isCaptain3xBoostActive?: boolean;
  showPrice?: boolean;
  showPointsInsteadOfTeam?: boolean;
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
  onEmptySlotClick,
  captain,
  viceCaptain,
  isBenchBoostActive = false,
  isDoublePowerBoostActive = false,
  isCaptain3xBoostActive = false,
  showPrice = true,
  showPointsInsteadOfTeam = false
}: FormationFieldManagementProps) => {
  // Detect current formation based on players
  const currentFormation = detectFormation(mainSquadPlayers) || "1-4-4-2";
  const formation = getFormationSlots(currentFormation);

  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return mainSquadPlayers.find(p => p.position === position && p.slotIndex === slotIndex);
  };

  const renderPlayer = (player: PlayerData, showActionButton = true, isOnBench = false) => {
    const isCaptain = captain === player.id;
    const isViceCaptain = viceCaptain === player.id;
    const isCaptainOrVice = isCaptain || isViceCaptain;
    const showDoublePowerBorder = isDoublePowerBoostActive && isCaptainOrVice;
    const showDoublePowerIcon = isDoublePowerBoostActive && isCaptainOrVice && !isOnBench;
    const showCaptain3xBorder = isCaptain3xBoostActive && isCaptain;
    const showCaptain3xIcon = isCaptain3xBoostActive && isCaptain && !isOnBench;
    const hasGreenBorder = showDoublePowerBorder || showCaptain3xBorder;
    const hasRedCard = player.hasRedCard;
    const isInjured = player.isInjured;

    // Border color priority: red card/injury > green boost > default white
    const borderClass = (hasRedCard || isInjured)
      ? "border-red-500" 
      : hasGreenBorder 
        ? "border-primary" 
        : "border-white/60";

    return (
      <div
        className={`w-[62px] relative flex flex-col items-center cursor-pointer border rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px] ${borderClass}`}
        onClick={() => onPlayerClick?.(player)}
      >
        {/* Captain/Vice-Captain badge - absolute in left corner, only for main squad */}
        {captain === player.id && !isOnBench && (
          <img src={captainBadge} alt="C" className="absolute top-1 left-1 z-50 w-3 h-3" />
        )}
        {viceCaptain === player.id && !isOnBench && (
          <img src={viceCaptainBadge} alt="V" className="absolute top-1 left-1 z-50 w-3 h-3" />
        )}

        {/* Boost badges for captain/vice-captain, or Bench boost badge, or Swap button */}
        {showCaptain3xIcon ? (
          <img src={icon3x} alt="3x" className="absolute top-[3.5px] right-1 z-50 w-[8.5px] h-[8.5px]" />
        ) : showDoublePowerIcon ? (
          <img src={icon2x} alt="2x" className="absolute top-[3px] right-1 z-50 w-3 h-3" />
        ) : showActionButton && isOnBench && isBenchBoostActive ? (
          <img src={iconBench} alt="Bench+" className="absolute top-1 right-1 z-50 w-3 h-3" />
        ) : showActionButton && onSwapPlayer ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwapPlayer(player.id);
            }}
            className="absolute top-1 right-1 z-50"
          >
            <img src={swapArrows} alt="Swap" className="w-3 h-3" />
          </button>
        ) : null}

      {/* Price centered */}
      {showPrice && (
        <div className="w-full flex items-center justify-center pt-1 pb-0.5">
          <span className="text-white text-[clamp(8px,2.2vw,12px)] font-medium drop-shadow-md whitespace-nowrap leading-tight">
            ${(player.price || 9).toFixed(1)}
          </span>
        </div>
      )}

      {/* Jersey - larger size, overlaps name/club below */}
      <div className="relative">
        <img src={getJerseyForTeam(player.team)} alt={player.name} className="w-[156%] h-auto object-contain mb-[-35%] z-0" />
        
        {/* Red card badge - positioned at bottom right of jersey */}
        {hasRedCard && (
          <img src={redCardBadge} alt="Red card" className="absolute bottom-[2px] right-1 z-50 w-2.5 h-2.5" />
        )}
        
        {/* Injury badge - positioned at bottom right of jersey */}
        {isInjured && !hasRedCard && (
          <img src={injuryBadge} alt="Injury" className="absolute bottom-[2px] right-1 z-50 w-2.5 h-2.5" />
        )}
      </div>

      {/* Player name and club blocks - jersey overlaps from above */}
      <div className="w-full relative z-10">
        <div className="bg-white px-[4%] py-[2%]">
          <span className="text-[clamp(5px,1.8vw,7px)] font-semibold text-black block truncate whitespace-nowrap text-center">
            {isOnBench ? `(${player.position}) ` : ""}{truncateName(player.name, isOnBench ? 6 : 9)}
          </span>
        </div>
        <div className="bg-[#1a1a2e] px-[4%] py-[2%]">
          {showPointsInsteadOfTeam ? (
            <span className={`text-[clamp(6px,2vw,10px)] font-bold block text-center ${
              player.points > 0 ? 'text-primary' : player.points < 0 ? 'text-red-500' : 'text-white'
            }`}>
              {player.points > 0 ? `+${player.points}` : player.points}
            </span>
          ) : (
            <span className="text-[clamp(4px,1.5vw,6px)] font-medium block truncate whitespace-nowrap text-center">
              <span className="text-[#7D7A94]">(Д)</span>
              <span className="text-white ml-[2%]">{truncateName(player.team, 7)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
    );
  };

  const renderEmptySlot = (position: string, isOnBench: boolean, slotIndex: number) => (
    <div
      className="w-[62px] h-[85px] rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center gap-[8%] cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
      onClick={() => onEmptySlotClick?.(position, isOnBench, slotIndex)}
    >
      <span className="text-white font-bold text-[clamp(11px,3vw,17px)]">
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
        
        {/* Advertisement banners in corners */}
        <img 
          src={bannerLeft} 
          alt="Advertisement" 
          className="absolute top-1 left-[41px] w-[22%] h-auto z-30"
        />
        <img 
          src={bannerRight} 
          alt="Advertisement" 
          className="absolute top-1 right-[41px] w-[22%] h-auto z-30"
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
                  {player ? renderPlayer(player, true, true) : renderEmptySlot("ЗАМ", true, idx)}
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