// Calculate streak multiplier based on streak days
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 6) return 1.5;
  if (streakDays >= 3) return 1.2;
  if (streakDays >= 1) return 1.0;
  return 1.0;
}

// Get the next multiplier tier info
export function getNextTierInfo(streakDays: number): { nextTier: number; daysNeeded: number; nextMultiplier: number } {
  if (streakDays < 3) return { nextTier: 3, daysNeeded: 3 - streakDays, nextMultiplier: 1.2 };
  if (streakDays < 6) return { nextTier: 6, daysNeeded: 6 - streakDays, nextMultiplier: 1.5 };
  return { nextTier: 6, daysNeeded: 0, nextMultiplier: 1.5 }; // Max tier reached
}

// Format multiplier for display
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(1)}x`;
}
