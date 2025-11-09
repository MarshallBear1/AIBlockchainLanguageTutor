import { cn } from "@/lib/utils";

interface TokiMascotProps {
  state?: "idle" | "speaking" | "listening";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TokiMascot = ({ state = "idle", size = "md", className }: TokiMascotProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  const animationClasses = {
    idle: "animate-bounce-soft",
    speaking: "animate-pulse-soft",
    listening: "animate-glow",
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold transition-all duration-300",
          sizeClasses[size],
          animationClasses[state]
        )}
      >
        <span className="text-4xl">🦜</span>
      </div>
    </div>
  );
};

export default TokiMascot;
