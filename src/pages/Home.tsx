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
            const relativeUnitNumber = index + 1;

            return (
              <div key={unit.id} className="space-y-4">
                {/* Unit Header */}
                <div className="text-center px-6">
                  <h2 className="text-2xl font-bold mb-1">Unit {relativeUnitNumber}</h2>
                  <p className="text-base text-muted-foreground">{unit.description}</p>
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
