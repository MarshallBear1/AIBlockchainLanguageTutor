import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import tokiMascot from "@/assets/toki-mascot.png";

const Sponsor = () => {
  const navigate = useNavigate();

  const handleBegin = () => {
    navigate("/conversation?lesson=first");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Toki Mascot */}
        <div className="flex justify-center">
          <img
            src={tokiMascot}
            alt="Toki"
            className="w-48 h-48 object-contain animate-bounce-soft"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Are you ready to meet your tutor Toki?
        </h1>

        {/* Begin Button */}
        <Button
          onClick={handleBegin}
          size="lg"
          className="w-full max-w-xs mx-auto h-14 text-lg"
        >
          Begin
        </Button>
      </div>
    </div>
  );
};

export default Sponsor;
