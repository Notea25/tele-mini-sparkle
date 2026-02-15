/**
 * Get jersey URL from team object
 * @param team - Team object with jersey URLs from API
 * @param position - Player position ("ВР" for goalkeeper)
 * @returns Jersey image URL or null if not available
 */
export const getJerseyForTeam = (
  team: { field_player_jersey?: string; goalkeeper_jersey?: string; name?: string; name_rus?: string }, 
  position?: string
): string | null => {
  const isGoalkeeper = position === "ВР" || position === "Goalkeeper";
  
  // Return API data if available
  if (isGoalkeeper && team.goalkeeper_jersey) {
    return team.goalkeeper_jersey;
  }
  if (!isGoalkeeper && team.field_player_jersey) {
    return team.field_player_jersey;
  }
  
  // No jersey available - return null
  console.warn('Jersey URL not provided by API for team:', team.name_rus || team.name);
  return null;
};
