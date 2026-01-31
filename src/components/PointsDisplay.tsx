import { cn } from "@/lib/utils";

interface PointsDisplayProps {
  /** Заработанные очки */
  points: number;
  /** Штрафные очки */
  penaltyPoints: number;
  /** Режим отображения */
  mode?: "compact" | "detailed" | "inline";
  /** Дополнительные классы */
  className?: string;
}

/**
 * Компонент для отображения очков с учетом штрафов
 * 
 * @example
 * // Компактный режим: "1250 (-12)"
 * <PointsDisplay points={1250} penaltyPoints={12} mode="compact" />
 * 
 * // Детальный режим: показывает разбивку
 * <PointsDisplay points={1250} penaltyPoints={12} mode="detailed" />
 */
export const PointsDisplay = ({ 
  points, 
  penaltyPoints, 
  mode = "compact",
  className 
}: PointsDisplayProps) => {
  const netPoints = points - penaltyPoints;
  const hasPenalty = penaltyPoints > 0;

  if (mode === "inline") {
    return (
      <span className={cn("font-medium", className)}>
        {netPoints}
      </span>
    );
  }

  if (mode === "compact") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className="font-bold text-lg">{netPoints}</span>
        {hasPenalty && (
          <span className="text-xs text-red-500">(-{penaltyPoints})</span>
        )}
      </div>
    );
  }

  // Детальный режим
  return (
    <div className={cn("flex flex-col gap-1 text-sm", className)}>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Заработано:</span>
        <span className="font-medium">{points}</span>
      </div>
      {hasPenalty && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Штрафы:</span>
          <span className="font-medium text-red-500">-{penaltyPoints}</span>
        </div>
      )}
      <div className="flex justify-between border-t pt-1 mt-1">
        <span className="font-semibold">Итого:</span>
        <span className="font-bold text-lg">{netPoints}</span>
      </div>
    </div>
  );
};

/**
 * Компонент для отображения очков в таблице лидерборда
 */
export const LeaderboardPoints = ({ 
  totalPoints, 
  penaltyPoints,
  className 
}: { 
  totalPoints: number; 
  penaltyPoints: number;
  className?: string;
}) => {
  const netPoints = totalPoints - penaltyPoints;
  const hasPenalty = penaltyPoints > 0;

  return (
    <div className={cn("text-right", className)}>
      <div className="font-bold">{netPoints}</div>
      {hasPenalty && (
        <div className="text-xs text-red-500">(-{penaltyPoints})</div>
      )}
    </div>
  );
};
