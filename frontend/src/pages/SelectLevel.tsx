import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import tokiTeacher from "@/assets/toki-teacher.png";

const levels = [
  {
    level: 1,
    title: "Beginner",
    description: "I can introduce myself and ask simple questions",
  },
  {
    level: 2,
    title: "Survival",
    description: "I can handle basic travel situations and daily needs",
  },
  {
    level: 3,
    title: "Conversational",
    description: "I can hold everyday conversations with some fluency",
  },
  {
    level: 4,
    title: "Proficient",
    description: "I can discuss various topics with good vocabulary",
  },
  {
    level: 5,
    title: "Fluent",
    description: "I can speak smoothly with native speakers",
  },
];

const SelectLevel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<number>(0);
  const [isStarting, setIsStarting] = useState(false);

  const handleNext = async () => {
    if (!selected || isStarting) return;

    setIsStarting(true);

    try {
      // Save to localStorage
      const selectedLanguage = localStorage.getItem("selectedLanguage") || "es";
      localStorage.setItem("selectedLevel", selected.toString());

      // Set default avatar
      localStorage.setItem("selectedAvatar", "default");

      // Save to lesson goal for first conversation
      localStorage.setItem("lessonGoal", `Start learning ${selectedLanguage.toUpperCase()} at ${levels.find(l => l.level === selected)?.title} level`);

      // Save to Supabase in background (don't wait)
      supabase.auth.getUser()
        .then(async ({ data: { user }, error: userError }) => {
          if (userError) {
            console.error("Error fetching user:", userError);
            return;
          }

          if (user) {
            const { error } = await supabase
              .from("profiles")
              .update({
                selected_language: selectedLanguage,
                selected_level: selected,
              })
              .eq("id", user.id);

            if (error) {
              console.error("Profile update error:", error);
            }
          }
        })
        .catch((error) => {
          console.error("Unexpected error getting user:", error);
        });

      // Navigate to earn while learn page
      navigate("/earn-while-learn");
    } catch (error) {
      console.error("Setup error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Starting anyway...",
        variant: "destructive",
      });
      // Navigate anyway
      navigate("/earn-while-learn");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full transition-all" />
          </div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/select-language")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Layout with Toki and Content */}
        <div className="flex flex-col md:flex-row gap-4 items-start justify-center">
          {/* Toki Avatar - Left Side */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-32 md:w-36">
            <img 
              src={tokiTeacher} 
              alt="Toki" 
              className="w-full h-auto object-contain animate-fade-in"
            />
          </div>

          {/* Speech Bubble and Levels - Right Side */}
          <div className="flex-1 max-w-md space-y-6">
            {/* Speech Bubble */}
            <div className="relative bg-card border-2 border-border rounded-2xl p-6 shadow-lg animate-fade-in">
              {/* Speech bubble tail pointing to Toki */}
              <div className="absolute -left-3 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-r-[16px] border-r-border border-b-[12px] border-b-transparent"></div>
              <div className="absolute -left-2 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-r-[16px] border-r-card border-b-[12px] border-b-transparent"></div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-2">What's your level?</h1>
              <p className="text-lg text-muted-foreground">Choose the level that best describes you</p>
            </div>

            {/* Level Cards */}
            <div className="space-y-3">
              {levels.map((level) => (
                <Card
                  key={level.level}
                  onClick={() => setSelected(level.level)}
                  className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                    selected === level.level
                      ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary"
                      : "bg-card hover:bg-accent"
                  }`}
                >
                  <div className="font-bold text-lg mb-1">{level.title}</div>
                  <div className={`text-sm ${selected === level.level ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    {level.description}
                  </div>
                </Card>
              ))}
            </div>

            {/* Start Button */}
            <Button
              onClick={handleNext}
              disabled={!selected || isStarting}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isStarting ? "Starting your journey..." : "Start Learning"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectLevel;
