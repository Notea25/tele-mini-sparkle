import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import captainBadge from "@/assets/captain-badge.png";
import viceCaptainBadge from "@/assets/vice-captain-badge.png";
import { X, Plus } from "lucide-react";
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
interface FormationPosition {
  position: string;
  row: number;
  col: number;
}

const TRANSFERS_FORMATION: FormationPosition[] = [
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
                width: `${cardSize.width * 6}px`,
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
                style={{ fontSize: `${cardSize.width * 0.1}px` }}
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

  // Мемоизированный маппинг слотов (position-row-col -> slotIndex)
  const slotIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const positionCounts = new Map<string, number>();

    TRANSFERS_FORMATION.forEach((pos) => {
      const count = positionCounts.get(pos.position) || 0;
      const key = `${pos.position}-${pos.row}-${pos.col}`;
      map.set(key, count);
      positionCounts.set(pos.position, count + 1);
    });

    return map;
  }, []);

  // Группировка по строкам с мемоизацией
  const rows = useMemo(
    () => ({
      1: TRANSFERS_FORMATION.filter((slot) => slot.row === 1),
      2: TRANSFERS_FORMATION.filter((slot) => slot.row === 2),
      3: TRANSFERS_FORMATION.filter((slot) => slot.row === 3),
      4: TRANSFERS_FORMATION.filter((slot) => slot.row === 4),
    }),
    [],
  );

  // Получить slotIndex для слота
  const getSlotIndex = useCallback(
    (slot: FormationPosition) => {
      const key = `${slot.position}-${slot.row}-${slot.col}`;
      return slotIndexMap.get(key) || 0;
    },
    [slotIndexMap],
  );

  // Мемоизированные функции для расчета отступов (из FormationField)
  const getRowGap = useCallback((cardsInRow: number) => {
    const width = window.innerWidth;
    if (width <= 768) {
      if (cardsInRow === 2) return 8;
      if (cardsInRow === 3) return 6;
      if (cardsInRow === 5) return 4;
      return 4;
    } else {
      if (cardsInRow === 2) return 24;
      if (cardsInRow === 3) return 20;
      if (cardsInRow === 5) return 16;
      return 16;
    }
  }, []);

  const getVerticalSpacing = useCallback(
    (rowIndex: number) => {
      const width = window.innerWidth;
      if (width <= 768) {
        return cardSize.height * 0.1 * (rowIndex + 1);
      } else {
        return cardSize.height * 0.5 * (rowIndex + 1);
      }
    },
    [cardSize.height],
  );

  // Расчет вертикальных отступов с мемоизацией
  const rowSpacings = useMemo(
    () => ({
      row1: getVerticalSpacing(0),
      row2: getVerticalSpacing(1),
      row3: getVerticalSpacing(2),
    }),
    [getVerticalSpacing],
  );

  // Рассчитываем горизонтальные гэпы для каждой строки
  const rowGaps = useMemo(
    () => ({
      row1: getRowGap(2),
      row2: getRowGap(5),
      row3: getRowGap(5),
      row4: getRowGap(3),
    }),
    [getRowGap],
  );

  return (
    <div className="relative w-full">
      <img src={footballFieldNew} alt="Футбольное поле" className="w-full h-auto" loading="lazy" />

      <div className="absolute inset-0">
        {/* Вратари */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: "4%",
            gap: `${rowGaps.row1}px`,
          }}
        >
          {rows[1].map((slot) => {
            const slotIndex = getSlotIndex(slot);
            const player = getPlayerForSlot(slot.position, slotIndex);
            const key = `${slot.position}-${slot.row}-${slot.col}`;

            return <div key={key}>{player ? renderPlayer(player) : renderEmptySlot(slot.position, slotIndex)}</div>;
          })}
        </div>

        {/* Защитники */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height}px + ${rowSpacings.row1}px)`,
            gap: `${rowGaps.row2}px`,
          }}
        >
          {rows[2].map((slot) => {
            const slotIndex = getSlotIndex(slot);
            const player = getPlayerForSlot(slot.position, slotIndex);
            const key = `${slot.position}-${slot.row}-${slot.col}`;

            return <div key={key}>{player ? renderPlayer(player) : renderEmptySlot(slot.position, slotIndex)}</div>;
          })}
        </div>

        {/* Полузащитники */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height * 2}px + ${rowSpacings.row1 + rowSpacings.row2}px)`,
            gap: `${rowGaps.row3}px`,
          }}
        >
          {rows[3].map((slot) => {
            const slotIndex = getSlotIndex(slot);
            const player = getPlayerForSlot(slot.position, slotIndex);
            const key = `${slot.position}-${slot.row}-${slot.col}`;

            return <div key={key}>{player ? renderPlayer(player) : renderEmptySlot(slot.position, slotIndex)}</div>;
          })}
        </div>

        {/* Нападающие */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height * 3}px + ${rowSpacings.row1 + rowSpacings.row2 + rowSpacings.row3}px)`,
            gap: `${rowGaps.row4}px`,
          }}
        >
          {rows[4].map((slot) => {
            const slotIndex = getSlotIndex(slot);
            const player = getPlayerForSlot(slot.position, slotIndex);
            const key = `${slot.position}-${slot.row}-${slot.col}`;

            return <div key={key}>{player ? renderPlayer(player) : renderEmptySlot(slot.position, slotIndex)}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default FormationFieldTransfers;
