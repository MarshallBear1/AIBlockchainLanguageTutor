import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AvatarMessage } from "@/types/avatar";
import { supabase } from "@/integrations/supabase/client";

interface ConversationMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AvatarChatContextType {
  chat: (message: string, isFirstMessage?: boolean) => Promise<void>;
  message: AvatarMessage | null;
  onMessagePlayed: () => void;
  loading: boolean;
  cameraZoomed: boolean;
  setCameraZoomed: (zoomed: boolean) => void;
  conversationHistory: ConversationMessage[];
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
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  const chat = async (userMessage: string, isFirstMessage: boolean = false) => {
    setLoading(true);
    
    // Only add user message to history if it's not the auto-triggered first message
    if (!isFirstMessage) {
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", text: userMessage, timestamp: new Date() },
      ]);
    }

    try {
      // Get auth session for authenticated function calls
      const { data: { session } } = await supabase.auth.getSession();

      // Call Supabase Edge Function for AI chat with conversation history
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage,
          isFirstMessage,
          conversationHistory: conversationHistory,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.error("Error calling AI chat:", error);
        // Fallback to a default response
        const fallbackMessage: AvatarMessage = {
          text: "I'm having trouble connecting right now. Please try again!",
          audio: "",
          facialExpression: "sad" as const,
          animation: "Idle" as const,
        };
        setMessages([fallbackMessage]);
        
        // Add AI response to conversation history
        setConversationHistory((prev) => [
          ...prev,
          { role: "assistant", text: fallbackMessage.text, timestamp: new Date() },
        ]);
      } else if (data?.messages && Array.isArray(data.messages)) {
        console.log("Received messages:", data.messages.length);
        
        // Add messages to queue for avatar to speak
        setMessages((prev) => [...prev, ...data.messages]);
        
        // Batch add all AI responses to conversation history at once
        const newHistoryEntries = data.messages.map((msg: AvatarMessage) => ({
          role: "assistant" as const,
          text: msg.text,
          timestamp: new Date(),
        }));
        
        setConversationHistory((prev) => [...prev, ...newHistoryEntries]);
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
        conversationHistory,
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
