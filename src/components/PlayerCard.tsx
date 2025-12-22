import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import playerPhoto from "@/assets/player-photo.png";
import clubLogo from "@/assets/club-logo.png";
import clubBelshina from "@/assets/club-belshina.png";

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
  variant?: "default" | "transfers" | "management" | "view";
  onSell?: (playerId: number) => void;
  onSwap?: (playerId: number) => void;
  hidePointsBreakdown?: boolean;
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
  hidePointsBreakdown = false,
}: PlayerCardProps) => {
  if (!player) return null;

  const positionNames: Record<string, string> = {
    ВР: "Вратарь",
    ЗЩ: "Защитник",
    ПЗ: "Полузащитник",
    НП: "Нападающий",
  };

  // Mock form data - last 3 matches
  const recentForm = [
    { tour: 24, opponent: "БАТ", home: true, points: 4, logo: clubLogo },
    { tour: 25, opponent: "ТОР", home: false, points: -1, logo: clubBelshina },
    { tour: 26, opponent: "АРС", home: true, points: 2, logo: clubLogo },
  ];

  // Mock calendar data - next 3 matches
  const upcomingMatches = [
    { tour: 27, opponent: "МОЛ", home: false, logo: clubBelshina },
    { tour: 28, opponent: "ВИТ", home: true, logo: clubLogo },
    { tour: 29, opponent: "НЕМ", home: false, logo: clubBelshina },
  ];

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
      <DrawerContent className="bg-card border-border">
        <div className="px-6 pt-4 pb-2">
          {/* Header with position and player info */}
          <div className="flex items-start gap-4">
            {/* Player photo */}
            <div className="w-24 h-28 rounded-lg overflow-hidden">
              <img src={playerPhoto} alt={player.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
              {/* Position badge */}
              <span className="inline-block bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full mb-2">
                {positionNames[player.position] || player.position}
              </span>

              {/* Player name */}
              <h2 className="text-foreground text-2xl font-bold">{player.name}</h2>

              {/* Team */}
              <div className="flex items-center gap-2 mt-1">
                <img src={clubLogo} alt={player.team} className="w-5 h-5 object-contain" />
                <span className="text-primary">{player.team}</span>
              </div>
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
              <h3 className="text-foreground text-sm font-bold text-center">Форма</h3>
              <h3 className="text-foreground text-sm font-bold text-center">Календарь</h3>
            </div>
            
            {/* Rows - each row has one form match and one calendar match */}
            <div className="space-y-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4">
                  {/* Form match */}
                  <div className="flex items-center justify-between bg-secondary/30 rounded-lg px-2 py-1.5">
                    <span className="text-muted-foreground text-xs">Тур {recentForm[idx].tour}</span>
                    <div className="flex items-center gap-1.5">
                      <img src={recentForm[idx].logo} alt={recentForm[idx].opponent} className="w-4 h-4 object-contain" />
                      <span className="text-muted-foreground text-xs">
                        {recentForm[idx].opponent} ({recentForm[idx].home ? "Д" : "Г"})
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${recentForm[idx].points < 0 ? "text-red-500" : "text-foreground"}`}>
                      {recentForm[idx].points}
                    </span>
                  </div>
                  
                  {/* Calendar match */}
                  <div className="flex items-center justify-between bg-secondary/30 rounded-lg px-2 py-1.5">
                    <span className="text-muted-foreground text-xs">Тур {upcomingMatches[idx].tour}</span>
                    <div className="flex items-center gap-1.5">
                      <img src={upcomingMatches[idx].logo} alt={upcomingMatches[idx].opponent} className="w-4 h-4 object-contain" />
                      <span className="text-muted-foreground text-xs">
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
              <h3 className="text-foreground text-sm font-bold mb-3">Начисление очков за тур</h3>
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
              className="w-full rounded-full py-6 font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Закрыть
            </Button>
          ) : variant === "transfers" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={onClose}
                className="flex-1 rounded-full py-6 font-semibold text-lg bg-card hover:bg-card/80 text-foreground border border-border"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  onSell?.(player.id);
                  onClose();
                }}
                className="flex-1 rounded-full py-6 font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Продать
              </Button>
            </div>
          ) : variant === "management" ? (
            <div className="flex gap-3 w-full">
              <Button
                onClick={onClose}
                className="flex-1 rounded-full py-6 font-semibold text-lg bg-card hover:bg-card/80 text-foreground border border-border"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  onSwap?.(player.id);
                  onClose();
                }}
                className="flex-1 rounded-full py-6 font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Заменить
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                onToggleSelect?.(player.id);
                onClose();
              }}
              className={`w-full rounded-full py-6 font-semibold text-lg ${
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
