// // import footballFieldNew from "@/assets/football-field-new.png";
// // import playerJerseyNew from "@/assets/player-jersey-new.png";
// // import jerseyDinamoMinsk from "@/assets/jersey-dinamo-minsk.png";
// // import jerseyBate from "@/assets/jersey-bate.png";
// // import jerseyBateGk from "@/assets/jersey-bate-gk.png";
// // import jerseyDinamoBrest from "@/assets/jersey-dinamo-brest.png";
// // import jerseyMlVitebsk from "@/assets/jersey-ml-vitebsk.png";
// // import jerseyMlVitebskGk from "@/assets/jersey-ml-vitebsk-gk.png";
// // import jerseySlavia from "@/assets/jersey-slaviya.png";
// // import jerseySlaviaGk from "@/assets/jersey-slaviya-gk-new.png";
// // import jerseyNeman from "@/assets/jersey-neman.png";
// // import jerseyMinsk from "@/assets/jersey-minsk.png";
// // import jerseyTorpedo from "@/assets/jersey-torpedo.png";
// // import jerseyVitebsk from "@/assets/jersey-vitebsk.png";
// // import jerseyVitebskGk from "@/assets/jersey-vitebsk-gk.png";
// // import jerseyArsenalGk from "@/assets/jersey-arsenal-gk.png";
// // import captainBadge from "@/assets/captain-badge.png";
// // import viceCaptainBadge from "@/assets/vice-captain-badge.png";
// // import { X, Plus } from "lucide-react";

// // // Helper function to get jersey based on team and position
// // const getJerseyForTeam = (team: string, position?: string) => {
// //   switch (team) {
// //     case "Динамо-Минск":
// //       return jerseyDinamoMinsk;
// //     case "БАТЭ":
// //       return position === "ВР" ? jerseyBateGk : jerseyBate;
// //     case "Динамо-Брест":
// //       return jerseyDinamoBrest;
// //     case "МЛ Витебск":
// //       return position === "ВР" ? jerseyMlVitebskGk : jerseyMlVitebsk;
// //     case "Славия-Мозырь":
// //       return position === "ВР" ? jerseySlaviaGk : jerseySlavia;
// //     case "Арсенал":
// //       return position === "ВР" ? jerseyArsenalGk : playerJerseyNew;
// //     case "Неман":
// //       return jerseyNeman;
// //     case "Минск":
// //       return jerseyMinsk;
// //     case "Торпедо-БелАЗ":
// //       return jerseyTorpedo;
// //     case "Витебск":
// //       return position === "ВР" ? jerseyVitebskGk : jerseyVitebsk;
// //     default:
// //       return playerJerseyNew;
// //   }
// // };

// // interface PlayerData {
// //   id: number;
// //   name: string;
// //   team: string;
// //   position: string;
// //   points: number;
// //   price?: number;
// //   slotIndex?: number;
// //   isCaptain?: boolean;
// //   isViceCaptain?: boolean;
// // }

// // interface FormationPosition {
// //   position: string;
// //   row: number;
// //   col: number;
// // }

// // interface FormationFieldProps {
// //   selectedPlayers?: PlayerData[];
// //   onRemovePlayer?: (playerId: number) => void;
// //   onPlayerClick?: (player: PlayerData) => void;
// //   onEmptySlotClick?: (position: string) => void;
// //   captain?: number | null;
// //   viceCaptain?: number | null;
// //   showCaptainBadges?: boolean;
// // }

// // const FormationField = ({
// //   selectedPlayers = [],
// //   onRemovePlayer,
// //   onPlayerClick,
// //   onEmptySlotClick,
// //   captain,
// //   viceCaptain,
// //   showCaptainBadges = true,
// // }: FormationFieldProps) => {
// //   // Formation: 2 ВР (goalkeepers), 5 ЗЩ (defenders), 5 ПЗ (midfielders), 3 НП (forwards)
// //   const formation: FormationPosition[] = [
// //     // Row 1 - Goalkeepers (top)
// //     { position: "ВР", row: 1, col: 2 },
// //     { position: "ВР", row: 1, col: 4 },
// //     // Row 2 - Defenders
// //     { position: "ЗЩ", row: 2, col: 1 },
// //     { position: "ЗЩ", row: 2, col: 2 },
// //     { position: "ЗЩ", row: 2, col: 3 },
// //     { position: "ЗЩ", row: 2, col: 4 },
// //     { position: "ЗЩ", row: 2, col: 5 },
// //     // Row 3 - Midfielders
// //     { position: "ПЗ", row: 3, col: 1 },
// //     { position: "ПЗ", row: 3, col: 2 },
// //     { position: "ПЗ", row: 3, col: 3 },
// //     { position: "ПЗ", row: 3, col: 4 },
// //     { position: "ПЗ", row: 3, col: 5 },
// //     // Row 4 - Forwards (bottom)
// //     { position: "НП", row: 4, col: 2 },
// //     { position: "НП", row: 4, col: 3 },
// //     { position: "НП", row: 4, col: 4 },
// //   ];

// //   const getPlayerStyle = (row: number, col: number) => {
// //     const topPositions: Record<number, string> = {
// //       1: "1%",
// //       2: "20%",
// //       3: "39%",
// //       4: "58%",
// //     };

// //     // Uniform spacing based on player count per row
// //     const leftPositions: Record<number, Record<number, string>> = {
// //       1: { 2: "35%", 4: "65%" }, // 2 players: symmetric around center
// //       2: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
// //       3: { 1: "10%", 2: "30%", 3: "50%", 4: "70%", 5: "90%" }, // 5 players
// //       4: { 2: "30%", 3: "50%", 4: "70%" }, // 3 players: aligned with columns 2,3,4
// //     };

// //     return {
// //       top: topPositions[row],
// //       left: leftPositions[row][col],
// //     };
// //   };

// //   // Get assigned player for a formation slot
// //   const getAssignedPlayer = (formationPos: FormationPosition) => {
// //     // Find the slot index within the position
// //     const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
// //     const slotPositionIndex = slotsForPosition.findIndex(
// //       (s) => s.row === formationPos.row && s.col === formationPos.col,
// //     );

// //     // Find player assigned to this specific slot
// //     return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
// //   };

// //   const truncateName = (text: string, maxLength: number) => {
// //     if (text.length > maxLength) {
// //       return text.slice(0, maxLength) + "...";
// //     }
// //     return text;
// //   };

// //   return (
// //     <div className="relative w-full">
// //       <img src={footballFieldNew} alt="Football field" className="w-full" />
// //       {formation.map((slot, idx) => {
// //         const style = getPlayerStyle(slot.row, slot.col);
// //         const assignedPlayer = getAssignedPlayer(slot);
// //         const isOccupied = !!assignedPlayer;

// //         return (
// //           <div
// //             key={idx}
// //             className={`absolute flex flex-col items-center ${isOccupied ? "z-20" : "z-10"}`}
// //             style={{
// //               top: style.top,
// //               left: style.left,
// //               transform: "translateX(-50%)",
// //             }}
// //           >
// //             {isOccupied ? (
// //               // Occupied slot with player
// //               <div
// //                 className="w-[70px] h-[84px] relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
// //                 onClick={() => onPlayerClick?.(assignedPlayer)}
// //               >
// //                 {/* Captain/Vice-Captain badge - absolute in left corner */}
// //                 {showCaptainBadges && captain === assignedPlayer.id && (
// //                   <img src={captainBadge} alt="C" className="absolute top-1 left-1 z-50 w-3 h-3" />
// //                 )}
// //                 {showCaptainBadges && viceCaptain === assignedPlayer.id && (
// //                   <img src={viceCaptainBadge} alt="V" className="absolute top-1 left-1 z-50 w-3 h-3" />
// //                 )}

// //                 {/* Delete button - absolute in corner */}
// //                 {onRemovePlayer && (
// //                   <button
// //                     onClick={(e) => {
// //                       e.stopPropagation();
// //                       onRemovePlayer(assignedPlayer.id);
// //                     }}
// //                     className="absolute top-1 right-1 z-50 w-3 h-3 flex items-center justify-center bg-[#5a7a4a] rounded-full"
// //                   >
// //                     <X className="w-2 h-2 text-[#1a2e1a]" />
// //                   </button>
// //                 )}

// //                 {/* Price centered */}
// //                 <div className="w-full flex items-center justify-center pt-1 pb-0.5 z-30 h-[16px]">
// //                   <span className="text-white text-[clamp(8px,2.2vw,12px)] font-medium drop-shadow-md whitespace-nowrap leading-tight">
// //                     ${(assignedPlayer.price || 9).toFixed(1)}
// //                   </span>
// //                 </div>

// //                 {/* Jersey - начинается сразу под ценой */}
// //                 <div className="relative w-full flex-1 z-10 overflow-hidden">
// //                   <img
// //                     src={getJerseyForTeam(assignedPlayer.team, assignedPlayer.position)}
// //                     alt={assignedPlayer.name}
// //                     className="w-[120%] h-auto object-contain absolute -top-[12px] left-1/2 transform -translate-x-1/2"
// //                     style={{ maxWidth: "none" }}
// //                   />
// //                 </div>

// //                 {/* Player name and club blocks */}
// //                 <div className="w-full relative z-20">
// //                   <div className="bg-white px-[4%] py-[2%]">
// //                     <span className="text-[clamp(5px,1.8vw,7px)] font-semibold text-black block truncate whitespace-nowrap text-center">
// //                       {truncateName(assignedPlayer.name, 9)}
// //                     </span>
// //                   </div>
// //                   <div className="bg-[#1a1a2e] px-[4%] py-[2%]">
// //                     <span className="text-[clamp(4px,1.5vw,6px)] font-medium block truncate whitespace-nowrap text-center">
// //                       <span className="text-[#7D7A94]">(Д)</span>
// //                       <span className="text-white ml-[2%]">{truncateName(assignedPlayer.team, 7)}</span>
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>
// //             ) : (
// //               // Empty slot - dashed border, position label, + button
// //               <div
// //                 className="w-[70px] h-[84px] rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center gap-[8%] cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
// //                 onClick={() => onEmptySlotClick?.(slot.position)}
// //               >
// //                 <span className="text-white font-bold text-[clamp(11px,3vw,17px)]">{slot.position}</span>
// //                 <div className="w-[28%] aspect-square rounded-full bg-white/90 flex items-center justify-center">
// //                   <Plus className="w-[60%] h-[60%] text-[#3a5a28]" />
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // };

// // export default FormationField;

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
//     { position: "ВР", row: 1, col: 1 },
//     { position: "ВР", row: 1, col: 2 },
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

//   const truncateName = (text: string, maxLength: number) => {
//     if (text.length > maxLength) {
//       return text.slice(0, maxLength) + "...";
//     }
//     return text;
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

//   // Group players by row
//   const rows = {
//     1: formation.filter((slot) => slot.row === 1),
//     2: formation.filter((slot) => slot.row === 2),
//     3: formation.filter((slot) => slot.row === 3),
//     4: formation.filter((slot) => slot.row === 4),
//   };

//   return (
//     <div className="relative w-full">
//       {/* Football field with padding */}
//       <div className="px-[5px] py-[5px]">
//         <img src={footballFieldNew} alt="Football field" className="w-full" />
//       </div>

//       {/* Player slots container */}
//       <div className="absolute inset-0 px-[5px] py-[5px]">
//         {/* Row 1 - Goalkeepers */}
//         <div className="absolute top-[2%] left-0 right-0 flex justify-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
//           {rows[1].map((slot, idx) => {
//             const assignedPlayer = getAssignedPlayer(slot);
//             const isOccupied = !!assignedPlayer;

//             return (
//               <div key={idx} className="flex flex-col items-center">
//                 {isOccupied ? (
//                   // Occupied slot with player
//                   <div
//                     className="relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                     }}
//                     onClick={() => onPlayerClick?.(assignedPlayer!)}
//                   >
//                     {/* Captain/Vice-Captain badge */}
//                     {showCaptainBadges && captain === assignedPlayer!.id && (
//                       <img
//                         src={captainBadge}
//                         alt="C"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}
//                     {showCaptainBadges && viceCaptain === assignedPlayer!.id && (
//                       <img
//                         src={viceCaptainBadge}
//                         alt="V"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}

//                     {/* Delete button */}
//                     {onRemovePlayer && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onRemovePlayer(assignedPlayer!.id);
//                         }}
//                         className="absolute top-1 right-1 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       >
//                         <X
//                           className="text-[#1a2e1a]"
//                           style={{
//                             width: "clamp(6px, 0.85vw, 10px)",
//                             height: "clamp(6px, 0.85vw, 10px)",
//                           }}
//                         />
//                       </button>
//                     )}

//                     {/* Price */}
//                     <div
//                       className="w-full flex items-center justify-center pt-1 pb-0.5 z-30"
//                       style={{ height: "clamp(14px, 2vw, 20px)" }}
//                     >
//                       <span
//                         className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
//                         style={{ fontSize: "clamp(7px, 1vw, 12px)" }}
//                       >
//                         ${(assignedPlayer!.price || 9).toFixed(1)}
//                       </span>
//                     </div>

//                     {/* Jersey */}
//                     <div className="relative w-full flex-1 z-10 overflow-hidden">
//                       <img
//                         src={getJerseyForTeam(assignedPlayer!.team, assignedPlayer!.position)}
//                         alt={assignedPlayer!.name}
//                         className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
//                         style={{
//                           width: "clamp(125%, 14vw, 145%)",
//                           top: "clamp(-9px, -1.3vw, -13px)",
//                         }}
//                       />
//                     </div>

//                     {/* Name and team */}
//                     <div className="w-full relative z-20">
//                       <div className="bg-white" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-semibold text-black block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(4px, 0.7vw, 8px)" }}
//                         >
//                           {truncateName(assignedPlayer!.name, 9)}
//                         </span>
//                       </div>
//                       <div className="bg-[#1a1a2e]" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-medium block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(3px, 0.6vw, 7px)" }}
//                         >
//                           <span className="text-[#7D7A94]">(Д)</span>
//                           <span className="text-white ml-[2%]">{truncateName(assignedPlayer!.team, 7)}</span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   // Empty slot
//                   <div
//                     className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                       gap: "clamp(4px, 0.6vw, 8px)",
//                     }}
//                     onClick={() => onEmptySlotClick?.(slot.position)}
//                   >
//                     <span className="text-white font-bold" style={{ fontSize: "clamp(10px, 1.4vw, 16px)" }}>
//                       {slot.position}
//                     </span>
//                     <div
//                       className="rounded-full bg-white/90 flex items-center justify-center"
//                       style={{
//                         width: "clamp(15px, 2.2vw, 22px)",
//                         height: "clamp(15px, 2.2vw, 22px)",
//                       }}
//                     >
//                       <Plus
//                         className="text-[#3a5a28]"
//                         style={{
//                           width: "clamp(8px, 1.2vw, 14px)",
//                           height: "clamp(8px, 1.2vw, 14px)",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Row 2 - Defenders */}
//         <div className="absolute top-[22%] left-0 right-0 flex justify-center gap-[4px] sm:gap-[6px] md:gap-[8px]">
//           {rows[2].map((slot, idx) => {
//             const assignedPlayer = getAssignedPlayer(slot);
//             const isOccupied = !!assignedPlayer;

//             return (
//               <div key={idx} className="flex flex-col items-center">
//                 {isOccupied ? (
//                   <div
//                     className="relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                     }}
//                     onClick={() => onPlayerClick?.(assignedPlayer!)}
//                   >
//                     {/* Badges and content same as above */}
//                     {showCaptainBadges && captain === assignedPlayer!.id && (
//                       <img
//                         src={captainBadge}
//                         alt="C"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}
//                     {showCaptainBadges && viceCaptain === assignedPlayer!.id && (
//                       <img
//                         src={viceCaptainBadge}
//                         alt="V"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}

//                     {onRemovePlayer && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onRemovePlayer(assignedPlayer!.id);
//                         }}
//                         className="absolute top-1 right-1 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       >
//                         <X
//                           className="text-[#1a2e1a]"
//                           style={{
//                             width: "clamp(6px, 0.85vw, 10px)",
//                             height: "clamp(6px, 0.85vw, 10px)",
//                           }}
//                         />
//                       </button>
//                     )}

//                     <div
//                       className="w-full flex items-center justify-center pt-1 pb-0.5 z-30"
//                       style={{ height: "clamp(14px, 2vw, 20px)" }}
//                     >
//                       <span
//                         className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
//                         style={{ fontSize: "clamp(7px, 1vw, 12px)" }}
//                       >
//                         ${(assignedPlayer!.price || 9).toFixed(1)}
//                       </span>
//                     </div>

//                     <div className="relative w-full flex-1 z-10 overflow-hidden">
//                       <img
//                         src={getJerseyForTeam(assignedPlayer!.team, assignedPlayer!.position)}
//                         alt={assignedPlayer!.name}
//                         className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
//                         style={{
//                           width: "clamp(125%, 14vw, 145%)",
//                           top: "clamp(-9px, -1.3vw, -13px)",
//                         }}
//                       />
//                     </div>

//                     <div className="w-full relative z-20">
//                       <div className="bg-white" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-semibold text-black block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(4px, 0.7vw, 8px)" }}
//                         >
//                           {truncateName(assignedPlayer!.name, 9)}
//                         </span>
//                       </div>
//                       <div className="bg-[#1a1a2e]" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-medium block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(3px, 0.6vw, 7px)" }}
//                         >
//                           <span className="text-[#7D7A94]">(Д)</span>
//                           <span className="text-white ml-[2%]">{truncateName(assignedPlayer!.team, 7)}</span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div
//                     className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                       gap: "clamp(4px, 0.6vw, 8px)",
//                     }}
//                     onClick={() => onEmptySlotClick?.(slot.position)}
//                   >
//                     <span className="text-white font-bold" style={{ fontSize: "clamp(10px, 1.4vw, 16px)" }}>
//                       {slot.position}
//                     </span>
//                     <div
//                       className="rounded-full bg-white/90 flex items-center justify-center"
//                       style={{
//                         width: "clamp(15px, 2.2vw, 22px)",
//                         height: "clamp(15px, 2.2vw, 22px)",
//                       }}
//                     >
//                       <Plus
//                         className="text-[#3a5a28]"
//                         style={{
//                           width: "clamp(8px, 1.2vw, 14px)",
//                           height: "clamp(8px, 1.2vw, 14px)",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Row 3 - Midfielders */}
//         <div className="absolute top-[42%] left-0 right-0 flex justify-center gap-[4px] sm:gap-[6px] md:gap-[8px]">
//           {rows[3].map((slot, idx) => {
//             const assignedPlayer = getAssignedPlayer(slot);
//             const isOccupied = !!assignedPlayer;

//             return (
//               <div key={idx} className="flex flex-col items-center">
//                 {isOccupied ? (
//                   <div
//                     className="relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                     }}
//                     onClick={() => onPlayerClick?.(assignedPlayer!)}
//                   >
//                     {/* Same player card structure as above */}
//                     {showCaptainBadges && captain === assignedPlayer!.id && (
//                       <img
//                         src={captainBadge}
//                         alt="C"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}
//                     {showCaptainBadges && viceCaptain === assignedPlayer!.id && (
//                       <img
//                         src={viceCaptainBadge}
//                         alt="V"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}

//                     {onRemovePlayer && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onRemovePlayer(assignedPlayer!.id);
//                         }}
//                         className="absolute top-1 right-1 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       >
//                         <X
//                           className="text-[#1a2e1a]"
//                           style={{
//                             width: "clamp(6px, 0.85vw, 10px)",
//                             height: "clamp(6px, 0.85vw, 10px)",
//                           }}
//                         />
//                       </button>
//                     )}

//                     <div
//                       className="w-full flex items-center justify-center pt-1 pb-0.5 z-30"
//                       style={{ height: "clamp(14px, 2vw, 20px)" }}
//                     >
//                       <span
//                         className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
//                         style={{ fontSize: "clamp(7px, 1vw, 12px)" }}
//                       >
//                         ${(assignedPlayer!.price || 9).toFixed(1)}
//                       </span>
//                     </div>

//                     <div className="relative w-full flex-1 z-10 overflow-hidden">
//                       <img
//                         src={getJerseyForTeam(assignedPlayer!.team, assignedPlayer!.position)}
//                         alt={assignedPlayer!.name}
//                         className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
//                         style={{
//                           width: "clamp(125%, 14vw, 145%)",
//                           top: "clamp(-9px, -1.3vw, -13px)",
//                         }}
//                       />
//                     </div>

//                     <div className="w-full relative z-20">
//                       <div className="bg-white" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-semibold text-black block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(4px, 0.7vw, 8px)" }}
//                         >
//                           {truncateName(assignedPlayer!.name, 9)}
//                         </span>
//                       </div>
//                       <div className="bg-[#1a1a2e]" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-medium block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(3px, 0.6vw, 7px)" }}
//                         >
//                           <span className="text-[#7D7A94]">(Д)</span>
//                           <span className="text-white ml-[2%]">{truncateName(assignedPlayer!.team, 7)}</span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div
//                     className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                       gap: "clamp(4px, 0.6vw, 8px)",
//                     }}
//                     onClick={() => onEmptySlotClick?.(slot.position)}
//                   >
//                     <span className="text-white font-bold" style={{ fontSize: "clamp(10px, 1.4vw, 16px)" }}>
//                       {slot.position}
//                     </span>
//                     <div
//                       className="rounded-full bg-white/90 flex items-center justify-center"
//                       style={{
//                         width: "clamp(15px, 2.2vw, 22px)",
//                         height: "clamp(15px, 2.2vw, 22px)",
//                       }}
//                     >
//                       <Plus
//                         className="text-[#3a5a28]"
//                         style={{
//                           width: "clamp(8px, 1.2vw, 14px)",
//                           height: "clamp(8px, 1.2vw, 14px)",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Row 4 - Forwards */}
//         <div className="absolute top-[62%] left-0 right-0 flex justify-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
//           {rows[4].map((slot, idx) => {
//             const assignedPlayer = getAssignedPlayer(slot);
//             const isOccupied = !!assignedPlayer;

//             return (
//               <div key={idx} className="flex flex-col items-center">
//                 {isOccupied ? (
//                   <div
//                     className="relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                     }}
//                     onClick={() => onPlayerClick?.(assignedPlayer!)}
//                   >
//                     {/* Same player card structure as above */}
//                     {showCaptainBadges && captain === assignedPlayer!.id && (
//                       <img
//                         src={captainBadge}
//                         alt="C"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}
//                     {showCaptainBadges && viceCaptain === assignedPlayer!.id && (
//                       <img
//                         src={viceCaptainBadge}
//                         alt="V"
//                         className="absolute top-1 left-1 z-50"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       />
//                     )}

//                     {onRemovePlayer && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onRemovePlayer(assignedPlayer!.id);
//                         }}
//                         className="absolute top-1 right-1 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
//                         style={{
//                           width: "clamp(10px, 1.4vw, 14px)",
//                           height: "clamp(10px, 1.4vw, 14px)",
//                         }}
//                       >
//                         <X
//                           className="text-[#1a2e1a]"
//                           style={{
//                             width: "clamp(6px, 0.85vw, 10px)",
//                             height: "clamp(6px, 0.85vw, 10px)",
//                           }}
//                         />
//                       </button>
//                     )}

//                     <div
//                       className="w-full flex items-center justify-center pt-1 pb-0.5 z-30"
//                       style={{ height: "clamp(14px, 2vw, 20px)" }}
//                     >
//                       <span
//                         className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
//                         style={{ fontSize: "clamp(7px, 1vw, 12px)" }}
//                       >
//                         ${(assignedPlayer!.price || 9).toFixed(1)}
//                       </span>
//                     </div>

//                     <div className="relative w-full flex-1 z-10 overflow-hidden">
//                       <img
//                         src={getJerseyForTeam(assignedPlayer!.team, assignedPlayer!.position)}
//                         alt={assignedPlayer!.name}
//                         className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
//                         style={{
//                           width: "clamp(125%, 14vw, 145%)",
//                           top: "clamp(-9px, -1.3vw, -13px)",
//                         }}
//                       />
//                     </div>

//                     <div className="w-full relative z-20">
//                       <div className="bg-white" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-semibold text-black block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(4px, 0.7vw, 8px)" }}
//                         >
//                           {truncateName(assignedPlayer!.name, 9)}
//                         </span>
//                       </div>
//                       <div className="bg-[#1a1a2e]" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
//                         <span
//                           className="font-medium block truncate whitespace-nowrap text-center"
//                           style={{ fontSize: "clamp(3px, 0.6vw, 7px)" }}
//                         >
//                           <span className="text-[#7D7A94]">(Д)</span>
//                           <span className="text-white ml-[2%]">{truncateName(assignedPlayer!.team, 7)}</span>
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div
//                     className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
//                     style={{
//                       width: "clamp(56px, 8vw, 72px)",
//                       height: "clamp(68px, 9.5vw, 88px)",
//                       gap: "clamp(4px, 0.6vw, 8px)",
//                     }}
//                     onClick={() => onEmptySlotClick?.(slot.position)}
//                   >
//                     <span className="text-white font-bold" style={{ fontSize: "clamp(10px, 1.4vw, 16px)" }}>
//                       {slot.position}
//                     </span>
//                     <div
//                       className="rounded-full bg-white/90 flex items-center justify-center"
//                       style={{
//                         width: "clamp(15px, 2.2vw, 22px)",
//                         height: "clamp(15px, 2.2vw, 22px)",
//                       }}
//                     >
//                       <Plus
//                         className="text-[#3a5a28]"
//                         style={{
//                           width: "clamp(8px, 1.2vw, 14px)",
//                           height: "clamp(8px, 1.2vw, 14px)",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
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

  // Компонент карточки игрока (вынесен для переиспользования)
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
        width: "clamp(56px, 8vw, 72px)",
        height: "clamp(68px, 9.5vw, 88px)",
      }}
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Captain/Vice-Captain badge */}
      {showCaptainBadges && captain === player.id && (
        <img
          src={captainBadge}
          alt="C"
          className="absolute top-1 left-1 z-50"
          style={{
            width: "clamp(10px, 1.4vw, 14px)",
            height: "clamp(10px, 1.4vw, 14px)",
          }}
        />
      )}
      {showCaptainBadges && viceCaptain === player.id && (
        <img
          src={viceCaptainBadge}
          alt="V"
          className="absolute top-1 left-1 z-50"
          style={{
            width: "clamp(10px, 1.4vw, 14px)",
            height: "clamp(10px, 1.4vw, 14px)",
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
          className="absolute top-1 right-1 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
          style={{
            width: "clamp(10px, 1.4vw, 14px)",
            height: "clamp(10px, 1.4vw, 14px)",
          }}
        >
          <X
            className="text-[#1a2e1a]"
            style={{
              width: "clamp(6px, 0.85vw, 10px)",
              height: "clamp(6px, 0.85vw, 10px)",
            }}
          />
        </button>
      )}

      {/* Price */}
      <div
        className="w-full flex items-center justify-center pt-1 pb-0.5 z-30"
        style={{ height: "clamp(14px, 2vw, 20px)" }}
      >
        <span
          className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
          style={{ fontSize: "clamp(7px, 1vw, 12px)" }}
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
            width: "clamp(125%, 14vw, 145%)",
            top: "clamp(-9px, -1.3vw, -13px)",
          }}
        />
      </div>

      {/* Name and team */}
      <div className="w-full relative z-20">
        <div className="bg-white" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
          <span
            className="font-semibold text-black block truncate whitespace-nowrap text-center"
            style={{ fontSize: "clamp(4px, 0.7vw, 8px)" }}
          >
            {truncateName(player.name, 9)}
          </span>
        </div>
        <div className="bg-[#1a1a2e]" style={{ padding: "clamp(1px, 0.2vw, 3px)" }}>
          <span
            className="font-medium block truncate whitespace-nowrap text-center"
            style={{ fontSize: "clamp(3px, 0.6vw, 7px)" }}
          >
            <span className="text-[#7D7A94]">(Д)</span>
            <span className="text-white ml-[2%]">{truncateName(player.team, 7)}</span>
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
        width: "clamp(56px, 8vw, 72px)",
        height: "clamp(68px, 9.5vw, 88px)",
        gap: "clamp(4px, 0.6vw, 8px)",
      }}
      onClick={() => onEmptySlotClick?.(position)}
    >
      <span className="text-white font-bold" style={{ fontSize: "clamp(10px, 1.4vw, 16px)" }}>
        {position}
      </span>
      <div
        className="rounded-full bg-white/90 flex items-center justify-center"
        style={{
          width: "clamp(15px, 2.2vw, 22px)",
          height: "clamp(15px, 2.2vw, 22px)",
        }}
      >
        <Plus
          className="text-[#3a5a28]"
          style={{
            width: "clamp(8px, 1.2vw, 14px)",
            height: "clamp(8px, 1.2vw, 14px)",
          }}
        />
      </div>
    </div>
  );

  // Рассчитываем пропорциональные отступы и гэпы
  const containerPadding = "clamp(2px, 0.5vw, 4px)"; // Меньше паддинги
  const rowGap = "clamp(4px, 0.8vw, 8px)"; // Отступ между карточками в строке
  const verticalGap = "clamp(8px, 1.5vw, 16px)"; // Отступ между строками

  // Вертикальные позиции строк (проценты от высоты поля)
  const rowPositions = {
    1: "2%", // Вратари
    2: "25%", // Защитники
    3: "48%", // Полузащитники
    4: "71%", // Нападающие
  };

  return (
    <div className="relative w-full">
      {/* Football field with SMALLER padding */}
      <div className="px-[clamp(2px,0.5vw,4px)] py-[clamp(2px,0.5vw,4px)]">
        <img src={footballFieldNew} alt="Football field" className="w-full" />
      </div>

      {/* Player slots container with proportional spacing */}
      <div
        className="absolute inset-0"
        style={{
          padding: containerPadding,
        }}
      >
        {/* Row 1 - Goalkeepers (2 игрока) */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: rowPositions[1],
            gap: rowGap,
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
            top: rowPositions[2],
            gap: `calc(${rowGap} / 1.5)`, // Меньше гэп для 5 карточек
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
            top: rowPositions[3],
            gap: `calc(${rowGap} / 1.5)`, // Меньше гэп для 5 карточек
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
            top: rowPositions[4],
            gap: `calc(${rowGap} * 1.2)`, // Больше гэп для 3 карточек
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
