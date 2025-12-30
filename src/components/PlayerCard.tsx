import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import playerPhoto from "@/assets/player-photo.png";
import clubLogo from "@/assets/club-logo.png";
import { clubLogos, getClubLogo } from "@/lib/clubLogos";

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
}: PlayerCardProps) => {
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
        </div>

        <DrawerFooter className="px-6 pb-6">
          {variant === "view" ? (
            <Button
              onClick={onClose}
              className="w-full rounded-lg py-6 font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Закрыть
            </Button>
          ) : variant === "transfers" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={onClose}
                className="flex-1 rounded-lg py-6 font-semibold text-lg bg-card hover:bg-card/80 text-foreground border border-border"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  onSell?.(player.id);
                  onClose();
                }}
                className="flex-1 rounded-lg py-6 font-semibold text-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Продать
              </Button>
            </div>
          ) : variant === "management" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={onClose}
                className="flex-1 rounded-lg py-6 font-semibold text-lg bg-card hover:bg-card/80 text-foreground border border-border"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  onSwap?.(player.id);
                  onClose();
                }}
                className="flex-1 rounded-lg py-6 font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Заменить
              </Button>
            </div>
          ) : variant === "buy" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={onClose}
                className="flex-1 rounded-lg py-6 font-semibold text-lg bg-card hover:bg-card/80 text-foreground border border-border"
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
                className={`flex-1 rounded-lg py-6 font-semibold text-lg ${
                  canBuy 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
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
              className={`w-full rounded-lg py-6 font-semibold text-lg ${
                isSelected ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[#A8FF00] hover:bg-[#98EE00] text-black"
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
