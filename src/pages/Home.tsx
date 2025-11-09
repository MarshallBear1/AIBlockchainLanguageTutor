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
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
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
      
      // Find first unit with incomplete lessons
      const firstIncompleteUnit = loadedUnits.findIndex(unit => 
        unit.lessons.some(lesson => !lesson.completed)
      );
      setCurrentUnitIndex(firstIncompleteUnit >= 0 ? firstIncompleteUnit : 0);
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
          
          const firstIncomplete = updatedUnits.findIndex(unit => 
            unit.lessons.some(lesson => !lesson.completed)
          );
          setCurrentUnitIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
        }
      }
    };
    
    loadProgress();
  }, []);

  const currentUnit = units[currentUnitIndex];
  
  // Calculate relative unit number (1-based for current level)
  const relativeUnitNumber = currentUnitIndex + 1;

  if (loading || !currentUnit) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const completedCount = currentUnit.lessons.filter((l) => l.completed).length;
  const progress = (completedCount / currentUnit.lessons.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      {/* Simple Unit Header */}
      <div className="text-center px-6 py-6 border-b border-border">
        <h1 className="text-2xl font-bold mb-1">Unit {relativeUnitNumber}</h1>
        <p className="text-base text-muted-foreground">{currentUnit.description}</p>
      </div>

      {/* Lesson Path */}
      <main className="flex-1 pb-24 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto">
          <LessonPath lessons={currentUnit.lessons} />
        </div>
      </main>

      {/* Unit Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentUnitIndex(Math.max(0, currentUnitIndex - 1))}
            disabled={currentUnitIndex === 0}
            className="px-6 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Previous Unit
          </button>
          
          <div className="text-sm text-muted-foreground">
            Unit {currentUnitIndex + 1} of {units.length}
          </div>
          
          <button
            onClick={() => setCurrentUnitIndex(Math.min(units.length - 1, currentUnitIndex + 1))}
            disabled={currentUnitIndex === units.length - 1}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Next Unit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
