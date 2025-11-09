import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import earnWhileLearnImage from "@/assets/earn-while-learn.png";

const EarnWhileLearn = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/streak-multiplier");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Image */}
        <div className="flex justify-center">
          <img
            src={earnWhileLearnImage}
            alt="Earn while you learn"
            className="w-64 h-64 object-contain animate-fade-in"
          />
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Earn while you learn
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete lessons and earn VIBE coins that you can withdraw to your wallet
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 text-left bg-card/50 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-foreground">Complete 5 lessons</p>
              <p className="text-sm text-muted-foreground">Finish a learning cycle to earn rewards</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-semibold text-foreground">Earn VIBE coins</p>
              <p className="text-sm text-muted-foreground">Get crypto rewards for your progress</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔗</span>
            <div>
              <p className="font-semibold text-foreground">Withdraw to wallet</p>
              <p className="text-sm text-muted-foreground">Connect your wallet and cash out anytime</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full h-12 text-lg"
          size="lg"
        >
          Meet Toki, your AI tutor
        </Button>
      </div>
    </div>
  );
};

export default EarnWhileLearn;
