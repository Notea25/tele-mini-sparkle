import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ArrowLeftRight, AlertCircle } from "lucide-react";

// Import jerseys from proper folder
import arsenalJersey from "@/assets/jerseys/arsenalJersey.png";
import bateJersey from "@/assets/jerseys/bateJersey.png";
import brestJersey from "@/assets/jerseys/brestJersey.png";
import dinamoJersey from "@/assets/jerseys/dinamoJersey.png";
import gomelJersey from "@/assets/jerseys/gomelJersey.png";
import minskJersey from "@/assets/jerseys/minskJersey.png";
import mlJersey from "@/assets/jerseys/mlJersey.png";
import naftanJersey from "@/assets/jerseys/naftanJersey.png";
import nemanJersey from "@/assets/jerseys/nemanJersey.png";
import slaviaJersey from "@/assets/jerseys/slaviaJersey.png";
import torpedoJersey from "@/assets/jerseys/torpedoJersey.png";
import vitebskJersey from "@/assets/jerseys/vitebskJersey.png";

// Goalkeeper jerseys
import arsenalGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/arsenalGoalkeeperJersey.png";
import bateGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/bateGoalkeeperJersey.png";
import gomelGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/gomelGoalkeeperJersey.png";
import mlGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/mlGoalkeeperJersey.png";
import slaviaGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/slaviaGoalkeeperJersey.png";
import vitebskGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/vitebskGoalkeeperJersey.png";

// Helper function to get jersey based on team and position
const getJerseyForTeam = (team: string, position?: string) => {
  const isGoalkeeper = position === "ВР";
  
  // Normalize team name
  const normalizedTeam = team.toLowerCase();
  
  if (normalizedTeam.includes("динамо") && normalizedTeam.includes("минск")) {
    return dinamoJersey;
  }
  if (normalizedTeam.includes("динамо") && normalizedTeam.includes("брест")) {
    return brestJersey;
  }
  if (normalizedTeam.includes("батэ") || normalizedTeam === "bate") {
    return isGoalkeeper ? bateGoalkeeperJersey : bateJersey;
  }
  if (normalizedTeam.includes("мл") || normalizedTeam.includes("витебск") && normalizedTeam.includes("мл")) {
    return isGoalkeeper ? mlGoalkeeperJersey : mlJersey;
  }
  if (normalizedTeam.includes("витебск") && !normalizedTeam.includes("мл")) {
    return isGoalkeeper ? vitebskGoalkeeperJersey : vitebskJersey;
  }
  if (normalizedTeam.includes("славия") || normalizedTeam.includes("мозырь")) {
    return isGoalkeeper ? slaviaGoalkeeperJersey : slaviaJersey;
  }
  if (normalizedTeam.includes("арсенал")) {
    return isGoalkeeper ? arsenalGoalkeeperJersey : arsenalJersey;
  }
  if (normalizedTeam.includes("неман")) {
    return nemanJersey;
  }
  if (normalizedTeam.includes("минск") && !normalizedTeam.includes("динамо")) {
    return minskJersey;
  }
  if (normalizedTeam.includes("торпедо") || normalizedTeam.includes("белаз")) {
    return torpedoJersey;
  }
  if (normalizedTeam.includes("гомель")) {
    return isGoalkeeper ? gomelGoalkeeperJersey : gomelJersey;
  }
  if (normalizedTeam.includes("нафтан") || normalizedTeam.includes("новополоцк")) {
    return naftanJersey;
  }
  if (normalizedTeam.includes("белшина")) {
    return slaviaJersey; // fallback
  }
  
  return dinamoJersey; // default fallback
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
                {validPlayers.map((player) => (
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
                    </div>
                    
                    {/* Price only */}
                    <span className="text-foreground text-sm flex-shrink-0">{player.price}</span>
                  </button>
                ))}
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