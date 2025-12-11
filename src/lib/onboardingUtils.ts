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
