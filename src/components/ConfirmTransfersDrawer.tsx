import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import jerseyDinamoMinsk from "@/assets/jerseys/dinamoJersey.png";
import jerseyBate from "@/assets/jerseys/bateJersey.png";
import jerseyBateGk from "@/assets/jerseys/goalkeeperJerseys/bateGoalkeeperJersey.png";
import jerseyDinamoBrest from "@/assets/jerseys/brestJersey.png";
import jerseyMlVitebsk from "@/assets/jerseys/mlJersey.png";
import jerseyMlVitebskGk from "@/assets/jerseys/goalkeeperJerseys/mlGoalkeeperJersey.png";
import jerseySlavia from "@/assets/jerseys/slaviaJersey.png";
import jerseySlaviaGk from "@/assets/jerseys/goalkeeperJerseys/slaviaGoalkeeperJersey.png";
import jerseyNeman from "@/assets/jerseys/nemanJersey.png";
import jerseyMinsk from "@/assets/jerseys/minskJersey.png";
import jerseyTorpedo from "@/assets/jerseys/torpedoJersey.png";
import jerseyVitebsk from "@/assets/jerseys/vitebskJersey.png";
import jerseyVitebskGk from "@/assets/jerseys/goalkeeperJerseys/vitebskGoalkeeperJersey.png";
import jerseyArsenalGk from "@/assets/jerseys/goalkeeperJerseys/arsenalGoalkeeperJersey.png";
import { BoostChip } from "@/components/BoostDrawer";
import { getJerseyForTeam } from "@/hooks/getJerseyForTeam.tsx";

interface TransferRecord {
  type: "swap" | "buy" | "sell";
  playerOut?: {
    id: number;
    name: string;
    points: number;
    team?: string;
    position?: string;
  };
  playerIn?: {
    id: number;
    name: string;
    points: number;
    team?: string;
    position?: string;
  };
}

interface ConfirmTransfersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transfers: TransferRecord[];
  freeTransfersUsed: number;
  additionalTransfersUsed: number;
  pointsPenalty?: number;
  remainingBudget: number;
  hasTransferBoost?: boolean;
  boosts?: BoostChip[];
}

const ConfirmTransfersDrawer = ({
  isOpen,
  onClose,
  onConfirm,
  transfers,
  freeTransfersUsed,
  additionalTransfersUsed,
  pointsPenalty = 0,
  remainingBudget,
  hasTransferBoost = false,
  boosts = [],
}: ConfirmTransfersDrawerProps) => {
  // Check if any boost is active (pending)
  const hasActiveBoost = boosts.some((b) => b.status === "pending");

  const getBoostStatusText = (boost: BoostChip) => {
    if (boost.status === "pending") {
      return "Используется";
    }
    if (boost.status === "used" && boost.usedInTour) {
      return `${boost.usedInTour} тур`;
    }
    return "Не использован";
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-foreground text-center text-xl">Подтверди замены</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {/* Transfer pairs */}
          {transfers.length > 0 ? (
            <div className="space-y-3 mb-6">
              {transfers.map((transfer, index) => (
                <div key={index} className="flex items-center justify-center gap-3">
                  {/* Player Out */}
                  <div className="flex-1 bg-secondary rounded-xl p-3 flex items-center gap-3">
                    <img
                      src={getJerseyForTeam(transfer.playerOut?.team || "", transfer.playerOut?.position)}
                      alt={transfer.playerOut?.name || "Player"}
                      className="w-10 h-10 object-contain rounded-lg"
                    />
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">{transfer.playerOut?.name || "—"}</span>
                      <span className="text-muted-foreground text-xs">{transfer.playerOut?.points || 0} очков</span>
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <ArrowLeftRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                  {/* Player In */}
                  <div className="flex-1 bg-secondary rounded-xl p-3 flex items-center gap-3">
                    <img
                      src={getJerseyForTeam(transfer.playerIn?.team || "", transfer.playerIn?.position)}
                      alt={transfer.playerIn?.name || "Player"}
                      className="w-10 h-10 object-contain rounded-lg"
                    />
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">{transfer.playerIn?.name || "—"}</span>
                      <span className="text-muted-foreground text-xs">{transfer.playerIn?.points || 0} очков</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">Нет изменений для сохранения</p>
          )}

          {/* Boosts Section - only show if there are boosts */}
          {boosts.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-5 gap-1">
                {boosts.map((boost) => (
                  <div
                    key={boost.id}
                    className={`flex flex-col items-center p-2 rounded-lg relative ${
                      boost.status === "pending" ? "bg-card border border-primary" : "bg-card/50 grayscale opacity-60"
                    }`}
                  >
                    <img
                      src={boost.icon}
                      alt={boost.label}
                      className={`w-5 h-5 mb-0.5 ${boost.status !== "pending" ? "grayscale" : ""}`}
                    />
                    <span
                      className={`text-[8px] font-medium text-center leading-tight ${
                        boost.status === "pending" ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {boost.label}
                    </span>
                    <span
                      className={`text-[7px] text-center leading-tight ${
                        boost.status === "pending" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {getBoostStatusText(boost)}
                    </span>
                    {/* Alert circle indicator */}
                    <div
                      className={
                        "absolute top-1 right-1 rounded-full p-0.5 " +
                        (boost.status === "pending" ? "bg-card" : "bg-card/70")
                      }
                    >
                      <AlertCircle
                        className={`w-3 h-3 ${
                          boost.status === "pending" ? "text-primary" : "text-muted-foreground/50"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="mb-6">
            <h3 className="text-foreground text-base font-semibold mb-3">Детали</h3>
            <div className="space-y-0">
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-muted-foreground text-sm">Бесплатных трансферов использовано</span>
                <span className={`text-sm font-medium ${hasTransferBoost ? "text-primary" : "text-foreground"}`}>
                  {hasTransferBoost ? "∞" : freeTransfersUsed}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-muted-foreground text-sm">Платных трансферов</span>
                <span className="text-foreground text-sm font-medium">{additionalTransfersUsed}</span>
              </div>
              {pointsPenalty > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-muted-foreground text-sm">Штраф за трансферы</span>
                  <span className="text-red-500 text-sm font-medium">-{pointsPenalty} очков</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-muted-foreground text-sm">Остаток бюджета</span>
                <span className="text-foreground text-sm font-medium">{remainingBudget}</span>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg h-12"
            >
              Изменить
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-lg h-12 shadow-neon"
            >
              Подтвердить
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ConfirmTransfersDrawer;
