import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RewardScreenProps {
  coinsEarned: number;
  onContinue: () => void;
}

export const RewardScreen = ({ coinsEarned, onContinue }: RewardScreenProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, type: "spring" }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Close Button */}
        <Button
          onClick={onContinue}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          {/* Reward Image */}
          <motion.img
            src="https://customer-assets.emergentagent.com/job_code-lens-3/artifacts/n2857u99_image.png"
            alt="Reward"
            className="w-64 h-64 object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          />

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold text-foreground">
              Good job! You earned
            </h2>
            <p className="text-5xl font-black text-primary">
              {coinsEarned} coins
            </p>
          </motion.div>

          {/* Close Button at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full pt-4"
          >
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full h-12 text-lg rounded-full font-semibold"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
