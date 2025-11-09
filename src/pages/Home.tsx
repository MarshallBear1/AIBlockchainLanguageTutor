import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { LessonPath } from "@/components/LessonPath";
import { getUnitsWithProgress } from "@/data/lessonData";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getWallet } from "@/utils/wallet";

const levelNames: Record<number, string> = {
  1: "Beginner",
  2: "Survival",
  3: "Conversational",
  4: "Proficient",
  5: "Fluent"
};

const Home = () => {
  const [userLevel, setUserLevel] = useState<number>(1);
  const [units, setUnits] = useState(getUnitsWithProgress(1));
  const [expandedUnits, setExpandedUnits] = useState<number[]>([1]); // First unit expanded by default

  useEffect(() => {
    // Get user's level from localStorage first
    const savedLevel = parseInt(localStorage.getItem("selectedLevel") || "1");
    setUserLevel(savedLevel);
    setUnits(getUnitsWithProgress(savedLevel));
    
    // Then sync from Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("profiles").select("selected_level").eq("id", user.id).single()
          .then(({ data }) => {
            if (data?.selected_level) {
              setUserLevel(data.selected_level);
              localStorage.setItem("selectedLevel", data.selected_level.toString());
              setUnits(getUnitsWithProgress(data.selected_level));
            }
          });
      }
    });
  }, []);

  const toggleUnit = (unitId: number) => {
    setExpandedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      <main className="flex-1 p-4 pb-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-4">
            <h1 className="text-3xl font-bold mb-2">{levelNames[userLevel]} Learning Path</h1>
            <p className="text-muted-foreground">Complete lessons to unlock new adventures</p>
          </div>

          {/* Units */}
          <div className="space-y-6">
            {units.map((unit) => {
              const isExpanded = expandedUnits.includes(unit.id);
              const completedCount = unit.lessons.filter((l) => l.completed).length;
              const progress = (completedCount / unit.lessons.length) * 100;

              return (
                <div
                  key={unit.id}
                  className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-lg"
                >
                  {/* Unit Header */}
                  <Button
                    variant="ghost"
                    className="w-full p-6 h-auto flex items-center justify-between hover:bg-accent"
                    onClick={() => toggleUnit(unit.id)}
                  >
                    <div className="text-left flex-1">
                      <h2 className="text-xl font-bold mb-1">{unit.title}</h2>
                      <p className="text-sm text-muted-foreground">{unit.description}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              progress === 100
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-primary to-purple-600"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                          {completedCount}/{unit.lessons.length}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 ml-4" />
                    ) : (
                      <ChevronDown className="w-6 h-6 ml-4" />
                    )}
                  </Button>

                  {/* Unit Lessons */}
                  {isExpanded && (
                    <div className="border-t border-border bg-background/50 p-4">
                      <LessonPath lessons={unit.lessons} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Motivational Footer */}
          <div className="mt-12 text-center text-muted-foreground">
            <p className="text-sm">Keep going! You're doing great! 🌟</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
