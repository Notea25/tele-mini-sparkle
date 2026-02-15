// Fallback jersey images (used only when API doesn't provide jersey URLs)
import jerseySlavia from "@/assets/jerseys/slaviaJersey.png";
import jerseySlaviaGk from "@/assets/jerseys/goalkeeperJerseys/slaviaGoalkeeperJersey.png";

/**
 * Get jersey URL from team object or fallback to default
 * @param team - Team object with jersey URLs from API
 * @param position - Player position ("ВР" for goalkeeper)
 * @returns Jersey image URL
 */
export const getJerseyForTeam = (
  team: { field_player_jersey?: string; goalkeeper_jersey?: string; name?: string; name_rus?: string }, 
  position?: string
) => {
  const isGoalkeeper = position === "ВР" || position === "Goalkeeper";
  
  // Use API data if available
  if (isGoalkeeper && team.goalkeeper_jersey) {
    return team.goalkeeper_jersey;
  }
  if (!isGoalkeeper && team.field_player_jersey) {
    return team.field_player_jersey;
  }
  
  // Fallback to default jersey
  console.warn('Jersey URL not provided by API for team:', team.name_rus || team.name);
  return isGoalkeeper ? jerseySlaviaGk : jerseySlavia;
};
