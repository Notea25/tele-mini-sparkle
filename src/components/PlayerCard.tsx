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
}: PlayerCardProps) => {
  if (!player) return null;

  const positionNames: Record<string, string> = {
    ВР: "Вратарь",
    ЗЩ: "Защитник",
    ПЗ: "Полузащитник",
    НП: "Нападающий",
  };

  // Mock form data for recent matches with club images
  const recentForm = [
    { tour: 24, opponent: "BAT", home: true, points: 4, logo: clubLogo },
    { tour: 25, opponent: "TOR", home: false, points: -1, logo: clubBelshina },
    { tour: 26, opponent: "ARS", home: true, points: 2, logo: clubLogo },
    { tour: 27, opponent: "MOL", home: false, points: 5, logo: clubBelshina },
    { tour: 28, opponent: "VIT", home: true, points: 3, logo: clubLogo },
  ];

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

          {/* Form section */}
          <div className="mt-6">
            <h3 className="text-foreground text-xl font-bold text-center mb-4">Форма</h3>
            <div className="grid grid-cols-5 gap-2">
              {recentForm.map((match, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-muted-foreground text-xs block">Тур {match.tour}</span>
                  <div className="w-8 h-8 mx-auto my-2 flex items-center justify-center">
                    <img src={match.logo} alt={match.opponent} className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-muted-foreground text-xs block">
                    {match.opponent} ({match.home ? "H" : "G"})
                  </span>
                  <span className={`text-lg font-bold ${match.points < 0 ? "text-red-500" : "text-foreground"}`}>
                    {match.points > 0 ? match.points : match.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
