// Wallet management for Vibe Coins and Streaks

export interface WalletData {
  vibeCoins: number;
  totalEarned: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastLessonDate: string | null;
}

const WALLET_KEY = "tokiWallet";

export function getWallet(): WalletData {
  const saved = localStorage.getItem(WALLET_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    vibeCoins: 0,
    totalEarned: 0,
    lessonsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastLessonDate: null,
  };
}

export function saveWallet(wallet: WalletData) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
}

export function addCoins(amount: number): WalletData {
  const wallet = getWallet();
  wallet.vibeCoins += amount;
  wallet.totalEarned += amount;
  saveWallet(wallet);
  return wallet;
}

export function spendCoins(amount: number): WalletData | null {
  const wallet = getWallet();
  if (wallet.vibeCoins < amount) {
    return null; // Not enough coins
  }
  wallet.vibeCoins -= amount;
  saveWallet(wallet);
  return wallet;
}

export function awardLessonCompletion(): WalletData {
  const wallet = getWallet();
  const today = new Date().toDateString();
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
  saveWallet(wallet);
  return wallet;
}
