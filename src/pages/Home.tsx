import { useNavigate } from "react-router-dom";
import TokiMascot from "@/components/TokiMascot";
import TopBar from "@/components/TopBar";
import ModeCard from "@/components/ModeCard";
import BottomTabBar from "@/components/BottomTabBar";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      
      <main className="flex-1 p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <TokiMascot state="idle" size="lg" className="mb-6" />
            <h1 className="text-2xl font-bold text-center">Start your learning journey!</h1>
          </div>

          <div className="space-y-4">
            <ModeCard
              emoji="🎓"
              title="Structured Learning"
              description="Progress through levels with GEM as your guide"
              badge="Start Here"
              badgeColor="bg-light-blue text-primary"
              onClick={() => navigate("/lessons")}
              buttonText="Start Learning ›"
            />
          </div>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};

export default Home;
