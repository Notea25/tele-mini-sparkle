/**
 * Check if user has created any team in any league
 * Returns true if user should see onboarding (no team created)
 */
export function shouldShowOnboarding(): boolean {
  // Check if user has any saved team players
  const savedPlayers = localStorage.getItem('fantasyTeamPlayers');
  
  if (savedPlayers) {
    try {
      const players = JSON.parse(savedPlayers);
      // If user has any players saved, they've created a team
      if (Array.isArray(players) && players.length > 0) {
        return false;
      }
    } catch {
      // If parsing fails, continue to show onboarding
    }
  }

  // Check if onboarding was completed manually (user clicked skip/complete)
  const onboardingCompleted = localStorage.getItem('fantasyOnboardingCompleted');
  if (onboardingCompleted === 'true') {
    return false;
  }

  return true;
}

/**
 * Mark onboarding as completed
 */
export function markOnboardingCompleted(): void {
  localStorage.setItem('fantasyOnboardingCompleted', 'true');
}
