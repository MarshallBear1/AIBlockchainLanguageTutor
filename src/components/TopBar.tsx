import { useState, useEffect } from "react";
import { ChevronDown, LogOut, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";

const TopBar = () => {
  const [vibeCoins, setVibeCoins] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem("selectedLanguage") || "es");
  const [selectedLevel, setSelectedLevel] = useState(localStorage.getItem("selectedLevel") || "1");
  const [open, setOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [coinPopoverOpen, setCoinPopoverOpen] = useState(false);
  const [lastPracticeDate, setLastPracticeDate] = useState<Date | null>(null);
  const [streakStartDate, setStreakStartDate] = useState<Date | null>(null);
  const [levelsInCycle, setLevelsInCycle] = useState(0);
  const [cycleStartDate, setCycleStartDate] = useState<Date | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user for language change:", userError);
      } else if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ selected_language: langCode })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating language in database:", updateError);
        }
      }
    } catch (error) {
      console.error("Unexpected error updating language:", error);
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user for level change:", userError);
      } else if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ selected_level: parseInt(level) })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating level in database:", updateError);
        }
      }
    } catch (error) {
      console.error("Unexpected error updating level:", error);
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
      try {
        const wallet = await getWallet();
        setVibeCoins(wallet.vibeCoins);
      } catch (error) {
        console.error('Error loading wallet in TopBar:', error);
      }

      try {
        const streak = await getStreak();
        setCurrentStreak(streak);
      } catch (error) {
        console.error('Error loading streak in TopBar:', error);
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user in TopBar:', userError);
          return;
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('last_practice_date, streak_start_date, levels_completed_in_cycle, current_cycle_start, wallet_address')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile data in TopBar:', profileError);
            return;
          }

          if (profile) {
            if (profile.last_practice_date) {
              setLastPracticeDate(new Date(profile.last_practice_date));
            }
            if (profile.streak_start_date) {
              setStreakStartDate(new Date(profile.streak_start_date));
            }
            setLevelsInCycle(profile.levels_completed_in_cycle || 0);
            if (profile.current_cycle_start) {
              setCycleStartDate(new Date(profile.current_cycle_start));
            }
            setWalletAddress(profile.wallet_address);
          }
        }
      } catch (error) {
        console.error('Unexpected error loading profile data in TopBar:', error);
      }
    };

    loadData();

    // Listen for Supabase changes (when coins are added/updated)
    const handleStorageChange = async () => {
      try {
        const updatedWallet = await getWallet();
        setVibeCoins(updatedWallet.vibeCoins);
      } catch (error) {
        console.error('Error updating wallet on storage change:', error);
      }

      try {
        const streak = await getStreak();
        setCurrentStreak(streak);
      } catch (error) {
        console.error('Error updating streak on storage change:', error);
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user on storage change:', userError);
          return;
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('last_practice_date, streak_start_date, levels_completed_in_cycle, current_cycle_start, wallet_address')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile on storage change:', profileError);
            return;
          }

          if (profile) {
            if (profile.last_practice_date) {
              setLastPracticeDate(new Date(profile.last_practice_date));
            }
            if (profile.streak_start_date) {
              setStreakStartDate(new Date(profile.streak_start_date));
            }
            setLevelsInCycle(profile.levels_completed_in_cycle || 0);
            if (profile.current_cycle_start) {
              setCycleStartDate(new Date(profile.current_cycle_start));
            }
            setWalletAddress(profile.wallet_address);
          }
        }
      } catch (error) {
        console.error('Unexpected error on storage change:', error);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically to update from Supabase
    const interval = setInterval(async () => {
      try {
        const updatedWallet = await getWallet();
        setVibeCoins(updatedWallet.vibeCoins);
      } catch (error) {
        console.error('Error updating wallet in interval:', error);
      }

      try {
        const streak = await getStreak();
        setCurrentStreak(streak);
      } catch (error) {
        console.error('Error updating streak in interval:', error);
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user in interval:', userError);
          return;
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('last_practice_date, streak_start_date, levels_completed_in_cycle, current_cycle_start, wallet_address')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile in interval:', profileError);
            return;
          }

          if (profile) {
            if (profile.last_practice_date) {
              setLastPracticeDate(new Date(profile.last_practice_date));
            }
            if (profile.streak_start_date) {
              setStreakStartDate(new Date(profile.streak_start_date));
            }
            setLevelsInCycle(profile.levels_completed_in_cycle || 0);
            if (profile.current_cycle_start) {
              setCycleStartDate(new Date(profile.current_cycle_start));
            }
            setWalletAddress(profile.wallet_address);
          }
        }
      } catch (error) {
        console.error('Unexpected error in interval:', error);
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate streak dates for calendar highlighting - from streak start to today
  const getStreakDates = () => {
    if (!streakStartDate || currentStreak === 0) return [];
    
    const dates: Date[] = [];
    const startDate = new Date(streakStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    // Add dates from streak start date forward
    for (let i = 0; i < currentStreak; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const streakDates = getStreakDates();

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
          <Popover open={streakOpen} onOpenChange={setStreakOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full px-3 gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-300 dark:border-orange-700 cursor-pointer">
                <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                <span className="font-semibold text-orange-700 dark:text-orange-300">{currentStreak}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    {currentStreak} Day Streak
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep it going! Practice every day.
                  </p>
                </div>
                <Calendar
                  mode="multiple"
                  selected={streakDates}
                  className={cn("pointer-events-auto")}
                  modifiers={{
                    streak: streakDates,
                  }}
                  modifiersClassNames={{
                    streak: "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
                  }}
                  disabled={(date) => date > new Date()}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Vibe Coins */}
          <Popover open={coinPopoverOpen} onOpenChange={setCoinPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full px-3 gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-300 dark:border-yellow-700 cursor-pointer">
                <img src={vibecoinLogo} alt="VibeCoin" className="w-5 h-5 object-contain" />
                <span className="font-semibold text-yellow-700 dark:text-yellow-300">{vibeCoins}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">VIBE Token Balance</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn 50 VIBE per lesson - tokens unlock after completing 1 lesson!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img src={vibecoinLogo} alt="VIBE" className="w-6 h-6" />
                      <span className="font-semibold">Locked VIBE</span>
                    </div>
                    <span className="text-2xl font-bold">{levelsInCycle * 50}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lesson Progress</span>
                      <span className="font-semibold">{levelsInCycle >= 1 ? "✓ Ready to unlock!" : "0 / 1 lesson"}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((levelsInCycle / 1) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lessons Completed</span>
                      <span className="font-semibold">{levelsInCycle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-semibold">
                        {levelsInCycle >= 1 ? "✓ Ready for payout!" : "Complete 1 lesson"}
                      </span>
                    </div>
                    {cycleStartDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cycle Started</span>
                        <span className="font-semibold">
                          {cycleStartDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {streakStartDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Streak Started</span>
                        <span className="font-semibold">
                          {streakStartDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm font-medium">
                        {walletAddress ? 'Wallet Connected' : 'Wallet Not Connected'}
                      </span>
                    </div>
                    {walletAddress ? (
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Connect MetaMask to receive tokens after completing lessons
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    💎 Complete 1 lesson to unlock your VIBE tokens. Earn 50 VIBE per lesson!
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
