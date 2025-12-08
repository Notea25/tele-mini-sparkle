// All available players data (same as in TeamBuilder)
export const allPlayers = [
  // Вратари (ВР)
  { id: 0, name: "Вакулич", team: "Динамо Минск", position: "ВР", points: 79, price: 10.5 },
  { id: 1, name: "Петров", team: "БАТЭ", position: "ВР", points: 65, price: 6.8 },
  { id: 2, name: "Климович", team: "Шахтер", position: "ВР", points: 71, price: 8.2 },
  { id: 3, name: "Горбунов", team: "Неман", position: "ВР", points: 58, price: 4.5 },
  { id: 30, name: "Антонов", team: "Славия", position: "ВР", points: 62, price: 5.4 },
  { id: 31, name: "Беляев", team: "Торпедо", position: "ВР", points: 55, price: 4.1 },
  { id: 32, name: "Воронов", team: "Динамо Минск", position: "ВР", points: 68, price: 7.3 },
  { id: 33, name: "Григорьев", team: "БАТЭ", position: "ВР", points: 74, price: 9.1 },
  { id: 60, name: "Давыдов", team: "Шахтер", position: "ВР", points: 60, price: 5.0 },
  { id: 61, name: "Ермаков", team: "Неман", position: "ВР", points: 53, price: 3.9 },
  // Защитники (ЗЩ)
  { id: 4, name: "Сидоров", team: "Шахтер", position: "ЗЩ", points: 72, price: 9.3 },
  { id: 5, name: "Иванов", team: "Динамо Минск", position: "ЗЩ", points: 68, price: 7.1 },
  { id: 6, name: "Соколов", team: "Шахтер", position: "ЗЩ", points: 70, price: 8.7 },
  { id: 7, name: "Орлов", team: "БАТЭ", position: "ЗЩ", points: 64, price: 5.9 },
  { id: 8, name: "Федоров", team: "Неман", position: "ЗЩ", points: 61, price: 4.2 },
  { id: 9, name: "Михайлов", team: "Динамо Минск", position: "ЗЩ", points: 73, price: 11.4 },
  { id: 10, name: "Зайцев", team: "Славия", position: "ЗЩ", points: 55, price: 4.8 },
  { id: 11, name: "Белов", team: "Торпедо", position: "ЗЩ", points: 59, price: 5.3 },
  { id: 34, name: "Денисов", team: "Динамо Минск", position: "ЗЩ", points: 66, price: 6.5 },
  { id: 35, name: "Егоров", team: "БАТЭ", position: "ЗЩ", points: 69, price: 7.8 },
  { id: 36, name: "Жуков", team: "Шахтер", position: "ЗЩ", points: 71, price: 8.4 },
  { id: 37, name: "Захаров", team: "Неман", position: "ЗЩ", points: 57, price: 4.6 },
  { id: 38, name: "Ильин", team: "Славия", position: "ЗЩ", points: 63, price: 5.7 },
  { id: 39, name: "Калинин", team: "Торпедо", position: "ЗЩ", points: 60, price: 5.1 },
  { id: 40, name: "Лазарев", team: "Динамо Минск", position: "ЗЩ", points: 75, price: 9.8 },
  { id: 41, name: "Макаров", team: "БАТЭ", position: "ЗЩ", points: 67, price: 7.2 },
  { id: 62, name: "Медведев", team: "Славия", position: "ЗЩ", points: 58, price: 4.9 },
  { id: 63, name: "Никитин", team: "Торпедо", position: "ЗЩ", points: 54, price: 4.0 },
  { id: 64, name: "Овчинников", team: "Шахтер", position: "ЗЩ", points: 65, price: 6.2 },
  { id: 65, name: "Прохоров", team: "Неман", position: "ЗЩ", points: 52, price: 3.8 },
  // Полузащитники (ПЗ)
  { id: 12, name: "Козлов", team: "БАТЭ", position: "ПЗ", points: 81, price: 11.9 },
  { id: 13, name: "Новиков", team: "Шахтер", position: "ПЗ", points: 75, price: 9.6 },
  { id: 14, name: "Лебедев", team: "Динамо Минск", position: "ПЗ", points: 77, price: 10.2 },
  { id: 15, name: "Тарасов", team: "БАТЭ", position: "ПЗ", points: 69, price: 7.4 },
  { id: 16, name: "Киселев", team: "Неман", position: "ПЗ", points: 62, price: 5.1 },
  { id: 17, name: "Павлов", team: "Шахтер", position: "ПЗ", points: 74, price: 8.9 },
  { id: 18, name: "Семенов", team: "Славия", position: "ПЗ", points: 58, price: 4.6 },
  { id: 19, name: "Голубев", team: "Торпедо", position: "ПЗ", points: 63, price: 6.2 },
  { id: 20, name: "Виноградов", team: "Динамо Минск", position: "ПЗ", points: 71, price: 8.1 },
  { id: 21, name: "Богданов", team: "БАТЭ", position: "ПЗ", points: 67, price: 6.7 },
  { id: 42, name: "Назаров", team: "Шахтер", position: "ПЗ", points: 72, price: 8.5 },
  { id: 43, name: "Осипов", team: "Неман", position: "ПЗ", points: 59, price: 4.9 },
  { id: 44, name: "Панов", team: "Славия", position: "ПЗ", points: 64, price: 6.0 },
  { id: 45, name: "Романов", team: "Торпедо", position: "ПЗ", points: 61, price: 5.5 },
  { id: 46, name: "Савельев", team: "Динамо Минск", position: "ПЗ", points: 78, price: 10.5 },
  { id: 47, name: "Титов", team: "БАТЭ", position: "ПЗ", points: 70, price: 7.9 },
  { id: 48, name: "Ушаков", team: "Шахтер", position: "ПЗ", points: 73, price: 8.8 },
  { id: 49, name: "Филиппов", team: "Неман", position: "ПЗ", points: 56, price: 4.3 },
  { id: 50, name: "Харитонов", team: "Славия", position: "ПЗ", points: 65, price: 6.4 },
  { id: 51, name: "Цветков", team: "Торпедо", position: "ПЗ", points: 68, price: 7.1 },
  { id: 66, name: "Рябов", team: "Динамо Минск", position: "ПЗ", points: 76, price: 9.9 },
  { id: 67, name: "Самойлов", team: "БАТЭ", position: "ПЗ", points: 66, price: 6.8 },
  { id: 68, name: "Трофимов", team: "Шахтер", position: "ПЗ", points: 70, price: 7.6 },
  { id: 69, name: "Уваров", team: "Неман", position: "ПЗ", points: 57, price: 4.5 },
  { id: 70, name: "Фомин", team: "Славия", position: "ПЗ", points: 62, price: 5.8 },
  { id: 71, name: "Хомяков", team: "Торпедо", position: "ПЗ", points: 60, price: 5.2 },
  // Нападающие (НП)
  { id: 22, name: "Морозов", team: "Динамо Минск", position: "НП", points: 88, price: 11.8 },
  { id: 23, name: "Волков", team: "БАТЭ", position: "НП", points: 82, price: 10.9 },
  { id: 24, name: "Кузнецов", team: "Шахтер", position: "НП", points: 79, price: 9.5 },
  { id: 25, name: "Попов", team: "Неман", position: "НП", points: 66, price: 5.7 },
  { id: 26, name: "Васильев", team: "Славия", position: "НП", points: 60, price: 4.3 },
  { id: 27, name: "Смирнов", team: "Торпедо", position: "НП", points: 64, price: 5.4 },
  { id: 28, name: "Ковалев", team: "Динамо Минск", position: "НП", points: 76, price: 8.6 },
  { id: 29, name: "Николаев", team: "БАТЭ", position: "НП", points: 70, price: 7.2 },
  { id: 52, name: "Чернов", team: "Шахтер", position: "НП", points: 77, price: 9.2 },
  { id: 53, name: "Шестаков", team: "Неман", position: "НП", points: 63, price: 5.6 },
  { id: 54, name: "Щербаков", team: "Славия", position: "НП", points: 58, price: 4.7 },
  { id: 55, name: "Яковлев", team: "Торпедо", position: "НП", points: 67, price: 6.3 },
  { id: 56, name: "Алексеев", team: "Динамо Минск", position: "НП", points: 84, price: 11.2 },
  { id: 57, name: "Борисов", team: "БАТЭ", position: "НП", points: 75, price: 8.9 },
  { id: 58, name: "Власов", team: "Шахтер", position: "НП", points: 71, price: 7.8 },
  { id: 59, name: "Гусев", team: "Неман", position: "НП", points: 62, price: 5.2 },
  { id: 72, name: "Широков", team: "Славия", position: "НП", points: 59, price: 4.9 },
  { id: 73, name: "Юрин", team: "Торпедо", position: "НП", points: 65, price: 6.0 },
  { id: 74, name: "Ясенев", team: "Динамо Минск", position: "НП", points: 80, price: 10.3 },
  { id: 75, name: "Артемьев", team: "БАТЭ", position: "НП", points: 73, price: 8.4 },
  { id: 76, name: "Буров", team: "Шахтер", position: "НП", points: 69, price: 7.0 },
  { id: 77, name: "Воробьев", team: "Неман", position: "НП", points: 61, price: 5.3 },
  { id: 78, name: "Громов", team: "Славия", position: "НП", points: 56, price: 4.4 },
  { id: 79, name: "Дроздов", team: "Торпедо", position: "НП", points: 68, price: 6.7 },
];

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
}

export interface SavedTeam {
  selectedPlayers: { id: number; slotIndex: number }[];
  teamName: string;
  captain: number | null;
  viceCaptain: number | null;
}

export function getSavedTeam(): SavedTeam {
  const players = localStorage.getItem('fantasyTeamPlayers');
  const name = localStorage.getItem('fantasyTeamName');
  const captain = localStorage.getItem('fantasyTeamCaptain');
  const viceCaptain = localStorage.getItem('fantasyTeamViceCaptain');

  return {
    selectedPlayers: players ? JSON.parse(players) : [],
    teamName: name || "Lucky Team",
    captain: captain ? JSON.parse(captain) : null,
    viceCaptain: viceCaptain ? JSON.parse(viceCaptain) : null,
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
  
  return { mainSquad, bench };
}
