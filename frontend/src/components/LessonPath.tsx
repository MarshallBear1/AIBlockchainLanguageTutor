import { useNavigate } from "react-router-dom";
import { Lock, Check, Star, Clock } from "lucide-react";
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
    <div className="relative w-full py-4 px-2">
      {/* Lessons */}
      <div className="space-y-3">
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
              <div className={cn("flex-1 min-w-0", isEven ? "text-right pr-2" : "text-left pl-2")}>
                <div className="inline-block space-y-2">
                  <div
                    className={cn(
                      "p-4 rounded-2xl transition-all duration-300 max-w-full shadow-lg",
                      lesson.locked
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        : lesson.completed
                        ? "bg-green-500 text-white cursor-pointer hover:scale-105"
                        : "bg-primary text-primary-foreground cursor-pointer hover:scale-105 border-2 border-primary-foreground/20",
                      !lesson.locked && "hover:shadow-xl"
                    )}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className={cn("space-y-2", isEven ? "text-right" : "text-left")}>
                      <div className="text-sm font-bold opacity-90">
                        Lesson {lesson.id}
                      </div>
                      <div className="text-lg font-bold leading-tight">{lesson.title}</div>
                      <div className="text-sm opacity-90 leading-snug">{lesson.description}</div>
                    </div>
                  </div>
                  
                  {/* Duration Tag */}
                  <div className={cn("flex", isEven ? "justify-end" : "justify-start")}>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                      <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {lesson.id % 10 === 1 ? "2 min" : "5 min"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Circle */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300",
                    lesson.locked
                      ? "bg-gray-300 dark:bg-gray-700"
                      : lesson.completed
                      ? "bg-gradient-to-br from-green-400 to-green-600 shadow-green-200 dark:shadow-green-900"
                      : "bg-gradient-to-br from-primary to-purple-600 shadow-primary/50"
                  )}
                  onClick={() => handleLessonClick(lesson)}
                >
                  {lesson.locked ? (
                    <Lock className="w-5 h-5 text-white" />
                  ) : lesson.completed ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : lesson.id % 10 === 0 ? (
                    <Star className="w-6 h-6 text-white fill-white" />
                  ) : (
                    lesson.emoji
                  )}
                </div>
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
