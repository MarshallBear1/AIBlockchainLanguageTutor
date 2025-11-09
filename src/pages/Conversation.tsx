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

const ConversationContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(false);
  const [showWordBank, setShowWordBank] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
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
          // Transcribe audio to text
          const { data, error } = await supabase.functions.invoke("voice-to-text", {
            body: { audio: audioBase64 },
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
      <main className="flex-1 flex flex-col items-center justify-center relative">
        {/* 3D Avatar Canvas */}
        <AvatarCanvas className="absolute inset-0 w-full h-full" />

        {/* Chat History Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10">
          <ScrollArea className="h-[300px] bg-background/80 backdrop-blur-md rounded-2xl shadow-lg border border-border">
            <div ref={chatScrollRef} className="p-4 space-y-2">
              {conversationHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Start speaking or typing to begin your conversation</p>
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

        {/* Timer Badge */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
          <div className="text-lg font-semibold text-foreground bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-md">
            {formatTime(timeLeft)} left
          </div>
        </div>
      </main>

      {/* Bottom Controls */}
      <div className="p-6 space-y-3">
        {/* Voice/Text Input Controls */}
        <div className="flex gap-3 items-center justify-center">
          {/* Voice Input Button */}
          <Button
            onClick={handleVoiceInput}
            disabled={loading || recordingState === "processing"}
            size="lg"
            className={`h-16 w-16 rounded-full transition-all ${
              recordingState === "recording"
                ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {recordingState === "processing" ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* Text Input Button */}
          <Button
            onClick={() => setShowTextInput(true)}
            disabled={loading || recordingState !== "idle"}
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full"
          >
            <Keyboard className="w-6 h-6" />
          </Button>
        </div>

        {/* Status Text */}
        <div className="text-center text-sm text-muted-foreground">
          {recordingState === "idle" && !loading && "Tap mic to speak or keyboard to type"}
          {recordingState === "recording" && "Recording... Tap to stop"}
          {recordingState === "processing" && "Processing your speech..."}
          {loading && "AI is thinking..."}
        </div>

        {/* End Conversation */}
        <Button
          onClick={handleEndConversation}
          variant="outline"
          className="w-full h-12 text-lg rounded-full"
          size="lg"
        >
          End Conversation
        </Button>

        {/* Help & Word Bank */}
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
