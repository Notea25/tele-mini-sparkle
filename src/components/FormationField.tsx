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
//       1: "0%",
//       2: "18%",
//       3: "36%",
//       4: "54%",
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
//                 className="w-[62px] h-[84px] relative flex flex-col items-center cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
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
//                 <div className="w-full flex items-center justify-center pt-1 pb-0.5">
//                   <span className="text-white text-[clamp(8px,2.2vw,12px)] font-medium drop-shadow-md whitespace-nowrap leading-tight">
//                     ${(assignedPlayer.price || 9).toFixed(1)}
//                   </span>
//                 </div>

//                 {/* Jersey - larger size, overlaps name/club below */}
//                 <img
//                   src={getJerseyForTeam(assignedPlayer.team, assignedPlayer.position)}
//                   alt={assignedPlayer.name}
//                   className="w-[156%] h-auto object-contain mb-[-30] z-0"
//                 />

//                 {/* Player name and club blocks - jersey overlaps from above */}
//                 <div className="w-full relative z-10">
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
//               // Empty slot - dashed border, position label, + button (same size as filled card ~85px height)
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
    { position: "ВР", row: 1, col: 2 },
    { position: "ВР", row: 1, col: 4 },
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
    { position: "НП", row: 4, col: 2 },
    { position: "НП", row: 4, col: 3 },
    { position: "НП", row: 4, col: 4 },
  ];

  const getPlayerStyle = (row: number, col: number) => {
    const topPositions: Record<number, string> = {
      1: "0%",
      2: "18%",
      3: "36%",
      4: "54%",
    };

    // Uniform spacing based on player count per row
    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: "35%", 4: "65%" }, // 2 players: symmetric around center
      2: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
      3: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
      4: { 2: "30%", 3: "50%", 4: "70%" }, // 3 players: aligned with columns 2,3,4
    };

    return {
      top: topPositions[row],
      left: leftPositions[row][col],
    };
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

  const truncateName = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="relative w-full">
      <img src={footballFieldNew} alt="Football field" className="w-full" />
      {formation.map((slot, idx) => {
        const style = getPlayerStyle(slot.row, slot.col);
        const assignedPlayer = getAssignedPlayer(slot);
        const isOccupied = !!assignedPlayer;

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
            {isOccupied ? (
              // Occupied slot with player
              <div
                className="w-[70px] h-[84px] relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
                onClick={() => onPlayerClick?.(assignedPlayer)}
              >
                {/* Captain/Vice-Captain badge - absolute in left corner */}
                {showCaptainBadges && captain === assignedPlayer.id && (
                  <img src={captainBadge} alt="C" className="absolute top-1 left-1 z-50 w-3 h-3" />
                )}
                {showCaptainBadges && viceCaptain === assignedPlayer.id && (
                  <img src={viceCaptainBadge} alt="V" className="absolute top-1 left-1 z-50 w-3 h-3" />
                )}

                {/* Delete button - absolute in corner */}
                {onRemovePlayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(assignedPlayer.id);
                    }}
                    className="absolute top-1 right-1 z-50 w-3 h-3 flex items-center justify-center bg-[#5a7a4a] rounded-full"
                  >
                    <X className="w-2 h-2 text-[#1a2e1a]" />
                  </button>
                )}

                {/* Price centered */}
                <div className="w-full flex items-center justify-center pt-1 pb-0.5 z-30 h-[16px]">
                  <span className="text-white text-[clamp(8px,2.2vw,12px)] font-medium drop-shadow-md whitespace-nowrap leading-tight">
                    ${(assignedPlayer.price || 9).toFixed(1)}
                  </span>
                </div>

                {/* Jersey - начинается сразу под ценой */}
                <div className="relative w-full flex-1 z-10 overflow-hidden">
                  <img
                    src={getJerseyForTeam(assignedPlayer.team, assignedPlayer.position)}
                    alt={assignedPlayer.name}
                    className="w-[120%] h-auto object-contain absolute top-0 left-1/2 transform -translate-x-1/2"
                    style={{ maxWidth: "none" }}
                  />
                </div>

                {/* Player name and club blocks */}
                <div className="w-full relative z-20">
                  <div className="bg-white px-[4%] py-[2%]">
                    <span className="text-[clamp(5px,1.8vw,7px)] font-semibold text-black block truncate whitespace-nowrap text-center">
                      {truncateName(assignedPlayer.name, 9)}
                    </span>
                  </div>
                  <div className="bg-[#1a1a2e] px-[4%] py-[2%]">
                    <span className="text-[clamp(4px,1.5vw,6px)] font-medium block truncate whitespace-nowrap text-center">
                      <span className="text-[#7D7A94]">(Д)</span>
                      <span className="text-white ml-[2%]">{truncateName(assignedPlayer.team, 7)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Empty slot - dashed border, position label, + button
              <div
                className="w-[70px] h-[84px] rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center gap-[8%] cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
                onClick={() => onEmptySlotClick?.(slot.position)}
              >
                <span className="text-white font-bold text-[clamp(11px,3vw,17px)]">{slot.position}</span>
                <div className="w-[28%] aspect-square rounded-full bg-white/90 flex items-center justify-center">
                  <Plus className="w-[60%] h-[60%] text-[#3a5a28]" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormationField;
