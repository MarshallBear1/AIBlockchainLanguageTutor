import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RewardScreenProps {
  coinsEarned: number;
  onContinue: () => void;
}

export const RewardScreen = ({ coinsEarned, onContinue }: RewardScreenProps) => {
  const [showCoins, setShowCoins] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Animate coin counter
    const timeout = setTimeout(() => setShowCoins(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (showCoins && count < coinsEarned) {
      const interval = setInterval(() => {
        setCount((prev) => Math.min(prev + 2, coinsEarned));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showCoins, count, coinsEarned]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Celebration Stars */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="flex justify-center"
        >
          <div className="relative">
            <Star className="w-24 h-24 text-blue-500 fill-blue-500" />
            <div className="absolute -top-4 -right-4">
              <Star className="w-12 h-12 text-blue-400 fill-blue-400" />
            </div>
            <div className="absolute -bottom-4 -left-4">
              <Star className="w-12 h-12 text-blue-400 fill-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Good Job Today Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl font-bold text-blue-600 mb-3">
            Good job today!
          </h1>
          <p className="text-xl text-gray-600">You're making great progress! 🎉</p>
        </motion.div>

        {/* Coins Earned */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: showCoins ? 1 : 0 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="bg-blue-50 rounded-3xl p-8 border-4 border-blue-200"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Coins className="w-16 h-16 text-yellow-500" />
            <div className="text-left">
              <p className="text-gray-600 text-sm font-medium">You Earned</p>
              <p className="text-6xl font-bold text-blue-600">{count}</p>
            </div>
          </div>
          <p className="text-blue-700 text-lg font-semibold">Vibe Coins</p>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <div className="bg-blue-100 rounded-xl p-4 flex items-center gap-3 border-2 border-blue-200">
            <Award className="w-6 h-6 text-blue-600" />
            <span className="text-blue-700 font-medium">Lesson Mastered</span>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full h-14 text-lg bg-blue-600 text-white hover:bg-blue-700 rounded-full font-bold shadow-lg"
          >
            Continue Learning
          </Button>
        </motion.div>
      </div>

      {/* Floating Coins Animation */}
      {showCoins && (
        <>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "100vh", x: Math.random() * window.innerWidth, opacity: 0 }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                delay: Math.random() * 0.5,
                duration: 2 + Math.random(),
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
              }}
              className="absolute"
            >
              <Coins className="w-8 h-8 text-blue-500" />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};
