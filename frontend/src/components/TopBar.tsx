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
  const [lastPracticeDate, setLastPracticeDate] = useState<Date | null>(null);
  const [streakStartDate, setStreakStartDate] = useState<Date | null>(null);
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
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('banked_vibe')
            .eq('id', user.id)
            .single();
          
          setVibeCoins(profile?.banked_vibe || 0);
        }
      } catch (error) {
        console.error('Error loading banked VIBE in TopBar:', error);
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
            .select('last_practice_date, streak_start_date')
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
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('banked_vibe')
            .eq('id', user.id)
            .single();
          
          setVibeCoins(profile?.banked_vibe || 0);
        }
      } catch (error) {
        console.error('Error updating banked VIBE on storage change:', error);
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
            .select('last_practice_date, streak_start_date')
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
          }
        }
      } catch (error) {
        console.error('Unexpected error on storage change:', error);
      }
    };

    // Listen for VIBE balance updates from custom events
    const handleVibeUpdate = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vibeBalanceUpdated", handleVibeUpdate);

    // Also check periodically to update from Supabase
    const interval = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('banked_vibe')
            .eq('id', user.id)
            .single();
          
          setVibeCoins(profile?.banked_vibe || 0);
        }
      } catch (error) {
        console.error('Error updating banked VIBE in interval:', error);
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
            .select('last_practice_date, streak_start_date')
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
          }
        }
      } catch (error) {
        console.error('Unexpected error in interval:', error);
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vibeBalanceUpdated", handleVibeUpdate);
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
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Your Streak Calendar
                  </h3>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-foreground">
                      Your streak is {currentStreak} {currentStreak === 1 ? 'day' : 'days'} long! 🎉
                    </p>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      Daily streak is: {currentStreak}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Keep practicing every day for the chance to earn greater rewards!
                    </p>
                  </div>
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
                <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                  <p>🟠 Orange days = Your active streak days</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Vibe Coins */}
          <Button 
            variant="outline" 
            className="rounded-full px-3 gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-300 dark:border-yellow-700 cursor-pointer"
            onClick={() => navigate('/rewards')}
          >
            <img src={vibecoinLogo} alt="VibeCoin" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-yellow-700 dark:text-yellow-300">{vibeCoins}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
