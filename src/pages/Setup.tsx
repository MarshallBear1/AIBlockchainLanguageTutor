import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Setup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 transition-all" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-8" />
          <h1 className="text-3xl font-bold mb-4">We're setting everything up for you</h1>
          <p className="text-lg text-muted-foreground">Customizing your Toki conversations…</p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
