// Wallet management for Vibe Coins

export interface WalletData {
  vibeCoins: number;
  totalEarned: number;
  lessonsCompleted: number;
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
  wallet.lessonsCompleted += 1;
  wallet.vibeCoins += 50; // 50 coins per lesson
  wallet.totalEarned += 50;
  saveWallet(wallet);
  return wallet;
}
