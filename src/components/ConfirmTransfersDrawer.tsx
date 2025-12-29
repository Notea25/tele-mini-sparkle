import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
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
// import jerseyArsenalGk from "@/assets/jersey-arsenal-gk.png";
import jerseyArsenalGk from "@/assets/jerseys/goalkeeperJerseys/arsenalGoalkeeperJersey.png";
import { BoostChip } from "@/components/BoostDrawer";

// Helper function to get jersey based on team and position
const getJerseyForTeam = (team: string, position?: string) => {
  switch (team) {
    case "Динамо-Минск":
      return jerseyDinamoMinsk;
    case "БАТЭ":
      return position === "ВР" ? jerseyBateGk : jerseyBate;
    case "Динамо-Брест":
      return jerseyDinamoBrest;
    case "МЛ Витебск":
      return position === "ВР" ? jerseyMlVitebskGk : jerseyMlVitebsk;
    case "Славия-Мозырь":
      return position === "ВР" ? jerseySlaviaGk : jerseySlavia;
    case "Арсенал":
      return position === "ВР" ? jerseyArsenalGk : jerseySlavia;
    case "Неман":
      return jerseyNeman;
    case "Минск":
      return jerseyMinsk;
    case "Торпедо-БелАЗ":
      return jerseyTorpedo;
    case "Витебск":
      return position === "ВР" ? jerseyVitebskGk : jerseyVitebsk;
    default:
      return jerseySlavia;
  }
};

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
  remainingBudget: number;
  boosts?: BoostChip[];
}

const ConfirmTransfersDrawer = ({
  isOpen,
  onClose,
  onConfirm,
  transfers,
  freeTransfersUsed,
  additionalTransfersUsed,
  remainingBudget,
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
            <h3 className="text-foreground text-lg font-semibold mb-4">Очки</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Свободных Трансферов потрачено</span>
                <span className="text-foreground font-semibold">{freeTransfersUsed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Дополнительных Трансферов потрачено</span>
                <span className="text-foreground font-semibold">{additionalTransfersUsed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Остаток бюджета</span>
                <span className="text-foreground font-semibold">{remainingBudget}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-lg h-12"
            >
              Изменить
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-lg h-12 shadow-neon"
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
