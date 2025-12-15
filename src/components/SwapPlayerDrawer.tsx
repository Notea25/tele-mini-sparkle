import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import jerseyDinamoMinsk from "@/assets/jersey-dinamo-minsk.png";
import jerseyBate from "@/assets/jersey-bate.png";
import jerseyDinamoBrest from "@/assets/jersey-dinamo-brest.png";
import jerseyMlVitebsk from "@/assets/jersey-ml-vitebsk.png";
import jerseySlavia from "@/assets/jersey-slaviya.png";
import jerseyNeman from "@/assets/jersey-neman.png";
import { FormationKey, FORMATION_LABELS } from "@/lib/formationUtils";

// Helper function to get jersey based on team
const getJerseyForTeam = (team: string) => {
  switch (team) {
    case "Динамо-Минск": return jerseyDinamoMinsk;
    case "БАТЭ": return jerseyBate;
    case "Динамо-Брест": return jerseyDinamoBrest;
    case "МЛ Витебск": return jerseyMlVitebsk;
    case "Славия-Мозырь": return jerseySlavia;
    case "Неман": return jerseyNeman;
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
      <DrawerContent className="bg-card border-border max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="text-foreground text-center">
            Замена игрока
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6 overflow-y-auto">
          {/* Current player */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex flex-col items-center">
              <img src={getJerseyForTeam(selectedPlayer.team)} alt={selectedPlayer.name} className="w-12 h-12 object-contain" />
              <span className="text-foreground text-sm mt-1">{selectedPlayer.name}</span>
              <span className="text-muted-foreground text-xs">{selectedPlayer.position}</span>
            </div>
            <ArrowLeftRight className="w-6 h-6 text-primary" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
                <span className="text-primary text-xl">?</span>
              </div>
              <span className="text-muted-foreground text-sm mt-1">Выберите</span>
            </div>
          </div>

          {/* Valid players for swap */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm mb-3">
              {selectedPlayer.isOnBench ? "Доступные игроки на поле:" : "Доступные игроки на скамейке:"}
            </p>
            
            {validPlayers.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  Нет доступных игроков для замены.
                </p>
                <p className="text-center text-muted-foreground text-xs">
                  Замена невозможна - нет подходящей схемы
                </p>
              </div>
            ) : (
              validPlayers.map((player) => {
                const formationLabel = getResultingFormationLabel(player.id);
                return (
                  <button
                    key={player.id}
                    onClick={() => handleSwap(player)}
                    className="w-full bg-secondary rounded-2xl px-4 py-3 flex flex-col gap-1 hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={getJerseyForTeam(player.team)} alt={player.name} className="w-8 h-8 object-contain" />
                      <div className="flex-1 text-left">
                        <span className="text-foreground font-medium">{player.name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{player.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-sm">{player.points} очков</span>
                        <span className="text-foreground text-sm">{player.price}₽</span>
                      </div>
                    </div>
                    {formationLabel && player.position !== selectedPlayer.position && (
                      <div className="text-xs text-primary/80 ml-11">
                        → {formationLabel}
                      </div>
                    )}
                  </button>
                );
              })
            )}

            {/* Show invalid options with explanation */}
            {invalidPlayers.length > 0 && validPlayers.length > 0 && (
              <>
                <p className="text-muted-foreground text-xs mt-4 mb-2">
                  Недоступно (нет подходящей схемы):
                </p>
                {invalidPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="w-full bg-secondary/30 rounded-2xl px-4 py-3 flex items-center gap-3 opacity-50"
                  >
                    <img src={getJerseyForTeam(player.team)} alt={player.name} className="w-8 h-8 object-contain grayscale" />
                    <div className="flex-1 text-left">
                      <span className="text-muted-foreground font-medium">{player.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">{player.position}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SwapPlayerDrawer;