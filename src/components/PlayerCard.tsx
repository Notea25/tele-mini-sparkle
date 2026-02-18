import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import playerPhoto from "@/assets/player-photo.png";
import playerDefault from "@/assets/player-default.png";
import clubLogo from "@/assets/club-logo.png";
import { clubLogos, getClubLogo } from "@/lib/clubLogos";
import injuryBadge from "@/assets/injury-badge.png";
import redCardBadge from "@/assets/red-card-badge.png";
import { playersApi, PlayerFullInfoResponse } from "@/lib/api";

// Club abbreviations for opponent names
const clubAbbreviations: Record<string, string> = {
  "Torpedo-BelAZ": "ТОР",
  "FC Gomel": "ГОМ",
  "BATE Borisov": "БАТ",
  "Dinamo Brest": "ДБР",
  "Dinamo Minsk": "ДМН",
  "FC Isloch": "ИСЛ",
  "Neman": "НЕМ",
  "Shakhtyor Soligorsk": "ШАХ",
  "FC Vitebsk": "ВИТ",
  "Slavia-Mozyr": "СЛА",
  "Naftan": "НАФ",
  "FC Minsk": "МИН",
  "Belshina Bobruisk": "БЕЛ",
  "Arsenal Dzerzhinsk": "АРС",
  "FK Baranovichi": "БАР",
  "FC Dnepr Mogilev": "ДНП",
  "Lokomotiv Vitebsk": "МЛ",
  // Russian names fallback
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

// Get abbreviation for team name
const getTeamAbbreviation = (teamName: string): string => {
  // Check direct match
  if (clubAbbreviations[teamName]) {
    return clubAbbreviations[teamName];
  }
  // Try partial match
  for (const [key, abbr] of Object.entries(clubAbbreviations)) {
    if (teamName.includes(key) || key.includes(teamName)) {
      return abbr;
    }
  }
  // Fallback: first 3 chars uppercase
  return teamName.substring(0, 3).toUpperCase();
};

// All clubs in the league for generating schedules (fallback for swap players)
const allClubs = [
  "Арсенал", "БАТЭ", "Белшина", "Витебск", "Гомель",
  "Динамо-Брест", "Динамо-Минск", "Днепр-Могилев", "Ислочь",
  "Минск", "МЛ Витебск", "Нафтан", "Неман", "Славия", "Торпедо-БелАЗ"
];

// Generate deterministic schedule for swap players (fallback when no API data)
function generateClubSchedule(teamName: string, playerId: number) {
  const opponents = allClubs.filter(club => !teamName.includes(club.split("-")[0]) && !club.includes(teamName.split("-")[0]));
  
  let seed = playerId;
  for (let i = 0; i < teamName.length; i++) {
    seed += teamName.charCodeAt(i);
  }
  
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  
  const shuffled = [...opponents].sort((a, b) => seededRandom(seed + a.charCodeAt(0)) - seededRandom(seed + b.charCodeAt(0)));
  
  const upcomingMatches = [
    { 
      tour: 27, 
      opponent: clubAbbreviations[shuffled[3]] || shuffled[3]?.substring(0, 3).toUpperCase() || "???", 
      home: seededRandom(seed + 4) > 0.5,
      logo: getClubLogo(shuffled[3]) || clubLogo
    },
  ];
  
  return { upcomingMatches };
}

/** Small stat cell with info tooltip */
function StatCell({ label, value, rank, tooltip }: { label: string; value: React.ReactNode; rank: string; tooltip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-center min-w-0">
      <TooltipProvider delayDuration={0}>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-0.5 cursor-pointer text-muted-foreground text-[10px] leading-none whitespace-nowrap hover:text-foreground transition-colors p-0"
              onClick={() => setOpen(!open)}
            >
              <span>{label}</span>
              <Info className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="max-w-[220px] text-center text-xs bg-popover border-border z-[100]"
          >
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-foreground text-xl font-bold block">{value}</span>
      <span className="text-muted-foreground text-xs block">{rank}</span>
    </div>
  );
}

interface PlayerData {
  id: number;
  name: string;
  name_rus?: string;
  team: string;
  team_rus?: string;
  position: string;
  points: number; // Оставлено для обратной совместимости
  price: number;
  total_points?: number; // Общие очки за все туры
  tour_points?: number; // Очки за последний/текущий тур
}

interface SwapablePlayer {
  id: number;
  name: string;
  name_rus?: string;
  team: string;
  team_rus?: string;
  team_logo?: string;
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
  swapInvalidMessages?: Record<number, string>;
  onSwapSelect?: (targetPlayerId: number) => void;
  // Points display mode
  showTourPoints?: boolean; // true = показывать tour_points, false/undefined = показывать total_points
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
  swapInvalidMessages = {},
  onSwapSelect,
  showTourPoints = false,
}: PlayerCardProps) => {
  const [selectedSwapTarget, setSelectedSwapTarget] = useState<number | null>(null);
  const [fullInfo, setFullInfo] = useState<PlayerFullInfoResponse | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  // Load full player info when drawer opens
  useEffect(() => {
    if (isOpen && player?.id) {
      setIsLoadingInfo(true);
      playersApi.getFullInfo(player.id)
        .then((response) => {
          if (response.success && response.data) {
            console.log(`[PlayerCard] Full info for ${player.name}:`, response.data);
            console.log(`[PlayerCard] Last 3 tours:`, response.data.last_3_tours);
            if (response.data.last_3_tours?.[0]) {
              console.log(`[PlayerCard] First tour matches:`, response.data.last_3_tours[0].matches);
              console.log(`[PlayerCard] First match player_points:`, response.data.last_3_tours[0].matches[0]?.player_points);
            }
            setFullInfo(response.data);
          } else {
            console.log(`[PlayerCard] API response not successful or no data`);
          }
        })
        .catch((err) => {
          console.error(`[PlayerCard] Error loading full info:`, err);
        })
        .finally(() => {
          setIsLoadingInfo(false);
        });
    } else if (!isOpen) {
      // Reset when closed
      setFullInfo(null);
    }
  }, [isOpen, player?.id]);

  if (!player) return null;

  // Get points from recent match in API if available, otherwise use prop points
  const recentMatchPoints = fullInfo?.last_3_tours?.[0]?.matches?.[0]?.player_points;
  
  // Выбираем какие очки показывать
  // Priority: recent match points from API > showTourPoints > total_points > points prop
  const displayPoints = (recentMatchPoints !== null && recentMatchPoints !== undefined) 
    ? recentMatchPoints
    : showTourPoints 
      ? (player.tour_points ?? 0) 
      : (player.total_points ?? player.points ?? 0);

  const positionNames: Record<string, string> = {
    ВР: "Вратарь",
    ЗЩ: "Защитник",
    ПЗ: "Полузащитник",
    НП: "Нападающий",
    Goalkeeper: "Вратарь",
    Defender: "Защитник",
    Midfielder: "Полузащитник",
    Attacker: "Нападающий",
  };

  // Get data from API or fallback to player props
  const playerPhoto_url = fullInfo?.base_info?.photo || playerDefault;
  const teamLogo_url = fullInfo?.base_info?.team_logo || clubLogos[player.team] || clubLogo;
  const teamName = fullInfo?.base_info?.team_name_rus || fullInfo?.base_info?.team_name || player.team_rus || player.team;
  const positionDisplay = fullInfo?.base_info?.position 
    ? positionNames[fullInfo.base_info.position] || fullInfo.base_info.position
    : positionNames[player.position] || player.position;

  // Extended info from API
  const extInfo = fullInfo?.extended_info;
  const totalPlayers = extInfo?.total_players_in_league || 467;

  // Form data from API (last 3 tours)
  const recentForm = fullInfo?.last_3_tours?.map(tour => {
    const match = tour.matches[0];
    return {
      tour: tour.tour_number,
      opponent: match ? getTeamAbbreviation(match.opponent_team_name) : "???",
      home: match?.is_home ?? false,
      points: match?.player_points !== null && match?.player_points !== undefined ? match.player_points : null,
      logo: match?.opponent_team_logo || clubLogo,
    };
  }) || [];

  // Calendar data from API (next 3 tours)
  const upcomingMatches = fullInfo?.next_3_tours?.map(tour => {
    const match = tour.matches[0];
    return {
      tour: tour.tour_number,
      opponent: match ? getTeamAbbreviation(match.opponent_team_name) : "???",
      home: match?.is_home ?? false,
      logo: match?.opponent_team_logo || clubLogo,
    };
  }) || [];

  // Get real point breakdown from the most recent match in last_3_tours
  const getPointBreakdown = () => {
    const actions: { action: string; points: number }[] = [];
    
    // Find the most recent match from API data (first in last_3_tours)
    const recentMatch = fullInfo?.last_3_tours?.[0]?.matches?.[0];
    
    if (!recentMatch) {
      return actions; // No data available
    }
    
    // Get player position (support both API format and prop format)
    const playerPos = fullInfo?.base_info?.position || player.position;
    const isGoalkeeper = playerPos === "ВР" || playerPos === "Goalkeeper";
    const isDefender = playerPos === "ЗЩ" || playerPos === "Defender";
    const isMidfielder = playerPos === "ПЗ" || playerPos === "Midfielder";
    const isAttacker = playerPos === "НП" || playerPos === "Attacker" || playerPos === "Forward";
    
    // Debug logging
    console.log('[PlayerCard] Point breakdown debug:', {
      playerPos,
      isGoalkeeper,
      isDefender,
      clean_sheet: recentMatch.clean_sheet,
      minutes_played: recentMatch.minutes_played,
      goals_conceded: recentMatch.goals_conceded,
      recentMatch
    });
    
    // 1. Minutes played (appearance points)
    const minutesPlayed = recentMatch.minutes_played || 0;
    if (minutesPlayed >= 60) {
      actions.push({ action: "Выход на поле (60+ мин)", points: 2 });
    } else if (minutesPlayed > 0) {
      actions.push({ action: "Выход на поле (<60 мин)", points: 1 });
    }
    
    // 2. Goals (depends on position)
    if (recentMatch.goals_total && recentMatch.goals_total > 0) {
      const goalPoints = isGoalkeeper ? 6 : isDefender ? 6 : isMidfielder ? 5 : 4;
      actions.push({ action: "Гол", points: goalPoints * recentMatch.goals_total });
    }
    
    // 3. Assists (all positions +3)
    if (recentMatch.assists && recentMatch.assists > 0) {
      actions.push({ action: "Голевая передача", points: 3 * recentMatch.assists });
    }
    
    // 4. Clean sheet (for goalkeepers and defenders who played >= 60 min)
    if (recentMatch.clean_sheet && minutesPlayed >= 60) {
      if (isGoalkeeper || isDefender) {
        actions.push({ action: "Сухой матч", points: 4 });
      }
    }
    
    // 5. Penalty saved (only for goalkeepers)
    if (recentMatch.penalty_saved && recentMatch.penalty_saved > 0 && isGoalkeeper) {
      actions.push({ action: "Отраженный пенальти", points: 5 * recentMatch.penalty_saved });
    }
    
    // 6. Penalty missed (all positions -2)
    if (recentMatch.penalty_missed && recentMatch.penalty_missed > 0) {
      actions.push({ action: "Незабитый пенальти", points: -2 * recentMatch.penalty_missed });
    }
    
    // 7. Yellow cards (all positions -1)
    if (recentMatch.yellow_cards && recentMatch.yellow_cards > 0) {
      actions.push({ action: "Жёлтая карточка", points: -1 * recentMatch.yellow_cards });
    }
    
    // 8. Red cards (all positions -3)
    if (recentMatch.red_cards && recentMatch.red_cards > 0) {
      actions.push({ action: "Красная карточка", points: -3 * recentMatch.red_cards });
    }
    
    // 9. Goals conceded (only for goalkeepers and defenders, -1 per 2 goals)
    if (recentMatch.goals_conceded && recentMatch.goals_conceded > 0) {
      if (isGoalkeeper || isDefender) {
        const penalty = Math.floor(recentMatch.goals_conceded / 2) * -1;
        if (penalty < 0) {
          actions.push({ action: "Пропущенные голы", points: penalty });
        }
      }
    }
    
    return actions;
  };

  const pointBreakdown = getPointBreakdown();

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border animate-fade-in max-h-[85vh] flex flex-col">
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 pt-4 pb-2 animate-scale-in">
          {/* Header with player info */}
          <div className="flex items-start gap-4">
            {/* Player photo */}
            <div className="w-24 h-28 rounded-lg overflow-hidden bg-secondary/30">
              {isLoadingInfo ? (
                <div className="w-full h-full animate-pulse bg-secondary/50" />
              ) : (
                <img 
                  src={playerPhoto_url} 
                   alt={player.name_rus || player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = playerDefault; }}
                />
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center h-28">
              {/* Player surname */}
              <h2 className="text-foreground text-2xl font-normal font-display">{player.name_rus || player.name}</h2>

              {/* Team with logo - Rubik font */}
              <div className="flex items-center gap-2 mt-1">
                {isLoadingInfo ? (
                  <div className="w-5 h-5 rounded-full animate-pulse bg-secondary/50" />
                ) : (
                  <img 
                    src={fullInfo?.base_info?.team_logo || clubLogos[player.team] || clubLogo} 
                    alt={teamName} 
                    className="w-5 h-5 object-contain"
                    onError={(e) => { e.currentTarget.src = clubLogo; }}
                  />
                )}
                <span className="text-foreground text-sm font-rubik">{teamName}</span>
              </div>

              {/* Position - muted color, Rubik font */}
              <span className="text-muted-foreground text-sm font-rubik mt-1">
                {positionDisplay}
              </span>

              {/* Captain / Vice-Captain badge text */}
              {(isCaptain || isViceCaptain) && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium font-rubik">
                  {isCaptain ? "Капитан (очки x2)" : "Вице-капитан (очки x2 если капитан не играл)"}
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-3 bg-secondary/50 rounded-xl px-3 pt-3 pb-5 items-center">
            <StatCell
              label="Цена"
              value={typeof player.price === "number" ? player.price.toFixed(1) : player.price}
              rank={extInfo ? `${extInfo.market_value_rank} из ${totalPlayers}` : "-"}
              tooltip="Стоимость игрока, а также его место в общем списке по этому критерию."
            />
            <StatCell
              label="Очки / матч"
              value={extInfo ? Math.round(extInfo.avg_points_all_matches) : Math.round(displayPoints / 10)}
              rank={extInfo ? `${extInfo.avg_points_all_matches_rank} из ${totalPlayers}` : "-"}
              tooltip="Среднее количество очков, набранное игроком за все прошедшие туры чемпионата, а также его место в общем списке по этому критерию."
            />
            <StatCell
              label="Форма"
              value={extInfo ? Math.round(extInfo.avg_points_last_5_matches) : "-"}
              rank={extInfo ? `${extInfo.avg_points_last_5_matches_rank} из ${totalPlayers}` : "-"}
              tooltip="Среднее количество очков, набранные игроком за последние 3 тура, а также его место в общем списке по этому критерию."
            />
            <StatCell
              label="Выбран"
              value={`${extInfo?.squad_presence_percentage?.toFixed(0) ?? 0}%`}
              rank={extInfo ? `${extInfo.squad_presence_rank} из ${totalPlayers}` : "-"}
              tooltip="Процент владения игроком среди всех пользователей, а также его место в общем списке по этому критерию."
            />
          </div>

          {/* Form and Calendar sections */}
          <div className="mt-6">
            {/* Headers */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <h3 className="text-foreground text-sm font-normal font-display text-left">Форма</h3>
              <h3 className="text-foreground text-sm font-normal font-display text-left">Календарь</h3>
            </div>
            
            {/* Rows - each row has one form match and one calendar match */}
            <div className="space-y-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4">
                  {/* Form match */}
                  {recentForm[idx] ? (
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
                      <span className="text-muted-foreground text-xs whitespace-nowrap">Тур {recentForm[idx].tour}</span>
                      <div className="flex items-center gap-1.5">
                        <img 
                          src={recentForm[idx].logo} 
                          alt={recentForm[idx].opponent} 
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = clubLogo; }}
                        />
                        <span className="text-muted-foreground text-xs text-left">
                          {recentForm[idx].opponent} ({recentForm[idx].home ? "Д" : "Г"})
                        </span>
                      </div>
                      <span className={`text-sm font-bold text-right ${(recentForm[idx].points ?? 0) < 0 ? "text-red-500" : recentForm[idx].points === null ? "text-muted-foreground" : "text-foreground"}`}>
                        {recentForm[idx].points !== null ? recentForm[idx].points : "-"}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-secondary/30 rounded-lg px-3 py-1.5 flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">—</span>
                    </div>
                  )}
                  
                  {/* Calendar match */}
                  {upcomingMatches[idx] ? (
                    <div className="grid grid-cols-[auto_1fr] items-center gap-2 bg-secondary/30 rounded-lg px-3 py-1.5">
                      <span className="text-muted-foreground text-xs whitespace-nowrap">Тур {upcomingMatches[idx].tour}</span>
                      <div className="flex items-center gap-1.5">
                        <img 
                          src={upcomingMatches[idx].logo} 
                          alt={upcomingMatches[idx].opponent} 
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = clubLogo; }}
                        />
                        <span className="text-muted-foreground text-xs text-left">
                          {upcomingMatches[idx].opponent} ({upcomingMatches[idx].home ? "Д" : "Г"})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-secondary/30 rounded-lg px-3 py-1.5 flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">—</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Points breakdown section - "Набранные очки" */}
          {!hidePointsBreakdown && (
            <div className="mt-6">
              <h3 className="text-foreground text-sm font-normal font-display mb-3 text-left">Набранные очки</h3>
              <div className="bg-secondary/30 rounded-xl p-3 space-y-2">
                {/* Check if player has 0 minutes played */}
                {fullInfo?.last_3_tours?.[0]?.matches?.[0]?.minutes_played === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-red-500 text-sm font-semibold text-center">
                      Игрок не вышел на поле
                    </span>
                  </div>
                ) : pointBreakdown.length > 0 ? (
                  <>
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
                          <span className={`text-sm font-bold ${item.points > 0 ? "text-success" : item.points < 0 ? "text-red-500" : "text-foreground"}`}>
                            {item.points > 0 ? `+${item.points}` : item.points}
                          </span>
                        </div>
                      ));
                    })()}
                    {/* Captain/Vice-Captain multiplier - отображаем только для капитана */}
                    {isCaptain && displayPoints > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Бонус за капитана
                        </span>
                        <span className="text-sm font-bold text-purple-500">
                          ×2
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
                      <span className="text-foreground text-sm font-semibold">Итого</span>
                      <span className={`text-sm font-bold ${(isCaptain ? displayPoints * 2 : displayPoints) > 0 ? "text-success" : (isCaptain ? displayPoints * 2 : displayPoints) < 0 ? "text-destructive" : "text-foreground"}`}>
                        {(isCaptain ? displayPoints * 2 : displayPoints) > 0 ? "+" : ""}{isCaptain ? displayPoints * 2 : displayPoints}
                      </span>
                    </div>

                  </>
                ) : (
                  /* Placeholder when no points data - similar to Form/Calendar */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">—</span>
                      <span className="text-muted-foreground text-sm">—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">—</span>
                      <span className="text-muted-foreground text-sm">—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">—</span>
                      <span className="text-muted-foreground text-sm">—</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Swap Player Selection Section - only for management variant */}
          {variant === "management" && swapablePlayers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-foreground text-sm font-normal font-display mb-3 text-left">Выбери игрока для замены</h3>
              
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
                    const swapPlayerLogo = swapPlayer.team_logo || clubLogos[swapPlayer.team] || getClubLogo(swapPlayer.team);
                    
                    // Generate next opponent for swap player
                    const { upcomingMatches: swapUpcoming } = generateClubSchedule(swapPlayer.team, swapPlayer.id);
                    const nextMatch = swapUpcoming[0];
                    const nextOpponentLogo = nextMatch?.logo;
                    
                    // Position label
                    const positionLabel = swapPlayer.position === "ВР" ? "ВР" 
                      : swapPlayer.position === "ЗЩ" ? "ЗАЩ"
                      : swapPlayer.position === "ПЗ" ? "ПЗ"
                      : swapPlayer.position === "НП" ? "НАП"
                      : swapPlayer.position;

                    // Get validation error message based on swap direction
                    const getValidationMessage = () => {
                      const currentPlayerPos = player.position; // Player being viewed (will go OUT)
                      const targetPos = swapPlayer.position; // Player in the list (will come IN)
                      
                      // If positions are same, it should be valid - something else is wrong
                      if (currentPlayerPos === targetPos) {
                        return "Замена невозможна";
                      }
                      
                      // When swapping, current player goes OUT (their position loses 1)
                      // and target player comes IN (their position gains 1)
                      
                      // Goalkeeper logic
                      if (currentPlayerPos === "ВР" && targetPos !== "ВР") {
                        return "На поле должен быть хотя бы 1 вратарь";
                      }
                      if (targetPos === "ВР" && currentPlayerPos !== "ВР") {
                        return "На поле не может быть 2 вратаря";
                      }
                      
                      // Defender logic (min 3, max 5)
                      if (currentPlayerPos === "ЗЩ" && targetPos !== "ЗЩ") {
                        return "На поле должно быть минимум 3 защитника";
                      }
                      if (targetPos === "ЗЩ" && currentPlayerPos !== "ЗЩ") {
                        return "На поле не может быть более 5 защитников";
                      }
                      
                      // Midfielder logic (min 2, max 5)
                      if (currentPlayerPos === "ПЗ" && targetPos !== "ПЗ") {
                        return "На поле должно быть минимум 2 полузащитника";
                      }
                      if (targetPos === "ПЗ" && currentPlayerPos !== "ПЗ") {
                        return "На поле не может быть более 5 полузащитников";
                      }
                      
                      // Forward logic (min 1, max 3)
                      if (currentPlayerPos === "НП" && targetPos !== "НП") {
                        return "На поле должен быть минимум 1 нападающий";
                      }
                      if (targetPos === "НП" && currentPlayerPos !== "НП") {
                        return "На поле не может быть более 3 нападающих";
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
                            toast.error(swapInvalidMessages[swapPlayer.id] ?? getValidationMessage());
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
                          {swapPlayerLogo && (
                            <img 
                              src={swapPlayerLogo} 
                              alt={swapPlayer.team_rus || swapPlayer.team} 
                              className="w-5 h-5 object-contain flex-shrink-0" 
                            />
                          )}
                          <span className={`text-sm font-medium truncate ${isValid ? "text-foreground" : "text-muted-foreground"}`}>
                            {swapPlayer.name_rus || swapPlayer.name}
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
                          {nextOpponentLogo && (
                            <img 
                              src={nextOpponentLogo} 
                              alt="opponent" 
                              className="w-5 h-5 object-contain flex-shrink-0" 
                            />
                          )}
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
        </ScrollArea>

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
