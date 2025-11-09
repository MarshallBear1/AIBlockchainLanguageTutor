import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, HelpCircle, Mic, Send, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";
import { AvatarChatProvider, useAvatarChat } from "@/hooks/useAvatarChat";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import HelpSheet from "@/components/HelpSheet";
import WordBankSheet from "@/components/WordBankSheet";
import ConversationBubble from "@/components/ConversationBubble";
import { completeLesson } from "@/data/lessonData";
import { RewardScreen } from "@/components/RewardScreen";
import { awardLessonCompletion } from "@/utils/wallet";

const ConversationContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  const [showWordBank, setShowWordBank] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [showReward, setShowReward] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Avatar chat context
  const { chat, loading, conversationHistory } = useAvatarChat();
  
  // Voice recording
  const { state: recordingState, startRecording, stopRecording, error: recordingError } = useVoiceRecording();

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

  const handleEndConversation = () => {
    // Mark lesson as complete if this is a lesson conversation
    const currentLessonId = localStorage.getItem("currentLessonId");
    if (currentLessonId) {
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

    // If not a lesson, just navigate back
    navigate("/home");
  };

  const handleRewardContinue = () => {
    setShowReward(false);
    navigate("/home");
  };

  const handleVoiceInput = async () => {
    if (recordingState === "idle") {
      // Start recording
      const success = await startRecording();
      if (!success) {
        toast({
          title: "Error",
          description: "Could not start recording. Please check microphone permissions.",
          variant: "destructive",
        });
      }
    } else if (recordingState === "recording") {
      // Stop recording and process
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
          
          // Transcribe audio to text
          const { data, error } = await supabase.functions.invoke("voice-to-text", {
            body: { audio: audioBase64 },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) throw error;

          const transcribedText = data?.text;
          if (transcribedText && transcribedText.trim()) {
            // Send to AI chat
            await chat(transcribedText);
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
      await chat(textMessage);
      setTextMessage("");
      setShowTextInput(false);
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
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* 3D Avatar Section - Upper portion */}
        <div className="relative w-full h-[35vh] md:h-[40vh] flex-shrink-0">
          <AvatarCanvas className="absolute inset-0 w-full h-full" />
        </div>

        {/* Chat History Section - Below Avatar */}
        <div className="flex-1 flex flex-col bg-background px-4 pb-2 overflow-hidden">
          <ScrollArea className="flex-1 rounded-lg border border-border bg-card/50">
            <div ref={chatScrollRef} className="p-3 space-y-2 min-h-full">
              {conversationHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[150px]">
                  <p className="text-center text-muted-foreground text-sm">
                    Start speaking or typing to begin your conversation
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
          </ScrollArea>
        </div>
      </main>

      {/* Bottom Controls */}
      <div className="p-3 space-y-2 border-t border-border bg-background">
        {/* Voice/Text Input Controls */}
        <div className="flex gap-2 items-center justify-center">
          {/* Voice Input Button */}
          <Button
            onClick={handleVoiceInput}
            disabled={loading || recordingState === "processing"}
            size="lg"
            className={`h-14 w-14 rounded-full transition-all ${
              recordingState === "recording"
                ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {recordingState === "processing" ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          {/* Text Input Button */}
          <Button
            onClick={() => setShowTextInput(true)}
            disabled={loading || recordingState !== "idle"}
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full"
          >
            <Keyboard className="w-5 h-5" />
          </Button>
        </div>

        {/* Status Text */}
        <div className="text-center text-xs text-muted-foreground">
          {recordingState === "idle" && !loading && "Tap mic to speak or keyboard to type"}
          {recordingState === "recording" && "Recording... Tap to stop"}
          {recordingState === "processing" && "Processing your speech..."}
          {loading && "AI is thinking..."}
        </div>

        {/* End Conversation */}
        <Button
          onClick={handleEndConversation}
          variant="outline"
          className="w-full h-10 text-sm rounded-full"
        >
          End Conversation
        </Button>

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
      </div>

      {/* Text Input Sheet */}
      <Sheet open={showTextInput} onOpenChange={setShowTextInput}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Type your message</SheetTitle>
          </SheetHeader>
          <div className="flex gap-2 mt-4">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
              placeholder="Type your message..."
              className="flex-1"
              autoFocus
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textMessage.trim() || loading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <HelpSheet open={showHelp} onOpenChange={setShowHelp} />
      <WordBankSheet open={showWordBank} onOpenChange={setShowWordBank} />

      {/* Reward Screen */}
      {showReward && (
        <RewardScreen coinsEarned={coinsEarned} onContinue={handleRewardContinue} />
      )}
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
