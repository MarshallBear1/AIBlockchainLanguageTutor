import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LiveConversationProps {
  unitNumber: number;
  language: string;
  level: string;
}

const LiveConversation = ({ unitNumber, language, level }: LiveConversationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const { toast } = useToast();

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
        description: "Start speaking to practice your conversation skills",
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
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        className="w-full gap-2"
      >
        <Mic className="w-4 h-4" />
        Live Conversation
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          endConversation();
        }
        setIsOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Live Conversation - Unit {unitNumber}</DialogTitle>
            <DialogDescription>
              Practice your speaking skills with voice-only conversation
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-8">
            {!isConnected && !isConnecting && (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click below to start a live voice conversation. Make sure your microphone is enabled.
                </p>
                <Button onClick={startConversation} size="lg" className="gap-2">
                  <Mic className="w-5 h-5" />
                  Start Conversation
                </Button>
              </div>
            )}

            {isConnecting && (
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Connecting...</p>
              </div>
            )}

            {isConnected && (
              <div className="text-center space-y-6 w-full">
                <div className={`relative w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                  isSpeaking 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 animate-pulse' 
                    : 'bg-gradient-to-r from-primary to-purple-600'
                }`}>
                  {isSpeaking ? (
                    <Mic className="w-16 h-16 text-white" />
                  ) : (
                    <MicOff className="w-16 h-16 text-white" />
                  )}
                </div>
                
                <div>
                  <p className="font-semibold mb-1">
                    {isSpeaking ? "AI is speaking..." : "Listening..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Speak naturally in your target language
                  </p>
                </div>

                <Button 
                  onClick={endConversation}
                  variant="destructive"
                  className="w-full"
                >
                  End Conversation
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LiveConversation;
