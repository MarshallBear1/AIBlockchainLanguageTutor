import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import vibeconLogo from "@/assets/vibecon-sponsor.png";

const Sponsor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-advance after 3 seconds
    const timer = setTimeout(() => {
      navigate("/conversation?lesson=first");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate("/conversation?lesson=first");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground animate-fade-in">
          Our sponsor for this month is
        </h1>

        {/* VibeCoin Logo */}
        <div className="flex justify-center animate-scale-in">
          <img
            src={vibeconLogo}
            alt="VibeCoin"
            className="w-72 h-72 object-contain"
          />
        </div>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground animate-fade-in">
          Powering your learning rewards
        </p>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default Sponsor;
