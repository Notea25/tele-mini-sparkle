import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ArrowLeftRight } from "lucide-react";
import playerJerseyTeam from "@/assets/player-jersey-team.png";

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

// Valid formations: [GK, DEF, MID, FWD]
export const VALID_FORMATIONS = [
  { formation: [1, 4, 4, 2], label: "1 ВР - 4 ЗЩ - 4 ПЗ - 2 НП" },
  { formation: [1, 3, 4, 3], label: "1 ВР - 3 ЗЩ - 4 ПЗ - 3 НП" },
  { formation: [1, 3, 5, 2], label: "1 ВР - 3 ЗЩ - 5 ПЗ - 2 НП" },
  { formation: [1, 4, 3, 3], label: "1 ВР - 4 ЗЩ - 3 ПЗ - 3 НП" },
  { formation: [1, 4, 5, 1], label: "1 ВР - 4 ЗЩ - 5 ПЗ - 1 НП" },
  { formation: [1, 5, 4, 1], label: "1 ВР - 5 ЗЩ - 4 ПЗ - 1 НП" },
  { formation: [1, 5, 3, 2], label: "1 ВР - 5 ЗЩ - 3 ПЗ - 2 НП" },
  { formation: [1, 5, 2, 3], label: "1 ВР - 5 ЗЩ - 2 ПЗ - 3 НП" },
];

export const getFormationCounts = (players: PlayerData[]): [number, number, number, number] => {
  const gk = players.filter(p => p.position === "ВР").length;
  const def = players.filter(p => p.position === "ЗЩ").length;
  const mid = players.filter(p => p.position === "ПЗ").length;
  const fwd = players.filter(p => p.position === "НП").length;
  return [gk, def, mid, fwd];
};

export const isValidFormation = (counts: [number, number, number, number]): boolean => {
  return VALID_FORMATIONS.some(f => 
    f.formation[0] === counts[0] && 
    f.formation[1] === counts[1] && 
    f.formation[2] === counts[2] && 
    f.formation[3] === counts[3]
  );
};

export const getFormationLabel = (counts: [number, number, number, number]): string => {
  const found = VALID_FORMATIONS.find(f => 
    f.formation[0] === counts[0] && 
    f.formation[1] === counts[1] && 
    f.formation[2] === counts[2] && 
    f.formation[3] === counts[3]
  );
  return found ? found.label : "";
};

interface SwapPlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayer: PlayerData | null;
  availablePlayers: PlayerData[];
  onSwap: (fromPlayerId: number, toPlayerId: number) => void;
  onSwapError?: (errorMessage: string, validFormations: string[]) => void;
  mainSquadPlayers: PlayerData[];
}

const SwapPlayerDrawer = ({ 
  isOpen, 
  onClose, 
  selectedPlayer, 
  availablePlayers,
  onSwap,
  onSwapError,
  mainSquadPlayers
}: SwapPlayerDrawerProps) => {
  if (!selectedPlayer) return null;

  const handleSwap = (targetPlayer: PlayerData) => {
    // Simulate the swap and check if the resulting formation is valid
    let newMainSquad: PlayerData[];
    
    if (selectedPlayer.isOnBench && !targetPlayer.isOnBench) {
      // Bench player replacing field player
      newMainSquad = mainSquadPlayers.map(p => 
        p.id === targetPlayer.id ? { ...selectedPlayer, isOnBench: false } : p
      );
    } else if (!selectedPlayer.isOnBench && targetPlayer.isOnBench) {
      // Field player replacing bench player
      newMainSquad = mainSquadPlayers.map(p => 
        p.id === selectedPlayer.id ? { ...targetPlayer, isOnBench: false } : p
      );
    } else {
      // Same location swap (shouldn't happen, but handle it)
      newMainSquad = mainSquadPlayers;
    }
    
    const newCounts = getFormationCounts(newMainSquad);
    
    if (!isValidFormation(newCounts)) {
      // Invalid formation - show error
      const validLabels = VALID_FORMATIONS.map(f => f.label);
      if (onSwapError) {
        onSwapError(
          `Замена ${selectedPlayer.name} (${selectedPlayer.position}) на ${targetPlayer.name} (${targetPlayer.position}) невозможна`,
          validLabels
        );
      }
      return;
    }
    
    // Valid swap
    onSwap(selectedPlayer.id, targetPlayer.id);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border">
        <DrawerHeader>
          <DrawerTitle className="text-foreground text-center">
            Замена игрока
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6">
          {/* Current player */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex flex-col items-center">
              <img src={playerJerseyTeam} alt={selectedPlayer.name} className="w-12 h-12 object-contain" />
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

          {/* Available players for swap */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm mb-3">
              {selectedPlayer.isOnBench ? "Игроки на поле:" : "Игроки на скамейке:"}
            </p>
            
            {availablePlayers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Нет доступных игроков для замены
              </p>
            ) : (
              availablePlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSwap(player)}
                  className="w-full bg-secondary rounded-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/80 transition-colors"
                >
                  <img src={playerJerseyTeam} alt={player.name} className="w-8 h-8 object-contain" />
                  <div className="flex-1 text-left">
                    <span className="text-foreground font-medium">{player.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">{player.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-sm">{player.points} очков</span>
                    <span className="text-foreground text-sm">{player.price}₽</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SwapPlayerDrawer;