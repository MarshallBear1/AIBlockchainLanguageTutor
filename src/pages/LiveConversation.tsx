import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";
import { lipsyncManager } from "@/lib/lipsyncManager";

const LiveConversationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const { toast } = useToast();

  const unitNumber = searchParams.get("unit") || "1";
  const language = searchParams.get("language") || localStorage.getItem("selectedLanguage") || "es";
  const level = searchParams.get("level") || localStorage.getItem("selectedLevel") || "1";

  const handleMessage = (event: any) => {
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    } else if (event.type === 'error') {
      console.error('Realtime API error:', event);
      toast({
        title: "Error",
        description: "An error occurred during the conversation",
        variant: "destructive",
      });
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      chatRef.current = new RealtimeChat(
        handleMessage, 
        language, 
        level,
        "toki", // mascot
        "practice", // scenario
        () => {
          // Connect lipsync when audio is ready
          const audioElement = chatRef.current?.getAudioElement();
          if (audioElement) {
            lipsyncManager.connectAudio(audioElement);
            console.log("Connected lipsync manager to realtime audio");
          }
        }
      );
      await chatRef.current.init();

      setIsConnected(true);
      setIsConnecting(false);

      toast({
        title: "Connected!",
        description: "Start speaking to practice",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    navigate("/home");
  };

  useEffect(() => {
    // Auto-start conversation when page loads
    startConversation();

    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 via-background to-background relative overflow-hidden">
      {/* Avatar - Full screen call view */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AvatarCanvas className="absolute inset-0 w-full h-full" initialZoom={true} />
      </div>

      {/* Top Status Bar */}
      <div className="relative z-10 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm p-6">
        <div className="flex flex-col items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <h1 className="text-2xl font-bold text-foreground">
            {isConnecting ? "Connecting to Toki..." : isConnected ? "Call with Toki" : "Connection Error"}
          </h1>
          {isConnected && (
            <p className="text-sm text-muted-foreground">
              {isSpeaking ? "Toki is speaking..." : "Listening..."}
            </p>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            <p className="text-xl font-medium">Connecting to Toki...</p>
            <p className="text-sm text-muted-foreground">This will just take a moment</p>
          </div>
        </div>
      )}

      {/* Bottom Call Controls */}
      {isConnected && (
        <div className="relative z-10 mt-auto bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm p-8">
          <div className="max-w-md mx-auto space-y-4">
            {/* Status Indicator */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                isSpeaking 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-primary/20 border border-primary/50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-primary'} ${isSpeaking ? 'animate-pulse' : ''}`} />
                <span className="font-medium text-sm">
                  {isSpeaking ? "Toki is speaking" : "You can speak now"}
                </span>
              </div>
            </div>

            {/* End Call Button */}
            <div className="flex justify-center">
              <Button
                onClick={endConversation}
                size="lg"
                className="rounded-full w-16 h-16 bg-destructive hover:bg-destructive/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <X className="w-8 h-8" />
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Tap to end call
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveConversationPage;
