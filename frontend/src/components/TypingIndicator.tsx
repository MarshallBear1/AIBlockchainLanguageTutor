import { useEffect, useState } from "react";

export const TypingIndicator = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 400); // Change dots every 400ms

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="animate-pulse">{dots}</span>
    </span>
  );
};
