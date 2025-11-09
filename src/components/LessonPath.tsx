import { useNavigate } from "react-router-dom";
import { Lock, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from "@/data/lessonData";

interface LessonPathProps {
  lessons: Lesson[];
}

export const LessonPath = ({ lessons }: LessonPathProps) => {
  const navigate = useNavigate();

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.locked) return;

    // Set lesson goal
    localStorage.setItem("lessonGoal", lesson.scenario);
    localStorage.setItem("currentLessonId", lesson.id.toString());

    // Navigate to conversation with lesson context
    navigate(`/conversation?lesson=${lesson.id}`);
  };

  return (
    <div className="relative max-w-2xl mx-auto py-8">
      {/* Path connector line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent -translate-x-1/2 -z-10" />

      {/* Lessons */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={lesson.id}
              className={cn(
                "flex items-center gap-4",
                isEven ? "flex-row" : "flex-row-reverse"
              )}
            >
              {/* Lesson Card */}
              <div className={cn("flex-1", isEven ? "text-right pr-4" : "text-left pl-4")}>
                <div
                  className={cn(
                    "inline-block p-4 rounded-xl transition-all duration-300",
                    lesson.locked
                      ? "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60"
                      : lesson.completed
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-pointer hover:scale-105 shadow-md"
                      : "bg-primary/10 text-primary cursor-pointer hover:scale-105 shadow-lg hover:shadow-xl border-2 border-primary",
                    !lesson.locked && "hover:bg-primary/20"
                  )}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div className={cn("space-y-1", isEven ? "text-right" : "text-left")}>
                    <div className="text-sm font-medium text-muted-foreground">
                      Lesson {lesson.id}
                    </div>
                    <div className="text-lg font-bold">{lesson.title}</div>
                    <div className="text-sm opacity-80">{lesson.description}</div>
                  </div>
                </div>
              </div>

              {/* Lesson Circle */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-300",
                    lesson.locked
                      ? "bg-gray-300 dark:bg-gray-700"
                      : lesson.completed
                      ? "bg-gradient-to-br from-green-400 to-green-600 shadow-green-200 dark:shadow-green-900"
                      : "bg-gradient-to-br from-primary to-purple-600 shadow-primary/50 animate-pulse"
                  )}
                  onClick={() => handleLessonClick(lesson)}
                >
                  {lesson.locked ? (
                    <Lock className="w-6 h-6 text-white" />
                  ) : lesson.completed ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : lesson.id % 10 === 0 ? (
                    <Star className="w-8 h-8 text-white fill-white" />
                  ) : (
                    lesson.emoji
                  )}
                </div>

                {/* Progress indicator for current lesson */}
                {!lesson.locked && !lesson.completed && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping" />
                )}
              </div>

              {/* Empty spacer for other side */}
              <div className="flex-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
