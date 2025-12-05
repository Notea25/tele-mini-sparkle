import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import playerPhoto from "@/assets/player-photo.png";
import clubLogo from "@/assets/club-logo.png";

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
  isSelected: boolean;
  onToggleSelect: (playerId: number) => void;
  isCaptain: boolean;
  isViceCaptain: boolean;
  onSetCaptain: (playerId: number) => void;
  onSetViceCaptain: (playerId: number) => void;
}

const PlayerCard = ({
  player,
  isOpen,
  onClose,
  isSelected,
  onToggleSelect,
  isCaptain,
  isViceCaptain,
  onSetCaptain,
  onSetViceCaptain,
}: PlayerCardProps) => {
  if (!player) return null;

  const positionNames: Record<string, string> = {
    "ВР": "Вратарь",
    "ЗЩ": "Защитник",
    "ПЗ": "Полузащитник",
    "НП": "Нападающий",
  };

  // Mock form data for recent matches
  const recentForm = [
    { tour: 24, opponent: "BAT", home: true, points: 4 },
    { tour: 25, opponent: "TOR", home: false, points: -1 },
    { tour: 26, opponent: "ARS", home: true, points: 2 },
    { tour: 27, opponent: "MOL", home: false, points: 5 },
    { tour: 28, opponent: "VIT", home: true, points: 3 },
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
              
              {/* Captain selection */}
              {isSelected && (
                <div className="flex items-center gap-4 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`captain-${player.id}`}
                      checked={isCaptain}
                      onChange={() => onSetCaptain(player.id)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-muted-foreground text-sm">Капитан</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`captain-${player.id}`}
                      checked={isViceCaptain}
                      onChange={() => onSetViceCaptain(player.id)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-muted-foreground text-sm">Вице Капитан</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-6 bg-secondary/50 rounded-xl p-4">
            <div className="text-center">
              <span className="text-muted-foreground text-xs block">Цена</span>
              <span className="text-foreground text-xl font-bold">{player.price}</span>
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
                  <div className="w-8 h-8 mx-auto my-2 bg-secondary rounded-lg flex items-center justify-center">
                    <span className="text-xs">🏆</span>
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
          <Button
            onClick={() => {
              onToggleSelect(player.id);
              onClose();
            }}
            className={`w-full rounded-full py-6 font-semibold text-lg ${
              isSelected 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-[#A8FF00] hover:bg-[#98EE00] text-black"
            }`}
          >
            {isSelected ? "Убрать" : "Выбрать"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayerCard;
