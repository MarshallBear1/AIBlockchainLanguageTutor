import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TokiMascot from "@/components/TokiMascot";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <TokiMascot state="idle" size="lg" />
    </div>
  );
};

export default Splash;
