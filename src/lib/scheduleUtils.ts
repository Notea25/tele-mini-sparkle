// Utility functions for team schedule / next opponent

// Team abbreviations mapping
const teamAbbreviations: Record<string, string> = {
  "Арсенал": "Арсенал",
  "Arsenal Dzerzhinsk": "Арсенал",
  "Барановичи": "Барановичи",
  "FK Baranovichi": "Барановичи",
  "БАТЭ": "БАТЭ",
  "BATE Borisov": "БАТЭ",
  "Белшина": "Белшина",
  "Belshina Bobruisk": "Белшина",
  "Витебск": "Витебск",
  "FC Vitebsk": "Витебск",
  "Гомель": "Гомель",
  "FC Gomel": "Гомель",
  "Динамо-Минск": "Дин. Мн",
  "Dinamo Minsk": "Дин. Мн",
  "Динамо-Брест": "Дин. Бр",
  "Dinamo Brest": "Дин. Бр",
  "Торпедо-Жодино": "Торпедо",
  "Torpedo Zhodino": "Торпедо",
  "Днепр": "Днепр",
  "Днепр-Могилев": "Днепр",
  "FC Dnepr Mogilev": "Днепр",
  "Ислочь": "Ислочь",
  "FC Isloch": "Ислочь",
  "МЛ Витебск": "МЛ",
  "Lokomotiv Vitebsk": "МЛ",
  "Минск": "Минск",
  "FC Minsk": "Минск",
  "Нафтан": "Нафтан",
  "Нафтан-Новополоцк": "Нафтан",
  "Naftan": "Нафтан",
  "Неман": "Неман",
  "Neman": "Неман",
  "Славия": "Славия",
  "Славия-Мозырь": "Славия",
  "Slavia-Mozyr": "Славия",
  "Торпедо": "Торпедо",
  "Торпедо-БелАЗ": "Торпедо",
  "Torpedo-BelAZ": "Торпедо",
  "Шахтер": "Шахтер",
  "Shakhtyor Soligorsk": "Шахтер",
};

// All teams in the league
const allTeams = [
  "Арсенал", "Барановичи", "БАТЭ", "Белшина", "Витебск", "Гомель",
  "Динамо-Минск", "Динамо-Брест", "Днепр", "Ислочь", "МЛ Витебск",
  "Минск", "Нафтан", "Неман", "Славия", "Торпедо"
];

// Get a normalized team name
export function normalizeTeamName(teamName: string): string {
  return teamAbbreviations[teamName] || teamName;
}

// Generate deterministic next opponent for a team based on team name hash
export function getNextOpponentForTeam(teamName: string): { opponent: string; isHome: boolean } {
  const normalizedTeam = normalizeTeamName(teamName);
  
  // Get list of other teams
  const otherTeams = allTeams.filter(t => normalizeTeamName(t) !== normalizedTeam);
  
  // Generate a hash from team name for deterministic selection
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = ((hash << 5) - hash) + teamName.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Select opponent deterministically
  const opponentIndex = Math.abs(hash) % otherTeams.length;
  const opponent = otherTeams[opponentIndex];
  
  // Determine if home or away based on hash
  const isHome = Math.abs(hash) % 2 === 0;
  
  return {
    opponent: normalizeTeamName(opponent),
    isHome
  };
}

// Enrich player data with next opponent info
export interface PlayerWithOpponent {
  nextOpponent: string;
  nextOpponentHome: boolean;
}

export function getNextOpponentData(teamName: string): PlayerWithOpponent {
  const { opponent, isHome } = getNextOpponentForTeam(teamName);
  return {
    nextOpponent: opponent,
    nextOpponentHome: isHome
  };
}
