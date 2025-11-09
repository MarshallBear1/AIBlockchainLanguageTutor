import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWallet } from "@/utils/wallet";
import spanishFlag from "@/assets/flags/spanish-flag.png";
import frenchFlag from "@/assets/flags/french-flag.png";
import germanFlag from "@/assets/flags/german-flag.png";
import italianFlag from "@/assets/flags/italian-flag.png";
import portugueseFlag from "@/assets/flags/portuguese-flag.png";
import japaneseFlag from "@/assets/flags/japanese-flag.png";
import koreanFlag from "@/assets/flags/korean-flag.png";
import chineseFlag from "@/assets/flags/chinese-flag.png";
import vibecoinLogo from "@/assets/vibecoin-logo.png";

const TopBar = () => {
  const [vibeCoins, setVibeCoins] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const selectedLanguage = localStorage.getItem("selectedLanguage") || "es";
  const selectedLevel = localStorage.getItem("selectedLevel") || "1";

  const languageFlags: Record<string, string> = {
    es: spanishFlag,
    fr: frenchFlag,
    de: germanFlag,
    it: italianFlag,
    pt: portugueseFlag,
    ja: japaneseFlag,
    ko: koreanFlag,
    zh: chineseFlag,
  };

  const levelNames: Record<string, string> = {
    "1": "Beginner",
    "2": "Survival",
    "3": "Conversational",
    "4": "Proficient",
    "5": "Fluent"
  };

  // Load wallet balance and streak on mount and whenever component re-renders
  useEffect(() => {
    const wallet = getWallet();
    setVibeCoins(wallet.vibeCoins);
    setCurrentStreak(wallet.currentStreak);

    // Listen for storage changes (when coins are added in other tabs/windows)
    const handleStorageChange = () => {
      const updatedWallet = getWallet();
      setVibeCoins(updatedWallet.vibeCoins);
      setCurrentStreak(updatedWallet.currentStreak);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in same tab
    const interval = setInterval(() => {
      const updatedWallet = getWallet();
      setVibeCoins(updatedWallet.vibeCoins);
      setCurrentStreak(updatedWallet.currentStreak);
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Button variant="outline" className="rounded-full px-4 gap-2">
          <img src={languageFlags[selectedLanguage]} alt="flag" className="w-5 h-5 object-contain rounded ring-2 ring-black/30" />
          <span className="font-semibold">{levelNames[selectedLevel]}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          {/* Streak */}
          <div className="text-sm font-medium text-muted-foreground">
            day {currentStreak}
          </div>

          {/* Vibe Coins */}
          <Button variant="outline" className="rounded-full px-3 gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-300 dark:border-yellow-700">
            <img src={vibecoinLogo} alt="VibeCoin" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-yellow-700 dark:text-yellow-300">{vibeCoins}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
