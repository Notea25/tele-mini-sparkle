import { useState } from "react";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import playerPhoto from "@/assets/player-photo.png";
import clubLogo from "@/assets/club-logo.png";
import { clubLogos, getClubLogo } from "@/lib/clubLogos";
import injuryBadge from "@/assets/injury-badge.png";
import redCardBadge from "@/assets/red-card-badge.png";

// Club abbreviations for form/calendar display
const clubAbbreviations: Record<string, string> = {
  "Арсенал": "АРС",
  "Барановичи": "БАР",
  "БАТЭ": "БАТ",
  "Белшина": "БЕЛ",
  "Витебск": "ВИТ",
  "Гомель": "ГОМ",
  "Динамо-Брест": "ДБР",
  "Динамо Брест": "ДБР",
  "Динамо-Минск": "ДМН",
  "Динамо Минск": "ДМН",
  "Днепр-Могилев": "ДНП",
  "Ислочь": "ИСЛ",
  "Минск": "МИН",
  "МЛ Витебск": "МЛ",
  "Нафтан-Новополоцк": "НАФ",
  "Нафтан": "НАФ",
  "Неман": "НЕМ",
  "Славия-Мозырь": "СЛА",
  "Славия": "СЛА",
  "Торпедо-БелАЗ": "ТОР",
  "Торпедо": "ТОР",
};

// All clubs in the league for generating schedules
const allClubs = [
  "Арсенал", "БАТЭ", "Белшина", "Витебск", "Гомель",
  "Динамо-Брест", "Динамо-Минск", "Днепр-Могилев", "Ислочь",
  "Минск", "МЛ Витебск", "Нафтан", "Неман", "Славия", "Торпедо-БелАЗ"
];

// Generate deterministic schedule based on team name
function generateClubSchedule(teamName: string, playerId: number) {
  // Get opponents (all clubs except player's team)
  const opponents = allClubs.filter(club => !teamName.includes(club.split("-")[0]) && !club.includes(teamName.split("-")[0]));
  
  // Create a seed from team name and player id for deterministic randomness
  let seed = playerId;
  for (let i = 0; i < teamName.length; i++) {
    seed += teamName.charCodeAt(i);
  }
  
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  
  // Shuffle opponents deterministically
  const shuffled = [...opponents].sort((a, b) => seededRandom(seed + a.charCodeAt(0)) - seededRandom(seed + b.charCodeAt(0)));
  
  // Generate form (last 3 matches)
  const recentForm = [
    { 
      tour: 24, 
      opponent: clubAbbreviations[shuffled[0]] || shuffled[0].substring(0, 3).toUpperCase(), 
      home: seededRandom(seed + 1) > 0.5, 
      points: Math.floor(seededRandom(seed + 10) * 10) - 2,
      logo: getClubLogo(shuffled[0]) || clubLogo
    },
    { 
      tour: 25, 
      opponent: clubAbbreviations[shuffled[1]] || shuffled[1].substring(0, 3).toUpperCase(), 
      home: seededRandom(seed + 2) > 0.5, 
      points: Math.floor(seededRandom(seed + 11) * 10) - 2,
      logo: getClubLogo(shuffled[1]) || clubLogo
    },
    { 
      tour: 26, 
      opponent: clubAbbreviations[shuffled[2]] || shuffled[2].substring(0, 3).toUpperCase(), 
      home: seededRandom(seed + 3) > 0.5, 
      points: Math.floor(seededRandom(seed + 12) * 10) - 2,
      logo: getClubLogo(shuffled[2]) || clubLogo
    },
  ];
  
  // Generate calendar (next 3 matches)
  const upcomingMatches = [
    { 
      tour: 27, 
      opponent: clubAbbreviations[shuffled[3]] || shuffled[3].substring(0, 3).toUpperCase(), 
      home: seededRandom(seed + 4) > 0.5,
      logo: getClubLogo(shuffled[3]) || clubLogo
    },
    { 
      tour: 28, 
      opponent: clubAbbreviations[shuffled[4]] || shuffled[4].substring(0, 3).toUpperCase(), 
      home: seededRandom(seed + 5) > 0.5,
      logo: getClubLogo(shuffled[4]) || clubLogo
    },
    { 
      tour: 29, 
      opponent: clubAbbreviations[shuffled[5]] || shuffled[5].substring(0, 3).toUpperCase(), 
      home: seededRandom(seed + 6) > 0.5,
      logo: getClubLogo(shuffled[5]) || clubLogo
    },
  ];
  
  return { recentForm, upcomingMatches };
}

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price: number;
}

interface SwapablePlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  points?: number;
  hasRedCard?: boolean;
  isInjured?: boolean;
  isOnBench?: boolean;
  nextOpponent?: string;
  nextOpponentHome?: boolean;
}

interface PlayerCardProps {
  player: PlayerData | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected?: boolean;
  onToggleSelect?: (playerId: number) => void;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onSetCaptain?: (playerId: number) => void;
  onSetViceCaptain?: (playerId: number) => void;
  variant?: "default" | "transfers" | "management" | "view" | "buy";
  onSell?: (playerId: number) => void;
  onSwap?: (playerId: number) => void;
  onBuy?: (playerId: number) => void;
  hidePointsBreakdown?: boolean;
  canBuy?: boolean;
  // New props for inline swap in management
  swapablePlayers?: SwapablePlayer[];
  validSwapIds?: Set<number>;
  onSwapSelect?: (targetPlayerId: number) => void;
}

const PlayerCard = ({
  player,
  isOpen,
  onClose,
  isSelected = false,
  onToggleSelect,
  isCaptain = false,
  isViceCaptain = false,
  onSetCaptain,
  onSetViceCaptain,
  variant = "default",
  onSell,
  onSwap,
  onBuy,
  hidePointsBreakdown = false,
  canBuy = true,
  swapablePlayers = [],
  validSwapIds = new Set(),
  onSwapSelect,
}: PlayerCardProps) => {
  const [selectedSwapTarget, setSelectedSwapTarget] = useState<number | null>(null);
  if (!player) return null;

  const positionNames: Record<string, string> = {
    ВР: "Вратарь",
    ЗЩ: "Защитник",
    ПЗ: "Полузащитник",
    НП: "Нападающий",
  };

  // Generate club-specific form and calendar data
  const { recentForm, upcomingMatches } = generateClubSchedule(player.team, player.id);

  // Generate point breakdown that sums up to the player's actual points
  const getPointBreakdown = () => {
    const actions: { action: string; points: number }[] = [];
    let remaining = player.points;
    
    // Define possible actions by position with their point values
    const positionActions: Record<string, { action: string; points: number }[]> = {
      "ВР": [
        { action: "Выход на поле", points: 2 },
        { action: "Сухой матч", points: 4 },
        { action: "Пенальти отбит", points: 5 },
        { action: "Гол пропущен", points: -1 },
        { action: "Жёлтая карточка", points: -1 },
      ],
      "ЗЩ": [
        { action: "Выход на поле", points: 2 },
        { action: "Гол", points: 6 },
        { action: "Голевая передача", points: 3 },
        { action: "Сухой матч", points: 4 },
        { action: "Жёлтая карточка", points: -1 },
      ],
      "ПЗ": [
        { action: "Выход на поле", points: 2 },
        { action: "Гол", points: 5 },
        { action: "Голевая передача", points: 3 },
        { action: "Жёлтая карточка", points: -1 },
        { action: "Красная карточка", points: -3 },
      ],
      "НП": [
        { action: "Выход на поле", points: 2 },
        { action: "Гол", points: 4 },
        { action: "Голевая передача", points: 3 },
        { action: "Жёлтая карточка", points: -1 },
      ],
    };

    const availableActions = positionActions[player.position] || positionActions["ПЗ"];
    
    // Always start with "Выход на поле" if player has positive points
    if (remaining >= 2) {
      actions.push({ action: "Выход на поле", points: 2 });
      remaining -= 2;
    }
    
    // Distribute remaining points using goals and assists
    const goalPoints = player.position === "ВР" ? 6 : player.position === "ЗЩ" ? 6 : player.position === "ПЗ" ? 5 : 4;
    const assistPoints = 3;
    
    // Add goals
    while (remaining >= goalPoints) {
      actions.push({ action: "Гол", points: goalPoints });
      remaining -= goalPoints;
    }
    
    // Add assists
    while (remaining >= assistPoints) {
      actions.push({ action: "Голевая передача", points: assistPoints });
      remaining -= assistPoints;
    }
    
    // Handle remaining points with clean sheet or smaller bonuses
    if (remaining === 4 && (player.position === "ВР" || player.position === "ЗЩ")) {
      actions.push({ action: "Сухой матч", points: 4 });
      remaining -= 4;
    }
    
    // Handle small remaining amounts
    if (remaining === 2) {
      actions.push({ action: "Бонус за передачи", points: 2 });
      remaining -= 2;
    } else if (remaining === 1) {
      actions.push({ action: "Бонус за отборы", points: 1 });
      remaining -= 1;
    }
    
    // Handle negative remaining (if player has negative total or yellow/red cards)
    while (remaining < 0 && remaining <= -1) {
      if (remaining <= -3) {
        actions.push({ action: "Красная карточка", points: -3 });
        remaining += 3;
      } else {
        actions.push({ action: "Жёлтая карточка", points: -1 });
        remaining += 1;
      }
    }
    
    return actions;
  };

  const pointBreakdown = getPointBreakdown();

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border animate-fade-in">
        <div className="px-6 pt-4 pb-2 animate-scale-in">
          {/* Header with player info */}
          <div className="flex items-start gap-4">
            {/* Player photo */}
            <div className="w-24 h-28 rounded-lg overflow-hidden">
              <img src={playerPhoto} alt={player.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex flex-col justify-center h-28">
              {/* Player surname */}
              <h2 className="text-foreground text-2xl font-bold font-display">{player.name}</h2>

              {/* Team with logo - Rubik font */}
              <div className="flex items-center gap-2 mt-1">
                <img src={clubLogos[player.team] || clubLogo} alt={player.team} className="w-5 h-5 object-contain" />
                <span className="text-foreground text-sm font-rubik">{player.team}</span>
              </div>

              {/* Position - muted color, Rubik font */}
              <span className="text-muted-foreground text-sm font-rubik mt-1">
                {positionNames[player.position] || player.position}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-6 bg-secondary/50 rounded-xl p-4">
            <div className="text-center">
              <span className="text-muted-foreground text-xs block">Цена</span>
              <span className="text-foreground text-xl font-bold">
                {typeof player.price === "number" ? player.price.toFixed(1) : player.price}
              </span>
              <span className="text-muted-foreground text-xs block">{Math.floor(Math.random() * 10) + 1} из 82</span>
            </div>
            <div className="text-center">
              <span className="text-muted-foreground text-xs block">Очки / матч</span>
              <span className="text-foreground text-xl font-bold">{Math.round(player.points / 10)}</span>
              <span className="text-muted-foreground text-xs block">{Math.floor(Math.random() * 10) + 1} из 82</span>
            </div>
            <div className="text-center">
              <span className="text-muted-foreground text-xs block">Форма</span>
              <span className="text-foreground text-xl font-bold">{Math.floor(Math.random() * 5) + 5}</span>
              <span className="text-muted-foreground text-xs block">{Math.floor(Math.random() * 10) + 1} из 82</span>
            </div>
            <div className="text-center">
              <span className="text-muted-foreground text-xs block">Выбран</span>
              <span className="text-foreground text-xl font-bold">{Math.floor(Math.random() * 30) + 5}%</span>
              <span className="text-muted-foreground text-xs block">{Math.floor(Math.random() * 10) + 1} из 82</span>
            </div>
          </div>

          {/* Form and Calendar sections */}
          <div className="mt-6">
            {/* Headers */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <h3 className="text-foreground text-sm font-bold text-left">Форма</h3>
              <h3 className="text-foreground text-sm font-bold text-left">Календарь</h3>
            </div>
            
            {/* Rows - each row has one form match and one calendar match */}
            <div className="space-y-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4">
                  {/* Form match */}
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">Тур {recentForm[idx].tour}</span>
                    <div className="flex items-center gap-1.5">
                      <img src={recentForm[idx].logo} alt={recentForm[idx].opponent} className="w-4 h-4 object-contain flex-shrink-0" />
                      <span className="text-muted-foreground text-xs text-left">
                        {recentForm[idx].opponent} ({recentForm[idx].home ? "Г" : "Д"})
                      </span>
                    </div>
                    <span className={`text-sm font-bold text-right ${recentForm[idx].points < 0 ? "text-red-500" : "text-foreground"}`}>
                      {recentForm[idx].points}
                    </span>
                  </div>
                  
                  {/* Calendar match */}
                  <div className="grid grid-cols-[auto_1fr] items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">Тур {upcomingMatches[idx].tour}</span>
                    <div className="flex items-center gap-1.5">
                      <img src={upcomingMatches[idx].logo} alt={upcomingMatches[idx].opponent} className="w-4 h-4 object-contain flex-shrink-0" />
                      <span className="text-muted-foreground text-xs text-left">
                        {upcomingMatches[idx].opponent} ({upcomingMatches[idx].home ? "Д" : "Г"})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points breakdown section - only show if there are actions and not hidden */}
          {!hidePointsBreakdown && pointBreakdown.length > 0 && (
            <div className="mt-6">
              <h3 className="text-foreground text-sm font-bold mb-3 text-left">Начисление очков за тур</h3>
              <div className="bg-secondary/30 rounded-xl p-3 space-y-2">
                {(() => {
                  // Group actions by name
                  const grouped = pointBreakdown.reduce((acc, item) => {
                    const key = item.action;
                    if (!acc[key]) {
                      acc[key] = { action: item.action, points: item.points, count: 1 };
                    } else {
                      acc[key].count += 1;
                      acc[key].points += item.points;
                    }
                    return acc;
                  }, {} as Record<string, { action: string; points: number; count: number }>);
                  
                  return Object.values(grouped).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        {item.action}{item.count > 1 ? ` x${item.count}` : ""}
                      </span>
                      <span className={`text-sm font-bold ${item.points > 0 ? "text-primary" : "text-red-500"}`}>
                        {item.points > 0 ? `+${item.points}` : item.points}
                      </span>
                    </div>
                  ));
                })()}
                <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
                  <span className="text-foreground text-sm font-semibold">Итого</span>
                  <span className={`text-sm font-bold ${player.points >= 0 ? "text-primary" : "text-red-500"}`}>
                    {player.points > 0 ? "+" : ""}{player.points}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Swap Player Selection Section - only for management variant */}
          {variant === "management" && swapablePlayers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-foreground text-sm font-bold mb-3 text-left">Выбери игрока для замены</h3>
              
              {/* Column Headers */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <span className="text-muted-foreground text-xs text-left">Игрок</span>
                <span className="text-muted-foreground text-xs text-left">Играет против</span>
              </div>
              
              <ScrollArea className="h-[180px]">
                <div className="space-y-2 pr-2">
                  {/* Sort players: valid first (by position priority), then invalid */}
                  {[...swapablePlayers]
                    .sort((a, b) => {
                      const aValid = validSwapIds.has(a.id);
                      const bValid = validSwapIds.has(b.id);
                      
                      // Valid players first
                      if (aValid && !bValid) return -1;
                      if (!aValid && bValid) return 1;
                      
                      // Among same validity, sort by position: ВР > ЗЩ > ПЗ > НП
                      const positionOrder: Record<string, number> = { "ВР": 0, "ЗЩ": 1, "ПЗ": 2, "НП": 3 };
                      const aOrder = positionOrder[a.position] ?? 4;
                      const bOrder = positionOrder[b.position] ?? 4;
                      return aOrder - bOrder;
                    })
                    .map((swapPlayer) => {
                    const isValid = validSwapIds.has(swapPlayer.id);
                    const isSelected = selectedSwapTarget === swapPlayer.id;
                    const swapPlayerLogo = clubLogos[swapPlayer.team] || getClubLogo(swapPlayer.team) || clubLogo;
                    
                    // Generate next opponent for swap player
                    const { upcomingMatches: swapUpcoming } = generateClubSchedule(swapPlayer.team, swapPlayer.id);
                    const nextMatch = swapUpcoming[0];
                    const nextOpponentLogo = nextMatch?.logo || clubLogo;
                    
                    // Position label
                    const positionLabel = swapPlayer.position === "ВР" ? "ВР" 
                      : swapPlayer.position === "ЗЩ" ? "ЗАЩ"
                      : swapPlayer.position === "ПЗ" ? "ПЗ"
                      : swapPlayer.position === "НП" ? "НАП"
                      : swapPlayer.position;

                    // Get validation error message
                    const getValidationMessage = () => {
                      const currentPlayerPos = player.position;
                      const targetPos = swapPlayer.position;
                      
                      if (currentPlayerPos === "ВР" || targetPos === "ВР") {
                        return "На поле должен быть хотя бы 1 вратарь";
                      }
                      if (currentPlayerPos === "ЗЩ" || targetPos === "ЗЩ") {
                        return "Защитников должно быть от 3 до 5";
                      }
                      if (currentPlayerPos === "ПЗ" || targetPos === "ПЗ") {
                        return "Полузащитников должно быть от 2 до 5";
                      }
                      if (currentPlayerPos === "НП" || targetPos === "НП") {
                        return "Нападающих должно быть от 1 до 3";
                      }
                      return "Замена невозможна - нет подходящей схемы";
                    };

                    return (
                      <div
                        key={swapPlayer.id}
                        onClick={() => {
                          if (isValid) {
                            setSelectedSwapTarget(isSelected ? null : swapPlayer.id);
                          } else {
                            toast.error(getValidationMessage());
                          }
                        }}
                        className={`grid grid-cols-2 gap-4 p-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-primary/20 border border-primary" 
                            : isValid 
                              ? "bg-secondary/30 hover:bg-secondary/50" 
                              : "bg-secondary/20 opacity-50 blur-[0.5px]"
                        } ${isValid && swapPlayer.hasRedCard ? "border border-destructive/50" : ""}`}
                      >
                        {/* Player column: logo, name, position, badges */}
                        <div className="flex items-center gap-2 min-w-0">
                          <img 
                            src={swapPlayerLogo} 
                            alt={swapPlayer.team} 
                            className="w-5 h-5 object-contain flex-shrink-0" 
                          />
                          <span className={`text-sm font-medium truncate ${isValid ? "text-foreground" : "text-muted-foreground"}`}>
                            {swapPlayer.name}
                          </span>
                          <span className="text-muted-foreground text-xs flex-shrink-0">{positionLabel}</span>
                          {swapPlayer.isInjured && (
                            <img src={injuryBadge} alt="injury" className="w-4 h-4 flex-shrink-0" />
                          )}
                          {swapPlayer.hasRedCard && (
                            <img src={redCardBadge} alt="red card" className="w-4 h-4 flex-shrink-0" />
                          )}
                        </div>

                        {/* Opponent column: logo, abbreviation (home/away), selection circle */}
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={nextOpponentLogo} 
                            alt="opponent" 
                            className="w-4 h-4 object-contain flex-shrink-0" 
                          />
                          <span className="text-muted-foreground text-xs">
                            {nextMatch?.opponent || ""} ({nextMatch?.home ? "Д" : "Г"})
                          </span>
                          
                          {/* Selection circle - pushed to the right */}
                          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? "border-primary bg-primary" 
                              : isValid 
                                ? "border-muted-foreground" 
                                : "border-muted"
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DrawerFooter className="px-6 pb-6">
          {variant === "view" ? (
            <Button
              onClick={onClose}
              className="w-full rounded-lg h-12 font-medium bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
            >
              Закрыть
            </Button>
          ) : variant === "transfers" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={onClose}
                className="flex-1 rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  onSell?.(player.id);
                  onClose();
                }}
                className="flex-1 rounded-lg h-12 font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Продать
              </Button>
            </div>
          ) : variant === "management" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={() => {
                  setSelectedSwapTarget(null);
                  onClose();
                }}
                className="flex-1 rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (selectedSwapTarget) {
                    onSwapSelect?.(selectedSwapTarget);
                    setSelectedSwapTarget(null);
                    onClose();
                  } else {
                    // Fallback to old swap mode
                    onSwap?.(player.id);
                    onClose();
                  }
                }}
                disabled={swapablePlayers.length > 0 && !selectedSwapTarget}
                className={`flex-1 rounded-lg h-12 font-medium ${
                  swapablePlayers.length > 0 && !selectedSwapTarget
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
                }`}
              >
                Заменить
              </Button>
            </div>
          ) : variant === "buy" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={onClose}
                className="flex-1 rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  if (canBuy) {
                    onBuy?.(player.id);
                    onClose();
                  }
                }}
                disabled={!canBuy}
                className={`flex-1 rounded-lg h-12 font-medium ${
                  canBuy 
                    ? "bg-primary hover:opacity-90 text-primary-foreground shadow-neon" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Купить
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                onToggleSelect?.(player.id);
                onClose();
              }}
              className={`w-full rounded-lg h-12 font-medium ${
                isSelected ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
              }`}
            >
              {isSelected ? "Убрать" : "Выбрать"}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayerCard;
