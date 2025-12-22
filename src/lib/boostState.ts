// Shared boost state management between pages
import { BoostChip, BoostStatus } from "@/components/BoostDrawer";

const BOOST_STATE_KEY = "fantasyBoostState";

export interface BoostState {
  pendingBoostId: string | null;
  pendingBoostPage: "team-management" | "transfers" | null;
  usedBoosts: { id: string; tour: number }[];
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

export const setPendingBoost = (boostId: string, page: "team-management" | "transfers"): void => {
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

export const markBoostAsUsed = (boostId: string, tour: number): void => {
  const state = getBoostState();
  state.usedBoosts.push({ id: boostId, tour });
  state.pendingBoostId = null;
  state.pendingBoostPage = null;
  saveBoostState(state);
};

export const isBoostUsed = (boostId: string): { used: boolean; tour?: number } => {
  const state = getBoostState();
  const usedBoost = state.usedBoosts.find(b => b.id === boostId);
  return usedBoost ? { used: true, tour: usedBoost.tour } : { used: false };
};

export const hasAnyPendingBoost = (): { pending: boolean; boostId?: string; page?: string } => {
  const state = getBoostState();
  if (state.pendingBoostId) {
    return { pending: true, boostId: state.pendingBoostId, page: state.pendingBoostPage || undefined };
  }
  return { pending: false };
};

// Team management boosts
export const TEAM_MANAGEMENT_BOOSTS = ["bench", "captain3x", "double"];

// Transfer boosts
export const TRANSFER_BOOSTS = ["transfers", "golden"];
