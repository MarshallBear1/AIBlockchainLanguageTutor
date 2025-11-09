import { useState, useEffect } from "react";
import { ChevronDown, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWallet } from "@/utils/wallet";

const TopBar = () => {
  const [vibeCoins, setVibeCoins] = useState(0);
  const selectedLanguage = localStorage.getItem("selectedLanguage") || "es";
  const selectedLevel = localStorage.getItem("selectedLevel") || "1";

  const languageFlags: Record<string, string> = {
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    ja: "🇯🇵",
    ko: "🇰🇷",
    zh: "🇨🇳",
  };

  // Load wallet balance on mount and whenever component re-renders
  useEffect(() => {
    const wallet = getWallet();
    setVibeCoins(wallet.vibeCoins);

    // Listen for storage changes (when coins are added in other tabs/windows)
    const handleStorageChange = () => {
      const updatedWallet = getWallet();
      setVibeCoins(updatedWallet.vibeCoins);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in same tab
    const interval = setInterval(() => {
      const updatedWallet = getWallet();
      setVibeCoins(updatedWallet.vibeCoins);
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
          <span className="text-xl">{languageFlags[selectedLanguage]}</span>
          <span className="font-semibold">Level {selectedLevel}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>

        <Button variant="outline" className="rounded-full px-4 gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-300 dark:border-yellow-700">
          <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="font-semibold text-yellow-700 dark:text-yellow-300">{vibeCoins}</span>
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
