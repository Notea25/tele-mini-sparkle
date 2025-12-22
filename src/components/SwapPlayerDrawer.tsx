import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
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
import { FormationKey, FORMATION_LABELS } from "@/lib/formationUtils";

// Helper function to get jersey based on team and position
const getJerseyForTeam = (team: string, position?: string) => {
  switch (team) {
    case "Динамо-Минск": return jerseyDinamoMinsk;
    case "БАТЭ": return position === "ВР" ? jerseyBateGk : jerseyBate;
    case "Динамо-Брест": return jerseyDinamoBrest;
    case "МЛ Витебск": return position === "ВР" ? jerseyMlVitebskGk : jerseyMlVitebsk;
    case "Славия-Мозырь": return position === "ВР" ? jerseySlaviaGk : jerseySlavia;
    case "Арсенал": return position === "ВР" ? jerseyArsenalGk : playerJerseyTeam;
    case "Неман": return jerseyNeman;
    case "Минск": return jerseyMinsk;
    case "Торпедо-БелАЗ": return jerseyTorpedo;
    case "Витебск": return position === "ВР" ? jerseyVitebskGk : jerseyVitebsk;
    default: return playerJerseyTeam;
  }
};

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price: number;
  slotIndex?: number;
  isOnBench?: boolean;
}

interface ValidSwapOption {
  id: number;
  position: string;
  resultingFormation?: FormationKey;
}

interface SwapPlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayer: PlayerData | null;
  availablePlayers: PlayerData[];
  validSwapOptions: ValidSwapOption[];
  onSwap: (fromPlayerId: number, toPlayerId: number) => void;
}

const SwapPlayerDrawer = ({ 
  isOpen, 
  onClose, 
  selectedPlayer, 
  availablePlayers,
  validSwapOptions,
  onSwap 
}: SwapPlayerDrawerProps) => {
  if (!selectedPlayer) return null;

  const handleSwap = (targetPlayer: PlayerData) => {
    onSwap(selectedPlayer.id, targetPlayer.id);
    onClose();
  };

  // Filter available players to only those with valid swap options
  const validPlayerIds = new Set(validSwapOptions.map(opt => opt.id));
  const validPlayers = availablePlayers.filter(p => validPlayerIds.has(p.id));
  const invalidPlayers = availablePlayers.filter(p => !validPlayerIds.has(p.id));

  const getResultingFormationLabel = (playerId: number) => {
    const option = validSwapOptions.find(opt => opt.id === playerId);
    if (option?.resultingFormation) {
      return FORMATION_LABELS[option.resultingFormation];
    }
    return null;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-foreground text-center text-xl">
            Замена игрока
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6 overflow-y-auto">
          {/* Current player and selection - card style */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* Selected player card */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img 
                  src={getJerseyForTeam(selectedPlayer.team, selectedPlayer.position)} 
                  alt={selectedPlayer.name} 
                  className="w-20 h-20 object-contain drop-shadow-lg" 
                />
              </div>
              <span className="text-foreground font-semibold text-sm mt-2">{selectedPlayer.name}</span>
              <span className="text-muted-foreground text-xs">{selectedPlayer.position}</span>
            </div>
            
            {/* Swap arrows */}
            <ArrowLeftRight className="w-8 h-8 text-primary" />
            
            {/* Empty slot for selection */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 border-2 border-dashed border-primary rounded-xl flex items-center justify-center bg-primary/5">
                <span className="text-primary text-3xl font-light">?</span>
              </div>
              <span className="text-muted-foreground text-sm mt-2">Выберите</span>
              <span className="text-transparent text-xs">—</span>
            </div>
          </div>

          {/* Valid players for swap */}
          <div>
            <p className="text-muted-foreground text-sm mb-4">
              {selectedPlayer.isOnBench ? "Доступные игроки на поле:" : "Доступные игроки на скамейке:"}
            </p>
            
            {validPlayers.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  Нет доступных игроков для замены.
                </p>
                <p className="text-center text-muted-foreground text-xs">
                  Замена невозможна - нет подходящей схемы
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {validPlayers.map((player) => {
                  const formationLabel = getResultingFormationLabel(player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => handleSwap(player)}
                      className="w-full bg-secondary rounded-2xl p-4 flex items-center gap-4 hover:bg-secondary/80 hover:border-primary/50 border border-transparent transition-all"
                    >
                      {/* Player jersey card */}
                      <div className="relative flex-shrink-0">
                        <img 
                          src={getJerseyForTeam(player.team, player.position)} 
                          alt={player.name} 
                          className="w-14 h-14 object-contain" 
                        />
                      </div>
                      
                      {/* Player info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-semibold">{player.name}</span>
                          <span className="text-muted-foreground text-xs">{player.position}</span>
                        </div>
                        {formationLabel && player.position !== selectedPlayer.position && (
                          <div className="text-xs text-primary/80 mt-1">
                            → {formationLabel}
                          </div>
                        )}
                      </div>
                      
                      {/* Points and price */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-primary text-sm font-medium">{player.points} очков</span>
                        <span className="text-foreground text-sm">{player.price}₽</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Show invalid options with explanation */}
            {invalidPlayers.length > 0 && validPlayers.length > 0 && (
              <div className="mt-6">
                <p className="text-muted-foreground text-xs mb-3">
                  Недоступно (нет подходящей схемы):
                </p>
                <div className="space-y-2">
                  {invalidPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="w-full bg-secondary/20 rounded-2xl p-3 flex items-center gap-4 opacity-50"
                    >
                      <img 
                        src={getJerseyForTeam(player.team, player.position)} 
                        alt={player.name} 
                        className="w-10 h-10 object-contain grayscale" 
                      />
                      <div className="flex-1 text-left">
                        <span className="text-muted-foreground font-medium">{player.name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{player.position}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SwapPlayerDrawer;