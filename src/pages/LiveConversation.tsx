import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import { AvatarCanvas } from "@/components/avatar/AvatarCanvas";

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

      chatRef.current = new RealtimeChat(handleMessage, language, level);
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
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Top Bar with End Call Button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="font-semibold text-sm">
              {isConnecting ? "Connecting..." : isConnected ? "Live Conversation" : "Connection Error"}
            </span>
          </div>
          
          <Button
            onClick={endConversation}
            variant="destructive"
            size="sm"
            className="rounded-full w-10 h-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 relative">
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">Connecting to your tutor...</p>
            </div>
          </div>
        )}

        {/* Avatar - Full height, properly zoomed */}
        <div className="relative w-full h-[60vh] flex-shrink-0">
          <AvatarCanvas className="absolute inset-0 w-full h-full" />
        </div>

        {/* Status Display */}
        {isConnected && (
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
              isSpeaking 
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                : 'bg-gradient-to-r from-primary to-purple-600 text-white'
            } transition-all duration-300`}>
              <div className={`w-2 h-2 rounded-full bg-white ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span className="font-semibold">
                {isSpeaking ? "AI is speaking..." : "Listening..."}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-md">
              Speak naturally in your target language. The conversation happens automatically with voice detection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveConversationPage;
