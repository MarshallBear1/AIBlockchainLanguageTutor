import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, HelpCircle, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";
import { AvatarChatProvider, useAvatarChat } from "@/hooks/useAvatarChat";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import HelpSheet from "@/components/HelpSheet";
import WordBankSheet from "@/components/WordBankSheet";
import ConversationBubble from "@/components/ConversationBubble";
import { completeLesson, units } from "@/data/lessonData";
import { RewardScreen } from "@/components/RewardScreen";
import { awardLessonCompletion } from "@/utils/wallet";

const ConversationContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  const [showWordBank, setShowWordBank] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [showReward, setShowReward] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isFinalMessage, setIsFinalMessage] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Avatar chat context
  const { chat, loading, conversationHistory, message, stopSpeaking } = useAvatarChat();
  
  // Voice recording
  const { state: recordingState, startRecording, stopRecording, error: recordingError } = useVoiceRecording();

  // Get lesson context from URL
  const isCustom = searchParams.get("custom") === "true";
  const lessonIdParam = searchParams.get("lesson");
  const roleplayId = searchParams.get("roleplay");

  // Find the actual lesson from lesson data
  const getLessonInfo = () => {
    if (isCustom) {
      return {
        goal: localStorage.getItem("lessonGoal") || "Custom conversation",
        scenario: localStorage.getItem("lessonGoal") || "Custom conversation",
        learningGoals: undefined,
      };
    }

    if (lessonIdParam) {
      const lessonId = parseInt(lessonIdParam);
      // Find lesson in units
      for (const unit of units) {
        const lesson = unit.lessons.find(l => l.id === lessonId);
        if (lesson) {
          return {
            goal: lesson.title,
            scenario: lesson.scenario,
            learningGoals: lesson.learningGoals,
          };
        }
      }
    }

    return {
      goal: "Conversation",
      scenario: "Have a natural conversation practice",
      learningGoals: undefined,
    };
  };

  const lessonInfo = getLessonInfo();
  const lessonGoal = lessonInfo.goal;
  const lessonScenario = lessonInfo.scenario;
  const learningGoals = lessonInfo.learningGoals;

  // Auto-start conversation with GEM speaking first
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      // Trigger AI to speak first with lesson scenario and learning goals
      chat("START_CONVERSATION", true, lessonScenario, learningGoals);
    }
  }, [isFirstLoad]); // Only run once on mount

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Show recording error as toast
  useEffect(() => {
    if (recordingError) {
      toast({
        title: "Microphone Error",
        description: recordingError,
        variant: "destructive",
      });
    }
  }, [recordingError, toast]);

  // Detect when GEM says "Great job today!" to mark as final message
  useEffect(() => {
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      
      // Check if GEM's last message contains the completion phrase
      if (
        lastMessage.role === "assistant" &&
        lastMessage.text.includes("Great job today!")
      ) {
        setIsFinalMessage(true);
        
        // Auto-trigger completion only after avatar finishes speaking
        if (message === null) {
          setTimeout(() => {
            handleEndConversation();
          }, 2000);
        }
      }
    }
  }, [conversationHistory, message]);

  const handleEndConversation = () => {
    // Check if lesson is actually complete (GEM said "Great job today!")
    const isLessonComplete = conversationHistory.length > 0 &&
      conversationHistory[conversationHistory.length - 1].role === "assistant" &&
      conversationHistory[conversationHistory.length - 1].text.includes("Great job today!");

    // Stop any current speech
    stopSpeaking();

    // Mark lesson as complete if this is a lesson conversation AND it's actually complete
    const currentLessonId = localStorage.getItem("currentLessonId");
    if (currentLessonId && isLessonComplete) {
      const lessonNum = parseInt(currentLessonId);
      if (!isNaN(lessonNum)) {
        // Complete the lesson
        completeLesson(lessonNum);

        // Award coins
        const wallet = awardLessonCompletion();
        setCoinsEarned(50); // 50 coins per lesson

        // Show reward screen
        setShowReward(true);
        return;
      }
    }

    // If lesson is not complete but they're trying to exit, show warning
    if (currentLessonId && !isLessonComplete) {
      setShowExitWarning(true);
      return;
    }

    // If not a lesson, just navigate back
    navigate("/home");
  };

  const handleConfirmExit = () => {
    setShowExitWarning(false);
    navigate("/home");
  };

  const handleCancelExit = () => {
    setShowExitWarning(false);
  };

  const handleRewardContinue = () => {
    setShowReward(false);
    navigate("/home");
  };

  const handleVoiceStart = async () => {
    if (recordingState === "idle") {
      // Start recording when button is pressed
      const success = await startRecording();
      if (!success) {
        toast({
          title: "Error",
          description: "Could not start recording. Please check microphone permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const handleVoiceEnd = async () => {
    if (recordingState === "recording") {
      // Stop recording and process when button is released
      const audioBase64 = await stopRecording();
      if (audioBase64) {
        try {
          // Get auth session for authenticated function calls
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !session) {
            toast({
              title: "Authentication Error",
              description: "Please log in again to continue.",
              variant: "destructive",
            });
            navigate("/auth");
            return;
          }

          // Transcribe audio to text with multilingual support
          const selectedLanguage = localStorage.getItem("selectedLanguage") || "es";
          const { data, error } = await supabase.functions.invoke("voice-to-text", {
            body: {
              audio: audioBase64,
              language: selectedLanguage
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) throw error;

          const transcribedText = data?.text;
          if (transcribedText && transcribedText.trim()) {
            // Send to AI chat with lesson scenario and learning goals
            await chat(transcribedText, false, lessonScenario, learningGoals);
          } else {
            toast({
              title: "No Speech Detected",
              description: "I didn't hear anything. Please try again.",
            });
          }
        } catch (err) {
          console.error("Voice processing error:", err);
          toast({
            title: "Error",
            description: "Failed to process voice input. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!textMessage.trim()) return;

    try {
      await chat(textMessage, false, lessonScenario, learningGoals);
      setTextMessage("");
    } catch (err) {
      console.error("Text chat error:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-background border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/home")}>
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 3D Avatar Section - Upper portion */}
        <div className="relative w-full h-[28vh] flex-shrink-0">
          <AvatarCanvas className="absolute inset-0 w-full h-full" />
        </div>

        {/* Chat History Section - Scrollable */}
        <div 
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        >
          {conversationHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[150px]">
              <p className="text-center text-muted-foreground text-sm">
                Your conversation will appear here
              </p>
            </div>
          ) : (
            conversationHistory.map((msg, idx) => (
              <ConversationBubble
                key={idx}
                role={msg.role}
                text={msg.text}
                timestamp={msg.timestamp}
              />
            ))
          )}
        </div>
      </main>

      {/* Bottom Controls - Fixed at 336px height */}
      <div className="flex-shrink-0 p-3 space-y-2 border-t border-border bg-background overflow-y-auto" style={{ height: '336px' }}>
        {/* Text Input - Always Visible */}
        <div className="flex gap-2">
          <Input
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
            placeholder="Type your message..."
            className="flex-1"
            disabled={loading || recordingState !== "idle"}
          />
          <Button
            onClick={handleTextSubmit}
            disabled={!textMessage.trim() || loading || recordingState !== "idle"}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Input Button - Push to Talk */}
        <Button
          onPointerDown={handleVoiceStart}
          onPointerUp={handleVoiceEnd}
          onPointerLeave={handleVoiceEnd}
          disabled={loading || recordingState === "processing"}
          size="lg"
          className={`w-full h-12 transition-all touch-none select-none ${
            recordingState === "recording"
              ? "bg-destructive hover:bg-destructive/90 animate-pulse"
              : ""
          }`}
        >
          {recordingState === "processing" ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : recordingState === "recording" ? (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Recording... (Release to send)
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Hold to Speak
            </>
          )}
        </Button>

        {/* Status Text */}
        <div className="text-center text-xs text-muted-foreground">
          {loading && "Gem is thinking..."}
          {!loading && recordingState === "idle" && "Type or hold button to speak"}
          {recordingState === "recording" && "🎤 Listening..."}
        </div>

        {/* Help & Word Bank */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowHelp(true)}
            variant="outline"
            className="flex-1 gap-1 h-9 text-xs"
            size="sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            I'm stuck
          </Button>

          <Button
            onClick={() => setShowWordBank(true)}
            variant="outline"
            className="flex-1 gap-1 h-9 text-xs"
            size="sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Word Bank
          </Button>
        </div>

        {/* End Conversation */}
        <Button
          onClick={handleEndConversation}
          variant="outline"
          className="w-full h-9 text-sm"
          disabled={isFinalMessage && message !== null}
        >
          {isFinalMessage && message !== null ? "GEM is finishing..." : "End Conversation"}
        </Button>
      </div>

      <HelpSheet open={showHelp} onOpenChange={setShowHelp} />
      <WordBankSheet open={showWordBank} onOpenChange={setShowWordBank} />

      {/* Reward Screen */}
      {showReward && (
        <RewardScreen coinsEarned={coinsEarned} onContinue={handleRewardContinue} />
      )}

      {/* Exit Warning Dialog */}
      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End lesson early?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't finished this lesson yet. If you leave now, you won't earn any Vibe Coins and will need to redo the lesson from the start.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelExit}>
              Keep Learning
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              Leave Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Conversation = () => {
  return (
    <AvatarChatProvider>
      <ConversationContent />
    </AvatarChatProvider>
  );
};

export default Conversation;
