// Calculate streak multiplier based on streak days
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 7) return 1.5;
  return 1.0;
}

// Get the next multiplier tier info
export function getNextTierInfo(streakDays: number): { nextTier: number; daysNeeded: number; nextMultiplier: number } {
  if (streakDays < 7) return { nextTier: 7, daysNeeded: 7 - streakDays, nextMultiplier: 1.5 };
  return { nextTier: 7, daysNeeded: 0, nextMultiplier: 1.5 }; // Max tier reached
}

// Format multiplier for display
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(1)}x`;
}
