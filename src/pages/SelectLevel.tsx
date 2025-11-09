import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const [selected, setSelected] = useState<number>(0);

  const handleNext = () => {
    if (selected) {
      localStorage.setItem("selectedLevel", selected.toString());
      navigate("/select-avatar");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/2 transition-all" />
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

export default SelectLevel;
