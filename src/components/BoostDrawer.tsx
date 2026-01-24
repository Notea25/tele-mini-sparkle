import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";

export type BoostStatus = "available" | "pending" | "used" | "unavailable";

export interface BoostChip {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  status: BoostStatus;
  usedInTour?: number;
}

interface BoostDrawerProps {
  chip: BoostChip | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (chipId: string) => void;
  onCancel?: (chipId: string) => void;
  onRemove?: (chipId: string) => void;
  currentTour?: number;
  isRemoving?: boolean;
  hasActiveBoostInTour?: boolean; // true if another boost is already pending in this tour
}

const boostDescriptions: Record<string, { title: string; description: React.ReactNode; canCancel: boolean }> = {
  bench: {
    title: "Скамейка+",
    description: (
      <>
        <span className="text-foreground font-medium">Эффект:</span> Очки игроков, находящихся на скамейке запасных,
        засчитываются в общую сумму баллов команды наравне с игроками стартового состава.
        <br />
        <br />
        <span className="text-foreground font-medium">Важно:</span> Буст можно отменить до наступления дедлайна тура.
      </>
    ),
    canCancel: true,
  },
  captain3x: {
    title: "3× Капитан",
    description: (
      <>
        <span className="text-foreground font-medium">Эффект:</span> Очки, набранные твоим капитаном, утраиваются.
        <br />
        <br />
        <span className="text-foreground font-medium">Особые условия:</span>
        <br />
        1. Если капитан не вышел на поле, буст передаётся вице-капитану.
        <br />
        2. Если и вице-капитан не появился на поле, буст сгорает.
        <br />
        <br />
        <span className="text-foreground font-medium">Важно:</span> Буст можно отменить до наступления дедлайна тура.
      </>
    ),
    canCancel: true,
  },
  transfers: {
    title: "Трансферы+",
    description: (
      <>
        <span className="text-foreground font-medium">Эффект:</span> Позволяет совершить неограниченное количество
        трансферов за один раз (без штрафа в -4 очка за каждый).
        <br />
        <br />
        <span className="text-foreground font-medium">Особые условия:</span>
        <br />
        1. Все внесённые изменения в состав становятся постоянными.
        <br />
        2. Накопленные до активации буста бесплатные трансферы сгорают.
        <br />
        <br />
        <span className="text-foreground font-medium">Важно:</span> Буст НЕЛЬЗЯ отменить после активации.
      </>
    ),
    canCancel: false,
  },
  golden: {
    title: "Золотой тур",
    description: (
      <>
        <span className="text-foreground font-medium">Эффект:</span> Позволяет совершать неограниченное количество
        бесплатных трансферов (без штрафа -4 очка) в рамках одного игрового тура.
        <br />
        <br />
        <span className="text-foreground font-medium">Особые условия:</span>
        <br />
        1. После окончания тура состав автоматически возвращается к тому, который был до активации буста.
        <br />
        2. Накопленные бесплатные трансферы НЕ сгорают.
        <br />
        <br />
        <span className="text-foreground font-medium">Важно:</span> Буст НЕЛЬЗЯ отменить после активации.
      </>
    ),
    canCancel: false,
  },
  double: {
    title: "Двойная сила",
    description: (
      <>
        <span className="text-foreground font-medium">Эффект:</span> Очки удваиваются как для капитана, так и для
        вице-капитана.
        <br />
        <br />
        <span className="text-foreground font-medium">Особые условия:</span>
        <br />
        Если капитан или вице-капитан не вышли на поле, буст НЕ переносится на других игроков.
        <br />
        <br />
        <span className="text-foreground font-medium">Важно:</span> Буст можно отменить до наступления дедлайна тура.
      </>
    ),
    canCancel: true,
  },
};

const BoostDrawer = ({ chip, isOpen, onClose, onApply, onCancel, onRemove, currentTour = 1, isRemoving = false, hasActiveBoostInTour = false }: BoostDrawerProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);

  if (!chip) return null;

  const boostInfo = boostDescriptions[chip.id];

  const handleApplyClick = () => {
    // If another boost is already active in this tour, show blocked message
    if (hasActiveBoostInTour) {
      setShowBlockedMessage(true);
      setTimeout(() => setShowBlockedMessage(false), 3000);
      return;
    }
    
    // For non-cancellable boosts, show confirmation first
    if (!boostInfo?.canCancel) {
      setShowConfirmation(true);
    } else {
      onApply(chip.id);
      onClose();
    }
  };

  const handleConfirmApply = () => {
    onApply(chip.id);
    setShowConfirmation(false);
    onClose();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(chip.id);
    }
    onClose();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(chip.id);
    }
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setShowBlockedMessage(false);
    onClose();
  };

  // Check if this boost is blocked (another boost is active and this one is available)
  const isBlocked = hasActiveBoostInTour && chip.status === "available";

  const getStatusText = () => {
    if (chip.status === "pending") {
      return `Используется в ${currentTour} туре`;
    }
    if (chip.status === "used" && chip.usedInTour) {
      return `Использовано в ${chip.usedInTour} туре`;
    }
    return null;
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="bg-card border-t border-border">
        {showConfirmation ? (
          // Confirmation view for non-cancellable boosts
          <div className="px-6 pb-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-display text-foreground mb-2">Внимание!</h2>
              <p className="text-muted-foreground text-sm text-medium leading-relaxed">
                Буст <span className="text-primary font-medium">{boostInfo?.title}</span> нельзя будет отменить после
                активации.
              </p>
              {chip.id === "transfers" && (
                <p className="text-muted-foreground text-sm mt-2">Все накопленные бесплатные трансферы сгорят.</p>
              )}
              {chip.id === "golden" && (
                <p className="text-muted-foreground text-sm mt-2">
                  После окончания тура твой состав автоматически вернётся к текущему.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancelConfirmation}
                className="flex-1 rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Отмена
              </Button>
              <Button
                onClick={handleConfirmApply}
                className="flex-1 rounded-lg h-12 font-medium bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
              >
                Подтвердить
              </Button>
            </div>
          </div>
        ) : (
          // Main boost info view
          <>
            <DrawerHeader className="flex flex-col items-center px-6 pb-6">
              <div className="mb-4">
                <img src={chip.icon} alt={chip.label} className="w-16 h-16 object-contain" />
              </div>
              <DrawerTitle className="text-2xl font-display text-foreground mb-4 text-center">
                {boostInfo?.title || chip.label}
              </DrawerTitle>
              <div className="text-muted-foreground text-sm leading-relaxed text-left w-full">
                {boostInfo?.description}
              </div>
              {getStatusText() && (
                <p className={`text-sm mt-4 ${chip.status === "pending" ? "text-primary" : "text-muted-foreground"}`}>
                  {getStatusText()}
                </p>
              )}
            </DrawerHeader>
            <div className="px-6 pb-8">
              {chip.status === "available" && (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleApplyClick}
                    className={`w-full rounded-lg h-12 font-medium ${
                      isBlocked 
                        ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted" 
                        : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
                    }`}
                  >
                    Использовать
                  </Button>
                  {showBlockedMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-500">
                        В одном туре можно использовать только 1 буст
                      </p>
                    </div>
                  )}
                </div>
              )}
              {chip.status === "pending" && (
                <div className="flex gap-3">
                  {onCancel && boostInfo?.canCancel && (
                    <Button
                      onClick={handleCancel}
                      className="flex-1 rounded-lg h-12 font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Отменить
                    </Button>
                  )}
                  <Button
                    onClick={handleClose}
                    className={`rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground ${onCancel && boostInfo?.canCancel ? 'flex-1' : 'w-full'}`}
                  >
                    Закрыть
                  </Button>
                </div>
              )}
              {chip.status === "used" && (
                <div className="flex gap-3">
                  {onRemove && boostInfo?.canCancel && (
                    <Button
                      onClick={handleRemove}
                      disabled={isRemoving}
                      className="flex-1 rounded-lg h-12 font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      {isRemoving ? "Отмена..." : "Отменить"}
                    </Button>
                  )}
                  <Button
                    onClick={handleClose}
                    className={`rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground ${onRemove && boostInfo?.canCancel ? 'flex-1' : 'w-full'}`}
                  >
                    Закрыть
                  </Button>
                </div>
              )}
              {chip.status === "unavailable" && (
                <Button
                  onClick={handleClose}
                  className="w-full rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
                >
                  Закрыть
                </Button>
              )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default BoostDrawer;
