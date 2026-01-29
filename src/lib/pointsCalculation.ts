// Points calculation utilities for fantasy league
import { BoostType } from "./api";

interface PlayerForCalculation {
  id: number;
  points: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
}

/**
 * Calculate displayed points for a player with boost multipliers applied
 * - Default: Captain gets x2
 * - 3x Captain boost (triple_captain): Captain gets x3
 * - Double Power boost (double_bet): Captain and Vice-Captain get x2
 * - Bench+ boost (bench_boost): No multiplier change, but bench players count in total
 */
export function getDisplayedPoints(
  basePoints: number,
  isCaptain: boolean,
  isViceCaptain: boolean,
  boostType: BoostType | null
): number {
  if (isCaptain) {
    if (boostType === "triple_captain") {
      return basePoints * 3;
    }
    // Default or double power - captain gets x2
    return basePoints * 2;
  }
  
  if (isViceCaptain && boostType === "double_bet") {
    return basePoints * 2;
  }
  
  return basePoints;
}

/**
 * Calculate total tour points based on active boost
 * - Default: Sum of 11 main squad players, captain's points doubled
 * - 3x Captain (triple_captain): Sum of 11 main squad players, captain's points tripled
 * - Double Power (double_bet): Sum of 11 main squad players, captain and vice-captain's points doubled
 * - Bench+ (bench_boost): Sum of all 15 players, captain's points doubled
 */
export function calculateTotalTourPoints(
  mainSquadPlayers: PlayerForCalculation[],
  benchPlayers: PlayerForCalculation[],
  boostType: BoostType | null
): number {
  let total = 0;
  
  // Calculate main squad points with multipliers
  for (const player of mainSquadPlayers) {
    const displayedPoints = getDisplayedPoints(
      player.points,
      !!player.isCaptain,
      !!player.isViceCaptain,
      boostType
    );
    total += displayedPoints;
  }
  
  // Add bench points only if Bench+ boost is active
  if (boostType === "bench_boost") {
    for (const player of benchPlayers) {
      total += player.points;
    }
  }
  
  return total;
}

/**
 * Get the multiplier for display purposes
 */
export function getPointsMultiplier(
  isCaptain: boolean,
  isViceCaptain: boolean,
  boostType: BoostType | null
): number {
  if (isCaptain) {
    return boostType === "triple_captain" ? 3 : 2;
  }
  if (isViceCaptain && boostType === "double_bet") {
    return 2;
  }
  return 1;
}