// Transfer state management
// Each tour: 2 free transfers, -4 points for each additional transfer

import { getBoostState } from "@/lib/boostState";

const TRANSFER_STATE_KEY = "fantasyTransferState";
const FREE_TRANSFERS_PER_TOUR = 2;
const PENALTY_PER_EXTRA_TRANSFER = 4;

export interface TransferState {
  currentTour: number;
  transfersUsedThisTour: number;
  pointsPenalty: number;
  lastSavedTour: number;
}

export const getTransferState = (): TransferState => {
  try {
    const saved = localStorage.getItem(TRANSFER_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as TransferState;
      // If new tour started, reset transfers used
      const currentTour = getCurrentTour();
      if (state.lastSavedTour !== currentTour) {
        return {
          currentTour,
          transfersUsedThisTour: 0,
          pointsPenalty: 0,
          lastSavedTour: currentTour,
        };
      }
      return state;
    }
  } catch (e) {
    console.error("Error reading transfer state:", e);
  }
  
  const currentTour = getCurrentTour();
  return {
    currentTour,
    transfersUsedThisTour: 0,
    pointsPenalty: 0,
    lastSavedTour: currentTour,
  };
};

export const saveTransferState = (state: TransferState): void => {
  try {
    localStorage.setItem(TRANSFER_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving transfer state:", e);
  }
};

// Get current tour number (mock for now - in production would come from backend)
export const getCurrentTour = (): number => {
  // For demo, return tour 1
  return 1;
};

// Calculate free transfers remaining based on current state
export const getFreeTransfersRemaining = (): number => {
  const state = getTransferState();
  return Math.max(0, FREE_TRANSFERS_PER_TOUR - state.transfersUsedThisTour);
};

// Calculate how many transfers are free and how many cost points
export const calculateTransferCosts = (
  numTransfers: number,
  hasTransfersBoost: boolean,
  hasGoldenTourBoost: boolean
): { freeTransfersUsed: number; paidTransfers: number; pointsPenalty: number } => {
  // Считаем, что трансферные бусты действуют весь тур, даже после повторных заходов на страницу.
  const boostState = getBoostState();

  const persistentBoostActive =
    hasTransfersBoost ||
    hasGoldenTourBoost ||
    // Если в boostState есть активный буст "transfers" или "golden" на странице трансферов,
    // считаем, что все трансферы в этом туре бесплатны.
    (boostState.pendingBoostPage === "transfers" &&
      (boostState.pendingBoostId === "transfers" || boostState.pendingBoostId === "golden"));

  // With boosts, all transfers are free
  if (persistentBoostActive) {
    return {
      freeTransfersUsed: 0,
      paidTransfers: 0,
      pointsPenalty: 0,
    };
  }

  const state = getTransferState();
  const freeRemaining = Math.max(0, FREE_TRANSFERS_PER_TOUR - state.transfersUsedThisTour);
  
  const freeTransfersUsed = Math.min(numTransfers, freeRemaining);
  const paidTransfers = Math.max(0, numTransfers - freeRemaining);
  const pointsPenalty = paidTransfers * PENALTY_PER_EXTRA_TRANSFER;

  return {
    freeTransfersUsed,
    paidTransfers,
    pointsPenalty,
  };
};

// Record transfers after save
export const recordTransfers = (
  numTransfers: number,
  hasTransfersBoost: boolean,
  hasGoldenTourBoost: boolean
): { pointsPenalty: number } => {
  const state = getTransferState();
  const costs = calculateTransferCosts(numTransfers, hasTransfersBoost, hasGoldenTourBoost);

  const boostState = getBoostState();
  const persistentBoostActive =
    hasTransfersBoost ||
    hasGoldenTourBoost ||
    (boostState.pendingBoostPage === "transfers" &&
      (boostState.pendingBoostId === "transfers" || boostState.pendingBoostId === "golden"));
  
  // With boosts (включая сохранённый в boostState), трансферы не тратят бесплатную квоту и не дают штраф
  if (!persistentBoostActive) {
    state.transfersUsedThisTour += numTransfers;
    state.pointsPenalty += costs.pointsPenalty;
  }
  
  saveTransferState(state);
  
  return { pointsPenalty: costs.pointsPenalty };
};

// Reset state for new tour
export const resetTransferStateForNewTour = (tour: number): void => {
  const state: TransferState = {
    currentTour: tour,
    transfersUsedThisTour: 0,
    pointsPenalty: 0,
    lastSavedTour: tour,
  };
  saveTransferState(state);
};

// Get total points penalty accumulated this tour
export const getTotalPointsPenalty = (): number => {
  const state = getTransferState();
  return state.pointsPenalty;
};

// Constants for export
export const TRANSFERS_CONFIG = {
  FREE_PER_TOUR: FREE_TRANSFERS_PER_TOUR,
  PENALTY_PER_EXTRA: PENALTY_PER_EXTRA_TRANSFER,
};
