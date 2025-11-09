import { useState, useEffect } from "react";
import { ChevronDown, LogOut, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { getWallet } from "@/utils/wallet";
import { getStreak } from "@/utils/streakManager";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem("selectedLanguage") || "es");
  const [selectedLevel, setSelectedLevel] = useState(localStorage.getItem("selectedLevel") || "1");
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

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

  const languageNames: Record<string, string> = {
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
  };

  const handleLanguageChange = async (langCode: string) => {
    // Update localStorage
    localStorage.setItem("selectedLanguage", langCode);
    setSelectedLanguage(langCode);

    // Update Supabase profile
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ selected_language: langCode })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error updating language in Supabase:", error);
    }

    setOpen(false);
    window.location.reload();
  };

  const handleLevelChange = async (level: string) => {
    // Update localStorage
    localStorage.setItem("selectedLevel", level);
    setSelectedLevel(level);

    // Update Supabase profile
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ selected_level: parseInt(level) })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error updating level in Supabase:", error);
    }

    setOpen(false);
    window.location.reload();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Load wallet balance and streak on mount and whenever component re-renders
  useEffect(() => {
    const loadData = async () => {
      const wallet = await getWallet();
      setVibeCoins(wallet.vibeCoins);

      // Load streak from database
      const streak = await getStreak();
      setCurrentStreak(streak);
    };

    loadData();

    // Listen for Supabase changes (when coins are added/updated)
    const handleStorageChange = async () => {
      const updatedWallet = await getWallet();
      setVibeCoins(updatedWallet.vibeCoins);

      const streak = await getStreak();
      setCurrentStreak(streak);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically to update from Supabase
    const interval = setInterval(async () => {
      const updatedWallet = await getWallet();
      setVibeCoins(updatedWallet.vibeCoins);

      const streak = await getStreak();
      setCurrentStreak(streak);
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-full px-4 gap-2">
              <img src={languageFlags[selectedLanguage]} alt="flag" className="w-5 h-5 object-contain rounded ring-2 ring-black/30" />
              <span className="font-semibold">{levelNames[selectedLevel]}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Switch Language</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(languageFlags).map(([code, flag]) => (
                    <Button
                      key={code}
                      variant={selectedLanguage === code ? "default" : "outline"}
                      className="justify-start gap-2"
                      onClick={() => handleLanguageChange(code)}
                    >
                      <img src={flag} alt={code} className="w-4 h-4 object-contain rounded" />
                      <span className="text-xs">{languageNames[code]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Switch Level</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(levelNames).map(([level, name]) => (
                    <Button
                      key={level}
                      variant={selectedLevel === level ? "default" : "outline"}
                      className="justify-start text-xs"
                      onClick={() => handleLevelChange(level)}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4" />
                Log Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          {/* Streak */}
          <Button variant="outline" className="rounded-full px-3 gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-300 dark:border-orange-700">
            <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <span className="font-semibold text-orange-700 dark:text-orange-300">{currentStreak}</span>
          </Button>

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
