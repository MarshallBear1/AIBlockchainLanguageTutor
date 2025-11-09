import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { LessonPath } from "@/components/LessonPath";
import { getUnitsWithProgress, Unit } from "@/data/lessonData";
import { supabase } from "@/integrations/supabase/client";

const levelNames: Record<number, string> = {
  1: "Beginner",
  2: "Survival",
  3: "Conversational",
  4: "Proficient",
  5: "Fluent"
};

const Home = () => {
  const [userLevel, setUserLevel] = useState<number>(1);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      
      // Get user's level from localStorage first
      const savedLevel = parseInt(localStorage.getItem("selectedLevel") || "1");
      setUserLevel(savedLevel);
      
      // Load units with progress from database
      const loadedUnits = await getUnitsWithProgress(savedLevel);
      setUnits(loadedUnits);
      setLoading(false);
      
      // Then sync from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("selected_level")
          .eq("id", user.id)
          .single();
          
        if (data?.selected_level && data.selected_level !== savedLevel) {
          setUserLevel(data.selected_level);
          localStorage.setItem("selectedLevel", data.selected_level.toString());
          
          const updatedUnits = await getUnitsWithProgress(data.selected_level);
          setUnits(updatedUnits);
        }
      }
    };
    
    loadProgress();
  }, []);

  if (loading || units.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      {/* Lesson Path - Scrollable */}
      <main className="flex-1 overflow-y-auto bg-background pb-8">
        <div className="max-w-4xl mx-auto space-y-12 py-6">
          {units.map((unit, index) => {
            const completedCount = unit.lessons.filter((l) => l.completed).length;
            const progress = (completedCount / unit.lessons.length) * 100;
            const relativeUnitNumber = index + 1;

            return (
              <div key={unit.id} className="space-y-4">
                {/* Unit Header */}
                <div className="text-center px-6 py-6 bg-card border border-border rounded-2xl shadow-sm">
                  <h2 className="text-2xl font-bold mb-1">Unit {relativeUnitNumber}</h2>
                  <p className="text-base text-muted-foreground mb-4">{unit.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 max-w-md mx-auto">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress === 100
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gradient-to-r from-primary to-purple-600"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {completedCount}/{unit.lessons.length}
                    </span>
                  </div>
                </div>

                {/* Lessons */}
                <LessonPath lessons={unit.lessons} />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
