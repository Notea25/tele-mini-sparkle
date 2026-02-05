import { safeGetItem, safeGetString } from "./safeStorage";

export interface PlayerData {
  id: number;
  name: string;
  name_rus?: string;
  team: string;
  team_rus?: string;
  position: string;
  points: number;
  total_points?: number; // Total points across all tours
  price: number;
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
  hasRedCard?: boolean;
  isInjured?: boolean;
  hasLeftLeague?: boolean; // Игрок покинул чемпионат
}

export interface SavedTeam {
  selectedPlayers: { id: number; slotIndex: number }[];
  teamName: string;
  captain: number | null;
  viceCaptain: number | null;
}

export function getSavedTeam(): SavedTeam {
  return {
    selectedPlayers: safeGetItem<{ id: number; slotIndex: number }[]>('fantasyTeamPlayers', []),
    teamName: safeGetString('fantasyTeamName', "Lucky Team") || "Lucky Team",
    captain: safeGetItem<number | null>('fantasyTeamCaptain', null),
    viceCaptain: safeGetItem<number | null>('fantasyTeamViceCaptain', null),
  };
}


// Save team transfers (updated squad composition)
export function saveTeamTransfers(
  mainSquadPlayers: PlayerData[], 
  benchPlayers: PlayerData[],
  captain?: number | null,
  viceCaptain?: number | null
): void {
  // Convert back to the format used in TeamBuilder
  const allTeamPlayers = [...mainSquadPlayers, ...benchPlayers];
  
  // Recalculate slot indices for storage
  const slotCountByPosition: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };
  
  const selectedPlayers = allTeamPlayers.map(player => {
    const slotIndex = player.slotIndex !== undefined 
      ? player.slotIndex 
      : slotCountByPosition[player.position]++;
    
    return {
      id: player.id,
      slotIndex: slotIndex
    };
  });
  
  localStorage.setItem('fantasyTeamPlayers', JSON.stringify(selectedPlayers));
  
  if (captain !== undefined) {
    localStorage.setItem('fantasyTeamCaptain', JSON.stringify(captain));
  }
  if (viceCaptain !== undefined) {
    localStorage.setItem('fantasyTeamViceCaptain', JSON.stringify(viceCaptain));
  }
}

// Restore team from Golden Tour backup
export function restoreTeamFromBackup(
  mainSquad: { id: number; slotIndex?: number }[],
  bench: { id: number; slotIndex?: number }[],
  captain: number | null,
  viceCaptain: number | null
): void {
  const allTeamPlayers = [...mainSquad, ...bench];
  
  const selectedPlayers = allTeamPlayers.map((player, index) => ({
    id: player.id,
    slotIndex: player.slotIndex !== undefined ? player.slotIndex : index
  }));
  
  localStorage.setItem('fantasyTeamPlayers', JSON.stringify(selectedPlayers));
  localStorage.setItem('fantasyTeamCaptain', JSON.stringify(captain));
  localStorage.setItem('fantasyTeamViceCaptain', JSON.stringify(viceCaptain));
}

