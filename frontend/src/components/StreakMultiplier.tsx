import React from "react";

const LEVELS = [1, 3, 6]; // days (or levels)

type Props = {
  streakDays: number; // e.g. 1, 2, 4, 7...
};

export const StreakMultiplier: React.FC<Props> = ({ streakDays }) => {
  // pick the highest level the user has reached
  const currentIndex = LEVELS.reduce(
    (idx, level, i) => (streakDays >= level ? i : idx),
    0
  );
  const currentLevel = LEVELS[currentIndex];

  // whatever mapping you want:
  // 1 day -> 1.0x, 3 days -> 1.2x, 6 days -> 1.5x
  const multiplierMap: Record<number, number> = {
    1: 1.0,
    3: 1.2,
    6: 1.5,
  };
  const multiplier = multiplierMap[currentLevel] ?? 1.0;

  // arrow position in % along the bar
  const arrowLeft = (currentIndex / (LEVELS.length - 1)) * 100;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-700">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Streak Multiplier</div>

      <div className="mt-2 text-3xl font-semibold text-orange-500">
        {multiplier.toFixed(1)}x
      </div>

      <div className="mt-1 text-xs text-slate-400">
        {streakDays}-day streak
      </div>

      {/* Lever */}
      <div className="mt-4">
        <div className="relative h-8">
          {/* bar */}
          <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 bg-slate-900 dark:bg-slate-300 rounded-full" />

          {/* arrow */}
          <div
            className="absolute -top-1 h-4 w-5"
            style={{ left: `${arrowLeft}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[12px] border-l-transparent border-r-transparent border-b-slate-900 dark:border-b-slate-300" />
          </div>

          {/* labels */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-slate-900 dark:text-slate-300">
            {LEVELS.map((level) => (
              <span key={level}>{level}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
