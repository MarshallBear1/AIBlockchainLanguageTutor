import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import tokiBlink1 from "@/assets/toki-blink-1.png";
import tokiBlink2 from "@/assets/toki-blink-2.png";

interface TokiMascotProps {
  state?: "idle" | "speaking" | "listening" | "flicker";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TokiMascot = ({ state = "idle", size = "md", className }: TokiMascotProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  const animationClasses = {
    idle: "animate-bounce-soft",
    speaking: "animate-pulse-soft",
    listening: "animate-glow",
    flicker: "",
  };

  useEffect(() => {
    if (state === "flicker") {
      const interval = setInterval(() => {
        setCurrentImage((prev) => {
          const next = prev === 0 ? 1 : 0;
          return next;
        });
      }, currentImage === 0 ? 2000 : 1000);

      return () => clearInterval(interval);
    }
  }, [state, currentImage]);

  if (state === "flicker") {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <img
          src={currentImage === 0 ? tokiBlink1 : tokiBlink2}
          alt="Toki"
          className={cn(sizeClasses[size], "object-contain")}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold transition-all duration-300",
          sizeClasses[size],
          animationClasses[state]
        )}
      >
        {/* Loading indicator without emoji */}
      </div>
    </div>
  );
};

export default TokiMascot;
