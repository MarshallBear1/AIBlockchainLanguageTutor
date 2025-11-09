import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import tokiTeacher from "@/assets/toki-teacher.png";
import spanishFlag from "@/assets/flags/spanish-flag.png";
import frenchFlag from "@/assets/flags/french-flag.png";
import germanFlag from "@/assets/flags/german-flag.png";
import italianFlag from "@/assets/flags/italian-flag.png";
import portugueseFlag from "@/assets/flags/portuguese-flag.png";
import japaneseFlag from "@/assets/flags/japanese-flag.png";
import koreanFlag from "@/assets/flags/korean-flag.png";
import chineseFlag from "@/assets/flags/chinese-flag.png";

const languages = [
  { code: "es", name: "Spanish", flag: spanishFlag },
  { code: "fr", name: "French", flag: frenchFlag },
  { code: "de", name: "German", flag: germanFlag },
  { code: "it", name: "Italian", flag: italianFlag },
  { code: "pt", name: "Portuguese", flag: portugueseFlag },
  { code: "ja", name: "Japanese", flag: japaneseFlag },
  { code: "ko", name: "Korean", flag: koreanFlag },
  { code: "zh", name: "Chinese", flag: chineseFlag },
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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
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

        {/* Main Layout with Toki and Content */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Toki Avatar - Left Side */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img 
              src={tokiTeacher} 
              alt="Toki" 
              className="w-40 h-40 md:w-48 md:h-48 object-contain animate-fade-in"
            />
          </div>

          {/* Speech Bubble and Languages - Right Side */}
          <div className="flex-1 space-y-6">
            {/* Speech Bubble */}
            <div className="relative bg-card border-2 border-border rounded-2xl p-6 shadow-lg animate-fade-in">
              {/* Speech bubble tail pointing to Toki */}
              <div className="absolute -left-3 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-r-[16px] border-r-border border-b-[12px] border-b-transparent"></div>
              <div className="absolute -left-2 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-r-[16px] border-r-card border-b-[12px] border-b-transparent"></div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Toki!</h1>
              <p className="text-lg text-muted-foreground">What language do you want to learn?</p>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {languages.map((lang) => (
                <Card
                  key={lang.code}
                  onClick={() => setSelected(lang.code)}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    selected === lang.code
                      ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary"
                      : "bg-card hover:bg-accent"
                  }`}
                >
                  <div className="mb-2 flex justify-center">
                    <img 
                      src={lang.flag} 
                      alt={`${lang.name} flag`} 
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-lg ring-2 ring-gray-400 dark:ring-gray-600" 
                    />
                  </div>
                  <div className="font-semibold text-center text-sm md:text-base">{lang.name}</div>
                </Card>
              ))}
            </div>

            {/* Next Button */}
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
      </div>
    </div>
  );
};

export default SelectLanguage;
