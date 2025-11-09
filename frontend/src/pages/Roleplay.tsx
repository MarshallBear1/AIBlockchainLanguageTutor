import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const scenarios = [
  {
    id: "coffee",
    emoji: "☕",
    title: "Coffee Shop",
    description: "Order your favorite drink and chat with the barista",
  },
  {
    id: "interview",
    emoji: "💼",
    title: "Job Interview",
    description: "Practice professional conversation and answer questions",
  },
  {
    id: "plans",
    emoji: "📅",
    title: "Making Plans",
    description: "Arrange to meet with friends and discuss activities",
  },
  {
    id: "shopping",
    emoji: "🛍️",
    title: "Shopping",
    description: "Browse and buy items at a local store",
  },
  {
    id: "doctor",
    emoji: "🏥",
    title: "Doctor's Office",
    description: "Describe symptoms and understand medical advice",
  },
  {
    id: "taxi",
    emoji: "🚕",
    title: "Taxi Ride",
    description: "Give directions and chat with the driver",
  },
];

const Roleplay = () => {
  const navigate = useNavigate();

  const handleScenarioClick = (scenario: typeof scenarios[0]) => {
    localStorage.setItem("lessonGoal", scenario.description);
    navigate(`/conversation?roleplay=${scenario.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Roleplay Scenarios</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              onClick={() => handleScenarioClick(scenario)}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="text-5xl mb-3">{scenario.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
              <p className="text-muted-foreground text-sm">{scenario.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roleplay;
