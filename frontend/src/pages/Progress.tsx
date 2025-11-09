import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import BottomTabBar from "@/components/BottomTabBar";

const Progress = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Progress</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">Coming soon!</p>
          <p>Your learning progress will be tracked here</p>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Progress;
