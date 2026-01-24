/**
 * Check if user should see onboarding (first time only)
 * Returns true only if user has never seen onboarding before
 */
export function shouldShowOnboarding(): boolean {
  const onboardingCompleted = localStorage.getItem('fantasyOnboardingCompleted');
  return onboardingCompleted !== 'true';
}

/**
 * Mark onboarding as completed
 */
export function markOnboardingCompleted(): void {
  localStorage.setItem('fantasyOnboardingCompleted', 'true');
}

/**
 * Check if user needs to complete registration (nickname + birthdate)
 * Returns true if registration data is not yet saved
 */
export function shouldShowRegistration(): boolean {
  const registrationCompleted = localStorage.getItem('fantasyRegistrationCompleted');
  return registrationCompleted !== 'true';
}

/**
 * Mark registration as completed
 */
export function markRegistrationCompleted(): void {
  localStorage.setItem('fantasyRegistrationCompleted', 'true');
}

/**
 * Check if user has entered team name and favorite team (completed CreateTeam form)
 */
export function hasCompletedTeamSetup(): boolean {
  const teamName = localStorage.getItem('fantasyTeamName');
  const favoriteTeam = localStorage.getItem('fantasyFavoriteTeam');
  return !!(teamName && favoriteTeam);
}

/**
 * Check if user has created a full team (15 players saved)
 */
export function hasCreatedTeam(): boolean {
  const teamPlayers = localStorage.getItem('fantasyTeamPlayers');
  if (!teamPlayers) return false;
  try {
    const parsed = JSON.parse(teamPlayers);
    return Array.isArray(parsed) && parsed.length === 15;
  } catch {
    return false;
  }
}

/**
 * Check if user is in progress of building a team (has some players but not 15)
 */
export function isTeamBuildingInProgress(): boolean {
  const teamPlayers = localStorage.getItem('fantasyTeamPlayers');
  if (!teamPlayers) return false;
  try {
    const parsed = JSON.parse(teamPlayers);
    return Array.isArray(parsed) && parsed.length > 0 && parsed.length < 15;
  } catch {
    return false;
  }
}

/**
 * Get the appropriate destination after selecting a league
 * Based on user's progress in the flow
 */
export function getLeagueDestination(): string {
  // If user has created a team (15 players), go to league page
  if (hasCreatedTeam()) {
    return '/league';
  }
  
  // If user is in progress of building team, continue to team-builder
  if (isTeamBuildingInProgress()) {
    return '/team-builder';
  }
  
  // If user has completed team setup (name + favorite team), go to team-builder
  if (hasCompletedTeamSetup()) {
    return '/team-builder';
  }
  
  // Otherwise, go to create-team to enter name and favorite team
  return '/create-team';
}
