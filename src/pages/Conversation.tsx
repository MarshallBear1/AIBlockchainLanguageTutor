import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";
import HelpSheet from "@/components/HelpSheet";
import WordBankSheet from "@/components/WordBankSheet";

const Conversation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showHelp, setShowHelp] = useState(false);
  const [showWordBank, setShowWordBank] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Get lesson context from URL
  const isCustom = searchParams.get("custom") === "true";
  const lessonId = searchParams.get("lesson");
  const roleplayId = searchParams.get("roleplay");

  const lessonGoal = isCustom 
    ? localStorage.getItem("lessonGoal") || "Custom conversation"
    : lessonId 
      ? `Lesson: ${lessonId}`
      : roleplayId 
        ? `Roleplay: ${roleplayId}`
        : "Conversation";

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndConversation = () => {
    // TODO: Save session to database
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <p className="text-sm text-muted-foreground flex-1 text-center px-4 truncate">
            {lessonGoal.length > 40 ? lessonGoal.slice(0, 40) + "..." : lessonGoal}
          </p>
          
          <Button variant="ghost" size="icon">
            <BookOpen className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        {/* 3D Avatar Canvas */}
        <AvatarCanvas className="absolute inset-0 w-full h-full" />

        {/* Overlay UI */}
        <div className="relative z-10 w-full flex flex-col items-center justify-end h-full pb-6">
          <div className="text-2xl font-semibold text-white bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
            {formatTime(timeLeft)} left
          </div>
        </div>
      </main>

      {/* Bottom Controls */}
      <div className="p-6 space-y-3">
        <Button
          onClick={handleEndConversation}
          variant="outline"
          className="w-full h-12 text-lg rounded-full"
          size="lg"
        >
          End Conversation
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowHelp(true)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            I'm stuck
          </Button>

          <Button
            onClick={() => setShowWordBank(true)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Word Bank
          </Button>
        </div>
      </div>

      <HelpSheet open={showHelp} onOpenChange={setShowHelp} />
      <WordBankSheet open={showWordBank} onOpenChange={setShowWordBank} />
    </div>
  );
};

export default Conversation;
