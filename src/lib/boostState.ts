// Shared boost state management between pages
import { BoostChip, BoostStatus } from "@/components/BoostDrawer";
import { BoostId, BoostSection, TEAM_MANAGEMENT_BOOSTS, TRANSFER_BOOSTS } from "@/constants/boosts";

const BOOST_STATE_KEY = "fantasyBoostState";
const GOLDEN_TOUR_BACKUP_KEY = "fantasyGoldenTourBackup";

export interface PlayerBackup {
  id: number;
  name: string;
  team: string;
  position: string;
  price: number;
  points: number;
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export interface GoldenTourBackup {
  tour: number;
  mainSquad: PlayerBackup[];
  bench: PlayerBackup[];
  captain: number | null;
  viceCaptain: number | null;
  savedAt: string;
}

export interface BoostState {
  pendingBoostId: BoostId | null;
  pendingBoostPage: BoostSection | null;
  usedBoosts: { id: BoostId; tour: number }[];
  currentTour: number;
}

export const getBoostState = (): BoostState => {
  try {
    const saved = localStorage.getItem(BOOST_STATE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading boost state:", e);
  }
  return {
    pendingBoostId: null,
    pendingBoostPage: null,
    usedBoosts: [],
    currentTour: 1,
  };
};

export const saveBoostState = (state: BoostState): void => {
  try {
    localStorage.setItem(BOOST_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving boost state:", e);
  }
};

export const setPendingBoost = (boostId: BoostId, page: BoostSection): void => {
  const state = getBoostState();
  state.pendingBoostId = boostId;
  state.pendingBoostPage = page;
  saveBoostState(state);
};

export const clearPendingBoost = (): void => {
  const state = getBoostState();
  state.pendingBoostId = null;
  state.pendingBoostPage = null;
  saveBoostState(state);
};

export const markBoostAsUsed = (boostId: BoostId, tour: number): void => {
  const state = getBoostState();
  state.usedBoosts.push({ id: boostId, tour });
  state.pendingBoostId = null;
  state.pendingBoostPage = null;
  saveBoostState(state);
};

export const isBoostUsed = (boostId: BoostId): { used: boolean; tour?: number } => {
  const state = getBoostState();
  const usedBoost = state.usedBoosts.find(b => b.id === boostId);
  return usedBoost ? { used: true, tour: usedBoost.tour } : { used: false };
};

export const hasAnyPendingBoost = (): { pending: boolean; boostId?: BoostId; page?: BoostSection } => {
  const state = getBoostState();
  if (state.pendingBoostId) {
    return { pending: true, boostId: state.pendingBoostId, page: state.pendingBoostPage || undefined };
  }
  return { pending: false };
};

// Golden Tour backup functions
export const saveGoldenTourBackup = (
  tour: number,
  mainSquad: PlayerBackup[],
  bench: PlayerBackup[],
  captain: number | null,
  viceCaptain: number | null
): void => {
  try {
    const backup: GoldenTourBackup = {
      tour,
      mainSquad,
      bench,
      captain,
      viceCaptain,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(GOLDEN_TOUR_BACKUP_KEY, JSON.stringify(backup));
  } catch (e) {
    console.error("Error saving golden tour backup:", e);
  }
};

export const getGoldenTourBackup = (): GoldenTourBackup | null => {
  try {
    const saved = localStorage.getItem(GOLDEN_TOUR_BACKUP_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading golden tour backup:", e);
  }
  return null;
};

export const clearGoldenTourBackup = (): void => {
  try {
    localStorage.removeItem(GOLDEN_TOUR_BACKUP_KEY);
  } catch (e) {
    console.error("Error clearing golden tour backup:", e);
  }
};

export const hasGoldenTourBackup = (): boolean => {
  return getGoldenTourBackup() !== null;
};

// Reset all boosts to unused (for testing)
export const resetAllBoosts = (): void => {
  try {
    const state = getBoostState();
    state.usedBoosts = [];
    state.pendingBoostId = null;
    state.pendingBoostPage = null;
    saveBoostState(state);
    console.log("All boosts have been reset to unused");
  } catch (e) {
    console.error("Error resetting boosts:", e);
  }
};

// Team management boosts
export const TEAM_MANAGEMENT_BOOSTS = ["bench", "captain3x", "double"];

// Transfer boosts
export const TRANSFER_BOOSTS = ["transfers", "golden"];
