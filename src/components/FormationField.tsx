// import footballFieldNew from "@/assets/football-field-new.png";
// import playerJerseyNew from "@/assets/player-jersey-new.png";
// import captainBadge from "@/assets/captain-badge.png";
// import viceCaptainBadge from "@/assets/vice-captain-badge.png";
// import swapArrows from "@/assets/swap-arrows.png";
// import redCardBadge from "@/assets/red-card-badge.png";
// import injuryBadge from "@/assets/injury-badge.svg";
// import boostBadge3x from "@/assets/boost-badge-3x.png";
// import boostBadge2x from "@/assets/boost-badge-2x.png";
// import boostBadgeBench from "@/assets/boost-badge-bench.png";
// import { X, Plus, ArrowUp } from "lucide-react";
// import { useState, useEffect, useMemo, useCallback } from "react";
// import { getJerseyForTeam } from "@/hooks/getJerseyForTeam.tsx";
// import { BOOST_CONFIG } from "@/lib/tourData";
// import {
//   getFormationSlots,
//   getPlayerPosition,
//   detectFormation,
//   getFormationForMode,
//   MODE_FORMATIONS,
// } from "@/lib/formationUtils";

// // Player data interface
// export interface FormationPlayerData {
//   id: number;
//   name: string;
//   team: string;
//   position: string;
//   points: number;
//   price?: number;
//   slotIndex?: number;
//   isCaptain?: boolean;
//   isViceCaptain?: boolean;
//   hasRedCard?: boolean;
//   isInjured?: boolean;
//   nextOpponent?: string; // Next match opponent team name
//   nextOpponentHome?: boolean; // Is next match at home?
// }

// // Removed player info for transfers mode
// export interface RemovedPlayerInfo {
//   position: string;
//   slotIndex: number;
//   name: string;
//   team: string;
// }

// // Mode types
// export type FormationMode = "create" | "management" | "transfers" | "view";

// export interface FormationFieldProps {
//   // Mode determines behavior and available features
//   mode: FormationMode;

//   // Player data - use based on mode
//   // For 'create', 'transfers', 'view' - single players array
//   // For 'management' - main squad + bench
//   players?: FormationPlayerData[];
//   mainSquadPlayers?: FormationPlayerData[];
//   benchPlayers?: FormationPlayerData[];

//   // Bench configuration (management mode)
//   maxBenchSize?: number;
//   showBench?: boolean;

//   // Actions
//   onPlayerClick?: (player: FormationPlayerData) => void;
//   onRemovePlayer?: (playerId: number) => void;
//   onSwapPlayer?: (playerId: number) => void;
//   onEmptySlotClick?: (position: string, isOnBench?: boolean, slotIndex?: number) => void;
//   onSwapBenchPlayers?: (fromIndex: number, toIndex: number) => void;

//   // Captain/Vice-Captain
//   captain?: number | null;
//   viceCaptain?: number | null;
//   showCaptainBadges?: boolean;

//   // Boosts (management mode)
//   isBenchBoostActive?: boolean;
//   isDoublePowerBoostActive?: boolean;
//   isCaptain3xBoostActive?: boolean;

//   // Display options
//   showPrice?: boolean;
//   showPointsInsteadOfTeam?: boolean;
//   showRemoveButton?: boolean;

//   // Swap mode (management mode)
//   swapModePlayerId?: number | null;
//   validSwapTargetIds?: Set<number>;

//   // Transfers mode specific
//   removedPlayers?: RemovedPlayerInfo[];
//   newPlayerIds?: Set<number>;
// }

// const FormationField = ({
//   mode,
//   players = [],
//   mainSquadPlayers = [],
//   benchPlayers = [],
//   maxBenchSize = 4,
//   showBench = false,
//   onPlayerClick,
//   onRemovePlayer,
//   onSwapPlayer,
//   onEmptySlotClick,
//   onSwapBenchPlayers,
//   captain,
//   viceCaptain,
//   showCaptainBadges = true,
//   isBenchBoostActive = false,
//   isDoublePowerBoostActive = false,
//   isCaptain3xBoostActive = false,
//   showPrice = true,
//   showPointsInsteadOfTeam = false,
//   showRemoveButton,
//   swapModePlayerId = null,
//   validSwapTargetIds = new Set(),
//   removedPlayers = [],
//   newPlayerIds = new Set(),
// }: FormationFieldProps) => {
//   // Determine actual showRemoveButton based on mode
//   const actualShowRemoveButton = showRemoveButton ?? (mode === "create" || mode === "transfers");

//   // Get formation based on mode - теперь используем единый подход
//   const formation = useMemo(() => {
//     if (mode === "management" || mode === "view") {
//       // Для режима управления используем детектированную формацию
//       const detected = detectFormation(mainSquadPlayers);
//       return getFormationSlots(detected || "1-4-4-2");
//     }
//     // Для create/transfers используем специальную формацию 1-5-5-3
//     return getFormationSlots("1-5-5-3");
//   }, [mode, mainSquadPlayers]);

//   // Get players based on mode
//   const getPlayerForSlot = useCallback(
//     (position: string, slotIndex: number) => {
//       if (mode === "management" || mode === "view") {
//         return mainSquadPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
//       }
//       // Для create/transfers используем простой поиск по позиции и slotIndex
//       return players.find((p) => p.position === position && p.slotIndex === slotIndex);
//     },
//     [mode, players, mainSquadPlayers],
//   );

//   const getRemovedPlayerForSlot = useCallback(
//     (position: string, slotIndex: number) => {
//       return removedPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
//     },
//     [removedPlayers],
//   );

//   // Card size state - унифицированные размеры для всех устройств
//   const [cardSize, setCardSize] = useState({ width: 90, height: 108 });
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const updateCardSize = () => {
//       const width = window.innerWidth;
//       let cardWidth, cardHeight;

//       // Унифицированные размеры для одинакового отображения
//       if (width <= 768) {
//         cardWidth = 90;
//         cardHeight = 108;
//         setIsMobile(true);
//       } else if (width <= 1024) {
//         cardWidth = 100;
//         cardHeight = 120;
//         setIsMobile(false);
//       } else {
//         cardWidth = 110;
//         cardHeight = 132;
//         setIsMobile(false);
//       }

//       setCardSize({ width: cardWidth, height: cardHeight });
//     };

//     updateCardSize();

//     let timeoutId: NodeJS.Timeout;
//     const handleResize = () => {
//       clearTimeout(timeoutId);
//       timeoutId = setTimeout(updateCardSize, 250);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       clearTimeout(timeoutId);
//     };
//   }, []);

//   const truncateName = useCallback((text: string, maxLength: number) => {
//     if (text.length > maxLength) {
//       return text.slice(0, maxLength) + "...";
//     }
//     return text;
//   }, []);

//   // Format player name: show only surname, add initials for players with same surname
//   const formatPlayerName = useCallback((playerName: string, allPlayersList: FormationPlayerData[]) => {
//     // Parse name - could be "Имя Фамилия" or "И. Фамилия"
//     const parts = playerName.trim().split(/\s+/);
//     if (parts.length < 2) return playerName;

//     const firstName = parts[0];
//     const surname = parts.slice(1).join(" ");

//     // Get all surnames from all players
//     const getSurname = (name: string) => {
//       const p = name.trim().split(/\s+/);
//       return p.length >= 2 ? p.slice(1).join(" ") : name;
//     };

//     const getFirstName = (name: string) => {
//       const p = name.trim().split(/\s+/);
//       return p.length >= 2 ? p[0] : "";
//     };

//     // Find players with the same surname
//     const playersWithSameSurname = allPlayersList.filter(
//       (p) => getSurname(p.name) === surname && p.name !== playerName,
//     );

//     // If no duplicates, just return surname
//     if (playersWithSameSurname.length === 0) {
//       return surname;
//     }

//     // Check if first letter distinguishes
//     const myFirstLetter = firstName.charAt(0).toUpperCase();
//     const othersFirstLetters = playersWithSameSurname.map((p) => getFirstName(p.name).charAt(0).toUpperCase());

//     if (!othersFirstLetters.includes(myFirstLetter)) {
//       return `${myFirstLetter}. ${surname}`;
//     }

//     // Need second letter too
//     const mySecondLetter = firstName.length > 1 ? firstName.charAt(1).toLowerCase() : "";
//     return `${myFirstLetter}${mySecondLetter}. ${surname}`;
//   }, []);

//   // Render player card
//   const renderPlayer = useCallback(
//     (player: FormationPlayerData, isOnBench = false, benchIndex?: number) => {
//       const isCaptainPlayer = captain === player.id;
//       const isViceCaptainPlayer = viceCaptain === player.id;
//       const isCaptainOrVice = isCaptainPlayer || isViceCaptainPlayer;
//       const isNewPlayer = newPlayerIds.has(player.id);
//       const hasRedCard = player.hasRedCard;
//       const isInjured = player.isInjured;

//       // Boost visibility
//       const showDoublePowerBorder = isDoublePowerBoostActive && isCaptainOrVice;
//       const showDoublePowerIcon = isDoublePowerBoostActive && isCaptainOrVice && !isOnBench;
//       const showCaptain3xBorder = isCaptain3xBoostActive && isCaptainPlayer;
//       const showCaptain3xIcon = isCaptain3xBoostActive && isCaptainPlayer && !isOnBench;

//       // Swap mode highlighting
//       const isSwapSource = swapModePlayerId === player.id;
//       const isValidSwapTarget = swapModePlayerId && validSwapTargetIds.has(player.id);
//       const isInSwapModeButNotTarget = swapModePlayerId && !isSwapSource && !isValidSwapTarget;

//       // Border styling
//       let borderClass = "border-white/60";
//       if (isSwapSource) {
//         borderClass = "border-primary border-2";
//       } else if (isValidSwapTarget) {
//         borderClass = "border-primary/80 border-2";
//       } else if (hasRedCard || isInjured) {
//         borderClass = "border-red-500";
//       } else if (showDoublePowerBorder || showCaptain3xBorder || (isOnBench && isBenchBoostActive)) {
//         borderClass = "border-primary";
//       } else if (isNewPlayer) {
//         borderClass = "border-primary border-2";
//       }

//       // Background styling
//       let bgClass = "bg-[#3a5a28]/40";
//       const hasBenchBoostOnBench = isOnBench && isBenchBoostActive;
//       const hasBoostEffect = showDoublePowerBorder || showCaptain3xBorder || hasBenchBoostOnBench;

//       if (isSwapSource) {
//         bgClass = "bg-primary/30";
//       } else if (isValidSwapTarget) {
//         bgClass = "bg-primary/20";
//       } else if (hasRedCard || isInjured) {
//         bgClass = "bg-red-500/25";
//       } else if (hasBoostEffect) {
//         bgClass = "bg-primary/25";
//       } else if (isNewPlayer) {
//         bgClass = "bg-primary/25";
//       }

//       // Opacity for non-valid targets in swap mode
//       const opacityClass = isInSwapModeButNotTarget ? "opacity-40" : "";

//       // Shadow for new players
//       const shadowClass = isNewPlayer ? "shadow-[0_0_12px_hsl(var(--primary)/0.4)]" : "";

//       // Bench swap button visibility
//       const isGoalkeeper = player.position === "ВР";
//       const playerAboveIsGK = benchIndex !== undefined && benchIndex === 1 && benchPlayers[0]?.position === "ВР";
//       const canSwapOnBench =
//         isOnBench && benchIndex !== undefined && benchIndex > 0 && !isGoalkeeper && !playerAboveIsGK;

//       // Calculate display text
//       const maxNameLength = Math.floor(cardSize.width / 7);
//       const maxTeamLength = Math.floor(cardSize.width / 9);

//       // Get all players list for surname check
//       const allPlayersList =
//         mode === "management" || mode === "view" ? [...mainSquadPlayers, ...benchPlayers] : players;

//       // Format name: surname only, or with initials for duplicates
//       const formattedName = formatPlayerName(player.name, allPlayersList);
//       const displayName = truncateName(formattedName, maxNameLength);

//       // Next opponent display
//       const nextOpponent = player.nextOpponent || player.team;
//       const isHome = player.nextOpponentHome !== undefined ? player.nextOpponentHome : true;
//       const homeAwayLabel = isHome ? "(Д)" : "(Г)";
//       const displayOpponent = truncateName(nextOpponent, maxTeamLength);

//       // Определяем отступ сверху для джерси
//       const jerseyPaddingTop = isMobile ? "13px" : "20px";

//       return (
//         <div
//           className={`relative flex flex-col cursor-pointer border rounded-md overflow-hidden ${bgClass} backdrop-blur-[2px] transition-all duration-200 ${borderClass} ${opacityClass} ${shadowClass} hover:bg-[#3a5a28]/60`}
//           style={{
//             width: `${cardSize.width}px`,
//             height: `${cardSize.height}px`,
//           }}
//           onClick={() => onPlayerClick?.(player)}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" || e.key === " ") {
//               e.preventDefault();
//               onPlayerClick?.(player);
//             }
//           }}
//           aria-label={`Игрок ${player.name}, команда ${player.team}, позиция ${player.position}`}
//         >
//           {/* Valid swap target indicator */}
//           {isValidSwapTarget && (
//             <div className="absolute inset-0 z-40 flex items-center justify-center bg-primary/10 animate-pulse">
//               <span className="text-primary font-bold" style={{ fontSize: `${cardSize.width * 0.1}px` }}>
//                 ЗАМЕНИТЬ
//               </span>
//             </div>
//           )}

//           {/* Price area */}
//           {showPrice && (
//             <div
//               className="absolute top-0 left-0 right-0 flex items-center justify-center z-30"
//               style={{
//                 height: `${cardSize.height * 0.19}px`,
//                 minHeight: "16px",
//                 paddingTop: "5px",
//               }}
//             >
//               <span
//                 className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
//                 style={{ fontSize: `${cardSize.width * 0.11}px` }}
//               >
//                 ${(player.price || 0).toFixed(1)}
//               </span>
//             </div>
//           )}

//           {/* Captain/Vice-Captain badge */}
//           {showCaptainBadges && isCaptainPlayer && !isOnBench && (
//             <img
//               src={captainBadge}
//               alt="Капитан"
//               className="absolute z-50"
//               style={{
//                 width: `${cardSize.width * 0.17}px`,
//                 height: `${cardSize.width * 0.17}px`,
//                 top: "4px",
//                 left: "4px",
//               }}
//             />
//           )}
//           {showCaptainBadges && isViceCaptainPlayer && !isOnBench && (
//             <img
//               src={viceCaptainBadge}
//               alt="Вице-капитан"
//               className="absolute z-50"
//               style={{
//                 width: `${cardSize.width * 0.17}px`,
//                 height: `${cardSize.width * 0.17}px`,
//                 top: "4px",
//                 left: "4px",
//               }}
//             />
//           )}

//           {/* Boost badges */}
//           {showCaptain3xIcon && (
//             <img
//               src={boostBadge3x}
//               alt="3x"
//               className="absolute z-50"
//               style={{
//                 width: `${cardSize.width * 0.17}px`,
//                 height: `${cardSize.width * 0.17}px`,
//                 top: "4px",
//                 right: "4px",
//               }}
//             />
//           )}
//           {/* Double power boost badge */}
//           {!showCaptain3xIcon && showDoublePowerIcon && (
//             <img
//               src={boostBadge2x}
//               alt="2x"
//               className="absolute z-50"
//               style={{
//                 width: `${cardSize.width * 0.17}px`,
//                 height: `${cardSize.width * 0.17}px`,
//                 top: "4px",
//                 right: "4px",
//               }}
//             />
//           )}
//           {/* Bench boost badge */}
//           {!showCaptain3xIcon && !showDoublePowerIcon && isOnBench && isBenchBoostActive && (
//             <img
//               src={boostBadgeBench}
//               alt="Bench+"
//               className="absolute z-50"
//               style={{
//                 width: `${cardSize.width * 0.17}px`,
//                 height: `${cardSize.width * 0.17}px`,
//                 top: "4px",
//                 right: "4px",
//               }}
//             />
//           )}
//           {/* Swap button (management mode) */}
//           {!showCaptain3xIcon &&
//             !showDoublePowerIcon &&
//             !(isOnBench && isBenchBoostActive) &&
//             mode === "management" &&
//             onSwapPlayer &&
//             !swapModePlayerId && (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onSwapPlayer(player.id);
//                 }}
//                 className="absolute z-50"
//                 style={{
//                   top: "4px",
//                   right: "4px",
//                 }}
//                 aria-label={`Заменить ${player.name}`}
//               >
//                 <img
//                   src={swapArrows}
//                   alt="Swap"
//                   style={{
//                     width: `${cardSize.width * 0.14}px`,
//                     height: `${cardSize.width * 0.14}px`,
//                   }}
//                 />
//               </button>
//             )}
//           {/* Remove button (create/transfers mode) */}
//           {!showCaptain3xIcon &&
//             !showDoublePowerIcon &&
//             actualShowRemoveButton &&
//             onRemovePlayer &&
//             (mode === "create" || mode === "transfers") && (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onRemovePlayer(player.id);
//                 }}
//                 className="absolute z-50 flex items-center justify-center bg-[#5a7a4a] hover:bg-[#6a8a5a] rounded-full transition-colors"
//                 style={{
//                   width: `${cardSize.width * 0.17}px`,
//                   height: `${cardSize.width * 0.17}px`,
//                   top: "4px",
//                   right: "4px",
//                 }}
//                 aria-label={`Удалить ${player.name}`}
//               >
//                 <X
//                   className="text-[#1a2e1a]"
//                   style={{
//                     width: `${cardSize.width * 0.11}px`,
//                     height: `${cardSize.width * 0.11}px`,
//                   }}
//                 />
//               </button>
//             )}

//           {/* Bench swap button */}
//           {canSwapOnBench && onSwapBenchPlayers && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onSwapBenchPlayers(benchIndex, benchIndex - 1);
//               }}
//               className="absolute z-50 bg-primary/80 rounded-sm"
//               title="Поднять в очереди"
//               aria-label="Поднять в очереди"
//               style={{
//                 top: "4px",
//                 left: "4px",
//                 padding: `${cardSize.width * 0.02}px`,
//               }}
//             >
//               <svg
//                 className="text-white"
//                 style={{
//                   width: `${cardSize.width * 0.1}px`,
//                   height: `${cardSize.width * 0.1}px`,
//                 }}
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="3"
//               >
//                 <path d="M12 19V5M5 12l7-7 7 7" />
//               </svg>
//             </button>
//           )}

//           {/* Jersey */}
//           <div
//             className="relative w-full flex-1 z-10 overflow-hidden min-h-0 flex items-start justify-center"
//             style={{ paddingTop: jerseyPaddingTop }}
//           >
//             <div className="relative flex items-start justify-center w-full h-full">
//               <img
//                 src={getJerseyForTeam(player.team, player.position)}
//                 alt={player.name}
//                 className="object-contain scale-150"
//                 style={{
//                   transform: "scale(1.5)",
//                   maxWidth: `${cardSize.width * 1.1}px`,
//                   maxHeight: `${cardSize.height * 1.1}px`,
//                 }}
//                 onError={(e) => {
//                   e.currentTarget.src = playerJerseyNew;
//                 }}
//               />

//               {/* Red card badge */}
//               {hasRedCard && (
//                 <img
//                   src={redCardBadge}
//                   alt="Red card"
//                   className="absolute bottom-1 right-1 z-50"
//                   style={{
//                     width: `${cardSize.width * 0.11}px`,
//                     height: `${cardSize.width * 0.11}px`,
//                   }}
//                 />
//               )}

//               {/* Injury badge */}
//               {isInjured && !hasRedCard && (
//                 <img
//                   src={injuryBadge}
//                   alt="Injury"
//                   className="absolute bottom-1 right-1 z-50"
//                   style={{
//                     width: `${cardSize.width * 0.11}px`,
//                     height: `${cardSize.width * 0.11}px`,
//                   }}
//                 />
//               )}
//             </div>
//           </div>

//           {/* Player name and club blocks */}
//           <div className="w-full relative z-20">
//             {/* Name block */}
//             <div
//               className="bg-white px-[4%] flex items-center justify-center gap-1"
//               style={{
//                 height: "16px",
//                 minHeight: "16px",
//                 maxHeight: "16px",
//               }}
//             >
//               {isOnBench && (
//                 <span
//                   className="text-black/40 shrink-0"
//                   style={{
//                     fontFamily: "Rubik, sans-serif",
//                     fontWeight: 400,
//                     fontSize: "7px",
//                     lineHeight: "16px",
//                   }}
//                 >
//                   ({player.position})
//                 </span>
//               )}
//               <span
//                 className="text-black block truncate whitespace-nowrap text-center"
//                 style={{
//                   fontFamily: "Rubik, sans-serif",
//                   fontWeight: 400,
//                   fontSize: "9px",
//                   lineHeight: "16px",
//                 }}
//                 title={player.name}
//               >
//                 {displayName}
//               </span>
//             </div>

//             {/* Club/Points block */}
//             <div
//               className="bg-[#1a1a2e] px-[4%] flex items-center justify-center"
//               style={{
//                 height: "16px",
//                 minHeight: "16px",
//                 maxHeight: "16px",
//               }}
//             >
//               {showPointsInsteadOfTeam ? (
//                 <span
//                   className={`font-bold block text-center ${
//                     player.points > 0 ? "text-success" : player.points < 0 ? "text-destructive" : "text-white"
//                   }`}
//                   style={{
//                     fontSize: `${cardSize.width * 0.11}px`,
//                     lineHeight: "16px",
//                   }}
//                 >
//                   {player.points > 0 ? `+${player.points}` : player.points}
//                 </span>
//               ) : (
//                 <span
//                   className="block truncate whitespace-nowrap text-center"
//                   style={{
//                     fontFamily: "Rubik, sans-serif",
//                     fontWeight: 400,
//                     fontSize: "9px",
//                     lineHeight: "16px",
//                   }}
//                   title={`${homeAwayLabel} ${nextOpponent}`}
//                 >
//                   <span className="text-[#7D7A94]">{homeAwayLabel}</span>
//                   <span className="text-white"> {displayOpponent}</span>
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       );
//     },
//     [
//       mode,
//       cardSize,
//       captain,
//       viceCaptain,
//       showCaptainBadges,
//       isBenchBoostActive,
//       isDoublePowerBoostActive,
//       isCaptain3xBoostActive,
//       swapModePlayerId,
//       validSwapTargetIds,
//       newPlayerIds,
//       showPrice,
//       showPointsInsteadOfTeam,
//       actualShowRemoveButton,
//       truncateName,
//       onPlayerClick,
//       onRemovePlayer,
//       onSwapPlayer,
//       onSwapBenchPlayers,
//       benchPlayers,
//       isMobile,
//       mainSquadPlayers,
//       players,
//     ],
//   );

//   // Render empty slot
//   const renderEmptySlot = useCallback(
//     (position: string, isOnBench = false, slotIndex = 0) => {
//       const removedPlayer = getRemovedPlayerForSlot(position, slotIndex);

//       return (
//         <div
//           className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors relative overflow-hidden"
//           style={{
//             width: `${cardSize.width}px`,
//             height: `${cardSize.height}px`,
//             gap: `${cardSize.height * 0.06}px`,
//           }}
//           onClick={() => onEmptySlotClick?.(position, isOnBench, slotIndex)}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" || e.key === " ") {
//               e.preventDefault();
//               onEmptySlotClick?.(position, isOnBench, slotIndex);
//             }
//           }}
//           aria-label={
//             removedPlayer
//               ? `Заменить ${removedPlayer.name} на позиции ${position}`
//               : isOnBench
//                 ? `Добавить игрока на скамейку`
//                 : `Добавить игрока на позицию ${position}`
//           }
//         >
//           {removedPlayer && mode === "transfers" ? (
//             <>
//               {/* Plus button at top center */}
//               <div className="flex-1 flex items-center justify-center">
//                 <div
//                   className="rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
//                   style={{
//                     width: `${cardSize.width * 0.28}px`,
//                     height: `${cardSize.width * 0.28}px`,
//                   }}
//                 >
//                   <Plus
//                     className="text-[#3a5a28]"
//                     style={{
//                       width: `${cardSize.width * 0.16}px`,
//                       height: `${cardSize.width * 0.16}px`,
//                     }}
//                   />
//                 </div>
//               </div>
//               {/* Removed player info at bottom */}
//               <div className="w-full">
//                 <div
//                   className="bg-white/30 px-1 flex items-center justify-center"
//                   style={{
//                     height: "16px",
//                     minHeight: "16px",
//                     maxHeight: "16px",
//                   }}
//                 >
//                   <span
//                     className="text-white/80 font-medium block truncate whitespace-nowrap text-center"
//                     style={{
//                       fontSize: `${cardSize.width * 0.09}px`,
//                       lineHeight: "16px",
//                     }}
//                     title={removedPlayer.name}
//                   >
//                     {truncateName(removedPlayer.name, Math.floor(cardSize.width / 6))}
//                   </span>
//                 </div>
//                 <div
//                   className="bg-[#1a1a2e]/50 px-1 flex items-center justify-center"
//                   style={{
//                     height: "16px",
//                     minHeight: "16px",
//                     maxHeight: "16px",
//                   }}
//                 >
//                   <span
//                     className="text-white/60 block truncate whitespace-nowrap text-center"
//                     style={{
//                       fontSize: `${cardSize.width * 0.08}px`,
//                       lineHeight: "16px",
//                     }}
//                     title={removedPlayer.team}
//                   >
//                     {truncateName(removedPlayer.team, Math.floor(cardSize.width / 5))}
//                   </span>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <span className="text-white font-medium" style={{ fontSize: `${cardSize.width * 0.16}px` }}>
//                 {isOnBench ? "ЗАМ" : position}
//               </span>
//               <div
//                 className="rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
//                 style={{
//                   width: `${cardSize.width * 0.25}px`,
//                   height: `${cardSize.width * 0.25}px`,
//                 }}
//               >
//                 <Plus
//                   className="text-[#3a5a28]"
//                   style={{
//                     width: `${cardSize.width * 0.14}px`,
//                     height: `${cardSize.width * 0.14}px`,
//                   }}
//                 />
//               </div>
//             </>
//           )}
//         </div>
//       );
//     },
//     [mode, cardSize, getRemovedPlayerForSlot, onEmptySlotClick, truncateName],
//   );

//   // Единая функция для рендеринга формации
//   const renderFormation = () => {
//     return formation.map((slot, idx) => {
//       const style = getPlayerPosition(slot.row, slot.col);
//       const slotIndex = slot.slotIndex ?? idx;
//       const player = getPlayerForSlot(slot.position, slotIndex);
//       const isOccupied = !!player;
//       const key = `${slot.position}-${slotIndex}-${idx}`;

//       return (
//         <div
//           key={key}
//           className={`absolute flex flex-col items-center ${isOccupied ? "z-20" : "z-10"}`}
//           style={{
//             top: style.top,
//             left: style.left,
//             transform: "translateX(-50%)",
//           }}
//         >
//           {player ? renderPlayer(player) : renderEmptySlot(slot.position, false, slotIndex)}
//         </div>
//       );
//     });
//   };

//   return (
//     <div>
//       <div className="relative w-full">
//         <img src={footballFieldNew} alt="Football field" className="w-full h-auto" loading="lazy" />

//         {renderFormation()}
//       </div>

//       {/* Bench section */}
//       {showBench && (
//         <div
//           className="-mt-8 px-3"
//           style={{
//             marginTop: `-${cardSize.height * 0.1}px`,
//             paddingLeft: `${isMobile ? 8 : 16}px`,
//             paddingRight: `${isMobile ? 8 : 16}px`,
//           }}
//         >
//           <div className="bg-card/50 rounded-xl overflow-hidden">
//             <div className="bg-foreground text-background py-1.5 text-center">
//               <span className="font-semibold" style={{ fontSize: `${cardSize.width * 0.18}px` }}>
//                 Скамейка
//               </span>
//             </div>
//             <div
//               className="p-4"
//               style={{
//                 padding: `${cardSize.height * 0.15}px`,
//               }}
//             >
//               <div className="flex gap-2 justify-between" style={{ gap: `${isMobile ? 8 : 16}px` }}>
//                 {(() => {
//                   return Array.from({ length: maxBenchSize }).map((_, idx) => {
//                     const player = benchPlayers[idx];
//                     const key = `bench-${idx}`;

//                     return (
//                       <div key={key} className="flex flex-col items-center flex-1 relative">
//                         {player ? renderPlayer(player, true, idx) : renderEmptySlot("ЗАМ", true, idx)}
//                       </div>
//                     );
//                   });
//                 })()}
//               </div>
//               {onSwapBenchPlayers && mode === "management" && (
//                 <div
//                   className="flex items-center justify-center gap-2 text-muted-foreground mt-4"
//                   style={{
//                     fontSize: `${cardSize.width * 0.11}px`,
//                     marginTop: `${cardSize.height * 0.15}px`,
//                   }}
//                 >
//                   <ArrowUp size={cardSize.width * 0.14} className="text-primary" />
//                   <span>Используй стрелку для изменения приоритета выхода на поле</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FormationField;

import footballFieldNew from "@/assets/football-field-new.png";
import footballGoal from "@/assets/football-goal.png";
import sponsorLogo from "@/assets/sponsor-logo.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import captainBadge from "@/assets/captain-badge.png";
import viceCaptainBadge from "@/assets/vice-captain-badge.png";
import swapArrows from "@/assets/swap-arrows.png";
import redCardBadge from "@/assets/red-card-badge.png";
import injuryBadge from "@/assets/injury-badge.svg";
import boostBadge3x from "@/assets/boost-badge-3x.png";
import boostBadge2x from "@/assets/boost-badge-2x.png";
import boostBadgeBench from "@/assets/boost-badge-bench.png";
import { X, Plus, ArrowUp } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getJerseyForTeam } from "@/hooks/getJerseyForTeam.tsx";
import { getFormationSlots, getPlayerPosition, detectFormation } from "@/lib/formationUtils";

// Player data interface
export interface FormationPlayerData {
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
  nextOpponent?: string; // Next match opponent team name
  nextOpponentHome?: boolean; // Is next match at home?
}

// Removed player info for transfers mode
export interface RemovedPlayerInfo {
  position: string;
  slotIndex: number;
  name: string;
  team: string;
}

// Formation position interface
interface FormationPosition {
  position: string;
  row: number;
  col: number;
}

// Fixed formation for create team / transfers: 2 GK, 5 DEF, 5 MID, 3 FWD = 15 players
const FIXED_FORMATION: FormationPosition[] = [
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

// Mode types
export type FormationMode = "create" | "management" | "transfers" | "view";

export interface FormationFieldProps {
  // Mode determines behavior and available features
  mode: FormationMode;

  // Player data - use based on mode
  // For 'create', 'transfers', 'view' - single players array
  // For 'management' - main squad + bench
  players?: FormationPlayerData[];
  mainSquadPlayers?: FormationPlayerData[];
  benchPlayers?: FormationPlayerData[];

  // Bench configuration (management mode)
  maxBenchSize?: number;
  showBench?: boolean;

  // Actions
  onPlayerClick?: (player: FormationPlayerData) => void;
  onRemovePlayer?: (playerId: number) => void;
  onSwapPlayer?: (playerId: number) => void;
  onEmptySlotClick?: (position: string, isOnBench?: boolean, slotIndex?: number) => void;
  onSwapBenchPlayers?: (fromIndex: number, toIndex: number) => void;

  // Captain/Vice-Captain
  captain?: number | null;
  viceCaptain?: number | null;
  showCaptainBadges?: boolean;

  // Boosts (management mode)
  isBenchBoostActive?: boolean;
  isDoublePowerBoostActive?: boolean;
  isCaptain3xBoostActive?: boolean;

  // Display options
  showPrice?: boolean;
  showPointsInsteadOfTeam?: boolean;
  showRemoveButton?: boolean;

  // Swap mode (management mode)
  swapModePlayerId?: number | null;
  validSwapTargetIds?: Set<number>;

  // Transfers mode specific
  removedPlayers?: RemovedPlayerInfo[];
  newPlayerIds?: Set<number>;
}

const FormationField = ({
  mode,
  players = [],
  mainSquadPlayers = [],
  benchPlayers = [],
  maxBenchSize = 4,
  showBench = false,
  onPlayerClick,
  onRemovePlayer,
  onSwapPlayer,
  onEmptySlotClick,
  onSwapBenchPlayers,
  captain,
  viceCaptain,
  showCaptainBadges = true,
  isBenchBoostActive = false,
  isDoublePowerBoostActive = false,
  isCaptain3xBoostActive = false,
  showPrice = true,
  showPointsInsteadOfTeam = false,
  showRemoveButton,
  swapModePlayerId = null,
  validSwapTargetIds = new Set(),
  removedPlayers = [],
  newPlayerIds = new Set(),
}: FormationFieldProps) => {
  // Determine actual showRemoveButton based on mode
  const actualShowRemoveButton = showRemoveButton ?? (mode === "create" || mode === "transfers");

  // Get formation based on mode
  const formation = useMemo(() => {
    if (mode === "management" || mode === "view") {
      const detected = detectFormation(mainSquadPlayers);
      return getFormationSlots(detected || "1-4-4-2");
    }
    return FIXED_FORMATION;
  }, [mode, mainSquadPlayers]);

  // Get players based on mode
  const getPlayerForSlot = useCallback(
    (position: string, slotIndex: number) => {
      if (mode === "management" || mode === "view") {
        return mainSquadPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
      }
      return players.find((p) => p.position === position && p.slotIndex === slotIndex);
    },
    [mode, players, mainSquadPlayers],
  );

  const getRemovedPlayerForSlot = useCallback(
    (position: string, slotIndex: number) => {
      return removedPlayers.find((p) => p.position === position && p.slotIndex === slotIndex);
    },
    [removedPlayers],
  );

  // Helper function to calculate card size based on window width
  const getCardSizeForWidth = (width: number) => {
    if (width <= 768) {
      return { width: 70, height: 84, isDesktop: false };
    } else if (width <= 1024) {
      return { width: 96, height: 115, isDesktop: false };
    } else {
      return { width: 128, height: 154, isDesktop: true };
    }
  };

  // Card size state - calculate initial value synchronously to avoid layout shift
  const [cardSize, setCardSize] = useState(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 768;
    const { width: w, height: h } = getCardSizeForWidth(width);
    return { width: w, height: h };
  });
  
  const [isDesktop, setIsDesktop] = useState(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 768;
    return getCardSizeForWidth(width).isDesktop;
  });

  // Only handle resize events - initial size is already calculated
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { width, height, isDesktop: desktop } = getCardSizeForWidth(window.innerWidth);
        setCardSize({ width, height });
        setIsDesktop(desktop);
      }, 250);
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

  // Format player name: show only surname, add initials for players with same surname
  const formatPlayerName = useCallback((playerName: string, allPlayersList: FormationPlayerData[]) => {
    // Parse name - could be "Имя Фамилия" or "И. Фамилия"
    const parts = playerName.trim().split(/\s+/);
    if (parts.length < 2) return playerName;

    const firstName = parts[0];
    const surname = parts.slice(1).join(" ");

    // Get all surnames from all players
    const getSurname = (name: string) => {
      const p = name.trim().split(/\s+/);
      return p.length >= 2 ? p.slice(1).join(" ") : name;
    };

    const getFirstName = (name: string) => {
      const p = name.trim().split(/\s+/);
      return p.length >= 2 ? p[0] : "";
    };

    // Find players with the same surname
    const playersWithSameSurname = allPlayersList.filter(
      (p) => getSurname(p.name) === surname && p.name !== playerName,
    );

    // If no duplicates, just return surname
    if (playersWithSameSurname.length === 0) {
      return surname;
    }

    // Check if first letter distinguishes
    const myFirstLetter = firstName.charAt(0).toUpperCase();
    const othersFirstLetters = playersWithSameSurname.map((p) => getFirstName(p.name).charAt(0).toUpperCase());

    if (!othersFirstLetters.includes(myFirstLetter)) {
      return `${myFirstLetter}. ${surname}`;
    }

    // Need second letter too
    const mySecondLetter = firstName.length > 1 ? firstName.charAt(1).toLowerCase() : "";
    return `${myFirstLetter}${mySecondLetter}. ${surname}`;
  }, []);

  // Slot index mapping for fixed formation
  const slotIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const positionCounts = new Map<string, number>();

    FIXED_FORMATION.forEach((pos) => {
      const count = positionCounts.get(pos.position) || 0;
      const key = `${pos.position}-${pos.row}-${pos.col}`;
      map.set(key, count);
      positionCounts.set(pos.position, count + 1);
    });

    return map;
  }, []);

  // Get slot index for fixed formation
  const getSlotIndex = useCallback(
    (slot: FormationPosition) => {
      const key = `${slot.position}-${slot.row}-${slot.col}`;
      return slotIndexMap.get(key) || 0;
    },
    [slotIndexMap],
  );

  // Render player card
  const renderPlayer = useCallback(
    (player: FormationPlayerData, isOnBench = false, benchIndex?: number) => {
      const isCaptainPlayer = captain === player.id;
      const isViceCaptainPlayer = viceCaptain === player.id;
      const isCaptainOrVice = isCaptainPlayer || isViceCaptainPlayer;
      const isNewPlayer = newPlayerIds.has(player.id);
      const hasRedCard = player.hasRedCard;
      const isInjured = player.isInjured;

      // Boost visibility
      const showDoublePowerBorder = isDoublePowerBoostActive && isCaptainOrVice;
      const showDoublePowerIcon = isDoublePowerBoostActive && isCaptainOrVice && !isOnBench;
      const showCaptain3xBorder = isCaptain3xBoostActive && isCaptainPlayer;
      const showCaptain3xIcon = isCaptain3xBoostActive && isCaptainPlayer && !isOnBench;

      // Swap mode highlighting
      const isSwapSource = swapModePlayerId === player.id;
      const isValidSwapTarget = swapModePlayerId && validSwapTargetIds.has(player.id);
      const isInSwapModeButNotTarget = swapModePlayerId && !isSwapSource && !isValidSwapTarget;

      // Border styling
      let borderClass = "border-white/60";
      if (isSwapSource) {
        borderClass = "border-primary border-2";
      } else if (isValidSwapTarget) {
        borderClass = "border-primary/80 border-2";
      } else if (hasRedCard || isInjured) {
        borderClass = "border-red-500";
      } else if (showDoublePowerBorder || showCaptain3xBorder || (isOnBench && isBenchBoostActive)) {
        borderClass = "border-primary";
      } else if (isNewPlayer) {
        borderClass = "border-primary border-2";
      }

      // Background styling
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
      } else if (isNewPlayer) {
        bgClass = "bg-primary/25";
      }

      // Opacity for non-valid targets in swap mode
      const opacityClass = isInSwapModeButNotTarget ? "opacity-40" : "";

      // Shadow for new players
      const shadowClass = isNewPlayer ? "shadow-[0_0_12px_hsl(var(--primary)/0.4)]" : "";

      // Bench swap button visibility (arrow up to move higher in priority)
      // Rules:
      // 1. Goalkeeper (ВР) cannot move - they stay first
      // 2. Player at index 1 cannot move up if player at index 0 is goalkeeper
      // 3. All other bench players can move up
      const isGoalkeeper = player.position === "ВР";
      const playerAboveIsGK = benchIndex !== undefined && benchIndex === 1 && benchPlayers[0]?.position === "ВР";
      const canSwapOnBench =
        isOnBench && benchIndex !== undefined && benchIndex > 0 && !isGoalkeeper && !playerAboveIsGK;

      // Calculate display text
      const maxNameLength = Math.floor(cardSize.width / 7);
      const maxTeamLength = Math.floor(cardSize.width / 9);

      // Get all players list for surname check
      const allPlayersList =
        mode === "management" || mode === "view" ? [...mainSquadPlayers, ...benchPlayers] : players;

      // Format name: surname only, or with initials for duplicates
      const formattedName = formatPlayerName(player.name, allPlayersList);
      const displayName = truncateName(formattedName, maxNameLength);

      // Next opponent display - use provided data or fallback to team name
      const nextOpponent = player.nextOpponent || player.team;
      const isHome = player.nextOpponentHome !== undefined ? player.nextOpponentHome : true;
      const homeAwayLabel = isHome ? "(Д)" : "(Г)";
      const displayOpponent = truncateName(nextOpponent, maxTeamLength);

      // Определяем отступ сверху для джерси
      const jerseyPaddingTop = isDesktop ? "20px" : "13px";

      return (
        <div
          className={`relative flex flex-col cursor-pointer border rounded-md overflow-hidden ${bgClass} backdrop-blur-[2px] transition-all duration-200 ${borderClass} ${opacityClass} ${shadowClass} hover:bg-[#3a5a28]/60`}
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

          {/* Price area - 5px from top */}
          {showPrice && (
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-center z-30"
              style={{
                height: `${cardSize.height * 0.19}px`,
                minHeight: "16px",
                paddingTop: "5px",
              }}
            >
              <span
                className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
                style={{ fontSize: `${cardSize.width * 0.12}px` }}
              >
                ${(player.price || 0).toFixed(1)}
              </span>
            </div>
          )}

          {/* Captain/Vice-Captain badge - 4px from top and left */}
          {showCaptainBadges && isCaptainPlayer && !isOnBench && (
            <img
              src={captainBadge}
              alt="Капитан"
              className="absolute z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
                top: "4px",
                left: "4px",
              }}
            />
          )}
          {showCaptainBadges && isViceCaptainPlayer && !isOnBench && (
            <img
              src={viceCaptainBadge}
              alt="Вице-капитан"
              className="absolute z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
                top: "4px",
                left: "4px",
              }}
            />
          )}

          {/* Action buttons based on mode */}
          {/* Captain 3x boost badge - 4px from top and right */}
          {showCaptain3xIcon && (
            <img
              src={boostBadge3x}
              alt="3x"
              className="absolute z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
                top: "4px",
                right: "4px",
              }}
            />
          )}
          {/* Double power boost badge - 4px from top and right */}
          {!showCaptain3xIcon && showDoublePowerIcon && (
            <img
              src={boostBadge2x}
              alt="2x"
              className="absolute z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
                top: "4px",
                right: "4px",
              }}
            />
          )}
          {/* Bench boost badge - 4px from top and right */}
          {!showCaptain3xIcon && !showDoublePowerIcon && isOnBench && isBenchBoostActive && (
            <img
              src={boostBadgeBench}
              alt="Bench+"
              className="absolute z-50"
              style={{
                width: `${cardSize.width * 0.18}px`,
                height: `${cardSize.width * 0.18}px`,
                top: "4px",
                right: "4px",
              }}
            />
          )}
          {/* Swap button (management mode) - 4px from top and right */}
          {!showCaptain3xIcon &&
            !showDoublePowerIcon &&
            !(isOnBench && isBenchBoostActive) &&
            mode === "management" &&
            onSwapPlayer &&
            !swapModePlayerId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwapPlayer(player.id);
                }}
                className="absolute z-50"
                style={{
                  top: "4px",
                  right: "4px",
                }}
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
            )}
          {/* Remove button (create/transfers mode) - 4px from top and right */}
          {!showCaptain3xIcon &&
            !showDoublePowerIcon &&
            actualShowRemoveButton &&
            onRemovePlayer &&
            (mode === "create" || mode === "transfers") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer(player.id);
                }}
                className="absolute z-50 flex items-center justify-center bg-[#5a7a4a] hover:bg-[#6a8a5a] rounded-full transition-colors"
                style={{
                  width: `${cardSize.width * 0.18}px`,
                  height: `${cardSize.width * 0.18}px`,
                  top: "4px",
                  right: "4px",
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

          {/* Bench swap button - swap with player above - 4px from top and left */}
          {canSwapOnBench && onSwapBenchPlayers && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwapBenchPlayers(benchIndex, benchIndex - 1);
              }}
              className="absolute z-50 bg-primary/80 rounded-sm"
              title="Поднять в очереди"
              aria-label="Поднять в очереди"
              style={{
                top: "4px",
                left: "4px",
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

          {/* Jersey - увеличенная, занимает большую часть карточки */}
          <div
            className="relative w-full flex-1 z-10 overflow-hidden min-h-0 flex items-start justify-center"
            style={{ paddingTop: jerseyPaddingTop }}
          >
            <div className="relative flex items-start justify-center w-full h-full">
              <img
                src={getJerseyForTeam(player.team, player.position)}
                alt={player.name}
                className="object-contain scale-150"
                style={{
                  transform: "scale(1.5)",
                  maxWidth: `${cardSize.width * 1.1}px`,
                  maxHeight: `${cardSize.height * 1.1}px`,
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
          </div>

          {/* Player name and club blocks - fixed height 13px each */}
          <div className="w-full relative z-20">
            {/* Name block */}
            <div
              className="bg-white px-[4%] flex items-center justify-center gap-1"
              style={{
                height: "13px",
                minHeight: "13px",
                maxHeight: "13px",
              }}
            >
              {isOnBench && (
                <span
                  className="text-black/40 shrink-0"
                  style={{
                    fontFamily: "Rubik, sans-serif",
                    fontWeight: 400,
                    fontSize: "6px",
                    lineHeight: "13px",
                  }}
                >
                  ({player.position})
                </span>
              )}
              <span
                className="text-black block truncate whitespace-nowrap text-center"
                style={{
                  fontFamily: "Rubik, sans-serif",
                  fontWeight: 400,
                  fontSize: "8px",
                  lineHeight: "13px",
                }}
                title={player.name}
              >
                {displayName}
              </span>
            </div>

            {/* Club/Points block */}
            <div
              className="bg-[#1a1a2e] px-[4%] flex items-center justify-center"
              style={{
                height: "13px",
                minHeight: "13px",
                maxHeight: "13px",
              }}
            >
              {showPointsInsteadOfTeam ? (
                <span
                  className={`font-bold block text-center ${
                    player.points > 0 ? "text-success" : player.points < 0 ? "text-destructive" : "text-white"
                  }`}
                  style={{
                    fontSize: `${cardSize.width * 0.12}px`,
                    lineHeight: "13px",
                  }}
                >
                  {player.points > 0 ? `+${player.points}` : player.points}
                </span>
              ) : (
                <span
                  className="block truncate whitespace-nowrap text-center"
                  style={{
                    fontFamily: "Rubik, sans-serif",
                    fontWeight: 400,
                    fontSize: "8px",
                    lineHeight: "13px",
                  }}
                  title={`${homeAwayLabel} ${nextOpponent}`}
                >
                  <span className="text-[#7D7A94]">{homeAwayLabel}</span>
                  <span className="text-white"> {displayOpponent}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
    [
      mode,
      cardSize,
      captain,
      viceCaptain,
      showCaptainBadges,
      isBenchBoostActive,
      isDoublePowerBoostActive,
      isCaptain3xBoostActive,
      swapModePlayerId,
      validSwapTargetIds,
      newPlayerIds,
      showPrice,
      showPointsInsteadOfTeam,
      actualShowRemoveButton,
      truncateName,
      onPlayerClick,
      onRemovePlayer,
      onSwapPlayer,
      onSwapBenchPlayers,
      benchPlayers,
      isDesktop,
    ],
  );

  // Render empty slot
  const renderEmptySlot = useCallback(
    (position: string, isOnBench = false, slotIndex = 0) => {
      const removedPlayer = getRemovedPlayerForSlot(position, slotIndex);

      return (
        <div
          className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors relative overflow-hidden"
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
          aria-label={
            removedPlayer
              ? `Заменить ${removedPlayer.name} на позиции ${position}`
              : isOnBench
                ? `Добавить игрока на скамейку`
                : `Добавить игрока на позицию ${position}`
          }
        >
          {removedPlayer && mode === "transfers" ? (
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
              {/* Removed player info at bottom - fixed height 13px each */}
              <div className="w-full">
                <div
                  className="bg-white/30 px-1 flex items-center justify-center"
                  style={{
                    height: "13px",
                    minHeight: "13px",
                    maxHeight: "13px",
                  }}
                >
                  <span
                    className="text-white/80 font-medium block truncate whitespace-nowrap text-center"
                    style={{
                      fontSize: `${cardSize.width * 0.08}px`,
                      lineHeight: "13px",
                    }}
                    title={removedPlayer.name}
                  >
                    {truncateName(removedPlayer.name, Math.floor(cardSize.width / 6))}
                  </span>
                </div>
                <div
                  className="bg-[#1a1a2e]/50 px-1 flex items-center justify-center"
                  style={{
                    height: "13px",
                    minHeight: "13px",
                    maxHeight: "13px",
                  }}
                >
                  <span
                    className="text-white/60 block truncate whitespace-nowrap text-center"
                    style={{
                      fontSize: `${cardSize.width * 0.07}px`,
                      lineHeight: "13px",
                    }}
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
            </>
          )}
        </div>
      );
    },
    [mode, cardSize, getRemovedPlayerForSlot, onEmptySlotClick, truncateName],
  );

  // Функция для получения позиций для фиксированной формации 2-5-5-3
  const getFixedFormationPosition = useCallback((row: number, col: number) => {
    // Это кастомные позиции для формации 2-5-5-3
    // Нужно адаптировать их под getPlayerPosition

    // Для формации 2-5-5-3 нам нужно распределить позиции:
    // Ряд 1: 2 вратаря
    // Ряд 2: 5 защитников
    // Ряд 3: 5 полузащитников
    // Ряд 4: 3 нападающих

    // Берем базовую позицию из getPlayerPosition
    const basePosition = getPlayerPosition(row, col);
    
    // Определяем, мобильное ли устройство
    const isMobile = !isDesktop;

    // Адаптируем для нашей фиксированной формации
    if (row === 1) {
      // Вратари - размещаем ближе к центру, сокращаем расстояние между ними
      if (col === 1) {
        return { ...basePosition, left: "38%" };
      } else if (col === 2) {
        return { ...basePosition, left: "62%" };
      }
    } else if (row === 2) {
      // 5 защитников - равномерно распределяем
      // На мобильных увеличиваем боковое расстояние
      if (isMobile) {
        const leftPercent = 10 + (col - 1) * 20;
        return { ...basePosition, left: `${leftPercent}%` };
      }
      const leftPercent = 20 + (col - 1) * 15;
      return { ...basePosition, left: `${leftPercent}%` };
    } else if (row === 3) {
      // 5 полузащитников - равномерно распределяем
      // На мобильных увеличиваем боковое расстояние
      if (isMobile) {
        const leftPercent = 10 + (col - 1) * 20;
        return { ...basePosition, left: `${leftPercent}%` };
      }
      const leftPercent = 20 + (col - 1) * 15;
      return { ...basePosition, left: `${leftPercent}%` };
    } else if (row === 4) {
      // 3 нападающих - равномерно распределяем
      const leftPercent = 30 + (col - 1) * 20;
      return { ...basePosition, left: `${leftPercent}%` };
    }

    return basePosition;
  }, [isDesktop]);

  const getBenchGap = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 768) {
      return 8;
    } else if (width <= 1024) {
      return 16;
    } else {
      return 24;
    }
  }, []);

  const benchGap = useMemo(() => getBenchGap(), [getBenchGap]);

  // Render based on mode
  if (mode === "management" || mode === "view") {
    // Management/View mode - uses dynamic formation based on player positions
    return (
      <div>
        <div className="relative w-full">
          <img src={footballFieldNew} alt="Football field" className="w-full h-auto" loading="lazy" />
          
          {/* Football Goal - scales with the field */}
          <img 
            src={footballGoal} 
            alt="Goal" 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-[5]"
            style={{
              top: '-4%',
              width: '12%',
              height: 'auto',
            }}
          />
          
          {/* Sponsor logos on both sides of the goal */}
          <img 
            src={sponsorLogo} 
            alt="Sponsor" 
            className="absolute pointer-events-none z-[4]"
            style={{
              top: '-3.5%',
              left: '27%',
              width: '29%',
              height: 'auto',
              transform: 'translateX(-50%)',
            }}
          />
          <img 
            src={sponsorLogo} 
            alt="Sponsor" 
            className="absolute pointer-events-none z-[4]"
            style={{
              top: '-3.5%',
              left: '73%',
              width: '29%',
              height: 'auto',
              transform: 'translateX(-50%)',
            }}
          />

          {formation.map((slot, idx) => {
            const style = getPlayerPosition(slot.row, slot.col);
            const slotIdx = (slot as { slotIndex?: number }).slotIndex ?? idx;
            const player = getPlayerForSlot(slot.position, slotIdx);
            const isOccupied = !!player;
            const key = `${slot.position}-${slotIdx}-${idx}`;

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
                {player ? renderPlayer(player) : renderEmptySlot(slot.position, false, slotIdx)}
              </div>
            );
          })}
        </div>

        {/* Bench section */}
        {showBench && (
          <div
            className="-mt-8 px-3"
            style={{
              marginTop: `-${cardSize.height * 0.1}px`,
              paddingLeft: `${benchGap}px`,
              paddingRight: `${benchGap}px`,
            }}
          >
            <div className="bg-card/50 rounded-xl overflow-hidden">
              <div className="bg-foreground text-background py-1.5 text-center">
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
                  {(() => {
                    // Use benchPlayers in their current order (already sorted by priority)
                    // Don't re-sort here - the order from state IS the priority order
                    return Array.from({ length: maxBenchSize }).map((_, idx) => {
                      const player = benchPlayers[idx];
                      const key = `bench-${idx}`;

                      return (
                        <div key={key} className="flex flex-col items-center flex-1 relative">
                          {player ? renderPlayer(player, true, idx) : renderEmptySlot("ЗАМ", true, idx)}
                        </div>
                      );
                    });
                  })()}
                </div>
                {onSwapBenchPlayers && mode === "management" && (
                  <div
                    className="flex items-center justify-center gap-2 text-muted-foreground mt-4"
                    style={{
                      fontSize: `${cardSize.width * 0.12}px`,
                      marginTop: `${cardSize.height * 0.15}px`,
                    }}
                  >
                    <ArrowUp size={cardSize.width * 0.16} className="text-primary" />
                    <span>Используй стрелку для изменения приоритета выхода на поле</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Create/Transfers mode - uses fixed formation 2-5-5-3
  return (
    <div className="relative w-full">
      <img src={footballFieldNew} alt="Футбольное поле" className="w-full h-auto" loading="lazy" />
      
      {/* Football Goal - scales with the field */}
      <img 
        src={footballGoal} 
        alt="Goal" 
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-[5]"
        style={{
          top: '-4%',
          width: '12%',
          height: 'auto',
        }}
      />
      
      {/* Sponsor logos on both sides of the goal */}
      <img 
        src={sponsorLogo} 
        alt="Sponsor" 
        className="absolute pointer-events-none z-[4]"
        style={{
          top: '-3.5%',
          left: '27%',
          width: '29%',
          height: 'auto',
          transform: 'translateX(-50%)',
        }}
      />
      <img 
        src={sponsorLogo} 
        alt="Sponsor" 
        className="absolute pointer-events-none z-[4]"
        style={{
          top: '-3.5%',
          left: '73%',
          width: '29%',
          height: 'auto',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Используем абсолютное позиционирование с адаптированными позициями */}
      {FIXED_FORMATION.map((slot, idx) => {
        const slotIndex = getSlotIndex(slot);
        const player = getPlayerForSlot(slot.position, slotIndex);
        const style = getFixedFormationPosition(slot.row, slot.col);
        const key = `${slot.position}-${slot.row}-${slot.col}`;

        return (
          <div
            key={key}
            className={`absolute flex flex-col items-center ${player ? "z-20" : "z-10"}`}
            style={{
              top: style.top,
              left: style.left,
              transform: "translateX(-50%)",
            }}
          >
            {player ? renderPlayer(player) : renderEmptySlot(slot.position, false, slotIndex)}
          </div>
        );
      })}
    </div>
  );
};

export default FormationField;
