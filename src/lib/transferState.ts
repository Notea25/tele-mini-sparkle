// Transfer state management - NEW ARCHITECTURE
// All state now comes from backend SquadTour model
// This file provides calculation helpers only - no localStorage
// Each tour: 2 free transfers (squad.replacements), -4 points for each additional transfer

const FREE_TRANSFERS_PER_TOUR = 2;
const PENALTY_PER_EXTRA_TRANSFER = 4;

/**
 * Calculate how many transfers are free and how many cost points.
 * NEW ARCHITECTURE: Uses squad.replacements from backend as the only source of truth.
 * 
 * @param numTransfers - Number of transfers being made
 * @param hasTransfersBoost - Whether unlimited transfers boost is active
 * @param hasGoldenTourBoost - Whether golden tour boost is active (also gives unlimited transfers)
 * @param freeTransfersFromBackend - squad.replacements value from API (SquadTourData.replacements)
 * @returns Cost breakdown
 */
export const calculateTransferCosts = (
  numTransfers: number,
  hasTransfersBoost: boolean,
  hasGoldenTourBoost: boolean,
  freeTransfersFromBackend: number = FREE_TRANSFERS_PER_TOUR
): { freeTransfersUsed: number; paidTransfers: number; pointsPenalty: number } => {
  // With boosts, all transfers are free
  const persistentBoostActive = hasTransfersBoost || hasGoldenTourBoost;
  if (persistentBoostActive) {
    return {
      freeTransfersUsed: 0,
      paidTransfers: 0,
      pointsPenalty: 0,
    };
  }

  // Use backend data (squad.replacements) as source of truth
  const freeRemaining = Math.max(0, freeTransfersFromBackend);
  const freeTransfersUsed = Math.min(numTransfers, freeRemaining);
  const paidTransfers = Math.max(0, numTransfers - freeRemaining);
  const pointsPenalty = paidTransfers * PENALTY_PER_EXTRA_TRANSFER;

  return {
    freeTransfersUsed,
    paidTransfers,
    pointsPenalty,
  };
};

/**
 * Calculate penalty points for transfers.
 * NEW ARCHITECTURE: No localStorage - backend is the only source of truth.
 * This is just a convenience wrapper around calculateTransferCosts.
 * 
 * @param numTransfers - Number of transfers being made
 * @param hasTransfersBoost - Whether unlimited transfers boost is active
 * @param hasGoldenTourBoost - Whether golden tour boost is active
 * @param freeTransfersFromBackend - squad.replacements from API
 * @returns Penalty points for these transfers
 */
export const calculateTransferPenalty = (
  numTransfers: number,
  hasTransfersBoost: boolean,
  hasGoldenTourBoost: boolean,
  freeTransfersFromBackend: number = FREE_TRANSFERS_PER_TOUR
): number => {
  const costs = calculateTransferCosts(
    numTransfers,
    hasTransfersBoost,
    hasGoldenTourBoost,
    freeTransfersFromBackend
  );
  return costs.pointsPenalty;
};

// Constants for export
export const TRANSFERS_CONFIG = {
  FREE_PER_TOUR: FREE_TRANSFERS_PER_TOUR,
  PENALTY_PER_EXTRA: PENALTY_PER_EXTRA_TRANSFER,
};

// Re-export for backward compatibility
export { FREE_TRANSFERS_PER_TOUR, PENALTY_PER_EXTRA_TRANSFER };
