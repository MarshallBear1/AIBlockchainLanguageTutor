// Wallet management for Vibe Coins and Streaks - now using Supabase
import { supabase } from "@/integrations/supabase/client";

export interface WalletData {
  vibeCoins: number;
  totalEarned: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastLessonDate: string | null;
}

// Get wallet data from Supabase
export async function getWallet(): Promise<WalletData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        vibeCoins: 0,
        totalEarned: 0,
        lessonsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastLessonDate: null,
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('vibe_coins, xp, streak_days, total_minutes_practiced, last_practice_date')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      return {
        vibeCoins: 0,
        totalEarned: 0,
        lessonsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastLessonDate: null,
      };
    }

    return {
      vibeCoins: data.vibe_coins || 0,
      totalEarned: data.xp || 0,
      lessonsCompleted: 0, // We can calculate this from lesson_progress if needed
      currentStreak: data.streak_days || 0,
      longestStreak: data.streak_days || 0, // For now, use current streak
      lastLessonDate: data.last_practice_date,
    };
  } catch (error) {
    console.error('Error in getWallet:', error);
    return {
      vibeCoins: 0,
      totalEarned: 0,
      lessonsCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLessonDate: null,
    };
  }
}

// Save wallet data to Supabase
export async function saveWallet(wallet: WalletData): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('profiles')
      .update({
        vibe_coins: wallet.vibeCoins,
        xp: wallet.totalEarned,
        streak_days: wallet.currentStreak,
        last_practice_date: wallet.lastLessonDate,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving wallet:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveWallet:', error);
    return false;
  }
}

// Add coins to wallet
export async function addCoins(amount: number): Promise<WalletData> {
  const wallet = await getWallet();
  wallet.vibeCoins += amount;
  wallet.totalEarned += amount;
  await saveWallet(wallet);
  return wallet;
}

// Spend coins from wallet
export async function spendCoins(amount: number): Promise<WalletData | null> {
  const wallet = await getWallet();
  if (wallet.vibeCoins < amount) {
    return null; // Not enough coins
  }
  wallet.vibeCoins -= amount;
  await saveWallet(wallet);
  return wallet;
}

// Award coins for lesson completion (legacy function - use streakManager instead)
export async function awardLessonCompletion(): Promise<WalletData> {
  const wallet = await getWallet();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const lastDate = wallet.lastLessonDate;

  // Update streak logic
  if (!lastDate) {
    // First lesson ever
    wallet.currentStreak = 1;
  } else {
    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
    const daysDiff = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, don't change streak
    } else if (daysDiff === 1) {
      // Consecutive day, increase streak
      wallet.currentStreak += 1;
    } else {
      // Streak broken, reset to 1
      wallet.currentStreak = 1;
    }
  }

  // Update longest streak
  if (wallet.currentStreak > wallet.longestStreak) {
    wallet.longestStreak = wallet.currentStreak;
  }

  wallet.lastLessonDate = today;
  wallet.lessonsCompleted += 1;
  wallet.vibeCoins += 50; // 50 coins per lesson
  wallet.totalEarned += 50;
  await saveWallet(wallet);
  return wallet;
}
