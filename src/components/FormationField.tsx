import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import jerseyDinamoMinsk from "@/assets/jersey-dinamo-minsk.png";
import jerseyBate from "@/assets/jersey-bate.png";
import jerseyBateGk from "@/assets/jersey-bate-gk.png";
import jerseyDinamoBrest from "@/assets/jersey-dinamo-brest.png";
import jerseyMlVitebsk from "@/assets/jersey-ml-vitebsk.png";
import jerseyMlVitebskGk from "@/assets/jersey-ml-vitebsk-gk.png";
import jerseySlavia from "@/assets/jersey-slaviya.png";
import jerseySlaviaGk from "@/assets/jersey-slaviya-gk-new.png";
import jerseyNeman from "@/assets/jersey-neman.png";
import jerseyMinsk from "@/assets/jersey-minsk.png";
import jerseyTorpedo from "@/assets/jersey-torpedo.png";
import jerseyVitebsk from "@/assets/jersey-vitebsk.png";
import jerseyVitebskGk from "@/assets/jersey-vitebsk-gk.png";
import jerseyArsenalGk from "@/assets/jersey-arsenal-gk.png";
import captainBadge from "@/assets/captain-badge.png";
import viceCaptainBadge from "@/assets/vice-captain-badge.png";
import { X, Plus } from "lucide-react";
import { getFormationSlots, getPlayerPosition, detectFormation } from "@/lib/formationUtils";

// Helper function to get jersey based on team and position
const getJerseyForTeam = (team: string, position?: string) => {
  switch (team) {
    case "Динамо-Минск":
      return jerseyDinamoMinsk;
    case "БАТЭ":
      return position === "ВР" ? jerseyBateGk : jerseyBate;
    case "Динамо-Брест":
      return jerseyDinamoBrest;
    case "МЛ Витебск":
      return position === "ВР" ? jerseyMlVitebskGk : jerseyMlVitebsk;
    case "Славия-Мозырь":
      return position === "ВР" ? jerseySlaviaGk : jerseySlavia;
    case "Арсенал":
      return position === "ВР" ? jerseyArsenalGk : playerJerseyNew;
    case "Неман":
      return jerseyNeman;
    case "Минск":
      return jerseyMinsk;
    case "Торпедо-БелАЗ":
      return jerseyTorpedo;
    case "Витебск":
      return position === "ВР" ? jerseyVitebskGk : jerseyVitebsk;
    default:
      return playerJerseyNew;
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
}

interface FormationFieldProps {
  selectedPlayers: PlayerData[];
  onPlayerClick?: (player: PlayerData) => void;
  onRemovePlayer?: (playerId: number) => void;
  onEmptySlotClick?: (position: string, slotIndex: number) => void;
  captain?: number | null;
  viceCaptain?: number | null;
  showCaptainBadges?: boolean;
}

const truncateName = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

const FormationField = ({
  selectedPlayers,
  onPlayerClick,
  onRemovePlayer,
  onEmptySlotClick,
  captain,
  viceCaptain,
  showCaptainBadges = true,
}: FormationFieldProps) => {
  // Detect current formation based on players
  const currentFormation = detectFormation(selectedPlayers) || "1-4-4-2";
  const formation = getFormationSlots(currentFormation);

  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return selectedPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
  };

  const renderPlayer = (player: PlayerData) => (
    <div
      className="w-[62px] relative flex flex-col items-center cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Captain/Vice-Captain badge - absolute in left corner */}
      {showCaptainBadges && captain === player.id && (
        <img src={captainBadge} alt="C" className="absolute top-1 left-1 z-50 w-3 h-3" />
      )}
      {showCaptainBadges && viceCaptain === player.id && (
        <img src={viceCaptainBadge} alt="V" className="absolute top-1 left-1 z-50 w-3 h-3" />
      )}

      {/* Delete button - absolute in corner */}
      {onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute top-1 right-1 z-50 w-3 h-3 flex items-center justify-center bg-[#5a7a4a] rounded-full"
        >
          <X className="w-2 h-2 text-[#1a2e1a]" />
        </button>
      )}

      {/* Price centered */}
      <div className="w-full flex items-center justify-center pt-1 pb-0.5">
        <span className="text-white text-[clamp(8px,2.2vw,12px)] font-medium drop-shadow-md whitespace-nowrap leading-tight">
          ${(player.price || 9).toFixed(1)}
        </span>
      </div>

      {/* Jersey - larger size, overlaps name/club below */}
      <div className="relative">
        <img
          src={getJerseyForTeam(player.team, player.position)}
          alt={player.name}
          className="w-[100%] h-auto object-contain mb-[-50%] z-0"
        />
      </div>

      {/* Player name and club blocks - jersey overlaps from above */}
      <div className="w-full relative z-10">
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

  const renderEmptySlot = (position: string, slotIndex: number) => (
    <div
      className="w-[62px] h-[85px] rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center gap-[8%] cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
      onClick={() => onEmptySlotClick?.(position, slotIndex)}
    >
      <span className="text-white font-medium text-[clamp(11px,3vw,17px)]">{position}</span>
      <div className="w-[28%] aspect-square rounded-full bg-white/90 flex items-center justify-center">
        <Plus className="w-[60%] h-[60%] text-[#3a5a28]" />
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <img src={footballFieldNew} alt="Football field" className="w-full" />

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
            {player ? renderPlayer(player) : renderEmptySlot(slot.position, slot.slotIndex)}
          </div>
        );
      })}
    </div>
  );
};

export default FormationField;
