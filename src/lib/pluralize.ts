/**
 * Russian pluralization helper
 * Returns correct word form based on number
 */

export function pluralizePoints(count: number): string {
  const absCount = Math.abs(count);
  const lastTwo = absCount % 100;
  const lastOne = absCount % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return "очков";
  }

  if (lastOne === 1) {
    return "очко";
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return "очка";
  }

  return "очков";
}

export function pluralizeDays(count: number): string {
  const absCount = Math.abs(count);
  const lastTwo = absCount % 100;
  const lastOne = absCount % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return "дней";
  }
  
  if (lastOne === 1) {
    return "день";
  }
  
  if (lastOne >= 2 && lastOne <= 4) {
    return "дня";
  }
  
  return "дней";
}
