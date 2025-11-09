import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        .then(({ data: { user }, error: userError }) => {
          if (userError) {
            console.error("Error fetching user:", userError);
            return;
          }

          if (user) {
            supabase
              .from("profiles")
              .update({
                selected_language: selectedLanguage,
                selected_level: selected,
              })
              .eq("id", user.id)
              .then(({ error }) => {
                if (error) {
                  console.error("Profile update error:", error);
                }
              })
              .catch((error) => {
                console.error("Unexpected error updating profile:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Unexpected error getting user:", error);
        });

      // Navigate straight to first conversation
      navigate("/conversation?lesson=first");
    } catch (error) {
      console.error("Setup error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Starting anyway...",
        variant: "destructive",
      });
      // Navigate anyway
      navigate("/conversation?lesson=first");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
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

        <h1 className="text-3xl font-bold mb-2">What's your level?</h1>
        <p className="text-muted-foreground mb-8">Choose the level that best describes you</p>

        {/* Level Cards */}
        <div className="space-y-4 mb-8">
          {levels.map((level) => (
            <Card
              key={level.level}
              onClick={() => setSelected(level.level)}
              className={`p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                selected === level.level
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-accent"
              }`}
            >
              <div className="font-bold text-xl mb-2">{level.title}</div>
              <div className={selected === level.level ? "text-primary-foreground/90" : "text-muted-foreground"}>
                {level.description}
              </div>
            </Card>
          ))}
        </div>

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
  );
};

export default SelectLevel;
