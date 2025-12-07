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

interface SwapPlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayer: PlayerData | null;
  availablePlayers: PlayerData[];
  onSwap: (fromPlayerId: number, toPlayerId: number) => void;
}

const SwapPlayerDrawer = ({ 
  isOpen, 
  onClose, 
  selectedPlayer, 
  availablePlayers,
  onSwap 
}: SwapPlayerDrawerProps) => {
  if (!selectedPlayer) return null;

  const handleSwap = (targetPlayer: PlayerData) => {
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