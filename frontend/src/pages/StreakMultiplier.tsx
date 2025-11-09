import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import streakMultiplierImage from "@/assets/streak-multiplier.png";

const StreakMultiplier = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/sponsor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Image - Reduced by 25% */}
        <div className="flex justify-center">
          <img
            src={streakMultiplierImage}
            alt="Streak multiplier"
            className="w-60 h-60 object-contain animate-fade-in"
          />
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Build your streak
          </h1>
          <p className="text-lg text-muted-foreground">
            The longer your daily streak, the higher the payout rewards
          </p>
        </div>

        {/* Streak Info */}
        <div className="space-y-3 text-left bg-card/50 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-foreground">Daily streak</p>
              <p className="text-sm text-muted-foreground">Practice every day to keep your streak alive</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-semibold text-foreground">Multiplier rewards</p>
              <p className="text-sm text-muted-foreground">1x → 3x → 6x rewards as you progress</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-foreground">30-day goal</p>
              <p className="text-sm text-muted-foreground">Reach maximum rewards with a 30-day streak</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full h-12 text-lg"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StreakMultiplier;
