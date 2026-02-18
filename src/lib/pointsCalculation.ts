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
 * - Default: Captain gets x2, Vice-Captain gets x2 only if captain didn't play
 * - 3x Captain boost (triple_captain): Captain gets x3, Vice-Captain gets x3 if captain didn't play
 * - Double Power boost (double_bet): Captain and Vice-Captain both get x2
 * - Bench+ boost (bench_boost): No multiplier change, but bench players count in total
 * 
 * Note: This function only calculates multipliers based on boost type.
 * The "captain didn't play" logic is handled separately in the backend.
 */
export function getDisplayedPoints(
  basePoints: number,
  isCaptain: boolean,
  isViceCaptain: boolean,
  boostType: BoostType | null,
  captainPlayed: boolean = true
): number {
  if (isCaptain) {
    if (boostType === "triple_captain") {
      return basePoints * 3;
    }
    // Default or double power - captain gets x2
    return basePoints * 2;
  }
  
  if (isViceCaptain) {
    // If captain didn't play, vice-captain gets captain's multiplier
    if (!captainPlayed) {
      if (boostType === "triple_captain") {
        return basePoints * 3;
      }
      return basePoints * 2;
    }
    // With double_bet, vice-captain gets x2 even if captain played
    if (boostType === "double_bet") {
      return basePoints * 2;
    }
  }
  
  return basePoints;
}

/**
 * Calculate total tour points based on active boost
 * - Default: Sum of 11 main squad players, captain's points doubled (vice-captain x2 if captain didn't play)
 * - 3x Captain (triple_captain): Sum of 11 main squad players, captain's points tripled (vice-captain x3 if captain didn't play)
 * - Double Power (double_bet): Sum of 11 main squad players, captain and vice-captain's points doubled
 * - Bench+ (bench_boost): Sum of all 15 players, captain's points doubled
 */
export function calculateTotalTourPoints(
  mainSquadPlayers: PlayerForCalculation[],
  benchPlayers: PlayerForCalculation[],
  boostType: BoostType | null,
  captainPlayed: boolean = true
): number {
  let total = 0;
  
  // Calculate main squad points with multipliers
  for (const player of mainSquadPlayers) {
    const displayedPoints = getDisplayedPoints(
      player.points,
      !!player.isCaptain,
      !!player.isViceCaptain,
      boostType,
      captainPlayed
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
  boostType: BoostType | null,
  captainPlayed: boolean = true
): number {
  if (isCaptain) {
    return boostType === "triple_captain" ? 3 : 2;
  }
  if (isViceCaptain) {
    // If captain didn't play, vice-captain gets captain's multiplier
    if (!captainPlayed) {
      return boostType === "triple_captain" ? 3 : 2;
    }
    // With double_bet, vice-captain gets x2 even if captain played
    if (boostType === "double_bet") {
      return 2;
    }
  }
  return 1;
}
