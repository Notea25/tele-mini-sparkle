// All valid formation configurations
export const FORMATIONS = {
  "1-4-3-3": { GK: 1, DEF: 4, MID: 3, FWD: 3 },
  "1-4-4-2": { GK: 1, DEF: 4, MID: 4, FWD: 2 },
  "1-3-5-2": { GK: 1, DEF: 3, MID: 5, FWD: 2 },
  "1-5-4-1": { GK: 1, DEF: 5, MID: 4, FWD: 1 },
  "1-3-4-3": { GK: 1, DEF: 3, MID: 4, FWD: 3 },
  "1-4-5-1": { GK: 1, DEF: 4, MID: 5, FWD: 1 },
  "1-5-2-3": { GK: 1, DEF: 5, MID: 2, FWD: 3 },
  "1-5-3-2": { GK: 1, DEF: 5, MID: 3, FWD: 2 },
  "1-5-5-3": { GK: 2, DEF: 5, MID: 5, FWD: 3 }, // Для create/transfers режима
} as const;

export type FormationKey = keyof typeof FORMATIONS;

// Special formation keys for specific modes
export const MODE_FORMATIONS = {
  CREATE_TRANSFERS: "1-5-5-3",
  DEFAULT: "1-4-4-2",
} as const;

// Map position codes to formation keys
const POSITION_MAP: Record<string, keyof (typeof FORMATIONS)["1-4-4-2"]> = {
  ВР: "GK",
  ЗЩ: "DEF",
  ПЗ: "MID",
  НП: "FWD",
};

// Formation slot configurations for field display
export const getFormationSlots = (formation: FormationKey) => {
  const config = FORMATIONS[formation];
  const slots: { position: string; row: number; col: number; slotIndex: number }[] = [];

  // Special handling for create/transfers mode (2 goalkeepers)
  if (formation === "1-5-5-3") {
    // Two goalkeepers in row 1
    const gkCols = getColumnPositions(2);
    for (let i = 0; i < config.GK; i++) {
      slots.push({ position: "ВР", row: 1, col: gkCols[i], slotIndex: i });
    }

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
  } else {
    // Standard formations (1 goalkeeper)
    // Goalkeeper always row 1, centered at 50%
    slots.push({ position: "ВР", row: 1, col: 50, slotIndex: 0 });

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
  }

  return slots;
};

// Get left percentage positions based on number of players in a row - uniform spacing
function getColumnPositions(count: number): number[] {
  switch (count) {
    case 1:
      return [50]; // Center
    case 2:
      return [37, 63]; // Symmetric around center
    case 3:
      return [25, 50, 75]; // Equal thirds
    case 4:
      return [12.5, 37.5, 62.5, 87.5]; // Equal quarters
    case 5:
      return [10, 30, 50, 70, 90]; // Equal fifths
    default:
      return [50];
  }
}

// Get CSS positioning for a player on the field
export const getPlayerPosition = (row: number, col: number) => {
  const topPositions: Record<number, string> = {
    1: "2%",
    2: "22%",
    3: "44%",
    4: "66%",
  };

  return {
    top: topPositions[row],
    left: `${col}%`,
  };
};

// Get CSS positioning specifically for create/transfers mode (with 2 GKs)
export const getPlayerPositionForCreateMode = (row: number, col: number) => {
  // Немного другие отступы для create/transfers режима
  const topPositions: Record<number, string> = {
    1: "2%", // Вратари
    2: "22%", // Защитники
    3: "44%", // Полузащитники
    4: "66%", // Нападающие
  };

  return {
    top: topPositions[row],
    left: `${col}%`,
  };
};

// Detect current formation based on main squad players
export const detectFormation = (mainSquadPlayers: { position: string }[]): FormationKey | null => {
  const counts = {
    GK: mainSquadPlayers.filter((p) => p.position === "ВР").length,
    DEF: mainSquadPlayers.filter((p) => p.position === "ЗЩ").length,
    MID: mainSquadPlayers.filter((p) => p.position === "ПЗ").length,
    FWD: mainSquadPlayers.filter((p) => p.position === "НП").length,
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

// Special detection for create/transfers mode (allows 2 GKs)
export const detectFormationForMode = (
  players: { position: string }[],
  mode: "create" | "transfers" | "management" | "view",
): FormationKey | null => {
  const counts = {
    GK: players.filter((p) => p.position === "ВР").length,
    DEF: players.filter((p) => p.position === "ЗЩ").length,
    MID: players.filter((p) => p.position === "ПЗ").length,
    FWD: players.filter((p) => p.position === "НП").length,
  };

  // For create/transfers mode, check for 1-5-5-3 formation
  if (mode === "create" || mode === "transfers") {
    if (counts.GK === 2 && counts.DEF === 5 && counts.MID === 5 && counts.FWD === 3) {
      return "1-5-5-3";
    }
  }

  // For other modes, use standard detection
  return detectFormation(players);
};

// Check if a swap between two players would result in a valid formation.
// Rules:
// - Goalkeeper (ВР) can only swap with goalkeeper.
// - Other positions can swap if after the swap the main squad matches one of the allowed formations.
export const isSwapValid = (
  mainSquadPlayers: { id?: number; position: string }[],
  fieldPlayer: { id?: number; position: string },
  benchPlayer: { id?: number; position: string },
): { valid: boolean; resultingFormation?: FormationKey; message?: string } => {
  // Goalkeepers can ONLY swap with goalkeepers
  if (fieldPlayer.position === "ВР" || benchPlayer.position === "ВР") {
    if (fieldPlayer.position !== benchPlayer.position) {
      return {
        valid: false,
        message: "Вратарь может меняться только с вратарём",
      };
    }
  }

  // Same position swaps are always valid
  if (fieldPlayer.position === benchPlayer.position) {
    const currentFormation = detectFormation(mainSquadPlayers);
    return { valid: true, resultingFormation: currentFormation || undefined };
  }

  // Find exact field player index (prefer id when available)
  let fieldIndex = -1;
  if (fieldPlayer.id != null) {
    fieldIndex = mainSquadPlayers.findIndex((p) => p.id === fieldPlayer.id);
  }
  if (fieldIndex === -1) {
    // Fallback (should be rare): replace first occurrence of that position
    fieldIndex = mainSquadPlayers.findIndex((p) => p.position === fieldPlayer.position);
  }

  if (fieldIndex === -1) {
    return {
      valid: false,
      message: "Игрок для замены не найден",
    };
  }

  // Simulate swap by replacing one main squad player position
  const simulatedMain = mainSquadPlayers.map((p, idx) =>
    idx === fieldIndex ? { ...p, position: benchPlayer.position } : p,
  );
  const resultingFormation = detectFormation(simulatedMain);

  if (resultingFormation) {
    return { valid: true, resultingFormation };
  }

  return {
    valid: false,
    message: "Замена невозможна: нарушит допустимые схемы",
  };
};

// Get all valid swap options for a player.
// - Goalkeeper swaps only with goalkeeper.
// - Other positions can swap if the resulting main squad formation stays valid.
export const getValidSwapOptions = (
  mainSquadPlayers: { id: number; position: string }[],
  benchPlayers: { id: number; position: string }[],
  selectedPlayer: { id: number; position: string; isOnBench?: boolean },
): { id: number; position: string; resultingFormation?: FormationKey }[] => {
  const validOptions: { id: number; position: string; resultingFormation?: FormationKey }[] = [];

  const currentFormation = detectFormation(mainSquadPlayers) || undefined;

  // Goalkeeper special rule: only swap with other goalkeepers
  if (selectedPlayer.position === "ВР") {
    if (selectedPlayer.isOnBench) {
      for (const fieldPlayer of mainSquadPlayers) {
        if (fieldPlayer.position === "ВР") {
          validOptions.push({
            id: fieldPlayer.id,
            position: fieldPlayer.position,
            resultingFormation: currentFormation,
          });
        }
      }
    } else {
      for (const benchPlayer of benchPlayers) {
        if (benchPlayer.position === "ВР") {
          validOptions.push({
            id: benchPlayer.id,
            position: benchPlayer.position,
            resultingFormation: currentFormation,
          });
        }
      }
    }
    return validOptions;
  }

  // Non-goalkeeper players
  if (selectedPlayer.isOnBench) {
    // Bench player -> consider swapping with each field player (excluding GK)
    for (const fieldPlayer of mainSquadPlayers) {
      if (fieldPlayer.position === "ВР") continue;

      const swapResult = isSwapValid(mainSquadPlayers, fieldPlayer, selectedPlayer);
      if (swapResult.valid) {
        validOptions.push({
          id: fieldPlayer.id,
          position: fieldPlayer.position,
          resultingFormation: swapResult.resultingFormation,
        });
      }
    }
  } else {
    // Field player -> consider swapping with each bench player (excluding GK)
    for (const benchPlayer of benchPlayers) {
      if (benchPlayer.position === "ВР") continue;

      const swapResult = isSwapValid(mainSquadPlayers, selectedPlayer, benchPlayer);
      if (swapResult.valid) {
        validOptions.push({
          id: benchPlayer.id,
          position: benchPlayer.position,
          resultingFormation: swapResult.resultingFormation,
        });
      }
    }
  }

  return validOptions;
};

// Formation display labels
export const FORMATION_LABELS: Record<FormationKey, string> = {
  "1-4-3-3": "Схема (1 ВР - 4 ЗЩ - 3 ПЗ - 3 НП)",
  "1-4-4-2": "Схема (1 ВР - 4 ЗЩ - 4 ПЗ - 2 НП)",
  "1-3-5-2": "Схема (1 ВР - 3 ЗЩ - 5 ПЗ - 2 НП)",
  "1-5-4-1": "Схема (1 ВР - 5 ЗЩ - 4 ПЗ - 1 НП)",
  "1-3-4-3": "Схема (1 ВР - 3 ЗЩ - 4 ПЗ - 3 НП)",
  "1-4-5-1": "Схема (1 ВР - 4 ЗЩ - 5 ПЗ - 1 НП)",
  "1-5-2-3": "Схема (1 ВР - 5 ЗЩ - 2 ПЗ - 3 НП)",
  "1-5-3-2": "Схема (1 ВР - 5 ЗЩ - 3 ПЗ - 2 НП)",
  "1-5-5-3": "Создание/Трансферы (2 ВР - 5 ЗЩ - 5 ПЗ - 3 НП)",
};

// Get the appropriate formation for a specific mode
export const getFormationForMode = (mode: "create" | "transfers" | "management" | "view"): FormationKey => {
  switch (mode) {
    case "create":
    case "transfers":
      return "1-5-5-3";
    case "management":
    case "view":
    default:
      return "1-4-4-2";
  }
};
