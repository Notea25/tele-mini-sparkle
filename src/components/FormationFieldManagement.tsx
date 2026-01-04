import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import captainBadge from "@/assets/captain-badge.png";
import viceCaptainBadge from "@/assets/vice-captain-badge.png";
import swapArrows from "@/assets/swap-arrows.png";
import iconBench from "@/assets/icon-bench.png";
import icon2x from "@/assets/icon-2x-boost.png";
import icon3x from "@/assets/icon-3x-boost.png";
import redCardBadge from "@/assets/red-card-badge.png";
import injuryBadge from "@/assets/injury-badge.svg";
import { Plus } from "lucide-react";
import { getFormationSlots, getPlayerPosition, detectFormation } from "@/lib/formationUtils";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getJerseyForTeam } from "@/hooks/getJerseyForTeam.tsx";

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
  onSwapBenchPlayers?: (fromIndex: number, toIndex: number) => void;
  captain?: number | null;
  viceCaptain?: number | null;
  isBenchBoostActive?: boolean;
  isDoublePowerBoostActive?: boolean;
  isCaptain3xBoostActive?: boolean;
  showPrice?: boolean;
  showPointsInsteadOfTeam?: boolean;
  swapModePlayerId?: number | null;
  validSwapTargetIds?: Set<number>;
}

const FormationFieldManagement = ({
  mainSquadPlayers,
  benchPlayers,
  maxBenchSize = 4,
  onPlayerClick,
  onRemovePlayer,
  onSwapPlayer,
  onEmptySlotClick,
  onSwapBenchPlayers,
  captain,
  viceCaptain,
  isBenchBoostActive = false,
  isDoublePowerBoostActive = false,
  isCaptain3xBoostActive = false,
  showPrice = true,
  showPointsInsteadOfTeam = false,
  swapModePlayerId = null,
  validSwapTargetIds = new Set(),
}: FormationFieldManagementProps) => {
  // Detect current formation based on players
  const currentFormation = detectFormation(mainSquadPlayers) || "1-4-4-2";
  const formation = getFormationSlots(currentFormation);

  const getPlayerForSlot = useCallback(
    (position: string, slotIndex: number) => {
      return mainSquadPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
    },
    [mainSquadPlayers],
  );

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

  const truncateName = useCallback((text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  }, []);

  const renderPlayer = useCallback(
    (player: PlayerData, showActionButton = true, isOnBench = false, benchIndex?: number) => {
      const isCaptainPlayer = captain === player.id;
      const isViceCaptainPlayer = viceCaptain === player.id;
      const isCaptainOrVice = isCaptainPlayer || isViceCaptainPlayer;
      const showDoublePowerBorder = isDoublePowerBoostActive && isCaptainOrVice;
      const showDoublePowerIcon = isDoublePowerBoostActive && isCaptainOrVice && !isOnBench;
      const showCaptain3xBorder = isCaptain3xBoostActive && isCaptainPlayer;
      const showCaptain3xIcon = isCaptain3xBoostActive && isCaptainPlayer && !isOnBench;
      const hasRedCard = player.hasRedCard;
      const isInjured = player.isInjured;

      // Swap mode highlighting
      const isSwapSource = swapModePlayerId === player.id;
      const isValidSwapTarget = swapModePlayerId && validSwapTargetIds.has(player.id);
      const isInSwapModeButNotTarget = swapModePlayerId && !isSwapSource && !isValidSwapTarget;

      // Border color priority: swap mode > red card/injury > green boost > default white
      let borderClass = "border-white/60";
      if (isSwapSource) {
        borderClass = "border-primary border-2";
      } else if (isValidSwapTarget) {
        borderClass = "border-primary/80 border-2";
      } else if (hasRedCard || isInjured) {
        borderClass = "border-red-500";
      } else if (showDoublePowerBorder || showCaptain3xBorder || (isOnBench && isBenchBoostActive)) {
        borderClass = "border-primary";
      }

      // Background color: swap mode > red tint for injured/red card > green tint for boosts > default
      let bgClass = "bg-[#3a5a28]/40";
      const hasBenchBoostOnBench = isOnBench && isBenchBoostActive;
      const hasBoostEffect = showDoublePowerBorder || showCaptain3xBorder || hasBenchBoostOnBench;

      if (isSwapSource) {
        bgClass = "bg-primary/30";
      } else if (isValidSwapTarget) {
        bgClass = "bg-primary/20";
      } else if (hasRedCard || isInjured) {
        bgClass = "bg-red-500/25";
      } else if (hasBoostEffect) {
        bgClass = "bg-primary/25";
      }

      // Opacity for non-valid targets in swap mode
      const opacityClass = isInSwapModeButNotTarget ? "opacity-40" : "";

      // Check if bench player can be swapped (not goalkeeper and not first position)
      const canSwapOnBench = isOnBench && benchIndex !== undefined && benchIndex > 0 && player.position !== "ВР";

      // Рассчитываем размеры для текущего разрешения
      const maxNameLength = Math.floor(cardSize.width / 7);
      const maxTeamLength = Math.floor(cardSize.width / 9);

      const displayName = truncateName(
        isOnBench ? `(${player.position}) ${player.name}` : player.name,
        isOnBench ? maxNameLength - 3 : maxNameLength,
      );

      const displayTeam = truncateName(player.team, maxTeamLength);

      return (
        <div
          className={`relative flex flex-col cursor-pointer border rounded-md overflow-hidden ${bgClass} backdrop-blur-[2px] transition-all duration-200 ${borderClass} ${opacityClass} hover:bg-[#3a5a28]/60`}
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
          {/* Valid swap target indicator */}
          {isValidSwapTarget && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-primary/10 animate-pulse">
              <span className="text-primary font-bold" style={{ fontSize: `${cardSize.width * 0.1}px` }}>
                ЗАМЕНИТЬ
              </span>
            </div>
          )}

          {/* Captain/Vice-Captain badge - absolute in left corner, only for main squad */}
          {isCaptainPlayer && !isOnBench && (
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
          {isViceCaptainPlayer && !isOnBench && (
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

          {/* Boost badges for captain/vice-captain, or Bench boost badge, or Swap button */}
          {showCaptain3xIcon ? (
            <img
              src={icon3x}
              alt="3x"
              className="absolute top-1 right-1 z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
              }}
            />
          ) : showDoublePowerIcon ? (
            <img
              src={icon2x}
              alt="2x"
              className="absolute top-1 right-1 z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
              }}
            />
          ) : showActionButton && isOnBench && isBenchBoostActive ? (
            <img
              src={iconBench}
              alt="Bench+"
              className="absolute top-1 right-1 z-50"
              style={{
                width: `${cardSize.width * 0.15}px`,
                height: `${cardSize.width * 0.15}px`,
              }}
            />
          ) : showActionButton && onSwapPlayer && !swapModePlayerId ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwapPlayer(player.id);
              }}
              className="absolute top-1 right-1 z-50"
              aria-label={`Заменить ${player.name}`}
            >
              <img
                src={swapArrows}
                alt="Swap"
                style={{
                  width: `${cardSize.width * 0.15}px`,
                  height: `${cardSize.width * 0.15}px`,
                }}
              />
            </button>
          ) : null}

          {/* Bench swap button - swap with player above */}
          {canSwapOnBench && onSwapBenchPlayers && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwapBenchPlayers(benchIndex, benchIndex - 1);
              }}
              className="absolute top-1 left-1 z-50 bg-primary/80 rounded-sm p-0.5"
              title="Поднять в очереди"
              aria-label="Поднять в очереди"
              style={{
                padding: `${cardSize.width * 0.02}px`,
              }}
            >
              <svg
                className="text-white"
                style={{
                  width: `${cardSize.width * 0.1}px`,
                  height: `${cardSize.width * 0.1}px`,
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}

          {/* Price area - ВСЕГДА ЗАНИМАЕТ МЕСТО, даже если цена не показывается */}
          <div
            className="w-full flex items-center justify-center pt-1 pb-0.5 z-30"
            style={{
              height: `${cardSize.height * 0.19}px`,
              minHeight: "16px", // Минимальная высота для мобильных
            }}
          >
            {showPrice && (
              <span
                className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
                style={{ fontSize: `${cardSize.width * 0.12}px` }}
              >
                ${(player.price || 0).toFixed(1)}
              </span>
            )}
          </div>

          {/* Jersey */}
          <div className="relative w-full flex-1 z-10 overflow-hidden min-h-0">
            <img
              src={getJerseyForTeam(player.team, player.position)}
              alt={player.name}
              className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
              style={{
                width: `${cardSize.width * 3}px`,
                top: `-${cardSize.height * 0.12}px`,
              }}
              onError={(e) => {
                e.currentTarget.src = playerJerseyNew;
              }}
            />

            {/* Red card badge */}
            {hasRedCard && (
              <img
                src={redCardBadge}
                alt="Red card"
                className="absolute bottom-1 right-1 z-50"
                style={{
                  width: `${cardSize.width * 0.12}px`,
                  height: `${cardSize.width * 0.12}px`,
                }}
              />
            )}

            {/* Injury badge */}
            {isInjured && !hasRedCard && (
              <img
                src={injuryBadge}
                alt="Injury"
                className="absolute bottom-1 right-1 z-50"
                style={{
                  width: `${cardSize.width * 0.12}px`,
                  height: `${cardSize.width * 0.12}px`,
                }}
              />
            )}
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
              {showPointsInsteadOfTeam ? (
                <span
                  className={`font-bold block text-center ${
                    player.points > 0 ? "text-primary" : player.points < 0 ? "text-destructive" : "text-white"
                  }`}
                  style={{
                    fontSize: `${cardSize.width * 0.12}px`,
                  }}
                >
                  {player.points > 0 ? `+${player.points}` : player.points}
                </span>
              ) : (
                <span
                  className="font-medium block truncate whitespace-nowrap text-center"
                  style={{ fontSize: `${cardSize.width * 0.085}px` }}
                  title={player.team}
                >
                  <span className="text-[#7D7A94]">(Д)</span>
                  <span className="text-white ml-[2%]">{displayTeam}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
    [
      cardSize,
      captain,
      viceCaptain,
      isBenchBoostActive,
      isDoublePowerBoostActive,
      isCaptain3xBoostActive,
      swapModePlayerId,
      validSwapTargetIds,
      truncateName,
      onPlayerClick,
      onSwapPlayer,
      onSwapBenchPlayers,
      showPrice, // Добавлено в зависимости
    ],
  );

  const renderEmptySlot = useCallback(
    (position: string, isOnBench: boolean, slotIndex: number) => (
      <div
        className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
        style={{
          width: `${cardSize.width}px`,
          height: `${cardSize.height}px`,
          gap: `${cardSize.height * 0.06}px`,
        }}
        onClick={() => onEmptySlotClick?.(position, isOnBench, slotIndex)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEmptySlotClick?.(position, isOnBench, slotIndex);
          }
        }}
        aria-label={`Добавить игрока ${isOnBench ? "на скамейку" : `на позицию ${position}`}`}
      >
        <span className="text-white font-medium" style={{ fontSize: `${cardSize.width * 0.16}px` }}>
          {isOnBench ? "ЗАМ" : position}
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
      </div>
    ),
    [cardSize, onEmptySlotClick],
  );

  // Мемоизированные функции для расчета отступов скамейки
  const getBenchGap = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 768) {
      return 8; // Мобильные
    } else if (width <= 1024) {
      return 16; // Планшеты
    } else {
      return 24; // Десктоп
    }
  }, []);

  // Мемоизированный расчет отступа для скамейки
  const benchGap = useMemo(() => getBenchGap(), [getBenchGap]);

  // Адаптация позиций под разные размеры карточек
  const getAdaptedPlayerPosition = useCallback((row: number, col: number) => {
    // Используем getPlayerPosition из formationUtils
    const basePosition = getPlayerPosition(row, col);

    // Для корректного позиционирования джерси не нужно масштабировать,
    // так как getPlayerPosition уже возвращает правильные проценты
    return basePosition;
  }, []);

  return (
    <div>
      {/* Football Field */}
      <div className="relative w-full">
        <img src={footballFieldNew} alt="Football field" className="w-full h-auto" loading="lazy" />

        {formation.map((slot, idx) => {
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
              {player ? renderPlayer(player) : renderEmptySlot(slot.position, false, slot.slotIndex)}
            </div>
          );
        })}
      </div>

      {/* Bench section */}
      <div
        className="-mt-8 px-3"
        style={{
          marginTop: `-${cardSize.height * 0.1}px`,
          paddingLeft: `${benchGap}px`,
          paddingRight: `${benchGap}px`,
        }}
      >
        <div className="bg-card/50 rounded-xl overflow-hidden">
          {/* Bench header label - full width thin bar */}
          <div className="bg-foreground text-background py-3 text-center">
            <span className="font-semibold" style={{ fontSize: `${cardSize.width * 0.2}px` }}>
              Скамейка
            </span>
          </div>
          <div
            className="p-4"
            style={{
              padding: `${cardSize.height * 0.15}px`,
            }}
          >
            <div className="flex gap-2 justify-between" style={{ gap: `${benchGap}px` }}>
              {Array.from({ length: maxBenchSize }).map((_, idx) => {
                const player = benchPlayers[idx];
                const key = `bench-${idx}`;

                return (
                  <div key={key} className="flex flex-col items-center flex-1 relative">
                    {player ? renderPlayer(player, true, true, idx) : renderEmptySlot("ЗАМ", true, idx)}
                  </div>
                );
              })}
            </div>
            {onSwapBenchPlayers && (
              <p
                className="text-center text-muted-foreground mt-4"
                style={{
                  fontSize: `${cardSize.width * 0.10}px`,
                  marginTop: `${cardSize.height * 0.15}px`,
                }}
              >
                Используй стрелку для изменения приоритета выхода на поле
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationFieldManagement;
