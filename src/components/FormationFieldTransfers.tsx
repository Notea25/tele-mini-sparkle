import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import jerseyDinamoMinsk from "@/assets/jerseys/dinamoJersey.png";
import jerseyBate from "@/assets/jerseys/bateJersey.png";
import jerseyBateGk from "@/assets/jerseys/goalkeeperJerseys/bateGoalkeeperJersey.png";
import jerseyDinamoBrest from "@/assets/jerseys/brestJersey.png";
import jerseyMlVitebsk from "@/assets/jerseys/mlJersey.png";
import jerseyMlVitebskGk from "@/assets/jerseys/goalkeeperJerseys/mlGoalkeeperJerseys.png";
import jerseySlavia from "@/assets/jerseys/slaviyaJersey.png";
import jerseySlaviaGk from "@/assets/jerseys/goalkeeperJerseys/slaviyaGoalkeeperJersey.png";
import jerseyNeman from "@/assets/jerseys/nemanJersey.png";
import jerseyMinsk from "@/assets/jerseys/minskJersey.png";
import jerseyTorpedo from "@/assets/jerseys/torpedoJersey.png";
import jerseyVitebsk from "@/assets/jerseys/vitebskJersey.png";
import jerseyVitebskGk from "@/assets/jerseys/goalkeeperJerseys/vitebskGoalkeeperJersey.png";
import jerseyArsenalGk from "@/assets/jerseys/goalkeeperJerseys/arsenalGoalkeeperJersey.png";
import captainBadge from "@/assets/captain-badge.png";
import viceCaptainBadge from "@/assets/vice-captain-badge.png";
import { X, Plus } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";

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

interface RemovedPlayerInfo {
  position: string;
  slotIndex: number;
  name: string;
  team: string;
}

interface FormationFieldTransfersProps {
  players: PlayerData[];
  onPlayerClick?: (player: PlayerData) => void;
  onRemovePlayer?: (playerId: number) => void;
  onEmptySlotClick?: (position: string, slotIndex: number) => void;
  captain?: number | null;
  viceCaptain?: number | null;
  removedPlayers?: RemovedPlayerInfo[];
  newPlayerIds?: Set<number>;
}

// Fixed formation for transfers: 2 GK, 5 DEF, 5 MID, 3 FWD = 15 players
const TRANSFERS_FORMATION = {
  ВР: { count: 2, row: 1 },
  ЗЩ: { count: 5, row: 2 },
  ПЗ: { count: 5, row: 3 },
  НП: { count: 3, row: 4 },
};

// Get left percentage positions based on number of players in a row - uniform spacing
function getColumnPositions(count: number): number[] {
  switch (count) {
    case 1:
      return [50];
    case 2:
      return [37, 63];
    case 3:
      return [25, 50, 75];
    case 4:
      return [12.5, 37.5, 62.5, 87.5];
    case 5:
      return [10, 30, 50, 70, 90];
    default:
      return [50];
  }
}

// Get CSS positioning for a player on the field
const getPlayerPosition = (row: number, col: number) => {
  const topPositions: Record<number, string> = {
    1: "2%",
    2: "22%",
    3: "44%",
    4: "66%",
  };

  return {
    top: topPositions[row],
    left: `${col}%`,
  };
};

const FormationFieldTransfers = ({
  players,
  onPlayerClick,
  onRemovePlayer,
  onEmptySlotClick,
  captain,
  viceCaptain,
  removedPlayers = [],
  newPlayerIds = new Set(),
}: FormationFieldTransfersProps) => {
  const [cardSize, setCardSize] = useState({ width: 70, height: 84 });

  useEffect(() => {
    const updateCardSize = () => {
      const width = window.innerWidth;
      let cardWidth, cardHeight;

      if (width <= 768) {
        // Для мобильных фиксированные 70x84
        cardWidth = 70;
        cardHeight = 84;
      } else if (width <= 1024) {
        // Для планшетов
        cardWidth = 96;
        cardHeight = 115; // 96 * 1.2 ≈ 115
      } else {
        // Для десктопа
        cardWidth = 128;
        cardHeight = 154; // 128 * 1.2 ≈ 154
      }

      setCardSize({ width: cardWidth, height: cardHeight });
    };

    updateCardSize();

    // Дебаунс для оптимизации ресайза
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateCardSize, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const getPlayerForSlot = useCallback(
    (position: string, slotIndex: number) => {
      return players.find((p) => p.position === position && p.slotIndex === slotIndex);
    },
    [players],
  );

  const getRemovedPlayerForSlot = useCallback(
    (position: string, slotIndex: number) => {
      return removedPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
    },
    [removedPlayers],
  );

  const truncateName = useCallback((text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  }, []);

  const renderPlayer = useCallback(
    (player: PlayerData) => {
      const isCap = captain === player.id;
      const isViceCap = viceCaptain === player.id;
      const isNewPlayer = newPlayerIds.has(player.id);

      const maxNameLength = Math.floor(cardSize.width / 7);
      const maxTeamLength = Math.floor(cardSize.width / 9);

      const displayName = truncateName(player.name, maxNameLength);
      const displayTeam = truncateName(player.team, maxTeamLength);

      return (
        <div
          className={`relative flex flex-col cursor-pointer rounded-md overflow-hidden backdrop-blur-[2px] hover:bg-[#3a5a28]/60 transition-colors ${
            isNewPlayer
              ? "border-2 border-primary bg-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
              : "border border-white/60 bg-[#3a5a28]/40"
          }`}
          style={{
            width: `${cardSize.width}px`,
            height: `${cardSize.height}px`,
          }}
          onClick={() => onPlayerClick?.(player)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPlayerClick?.(player);
            }
          }}
          aria-label={`Игрок ${player.name}, команда ${player.team}, позиция ${player.position}`}
        >
          {/* Captain/Vice-Captain badge */}
          {isCap && (
            <img
              src={captainBadge}
              alt="Капитан"
              className="absolute top-1 left-1 z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
              }}
            />
          )}
          {isViceCap && (
            <img
              src={viceCaptainBadge}
              alt="Вице-капитан"
              className="absolute top-1 left-1 z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
              }}
            />
          )}

          {/* Delete button */}
          {onRemovePlayer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlayer(player.id);
              }}
              className="absolute top-1 right-1 z-50 flex items-center justify-center bg-[#5a7a4a] hover:bg-[#6a8a5a] rounded-full transition-colors"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
              }}
              aria-label={`Удалить ${player.name}`}
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

          {/* Price centered */}
          <div
            className="w-full flex items-center justify-center pt-1 pb-0.5 z-30"
            style={{ height: `${cardSize.height * 0.19}px` }}
          >
            <span
              className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
              style={{ fontSize: `${cardSize.width * 0.12}px` }}
            >
              ${(player.price || 0).toFixed(1)}
            </span>
          </div>

          {/* Jersey - правильно позиционированная как в первом компоненте */}
          <div className="relative w-full flex-1 z-10 overflow-hidden">
            <img
              src={getJerseyForTeam(player.team, player.position)}
              alt={player.name}
              className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
              style={{
                width: `${cardSize.width * 1.5}px`,
                top: `-${cardSize.height * 0.12}px`,
              }}
              onError={(e) => {
                e.currentTarget.src = playerJerseyNew;
              }}
            />
          </div>

          {/* Player name and club blocks */}
          <div className="w-full relative z-20">
            <div className="bg-white px-[4%] py-[2%]">
              <span
                className="font-semibold text-black block truncate whitespace-nowrap text-center"
                style={{ fontSize: `${cardSize.width * 0.1}px` }}
                title={player.name}
              >
                {displayName}
              </span>
            </div>
            <div className="bg-[#1a1a2e] px-[4%] py-[2%]">
              <span
                className="font-medium block truncate whitespace-nowrap text-center"
                style={{ fontSize: `${cardSize.width * 0.085}px` }}
                title={player.team}
              >
                <span className="text-[#7D7A94]">(Д)</span>
                <span className="text-white ml-[2%]">{displayTeam}</span>
              </span>
            </div>
          </div>
        </div>
      );
    },
    [cardSize, captain, viceCaptain, onPlayerClick, onRemovePlayer, truncateName, newPlayerIds],
  );

  const renderEmptySlot = useCallback(
    (position: string, slotIndex: number) => {
      const removedPlayer = getRemovedPlayerForSlot(position, slotIndex);

      return (
        <div
          className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors relative overflow-hidden"
          style={{
            width: `${cardSize.width}px`,
            height: `${cardSize.height}px`,
            gap: `${cardSize.height * 0.06}px`,
          }}
          onClick={() => onEmptySlotClick?.(position, slotIndex)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEmptySlotClick?.(position, slotIndex);
            }
          }}
          aria-label={
            removedPlayer
              ? `Заменить ${removedPlayer.name} на позиции ${position}`
              : `Добавить игрока на позицию ${position}`
          }
        >
          {removedPlayer ? (
            <>
              {/* Plus button at top center */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                  style={{
                    width: `${cardSize.width * 0.28}px`,
                    height: `${cardSize.width * 0.28}px`,
                  }}
                >
                  <Plus
                    className="text-[#3a5a28]"
                    style={{
                      width: `${cardSize.width * 0.16}px`,
                      height: `${cardSize.width * 0.16}px`,
                    }}
                  />
                </div>
              </div>
              {/* Removed player info at bottom */}
              <div className="w-full">
                <div className="bg-white/30 px-1 py-[2px]">
                  <span
                    className="text-white/80 font-medium block truncate whitespace-nowrap text-center"
                    style={{ fontSize: `${cardSize.width * 0.08}px` }}
                    title={removedPlayer.name}
                  >
                    {truncateName(removedPlayer.name, Math.floor(cardSize.width / 6))}
                  </span>
                </div>
                <div className="bg-[#1a1a2e]/50 px-1 py-[2px]">
                  <span
                    className="text-white/60 block truncate whitespace-nowrap text-center"
                    style={{ fontSize: `${cardSize.width * 0.07}px` }}
                    title={removedPlayer.team}
                  >
                    {truncateName(removedPlayer.team, Math.floor(cardSize.width / 5))}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="text-white font-medium" style={{ fontSize: `${cardSize.width * 0.16}px` }}>
                {position}
              </span>
              <div
                className="rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
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
            </>
          )}
        </div>
      );
    },
    [cardSize, getRemovedPlayerForSlot, onEmptySlotClick, truncateName],
  );

  // Generate all slots for the fixed formation
  const generateSlots = useCallback(() => {
    const slots: { position: string; row: number; col: number; slotIndex: number }[] = [];

    for (const [position, config] of Object.entries(TRANSFERS_FORMATION)) {
      const cols = getColumnPositions(config.count);
      for (let i = 0; i < config.count; i++) {
        slots.push({ position, row: config.row, col: cols[i], slotIndex: i });
      }
    }

    return slots;
  }, []);

  const allSlots = useMemo(() => generateSlots(), [generateSlots]);

  // Адаптация позиций под разные размеры карточек
  const getAdaptedPlayerPosition = useCallback(
    (row: number, col: number) => {
      const baseTopPositions: Record<number, string> = {
        1: "2%",
        2: "22%",
        3: "44%",
        4: "66%",
      };

      // Масштабируем вертикальные позиции в зависимости от размера карточки
      const scaleFactor = cardSize.height / 84; // 84 - базовый размер для мобильных

      let topPosition = baseTopPositions[row];
      if (scaleFactor > 1) {
        // Для больших карточек немного корректируем позиции
        const baseValue = parseInt(topPosition);
        const adjustedValue = baseValue - (scaleFactor - 1) * 2;
        topPosition = `${Math.max(adjustedValue, 0)}%`;
      }

      return {
        top: topPosition,
        left: `${col}%`,
      };
    },
    [cardSize.height],
  );

  return (
    <div className="relative w-full">
      <img src={footballFieldNew} alt="Футбольное поле" className="w-full h-auto" loading="lazy" />

      {allSlots.map((slot, idx) => {
        const style = getAdaptedPlayerPosition(slot.row, slot.col);
        const player = getPlayerForSlot(slot.position, slot.slotIndex);
        const isOccupied = !!player;
        const key = `${slot.position}-${slot.slotIndex}-${idx}`;

        return (
          <div
            key={key}
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

export default FormationFieldTransfers;
