// Calculate streak multiplier based on streak days
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 60) return 3.0;
  if (streakDays >= 30) return 2.5;
  if (streakDays >= 14) return 2.0;
  if (streakDays >= 7) return 1.5;
  return 1.0;
}

// Get the next multiplier tier info
export function getNextTierInfo(streakDays: number): { nextTier: number; daysNeeded: number; nextMultiplier: number } {
  if (streakDays < 7) return { nextTier: 7, daysNeeded: 7 - streakDays, nextMultiplier: 1.5 };
  if (streakDays < 14) return { nextTier: 14, daysNeeded: 14 - streakDays, nextMultiplier: 2.0 };
  if (streakDays < 30) return { nextTier: 30, daysNeeded: 30 - streakDays, nextMultiplier: 2.5 };
  if (streakDays < 60) return { nextTier: 60, daysNeeded: 60 - streakDays, nextMultiplier: 3.0 };
  return { nextTier: 60, daysNeeded: 0, nextMultiplier: 3.0 }; // Max tier reached
}

// Format multiplier for display
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(1)}x`;
}
