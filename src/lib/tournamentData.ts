// Shared tournament table data - used by both League and TournamentTable pages

export const teamNames = [
  "FC Phoenix", "Red Bulls", "Golden Eagles", "Thunder FC", "Storm United",
  "Blue Lions", "Silver Hawks", "Dark Knights", "Fire Dragons", "Ice Warriors",
  "Royal Tigers", "Electric City", "Shadow Wolves", "Crimson Kings", "Emerald Stars",
  "Diamond FC", "Platinum United", "Bronze Legends", "Copper Chiefs", "Steel Titans",
  "Galaxy FC", "Cosmic Stars", "Meteor United", "Comet FC", "Asteroid FC",
  "Ocean Waves", "River Flow", "Lake City", "Mountain FC", "Valley United",
  "Forest Rangers", "Desert Hawks", "Tundra Bears", "Jungle Cats", "Savanna Lions",
  "Arctic Foxes", "Tropical Storm", "Volcano FC", "Canyon City", "Prairie Dogs",
  "Night Owls", "Dawn Breakers", "Sunset FC", "Twilight United", "Midnight FC",
  "Victory FC", "Champion Stars", "Glory United", "Honor FC", "Pride City",
  "Spirit FC", "Soul United", "Heart FC", "Mind Warriors", "Power FC",
  "Speed Demons", "Flash FC", "Lightning FC", "Bolt United", "Spark City",
  "Alpha FC", "Beta United", "Gamma FC", "Delta City", "Omega FC",
  "Zenith Stars", "Apex United", "Summit FC", "Peak City", "Pinnacle FC",
  "Nova FC", "Quantum United", "Fusion FC", "Energy City", "Dynamo FC",
  "Rocket FC", "Jet United", "Turbo FC", "Nitro City", "Boost FC",
  "Legend FC", "Myth United", "Epic FC", "Hero City", "Champion FC",
  "Elite Stars", "Premier United", "Supreme FC", "Ultimate City", "Max FC",
  "Prime FC", "Core United", "Base FC", "Root City", "Origin FC",
  "Future FC", "Next United", "Forward FC", "Ahead City", "Beyond FC"
];

export interface TournamentTeam {
  id: number;
  position: number;
  change: "up" | "down" | "same";
  name: string;
  tourPoints: number;
  totalPoints: number;
  isUser: boolean;
}

// Generate consistent tournament data using seeded pseudo-random
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Generate 100 teams with consistent data (seeded random)
function generateTournamentTeams(userTeamName: string = "Моя команда"): TournamentTeam[] {
  const random = seededRandom(42); // Fixed seed for consistent data
  const teams: TournamentTeam[] = [];
  const changes: Array<"up" | "down" | "same"> = ["up", "down", "same"];
  
  for (let i = 1; i <= 100; i++) {
    const isUser = i === 17;
    teams.push({
      id: i,
      position: i,
      change: changes[Math.floor(random() * 3)],
      name: isUser ? userTeamName : teamNames[(i - 1) % teamNames.length],
      tourPoints: Math.floor(random() * 40) + 15,
      totalPoints: Math.floor(random() * 2000) + 1500,
      isUser
    });
  }
  
  // Sort by total points descending
  teams.sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Update positions after sorting
  teams.forEach((team, idx) => {
    team.position = idx + 1;
  });
  
  // Find and move user to position 17
  const userTeamIndex = teams.findIndex(t => t.isUser);
  if (userTeamIndex !== -1) {
    const userTeam = teams.splice(userTeamIndex, 1)[0];
    teams.splice(16, 0, userTeam);
    // Recalculate positions
    teams.forEach((team, idx) => {
      team.position = idx + 1;
    });
  }
  
  return teams;
}

// Get tournament teams with user's actual team name
export function getTournamentTeams(userTeamName?: string): TournamentTeam[] {
  const teamName = userTeamName || (typeof localStorage !== 'undefined' ? localStorage.getItem("fantasyTeamName") : null) || "Моя команда";
  return generateTournamentTeams(teamName);
}

// Export the static tournament data (for backward compatibility)
export const tournamentTeams: TournamentTeam[] = generateTournamentTeams();

// Get top 3 teams plus user's team for /league page preview
export function getLeaguePreviewTeams(userTeamName?: string): TournamentTeam[] {
  const teams = getTournamentTeams(userTeamName);
  const top3 = teams.slice(0, 3);
  const userTeam = teams.find(t => t.isUser);
  
  if (userTeam && userTeam.position > 3) {
    return [...top3, userTeam];
  }
  
  return top3;
}
