import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const surpriseTopics = [
  "Order a croissant at a bakery",
  "Ask for directions to the museum",
  "Book a hotel room",
  "Compliment someone's outfit",
  "Talk about the weather",
  "Discuss your favorite hobby",
  "Order at a local restaurant",
  "Make a doctor's appointment",
  "Ask about public transportation",
];

const CustomLesson = () => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");

  const handleSurprise = () => {
    const randomTopic = surpriseTopics[Math.floor(Math.random() * surpriseTopics.length)];
    setGoal(randomTopic);
  };

  const handleStart = () => {
    if (goal.trim()) {
      localStorage.setItem("lessonGoal", goal);
      navigate("/conversation?custom=true");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/lessons")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSurprise}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Surprise me
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Custom Lesson</h1>

        <div className="space-y-4">
          <Label htmlFor="goal" className="text-lg font-semibold">
            Set your goal
          </Label>
          <Textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to learn? e.g. 'Order a croissant at a bakery'"
            className="min-h-32 text-base"
          />

          <Button
            onClick={handleStart}
            disabled={!goal.trim()}
            className="w-full h-12 text-lg"
            size="lg"
          >
            Start Lesson
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomLesson;
