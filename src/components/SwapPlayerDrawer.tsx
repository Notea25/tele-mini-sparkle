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

  // Sort: valid players first, then invalid at the bottom
  const sortedPlayers = [...validPlayers, ...invalidPlayers];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-foreground text-center text-lg">
            Замена игрока
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6">
          <div className="flex gap-4 h-[400px]">
            {/* Left side: Selected player card */}
            <div className="flex flex-col items-center justify-start pt-4">
              <div className="bg-[#1a2233] rounded-xl p-3 flex flex-col items-center min-w-[100px]">
                <img 
                  src={getJerseyForTeam(selectedPlayer.team, selectedPlayer.position)} 
                  alt={selectedPlayer.name} 
                  className="w-16 h-16 object-contain drop-shadow-lg" 
                />
                <span className="text-foreground font-semibold text-sm mt-2 text-center leading-tight">{selectedPlayer.name}</span>
                <span className="text-muted-foreground text-[10px] mt-0.5">({selectedPlayer.position})</span>
                <span className="text-muted-foreground text-[10px]">{selectedPlayer.team}</span>
              </div>
              
              <ArrowLeftRight className="w-6 h-6 text-primary mt-4 rotate-0" />
              
              {/* Empty slot */}
              <div className="bg-[#1a2233] rounded-xl p-3 flex flex-col items-center min-w-[100px] mt-4 border-2 border-dashed border-primary/50">
                <div className="w-16 h-16 flex items-center justify-center">
                  <span className="text-primary text-4xl font-light">?</span>
                </div>
                <span className="text-muted-foreground text-sm mt-2">Выберите</span>
              </div>
            </div>

            {/* Right side: Scrollable player list */}
            <div className="flex-1 overflow-y-auto pr-1">
              {sortedPlayers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <AlertCircle className="w-10 h-10 text-muted-foreground" />
                  <p className="text-center text-muted-foreground text-sm">
                    Нет доступных игроков для замены
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {sortedPlayers.map((player) => {
                    const isValid = validPlayerIds.has(player.id);
                    
                    return (
                      <button
                        key={player.id}
                        onClick={() => isValid && handleSwap(player)}
                        disabled={!isValid}
                        className={`
                          bg-[#1a2233] rounded-xl p-2 flex flex-col items-center transition-all
                          ${isValid 
                            ? 'hover:bg-[#243047] hover:ring-2 hover:ring-primary cursor-pointer' 
                            : 'opacity-40 blur-[1px] cursor-not-allowed order-last'
                          }
                        `}
                      >
                        <img 
                          src={getJerseyForTeam(player.team, player.position)} 
                          alt={player.name} 
                          className={`w-12 h-12 object-contain ${!isValid ? 'grayscale' : ''}`}
                        />
                        <span className="text-foreground font-semibold text-xs mt-1 text-center leading-tight line-clamp-1">{player.name}</span>
                        <span className="text-muted-foreground text-[10px]">({player.position})</span>
                        <span className="text-muted-foreground text-[10px] line-clamp-1">{player.team}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SwapPlayerDrawer;