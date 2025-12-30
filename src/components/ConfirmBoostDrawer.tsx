import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BoostChip } from "@/components/BoostDrawer";

interface ConfirmBoostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeBoost: () => void;
  pendingBoost: BoostChip | null;
}

const ConfirmBoostDrawer = ({
  isOpen,
  onClose,
  onConfirm,
  onChangeBoost,
  pendingBoost,
}: ConfirmBoostDrawerProps) => {
  if (!pendingBoost) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-t border-border">
        <div className="px-6 py-6">
          {/* Title */}
          <h2 className="text-foreground text-xl font-display text-center mb-6">
            Подтверждение буста
          </h2>

          {/* Boost card */}
          <div className="flex flex-col items-center justify-center p-6 bg-secondary/50 rounded-xl mb-6">
            <img 
              src={pendingBoost.icon} 
              alt={pendingBoost.label} 
              className="w-16 h-16 object-contain mb-3"
            />
            <span className="text-foreground text-lg font-medium text-center">
              {pendingBoost.label}
            </span>
            <span className="text-primary text-sm mt-1">
              Будет использован в этом туре
            </span>
          </div>

          {/* Warning text */}
          <p className="text-muted-foreground text-sm text-center mb-6 text-regular">
            После подтверждения буст нельзя будет отменить. Буст можно использовать только один раз за сезон.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onChangeBoost}
              className="flex-1 rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
            >
              Изменить
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 rounded-lg h-12 font-medium bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
            >
              Подтвердить
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ConfirmBoostDrawer;
