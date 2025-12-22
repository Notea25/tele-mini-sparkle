// import footballFieldNew from "@/assets/football-field-new.png";
// import playerJerseyNew from "@/assets/player-jersey-new.png";
// import jerseyDinamoMinsk from "@/assets/jersey-dinamo-minsk.png";
// import jerseyBate from "@/assets/jersey-bate.png";
// import jerseyBateGk from "@/assets/jersey-bate-gk.png";
// import jerseyDinamoBrest from "@/assets/jersey-dinamo-brest.png";
// import jerseyMlVitebsk from "@/assets/jersey-ml-vitebsk.png";
// import jerseyMlVitebskGk from "@/assets/jersey-ml-vitebsk-gk.png";
// import jerseySlavia from "@/assets/jersey-slaviya.png";
// import jerseySlaviaGk from "@/assets/jersey-slaviya-gk-new.png";
// import jerseyNeman from "@/assets/jersey-neman.png";
// import jerseyMinsk from "@/assets/jersey-minsk.png";
// import jerseyTorpedo from "@/assets/jersey-torpedo.png";
// import jerseyVitebsk from "@/assets/jersey-vitebsk.png";
// import jerseyVitebskGk from "@/assets/jersey-vitebsk-gk.png";
// import jerseyArsenalGk from "@/assets/jersey-arsenal-gk.png";
// import captainBadge from "@/assets/captain-badge.png";
// import viceCaptainBadge from "@/assets/vice-captain-badge.png";
// import { X, Plus } from "lucide-react";

// // Helper function to get jersey based on team and position
// const getJerseyForTeam = (team: string, position?: string) => {
//   switch (team) {
//     case "Динамо-Минск":
//       return jerseyDinamoMinsk;
//     case "БАТЭ":
//       return position === "ВР" ? jerseyBateGk : jerseyBate;
//     case "Динамо-Брест":
//       return jerseyDinamoBrest;
//     case "МЛ Витебск":
//       return position === "ВР" ? jerseyMlVitebskGk : jerseyMlVitebsk;
//     case "Славия-Мозырь":
//       return position === "ВР" ? jerseySlaviaGk : jerseySlavia;
//     case "Арсенал":
//       return position === "ВР" ? jerseyArsenalGk : playerJerseyNew;
//     case "Неман":
//       return jerseyNeman;
//     case "Минск":
//       return jerseyMinsk;
//     case "Торпедо-БелАЗ":
//       return jerseyTorpedo;
//     case "Витебск":
//       return position === "ВР" ? jerseyVitebskGk : jerseyVitebsk;
//     default:
//       return playerJerseyNew;
//   }
// };

// interface PlayerData {
//   id: number;
//   name: string;
//   team: string;
//   position: string;
//   points: number;
//   price?: number;
//   slotIndex?: number;
//   isCaptain?: boolean;
//   isViceCaptain?: boolean;
// }

// interface FormationPosition {
//   position: string;
//   row: number;
//   col: number;
// }

// interface FormationFieldProps {
//   selectedPlayers?: PlayerData[];
//   onRemovePlayer?: (playerId: number) => void;
//   onPlayerClick?: (player: PlayerData) => void;
//   onEmptySlotClick?: (position: string) => void;
//   captain?: number | null;
//   viceCaptain?: number | null;
//   showCaptainBadges?: boolean;
// }

// const FormationField = ({
//   selectedPlayers = [],
//   onRemovePlayer,
//   onPlayerClick,
//   onEmptySlotClick,
//   captain,
//   viceCaptain,
//   showCaptainBadges = true,
// }: FormationFieldProps) => {
//   // Formation: 2 ВР (goalkeepers), 5 ЗЩ (defenders), 5 ПЗ (midfielders), 3 НП (forwards)
//   const formation: FormationPosition[] = [
//     // Row 1 - Goalkeepers (top)
//     { position: "ВР", row: 1, col: 2 },
//     { position: "ВР", row: 1, col: 4 },
//     // Row 2 - Defenders
//     { position: "ЗЩ", row: 2, col: 1 },
//     { position: "ЗЩ", row: 2, col: 2 },
//     { position: "ЗЩ", row: 2, col: 3 },
//     { position: "ЗЩ", row: 2, col: 4 },
//     { position: "ЗЩ", row: 2, col: 5 },
//     // Row 3 - Midfielders
//     { position: "ПЗ", row: 3, col: 1 },
//     { position: "ПЗ", row: 3, col: 2 },
//     { position: "ПЗ", row: 3, col: 3 },
//     { position: "ПЗ", row: 3, col: 4 },
//     { position: "ПЗ", row: 3, col: 5 },
//     // Row 4 - Forwards (bottom)
//     { position: "НП", row: 4, col: 2 },
//     { position: "НП", row: 4, col: 3 },
//     { position: "НП", row: 4, col: 4 },
//   ];

//   const getPlayerStyle = (row: number, col: number) => {
//     const topPositions: Record<number, string> = {
//       1: "1%",
//       2: "20%",
//       3: "39%",
//       4: "58%",
//     };

//     // Uniform spacing based on player count per row
//     const leftPositions: Record<number, Record<number, string>> = {
//       1: { 2: "35%", 4: "65%" }, // 2 players: symmetric around center
//       2: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
//       3: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
//       4: { 2: "30%", 3: "50%", 4: "70%" }, // 3 players: aligned with columns 2,3,4
//     };

//     return {
//       top: topPositions[row],
//       left: leftPositions[row][col],
//     };
//   };

//   // Get assigned player for a formation slot
//   const getAssignedPlayer = (formationPos: FormationPosition) => {
//     // Find the slot index within the position
//     const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
//     const slotPositionIndex = slotsForPosition.findIndex(
//       (s) => s.row === formationPos.row && s.col === formationPos.col,
//     );

//     // Find player assigned to this specific slot
//     return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
//   };

//   const truncateName = (text: string, maxLength: number) => {
//     if (text.length > maxLength) {
//       return text.slice(0, maxLength) + "...";
//     }
//     return text;
//   };

//   return (
//     <div className="relative w-full">
//       <img src={footballFieldNew} alt="Football field" className="w-full" />
//       {formation.map((slot, idx) => {
//         const style = getPlayerStyle(slot.row, slot.col);
//         const assignedPlayer = getAssignedPlayer(slot);
//         const isOccupied = !!assignedPlayer;

//         return (
//           <div
//             key={idx}
//             className={`absolute flex flex-col items-center ${isOccupied ? "z-20" : "z-10"}`}
//             style={{
//               top: style.top,
//               left: style.left,
//               transform: "translateX(-50%)",
//             }}
//           >
//             {isOccupied ? (
//               // Occupied slot with player
//               <div
//                 className="w-[70px] h-[84px] relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
//                 onClick={() => onPlayerClick?.(assignedPlayer)}
//               >
//                 {/* Captain/Vice-Captain badge - absolute in left corner */}
//                 {showCaptainBadges && captain === assignedPlayer.id && (
//                   <img src={captainBadge} alt="C" className="absolute top-1 left-1 z-50 w-3 h-3" />
//                 )}
//                 {showCaptainBadges && viceCaptain === assignedPlayer.id && (
//                   <img src={viceCaptainBadge} alt="V" className="absolute top-1 left-1 z-50 w-3 h-3" />
//                 )}

//                 {/* Delete button - absolute in corner */}
//                 {onRemovePlayer && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onRemovePlayer(assignedPlayer.id);
//                     }}
//                     className="absolute top-1 right-1 z-50 w-3 h-3 flex items-center justify-center bg-[#5a7a4a] rounded-full"
//                   >
//                     <X className="w-2 h-2 text-[#1a2e1a]" />
//                   </button>
//                 )}

//                 {/* Price centered */}
//                 <div className="w-full flex items-center justify-center pt-1 pb-0.5 z-30 h-[16px]">
//                   <span className="text-white text-[clamp(8px,2.2vw,12px)] font-medium drop-shadow-md whitespace-nowrap leading-tight">
//                     ${(assignedPlayer.price || 9).toFixed(1)}
//                   </span>
//                 </div>

//                 {/* Jersey - начинается сразу под ценой */}
//                 <div className="relative w-full flex-1 z-10 overflow-hidden">
//                   <img
//                     src={getJerseyForTeam(assignedPlayer.team, assignedPlayer.position)}
//                     alt={assignedPlayer.name}
//                     className="w-[120%] h-auto object-contain absolute -top-[12px] left-1/2 transform -translate-x-1/2"
//                     style={{ maxWidth: "none" }}
//                   />
//                 </div>

//                 {/* Player name and club blocks */}
//                 <div className="w-full relative z-20">
//                   <div className="bg-white px-[4%] py-[2%]">
//                     <span className="text-[clamp(5px,1.8vw,7px)] font-semibold text-black block truncate whitespace-nowrap text-center">
//                       {truncateName(assignedPlayer.name, 9)}
//                     </span>
//                   </div>
//                   <div className="bg-[#1a1a2e] px-[4%] py-[2%]">
//                     <span className="text-[clamp(4px,1.5vw,6px)] font-medium block truncate whitespace-nowrap text-center">
//                       <span className="text-[#7D7A94]">(Д)</span>
//                       <span className="text-white ml-[2%]">{truncateName(assignedPlayer.team, 7)}</span>
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               // Empty slot - dashed border, position label, + button
//               <div
//                 className="w-[70px] h-[84px] rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center gap-[8%] cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
//                 onClick={() => onEmptySlotClick?.(slot.position)}
//               >
//                 <span className="text-white font-bold text-[clamp(11px,3vw,17px)]">{slot.position}</span>
//                 <div className="w-[28%] aspect-square rounded-full bg-white/90 flex items-center justify-center">
//                   <Plus className="w-[60%] h-[60%] text-[#3a5a28]" />
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default FormationField;
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
  // Formation: 2 ВР (goalkeepers), 5 ЗЩ (defenders), 5 ПЗ (midfielders), 3 НП (forwards)
  const formation: FormationPosition[] = [
    // Row 1 - Goalkeepers (top)
    { position: "ВР", row: 1, col: 1 },
    { position: "ВР", row: 1, col: 2 },
    // Row 2 - Defenders
    { position: "ЗЩ", row: 2, col: 1 },
    { position: "ЗЩ", row: 2, col: 2 },
    { position: "ЗЩ", row: 2, col: 3 },
    { position: "ЗЩ", row: 2, col: 4 },
    { position: "ЗЩ", row: 2, col: 5 },
    // Row 3 - Midfielders
    { position: "ПЗ", row: 3, col: 1 },
    { position: "ПЗ", row: 3, col: 2 },
    { position: "ПЗ", row: 3, col: 3 },
    { position: "ПЗ", row: 3, col: 4 },
    { position: "ПЗ", row: 3, col: 5 },
    // Row 4 - Forwards (bottom)
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

  // Get assigned player for a formation slot
  const getAssignedPlayer = (formationPos: FormationPosition) => {
    // Find the slot index within the position
    const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      (s) => s.row === formationPos.row && s.col === formationPos.col,
    );

    // Find player assigned to this specific slot
    return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
  };

  // Group players by row
  const rows = {
    1: formation.filter((slot) => slot.row === 1),
    2: formation.filter((slot) => slot.row === 2),
    3: formation.filter((slot) => slot.row === 3),
    4: formation.filter((slot) => slot.row === 4),
  };

  // Состояние для определения размера экрана и карточки
  const [screenWidth, setScreenWidth] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCardSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);

      // Базовые значения для мобильного (320px)
      const mobileBase = 320;
      const mobileCardWidth = 64; // На мобильном 64px
      const mobileCardHeight = 82; // На мобильном 82px

      // Рассчитываем размер карточки в зависимости от ширины экрана
      // Используем нелинейное масштабирование для лучшего результата
      let cardWidth;

      if (width <= 375) {
        // Мобильные до 375px
        cardWidth = mobileCardWidth * (width / mobileBase);
      } else if (width <= 768) {
        // Планшеты 375-768px
        // На 768px хотим карточку 96px (в 1.5 раза больше чем на 320px)
        const minWidth = mobileCardWidth * (375 / mobileBase); // ~75px
        const maxWidth = 96; // Желаемый размер на 768px
        const scale = (width - 375) / (768 - 375); // 0-1
        cardWidth = minWidth + (maxWidth - minWidth) * scale;
      } else if (width <= 1024) {
        // Планшеты 768-1024px
        // На 1024px хотим карточку 128px
        const minWidth = 96;
        const maxWidth = 128;
        const scale = (width - 768) / (1024 - 768);
        cardWidth = minWidth + (maxWidth - minWidth) * scale;
      } else {
        // Десктопы 1024px+
        // Плавное увеличение дальше
        const minWidth = 128;
        const maxWidth = 160; // Максимальный размер на очень широких экранах
        const maxScreen = 1920;
        const scale = Math.min(1, (width - 1024) / (maxScreen - 1024));
        cardWidth = minWidth + (maxWidth - minWidth) * scale;
      }

      // Ограничиваем минимальный и максимальный размер
      cardWidth = Math.max(56, Math.min(160, cardWidth));

      // Высота пропорциональна ширине (соотношение 82:64 = 1.28125)
      const cardHeight = cardWidth * 1.28125;

      setCardSize({ width: cardWidth, height: cardHeight });
    };

    // Устанавливаем начальный размер
    updateCardSize();

    // Добавляем слушатель изменения размера
    window.addEventListener("resize", updateCardSize);

    return () => window.removeEventListener("resize", updateCardSize);
  }, []);

  // Если карточка еще не рассчитана, показываем пустой контейнер
  if (cardSize.width === 0 || cardSize.height === 0) {
    return <div className="relative w-full h-[400px] bg-gray-900/20 animate-pulse rounded-lg" />;
  }

  // Компонент карточки игрока
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
      {/* Captain/Vice-Captain badge */}
      {showCaptainBadges && captain === player.id && (
        <img
          src={captainBadge}
          alt="C"
          className="absolute top-2 left-2 z-50"
          style={{
            width: `${cardSize.width * 0.18}px`, // 18% от ширины карточки
            height: `${cardSize.width * 0.18}px`,
          }}
        />
      )}
      {showCaptainBadges && viceCaptain === player.id && (
        <img
          src={viceCaptainBadge}
          alt="V"
          className="absolute top-2 left-2 z-50"
          style={{
            width: `${cardSize.width * 0.18}px`,
            height: `${cardSize.width * 0.18}px`,
          }}
        />
      )}

      {/* Delete button */}
      {showRemoveButton && onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute top-2 right-2 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
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

      {/* Price */}
      <div
        className="w-full flex items-center justify-center pt-2 pb-1.5 z-30"
        style={{ height: `${cardSize.height * 0.22}px` }} // 22% от высоты карточки
      >
        <span
          className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
          style={{ fontSize: `${cardSize.width * 0.12}px` }} // 12% от ширины карточки
        >
          ${(player.price || 9).toFixed(1)}
        </span>
      </div>

      {/* Jersey */}
      <div className="relative w-full flex-1 z-10 overflow-hidden">
        <img
          src={getJerseyForTeam(player.team, player.position)}
          alt={player.name}
          className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: `${cardSize.width * 1.5}px`, // 150% от ширины карточки
            top: `-${cardSize.height * 0.16}px`, // -16% от высоты карточки
          }}
        />
      </div>

      {/* Name and team */}
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
            style={{ fontSize: `${cardSize.width * 0.1}px` }} // 10% от ширины
          >
            {truncateName(player.name, Math.floor(cardSize.width / 6.4))} // 6.4px на символ
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
            style={{ fontSize: `${cardSize.width * 0.085}px` }} // 8.5% от ширины
          >
            <span className="text-[#7D7A94]">(Д)</span>
            <span className="text-white ml-[2%]">{truncateName(player.team, Math.floor(cardSize.width / 8))}</span> //
            8px на символ
          </span>
        </div>
      </div>
    </div>
  );

  // Компонент пустого слота
  const EmptySlotComponent = ({ position }: { position: string }) => (
    <div
      className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
      style={{
        width: `${cardSize.width}px`,
        height: `${cardSize.height}px`,
        gap: `${cardSize.height * 0.06}px`, // 6% от высоты
      }}
      onClick={() => onEmptySlotClick?.(position)}
    >
      <span
        className="text-white font-bold"
        style={{ fontSize: `${cardSize.width * 0.2}px` }} // 20% от ширины
      >
        {position}
      </span>
      <div
        className="rounded-full bg-white/90 flex items-center justify-center"
        style={{
          width: `${cardSize.width * 0.25}px`, // 25% от ширины
          height: `${cardSize.width * 0.25}px`,
        }}
      >
        <Plus
          className="text-[#3a5a28]"
          style={{
            width: `${cardSize.width * 0.14}px`, // 14% от ширины
            height: `${cardSize.width * 0.14}px`,
          }}
        />
      </div>
    </div>
  );

  // Рассчитываем паддинги и гэпы пропорционально ширине экрана
  // Базовые значения для мобильного (320px)
  const mobileBaseWidth = 320;
  const mobilePadding = 4;
  const mobileGapFor2 = 16; // для 2 карточек
  const mobileGapFor5 = 8; // для 5 карточек

  // Рассчитываем коэффициент увеличения относительно базовой мобильной ширины
  const baseScaleFactor = screenWidth / mobileBaseWidth;

  // Гэпы пропорциональны ширине экрана
  const getRowGap = (cardsInRow: number) => {
    if (cardsInRow === 2) return mobileGapFor2 * baseScaleFactor;
    if (cardsInRow === 3) return mobileGapFor2 * baseScaleFactor * 0.85; // Немного меньше для 3 карточек
    if (cardsInRow === 5) return mobileGapFor5 * baseScaleFactor;
    return mobileGapFor5 * baseScaleFactor;
  };

  // Паддинги контейнера пропорциональны ширине экрана
  const containerPadding = mobilePadding * baseScaleFactor;

  // Вертикальные отступы между строками
  const rowSpacing = cardSize.height * 0.5; // 50% от высоты карточки

  return (
    <div className="relative w-full">
      {/* Football field */}
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

      {/* Player slots container */}
      <div
        className="absolute inset-0"
        style={{
          paddingLeft: `${containerPadding}px`,
          paddingRight: `${containerPadding}px`,
          paddingTop: `${containerPadding}px`,
          paddingBottom: `${containerPadding}px`,
        }}
      >
        {/* Row 1 - Goalkeepers (2 игрока) */}
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

        {/* Row 2 - Defenders (5 игроков) */}
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

        {/* Row 3 - Midfielders (5 игроков) */}
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

        {/* Row 4 - Forwards (3 игрока) */}
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
