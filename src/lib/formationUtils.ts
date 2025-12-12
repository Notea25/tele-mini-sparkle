// All valid formation configurations
export const FORMATIONS = {
  "1-3-4-3": { GK: 1, DEF: 3, MID: 4, FWD: 3 },
  "1-3-5-2": { GK: 1, DEF: 3, MID: 5, FWD: 2 },
  "1-4-3-3": { GK: 1, DEF: 4, MID: 3, FWD: 3 },
  "1-4-4-2": { GK: 1, DEF: 4, MID: 4, FWD: 2 },
  "1-4-5-1": { GK: 1, DEF: 4, MID: 5, FWD: 1 },
  "1-5-2-3": { GK: 1, DEF: 5, MID: 2, FWD: 3 },
  "1-5-3-2": { GK: 1, DEF: 5, MID: 3, FWD: 2 },
  "1-5-4-1": { GK: 1, DEF: 5, MID: 4, FWD: 1 },
} as const;

export type FormationKey = keyof typeof FORMATIONS;

// Map position codes to formation keys
const POSITION_MAP: Record<string, keyof typeof FORMATIONS["1-4-4-2"]> = {
  "ВР": "GK",
  "ЗЩ": "DEF",
  "ПЗ": "MID",
  "НП": "FWD",
};

// Formation slot configurations for field display
export const getFormationSlots = (formation: FormationKey) => {
  const config = FORMATIONS[formation];
  const slots: { position: string; row: number; col: number; slotIndex: number }[] = [];
  
  // Goalkeeper always row 1, centered
  slots.push({ position: "ВР", row: 1, col: 3, slotIndex: 0 });
  
  // Defenders - row 2
  const defCols = getColumnPositions(config.DEF);
  for (let i = 0; i < config.DEF; i++) {
    slots.push({ position: "ЗЩ", row: 2, col: defCols[i], slotIndex: i });
  }
  
  // Midfielders - row 3
  const midCols = getColumnPositions(config.MID);
  for (let i = 0; i < config.MID; i++) {
    slots.push({ position: "ПЗ", row: 3, col: midCols[i], slotIndex: i });
  }
  
  // Forwards - row 4
  const fwdCols = getColumnPositions(config.FWD);
  for (let i = 0; i < config.FWD; i++) {
    slots.push({ position: "НП", row: 4, col: fwdCols[i], slotIndex: i });
  }
  
  return slots;
};

// Get column positions based on number of players in a row - equal spacing from center
function getColumnPositions(count: number): number[] {
  // All positions centered around 3 (range 1-5)
  // Equal spacing: each player gets equal distance from neighbors
  if (count === 1) return [3];
  
  const minCol = 1;
  const maxCol = 5;
  const range = maxCol - minCol;
  const gap = range / (count - 1);
  
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    positions.push(minCol + i * gap);
  }
  return positions;
}

// Get CSS positioning for a player on the field
export const getPlayerPosition = (row: number, col: number) => {
  const topPositions: Record<number, string> = {
    1: "4%",
    2: "22%",
    3: "44%",
    4: "66%",
  };

  // Calculate left position based on column (1-5 range)
  // 10% margin on each side, so range is 10% to 90%
  const leftPercent = 10 + ((col - 1) / 4) * 80;

  return {
    top: topPositions[row],
    left: `${leftPercent}%`,
  };
};

// Detect current formation based on main squad players
export const detectFormation = (mainSquadPlayers: { position: string }[]): FormationKey | null => {
  const counts = {
    GK: mainSquadPlayers.filter(p => p.position === "ВР").length,
    DEF: mainSquadPlayers.filter(p => p.position === "ЗЩ").length,
    MID: mainSquadPlayers.filter(p => p.position === "ПЗ").length,
    FWD: mainSquadPlayers.filter(p => p.position === "НП").length,
  };

  for (const [key, formation] of Object.entries(FORMATIONS)) {
    if (
      formation.GK === counts.GK &&
      formation.DEF === counts.DEF &&
      formation.MID === counts.MID &&
      formation.FWD === counts.FWD
    ) {
      return key as FormationKey;
    }
  }

  return null;
};

// Check if a swap between two players would result in a valid formation
export const isSwapValid = (
  mainSquadPlayers: { position: string }[],
  fieldPlayer: { position: string },
  benchPlayer: { position: string }
): { valid: boolean; resultingFormation?: FormationKey; message?: string } => {
  // Same position is always valid
  if (fieldPlayer.position === benchPlayer.position) {
    const currentFormation = detectFormation(mainSquadPlayers);
    return { valid: true, resultingFormation: currentFormation || undefined };
  }

  // Calculate new position counts after swap
  const newCounts = {
    GK: mainSquadPlayers.filter(p => p.position === "ВР").length,
    DEF: mainSquadPlayers.filter(p => p.position === "ЗЩ").length,
    MID: mainSquadPlayers.filter(p => p.position === "ПЗ").length,
    FWD: mainSquadPlayers.filter(p => p.position === "НП").length,
  };

  // Remove field player's position, add bench player's position
  const fieldPosKey = POSITION_MAP[fieldPlayer.position];
  const benchPosKey = POSITION_MAP[benchPlayer.position];

  newCounts[fieldPosKey]--;
  newCounts[benchPosKey]++;

  // Check if new counts match any valid formation
  for (const [key, formation] of Object.entries(FORMATIONS)) {
    if (
      formation.GK === newCounts.GK &&
      formation.DEF === newCounts.DEF &&
      formation.MID === newCounts.MID &&
      formation.FWD === newCounts.FWD
    ) {
      return { valid: true, resultingFormation: key as FormationKey };
    }
  }

  return { 
    valid: false, 
    message: `Замена ${fieldPlayer.position} на ${benchPlayer.position} невозможна - нет подходящей схемы` 
  };
};

// Get all valid swap options for a player
export const getValidSwapOptions = (
  mainSquadPlayers: { id: number; position: string }[],
  benchPlayers: { id: number; position: string }[],
  selectedPlayer: { id: number; position: string; isOnBench?: boolean }
): { id: number; position: string; resultingFormation?: FormationKey }[] => {
  const validOptions: { id: number; position: string; resultingFormation?: FormationKey }[] = [];

  if (selectedPlayer.isOnBench) {
    // Bench player - check which field players can be swapped
    for (const fieldPlayer of mainSquadPlayers) {
      const result = isSwapValid(mainSquadPlayers, fieldPlayer, selectedPlayer);
      if (result.valid) {
        validOptions.push({ 
          id: fieldPlayer.id, 
          position: fieldPlayer.position,
          resultingFormation: result.resultingFormation 
        });
      }
    }
  } else {
    // Field player - check which bench players can be swapped
    for (const benchPlayer of benchPlayers) {
      const result = isSwapValid(mainSquadPlayers, selectedPlayer, benchPlayer);
      if (result.valid) {
        validOptions.push({ 
          id: benchPlayer.id, 
          position: benchPlayer.position,
          resultingFormation: result.resultingFormation 
        });
      }
    }
  }

  return validOptions;
};

// Formation display labels
export const FORMATION_LABELS: Record<FormationKey, string> = {
  "1-3-4-3": "Схема (1 ВР - 3 ЗЩ - 4 ПЗ - 3 НП)",
  "1-3-5-2": "Схема (1 ВР - 3 ЗЩ - 5 ПЗ - 2 НП)",
  "1-4-3-3": "Схема (1 ВР - 4 ЗЩ - 3 ПЗ - 3 НП)",
  "1-4-4-2": "Схема (1 ВР - 4 ЗЩ - 4 ПЗ - 2 НП)",
  "1-4-5-1": "Схема (1 ВР - 4 ЗЩ - 5 ПЗ - 1 НП)",
  "1-5-2-3": "Схема (1 ВР - 5 ЗЩ - 2 ПЗ - 3 НП)",
  "1-5-3-2": "Схема (1 ВР - 5 ЗЩ - 3 ПЗ - 2 НП)",
  "1-5-4-1": "Схема (1 ВР - 5 ЗЩ - 4 ПЗ - 1 НП)",
};
