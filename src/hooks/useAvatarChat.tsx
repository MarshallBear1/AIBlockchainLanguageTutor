import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AvatarMessage } from "@/types/avatar";
import { supabase } from "@/integrations/supabase/client";

interface AvatarChatContextType {
  chat: (message: string) => Promise<void>;
  message: AvatarMessage | null;
  onMessagePlayed: () => void;
  loading: boolean;
  cameraZoomed: boolean;
  setCameraZoomed: (zoomed: boolean) => void;
}

const AvatarChatContext = createContext<AvatarChatContextType | undefined>(undefined);

interface AvatarChatProviderProps {
  children: ReactNode;
}

export const AvatarChatProvider = ({ children }: AvatarChatProviderProps) => {
  const [messages, setMessages] = useState<AvatarMessage[]>([]);
  const [message, setMessage] = useState<AvatarMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const chat = async (userMessage: string) => {
    setLoading(true);
    try {
      // Call Supabase Edge Function for AI chat
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: userMessage },
      });

      if (error) {
        console.error("Error calling AI chat:", error);
        // Fallback to a default response
        setMessages([
          {
            text: "I'm having trouble connecting right now. Please try again!",
            audio: "",
            lipsync: { mouthCues: [] },
            facialExpression: "sad",
            animation: "Idle",
          },
        ]);
      } else if (data?.messages) {
        setMessages((prev) => [...prev, ...data.messages]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <AvatarChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </AvatarChatContext.Provider>
  );
};

export const useAvatarChat = () => {
  const context = useContext(AvatarChatContext);
  if (!context) {
    throw new Error("useAvatarChat must be used within an AvatarChatProvider");
  }
  return context;
};
