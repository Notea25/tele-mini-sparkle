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
import { useState, useEffect } from "react";

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
  captain?: number | null;
  viceCaptain?: number | null;
  showCaptainBadges?: boolean;
}

const FormationField = ({
  selectedPlayers = [],
  onRemovePlayer,
  onPlayerClick,
  onEmptySlotClick,
  captain,
  viceCaptain,
  showCaptainBadges = true,
}: FormationFieldProps) => {
  const formation: FormationPosition[] = [
    { position: "ВР", row: 1, col: 1 },
    { position: "ВР", row: 1, col: 2 },
    { position: "ЗЩ", row: 2, col: 1 },
    { position: "ЗЩ", row: 2, col: 2 },
    { position: "ЗЩ", row: 2, col: 3 },
    { position: "ЗЩ", row: 2, col: 4 },
    { position: "ЗЩ", row: 2, col: 5 },
    { position: "ПЗ", row: 3, col: 1 },
    { position: "ПЗ", row: 3, col: 2 },
    { position: "ПЗ", row: 3, col: 3 },
    { position: "ПЗ", row: 3, col: 4 },
    { position: "ПЗ", row: 3, col: 5 },
    { position: "НП", row: 4, col: 1 },
    { position: "НП", row: 4, col: 2 },
    { position: "НП", row: 4, col: 3 },
  ];

  const truncateName = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  const getAssignedPlayer = (formationPos: FormationPosition) => {
    const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      (s) => s.row === formationPos.row && s.col === formationPos.col,
    );

    return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
  };

  const rows = {
    1: formation.filter((slot) => slot.row === 1),
    2: formation.filter((slot) => slot.row === 2),
    3: formation.filter((slot) => slot.row === 3),
    4: formation.filter((slot) => slot.row === 4),
  };

  const [screenWidth, setScreenWidth] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCardSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);

      let cardWidth;

      if (width <= 480) {
        // Для ширины экрана до 480px фиксированные 70x84
        cardWidth = 70;
      } else if (width <= 768) {
        const minWidth = 70;
        const maxWidth = 96;
        const scale = (width - 480) / (768 - 480);
        cardWidth = minWidth + (maxWidth - minWidth) * scale;
      } else if (width <= 1024) {
        const minWidth = 96;
        const maxWidth = 128;
        const scale = (width - 768) / (1024 - 768);
        cardWidth = minWidth + (maxWidth - minWidth) * scale;
      } else {
        const minWidth = 128;
        const maxWidth = 160;
        const maxScreen = 1920;
        const scale = Math.min(1, (width - 1024) / (maxScreen - 1024));
        cardWidth = minWidth + (maxWidth - minWidth) * scale;
      }

      cardWidth = Math.max(56, Math.min(160, cardWidth));

      // Высота рассчитывается с соотношением 84/70 = 1.2
      const cardHeight = cardWidth * 1.2;

      setCardSize({ width: cardWidth, height: cardHeight });
    };

    updateCardSize();

    window.addEventListener("resize", updateCardSize);

    return () => window.removeEventListener("resize", updateCardSize);
  }, []);

  if (cardSize.width === 0 || cardSize.height === 0) {
    return <div className="relative w-full h-[400px] bg-gray-900/20 animate-pulse rounded-lg" />;
  }

  const PlayerCardComponent = ({
    player,
    showRemoveButton = true,
  }: {
    player: PlayerData;
    showRemoveButton?: boolean;
  }) => (
    <div
      className="relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
      style={{
        width: `${cardSize.width}px`,
        height: `${cardSize.height}px`,
      }}
      onClick={() => onPlayerClick?.(player)}
    >
      {showCaptainBadges && captain === player.id && (
        <img
          src={captainBadge}
          alt="C"
          className="absolute top-1 left-1 z-50"
          style={{
            width: `${cardSize.width * 0.18}px`,
            height: `${cardSize.width * 0.18}px`,
          }}
        />
      )}
      {showCaptainBadges && viceCaptain === player.id && (
        <img
          src={viceCaptainBadge}
          alt="V"
          className="absolute top-1 left-1 z-50"
          style={{
            width: `${cardSize.width * 0.18}px`,
            height: `${cardSize.width * 0.18}px`,
          }}
        />
      )}

      {showRemoveButton && onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute top-1 right-1 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
          style={{
            width: `${cardSize.width * 0.18}px`,
            height: `${cardSize.width * 0.18}px`,
          }}
        >
          <X
            className="text-[#1a2e1a]"
            style={{
              width: `${cardSize.width * 0.12}px`,
              height: `${cardSize.width * 0.12}px`,
            }}
          />
        </button>
      )}

      <div className="absolute top-[7px] left-0 right-0 flex items-center justify-center z-30">
        <span
          className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
          style={{
            fontSize: `${cardSize.width * 0.12}px`,
            lineHeight: 1,
          }}
        >
          ${(player.price || 9).toFixed(1)}
        </span>
      </div>

      <div className="relative w-full flex-1 z-10 overflow-hidden">
        <img
          src={getJerseyForTeam(player.team, player.position)}
          alt={player.name}
          className="h-auto object-contain top-2 absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: `${cardSize.width * 1.5}px`,
          }}
        />
      </div>

      <div className="w-full relative z-20">
        <div
          className="bg-white"
          style={{
            paddingTop: `${cardSize.height * 0.02}px`,
            paddingBottom: `${cardSize.height * 0.02}px`,
          }}
        >
          <span
            className="font-semibold text-black block truncate whitespace-nowrap text-center"
            style={{ fontSize: `${cardSize.width * 0.1}px` }}
          >
            {truncateName(player.name, Math.floor(cardSize.width / 6.4))}
          </span>
        </div>
        <div
          className="bg-[#1a1a2e]"
          style={{
            paddingTop: `${cardSize.height * 0.018}px`,
            paddingBottom: `${cardSize.height * 0.018}px`,
          }}
        >
          <span
            className="font-medium block truncate whitespace-nowrap text-center"
            style={{ fontSize: `${cardSize.width * 0.085}px` }}
          >
            <span className="text-[#7D7A94]">(Д)</span>
            <span className="text-white ml-[2%]">{truncateName(player.team, Math.floor(cardSize.width / 8))}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const EmptySlotComponent = ({ position }: { position: string }) => (
    <div
      className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
      style={{
        width: `${cardSize.width}px`,
        height: `${cardSize.height}px`,
        gap: `${cardSize.height * 0.06}px`,
      }}
      onClick={() => onEmptySlotClick?.(position)}
    >
      <span className="text-white font-bold" style={{ fontSize: `${cardSize.width * 0.2}px` }}>
        {position}
      </span>
      <div
        className="rounded-full bg-white/90 flex items-center justify-center"
        style={{
          width: `${cardSize.width * 0.25}px`,
          height: `${cardSize.width * 0.25}px`,
        }}
      >
        <Plus
          className="text-[#3a5a28]"
          style={{
            width: `${cardSize.width * 0.14}px`,
            height: `${cardSize.width * 0.14}px`,
          }}
        />
      </div>
    </div>
  );

  const mobileBaseWidth = 320;
  const mobilePadding = 4;
  // Уменьшили отступы между карточками в два раза
  const mobileGapFor2 = 8; // было 16
  const mobileGapFor5 = 4; // было 8

  const baseScaleFactor = screenWidth / mobileBaseWidth;

  const getRowGap = (cardsInRow: number) => {
    if (cardsInRow === 2) return mobileGapFor2 * baseScaleFactor;
    if (cardsInRow === 3) return mobileGapFor5 * baseScaleFactor;
    if (cardsInRow === 5) return mobileGapFor5 * baseScaleFactor;
    return mobileGapFor5 * baseScaleFactor;
  };

  const containerPadding = mobilePadding * baseScaleFactor;

  const rowSpacing = screenWidth < 768 ? cardSize.height * 0.1 : cardSize.height * 0.5;

  return (
    <div className="relative w-full">
      <div
        style={{
          paddingLeft: `${containerPadding}px`,
          paddingRight: `${containerPadding}px`,
          paddingTop: `${containerPadding}px`,
          paddingBottom: `${containerPadding}px`,
        }}
      >
        <img src={footballFieldNew} alt="Football field" className="w-full" />
      </div>

      <div
        className="absolute inset-0"
        style={{
          paddingLeft: `${containerPadding}px`,
          paddingRight: `${containerPadding}px`,
          paddingTop: `${containerPadding}px`,
          paddingBottom: `${containerPadding}px`,
        }}
      >
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: "4%",
            gap: `${getRowGap(2)}px`,
          }}
        >
          {rows[1].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>

        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height}px + ${rowSpacing}px)`,
            gap: `${getRowGap(5)}px`,
          }}
        >
          {rows[2].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>

        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height * 2}px + ${rowSpacing * 2}px)`,
            gap: `${getRowGap(5)}px`,
          }}
        >
          {rows[3].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>

        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height * 3}px + ${rowSpacing * 3}px)`,
            gap: `${getRowGap(3)}px`,
          }}
        >
          {rows[4].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormationField;
