import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const languages = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

const SelectLanguage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");

  const handleNext = () => {
    if (selected) {
      localStorage.setItem("selectedLanguage", selected);
      navigate("/select-level");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/4 transition-all" />
          </div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/welcome")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-2">Choose your language</h1>
        <p className="text-muted-foreground mb-8">What language do you want to learn?</p>

        {/* Language Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {languages.map((lang) => (
            <Card
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                selected === lang.code
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-accent"
              }`}
            >
              <div className="text-4xl mb-2">{lang.flag}</div>
              <div className="font-semibold">{lang.name}</div>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!selected}
          className="w-full h-12 text-lg"
          size="lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default SelectLanguage;
