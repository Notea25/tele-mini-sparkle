// Transfer state management
// Transfers are made for the NEXT tour
// Each tour: 2 free transfers, -4 points for each additional transfer

import { getBoostState } from "@/lib/boostState";

const TRANSFER_STATE_KEY = "fantasyTransferState";
const FREE_TRANSFERS_PER_TOUR = 2;
const PENALTY_PER_EXTRA_TRANSFER = 4;

export interface TransferState {
  nextTour: number;  // The tour we're making transfers for
  transfersUsedForNextTour: number;
  pointsPenalty: number;
  lastSavedTour: number;  // The last tour we saved transfers for
}

export const getTransferState = (nextTourFromApi?: number | null): TransferState => {
  try {
    const saved = localStorage.getItem(TRANSFER_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as TransferState;
      // If we moved to a new tour (nextTour changed), reset transfers used
      const nextTour = getNextTour(nextTourFromApi);
      if (state.lastSavedTour !== nextTour) {
        return {
          nextTour,
          transfersUsedForNextTour: 0,
          pointsPenalty: 0,
          lastSavedTour: nextTour,
        };
      }
      return state;
    }
  } catch (e) {
    console.error("Error reading transfer state:", e);
  }
  
  const nextTour = getNextTour(nextTourFromApi);
  return {
    nextTour,
    transfersUsedForNextTour: 0,
    pointsPenalty: 0,
    lastSavedTour: nextTour,
  };
};

export const saveTransferState = (state: TransferState): void => {
  try {
    localStorage.setItem(TRANSFER_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving transfer state:", e);
  }
};

// Get next tour number from API data
// Transfers are always made for the NEXT tour, not the current one
// This is passed as a parameter from pages that have access to tour data
// Default to 1 if not provided for backward compatibility
export const getNextTour = (nextTourFromApi?: number | null): number => {
  return nextTourFromApi ?? 1;
};

// Calculate free transfers remaining for next tour based on current state
export const getFreeTransfersRemaining = (nextTourFromApi?: number | null): number => {
  const state = getTransferState(nextTourFromApi);
  return Math.max(0, FREE_TRANSFERS_PER_TOUR - state.transfersUsedForNextTour);
};

// Calculate how many transfers are free and how many cost points for next tour
// Uses squad.replacements from backend as the source of truth for available free transfers
export const calculateTransferCosts = (
  numTransfers: number,
  hasTransfersBoost: boolean,
  hasGoldenTourBoost: boolean,
  nextTourFromApi?: number | null,
  freeTransfersFromBackend?: number  // squad.replacements from API
): { freeTransfersUsed: number; paidTransfers: number; pointsPenalty: number } => {
  // Считаем, что трансферные бусты действуют весь следующий тур, если активированы.
  // Здесь мы доверяем только флагам hasTransfersBoost/hasGoldenTourBoost, вычисленным на основе API данных,
  // и не используем локальный boostState.pendingBoost* для определения активности.
  const persistentBoostActive = hasTransfersBoost || hasGoldenTourBoost;

  // With boosts, all transfers are free
  if (persistentBoostActive) {
    return {
      freeTransfersUsed: 0,
      paidTransfers: 0,
      pointsPenalty: 0,
    };
  }

  // Use backend data (squad.replacements) as source of truth for free transfers available
  // This ensures we always show correct costs based on what backend says
  const freeRemaining = freeTransfersFromBackend !== undefined 
    ? Math.max(0, freeTransfersFromBackend)
    : Math.max(0, FREE_TRANSFERS_PER_TOUR);  // Fallback to default if backend data not available
  
  const freeTransfersUsed = Math.min(numTransfers, freeRemaining);
  const paidTransfers = Math.max(0, numTransfers - freeRemaining);
  const pointsPenalty = paidTransfers * PENALTY_PER_EXTRA_TRANSFER;

  return {
    freeTransfersUsed,
    paidTransfers,
    pointsPenalty,
  };
};

// Record transfers after save (for next tour)
// NOTE: This function now only tracks usage in localStorage for potential future features.
// The actual cost calculation uses squad.replacements from backend as source of truth.
export const recordTransfers = (
  numTransfers: number,
  hasTransfersBoost: boolean,
  hasGoldenTourBoost: boolean,
  nextTourFromApi?: number | null,
  freeTransfersFromBackend?: number
): { pointsPenalty: number } => {
  const state = getTransferState(nextTourFromApi);
  const costs = calculateTransferCosts(numTransfers, hasTransfersBoost, hasGoldenTourBoost, nextTourFromApi, freeTransfersFromBackend);

  const persistentBoostActive = hasTransfersBoost || hasGoldenTourBoost;
  
  // With boosts трансферы не тратят бесплатную квоту и не дают штраф
  if (!persistentBoostActive) {
    state.transfersUsedForNextTour += numTransfers;
    state.pointsPenalty += costs.pointsPenalty;
  }
  
  saveTransferState(state);
  
  return { pointsPenalty: costs.pointsPenalty };
};

// Reset state for new tour
export const resetTransferStateForNewTour = (nextTour: number): void => {
  const state: TransferState = {
    nextTour,
    transfersUsedForNextTour: 0,
    pointsPenalty: 0,
    lastSavedTour: nextTour,
  };
  saveTransferState(state);
};

// Get total points penalty accumulated for next tour
export const getTotalPointsPenalty = (nextTourFromApi?: number | null): number => {
  const state = getTransferState(nextTourFromApi);
  return state.pointsPenalty;
};

// Constants for export
export const TRANSFERS_CONFIG = {
  FREE_PER_TOUR: FREE_TRANSFERS_PER_TOUR,
  PENALTY_PER_EXTRA: PENALTY_PER_EXTRA_TRANSFER,
};
