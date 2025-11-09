import { ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const TopBar = () => {
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

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Button variant="outline" className="rounded-full px-4 gap-2">
          <span className="text-xl">{languageFlags[selectedLanguage]}</span>
          <span className="font-semibold">Level {selectedLevel}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>

        <Button variant="outline" className="rounded-full px-4 gap-2">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="font-semibold">120 XP</span>
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
