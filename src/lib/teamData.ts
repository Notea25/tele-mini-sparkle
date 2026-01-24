import { safeGetItem, safeGetString } from "./safeStorage";

// All 16 teams in the Belarusian league
export const allTeams = [
  "Арсенал", "Барановичи", "БАТЭ", "Белшина", "Витебск", "Гомель", 
  "Динамо-Брест", "Динамо-Минск", "Днепр-Могилев", "Ислочь", 
  "Минск", "МЛ Витебск", "Нафтан-Новополоцк", "Неман", "Славия-Мозырь", "Торпедо-БелАЗ"
];

// Russian last names for player generation
const lastNames = [
  "Иванов", "Петров", "Сидоров", "Козлов", "Новиков", "Морозов", "Волков", "Соколов",
  "Попов", "Лебедев", "Кузнецов", "Орлов", "Федоров", "Михайлов", "Зайцев", "Белов",
  "Тарасов", "Киселев", "Павлов", "Семенов", "Голубев", "Виноградов", "Богданов",
  "Васильев", "Смирнов", "Ковалев", "Николаев", "Климович", "Горбунов", "Антонов",
  "Беляев", "Воронов", "Григорьев", "Давыдов", "Ермаков", "Денисов", "Егоров",
  "Жуков", "Захаров", "Ильин", "Калинин", "Лазарев", "Макаров", "Медведев",
  "Никитин", "Овчинников", "Прохоров", "Назаров", "Осипов", "Панов", "Романов",
  "Савельев", "Титов", "Ушаков", "Филиппов", "Харитонов", "Цветков", "Рябов",
  "Самойлов", "Трофимов", "Уваров", "Фомин", "Хомяков", "Чернов", "Шестаков",
  "Щербаков", "Яковлев", "Алексеев", "Борисов", "Власов", "Гусев", "Широков",
  "Юрин", "Ясенев", "Артемьев", "Буров", "Воробьев", "Громов", "Дроздов",
  "Ефимов", "Жданов", "Зуев", "Игнатов", "Карпов", "Логинов", "Мартынов",
  "Наумов", "Орехов", "Поляков", "Родионов", "Сорокин", "Тихонов", "Устинов",
  "Фролов", "Хлебников", "Чижов", "Шаров", "Щукин", "Яшин", "Агеев", "Баранов",
  "Вишняков", "Галкин", "Дементьев", "Ершов", "Журавлев", "Зотов", "Исаев",
  "Комаров", "Лукин", "Маслов", "Носов", "Одинцов", "Пименов", "Рогов",
  "Степанов", "Туров", "Ульянов", "Фадеев", "Худяков", "Царев", "Чеботарев",
  "Шашков", "Юдин", "Якушев", "Андреев", "Бычков", "Веселов", "Глухов"
];

const positions = ["ВР", "ЗЩ", "ПЗ", "НП"];
const positionDistribution = { "ВР": 2, "ЗЩ": 5, "ПЗ": 5, "НП": 4 }; // Per team distribution

// Seeded random function for consistent generation
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate all players distributed across all 16 teams
function generateAllPlayers() {
  const players: Array<{
    id: number;
    name: string;
    team: string;
    position: string;
    points: number;
    price: number;
  }> = [];
  
  let playerId = 0;
  let nameIndex = 0;
  
  // Generate players for each team
  for (const team of allTeams) {
    // Generate players for each position
    for (const position of positions) {
      const count = positionDistribution[position as keyof typeof positionDistribution];
      
      for (let i = 0; i < count; i++) {
        const seed = playerId * 7 + 13;
        // Realistic points: -1 to 15 per match
        const points = Math.floor(seededRandom(seed) * 17) - 1;
        const price = Math.round((seededRandom(seed + 1) * 8 + 4) * 10) / 10; // 4.0-12.0 price
        
        players.push({
          id: playerId,
          name: lastNames[nameIndex % lastNames.length],
          team,
          position,
          points,
          price
        });
        
        playerId++;
        nameIndex++;
      }
    }
  }
  
  return players;
}

// All available players data - 256 players (16 teams x 16 players each)
export const allPlayers = generateAllPlayers();

export interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price: number;
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
  hasRedCard?: boolean;
  isInjured?: boolean;
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

export function getTeamPlayers(): PlayerData[] {
  const saved = getSavedTeam();
  
  return saved.selectedPlayers.map(sp => {
    const player = allPlayers.find(p => p.id === sp.id);
    if (!player) return null;
    return {
      ...player,
      slotIndex: sp.slotIndex,
      isCaptain: sp.id === saved.captain,
      isViceCaptain: sp.id === saved.viceCaptain,
    };
  }).filter(Boolean) as PlayerData[];
}

// Split players into main squad (11) and bench (4) based on formation 1-4-4-2
// Goalkeeper always first on bench
export function getMainSquadAndBench(): { mainSquad: PlayerData[]; bench: PlayerData[] } {
  const teamPlayers = getTeamPlayers();
  
  // Formation 1-4-4-2: 1 GK, 4 DEF, 4 MID, 2 FWD = 11 main
  const formation = { "ВР": 1, "ЗЩ": 4, "ПЗ": 4, "НП": 2 };
  
  const mainSquad: PlayerData[] = [];
  const bench: PlayerData[] = [];
  const countByPosition: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };
  
  // Sort by slotIndex to maintain order
  const sortedPlayers = [...teamPlayers].sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));
  
  for (const player of sortedPlayers) {
    const maxForPosition = formation[player.position as keyof typeof formation] || 0;
    if (countByPosition[player.position] < maxForPosition) {
      mainSquad.push({ ...player, isOnBench: false });
      countByPosition[player.position]++;
    } else {
      bench.push({ ...player, isOnBench: true });
    }
  }
  
  // Sort bench: goalkeeper always first, then other positions maintain their order
  const sortedBench = bench.sort((a, b) => {
    if (a.position === "ВР" && b.position !== "ВР") return -1;
    if (a.position !== "ВР" && b.position === "ВР") return 1;
    return 0;
  });
  
  return { mainSquad, bench: sortedBench };
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

// Available formations for realistic team generation
const FORMATIONS = [
  { name: "4-4-2", positions: ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "ПЗ", "НП", "НП"] },
  { name: "4-3-3", positions: ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "НП", "НП", "НП"] },
  { name: "3-5-2", positions: ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "ПЗ", "ПЗ", "НП", "НП"] },
  { name: "3-4-3", positions: ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "ПЗ", "НП", "НП", "НП"] },
  { name: "5-3-2", positions: ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "НП", "НП"] },
  { name: "5-4-1", positions: ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "ПЗ", "НП"] },
];

const BENCH_POSITIONS = ["ВР", "ЗЩ", "ПЗ", "НП"];

// Generate a realistic random team for view pages (max 3 per club)
export function generateRandomTeam(seed: number, tour: number): {
  mainSquad: PlayerData[];
  bench: PlayerData[];
  formation: string;
} {
  const combinedSeed = seed * 1000 + tour;
  
  // Select formation based on seed
  const formationIndex = Math.floor(seededRandom(combinedSeed * 3) * FORMATIONS.length);
  const selectedFormation = FORMATIONS[formationIndex];
  
  // Track club usage (max 3 per club)
  const clubCount: Record<string, number> = {};
  const usedPlayerIds = new Set<number>();
  
  // Helper to get available players for a position respecting club limit
  const getAvailablePlayer = (position: string, playerSeed: number): typeof allPlayers[0] | null => {
    const positionPlayers = allPlayers.filter(p => 
      p.position === position && 
      !usedPlayerIds.has(p.id) &&
      (clubCount[p.team] || 0) < 3
    );
    
    if (positionPlayers.length === 0) return null;
    
    const index = Math.floor(seededRandom(playerSeed) * positionPlayers.length);
    return positionPlayers[index];
  };
  
  // Generate main squad with slot indices
  const mainSquad: PlayerData[] = [];
  const positionSlotCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };
  
  for (let i = 0; i < selectedFormation.positions.length; i++) {
    const position = selectedFormation.positions[i];
    const player = getAvailablePlayer(position, combinedSeed * 100 + i);
    
    if (player) {
      usedPlayerIds.add(player.id);
      clubCount[player.team] = (clubCount[player.team] || 0) + 1;
      
      // Generate tour-specific points (-1 to 15)
      const pointsSeed = combinedSeed * 1000 + i;
      const points = Math.floor(seededRandom(pointsSeed) * 17) - 1;
      
      mainSquad.push({
        ...player,
        points,
        slotIndex: positionSlotCounters[position],
      });
      
      positionSlotCounters[position]++;
    }
  }
  
  // Generate bench
  const bench: PlayerData[] = [];
  for (let i = 0; i < BENCH_POSITIONS.length; i++) {
    const position = BENCH_POSITIONS[i];
    const player = getAvailablePlayer(position, combinedSeed * 200 + i);
    
    if (player) {
      usedPlayerIds.add(player.id);
      clubCount[player.team] = (clubCount[player.team] || 0) + 1;
      
      // Bench players: -1 to 10 points
      const pointsSeed = combinedSeed * 2000 + i;
      const points = Math.floor(seededRandom(pointsSeed) * 12) - 1;
      
      bench.push({
        ...player,
        points,
        isOnBench: true,
      });
    }
  }
  
  return {
    mainSquad,
    bench,
    formation: selectedFormation.name,
  };
}
