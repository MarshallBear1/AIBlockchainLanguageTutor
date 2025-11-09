import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { AvatarMessage } from "@/types/avatar";
import { supabase } from "@/integrations/supabase/client";

interface ConversationMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AvatarChatContextType {
  chat: (message: string, isFirstMessage?: boolean, lessonGoal?: string, learningGoals?: string[]) => Promise<void>;
  message: AvatarMessage | null;
  onMessagePlayed: () => void;
  stopSpeaking: () => void;
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

  const chat = async (userMessage: string, isFirstMessage: boolean = false, lessonGoal?: string, learningGoals?: string[]) => {
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session in AI chat:", sessionError);
        const fallbackMessage: AvatarMessage = {
          text: "Authentication error. Please log in again.",
          audio: "",
          facialExpression: "sad" as const,
          animation: "Idle" as const,
        };
        setMessages([fallbackMessage]);
        setConversationHistory((prev) => [
          ...prev,
          { role: "assistant", text: fallbackMessage.text, timestamp: new Date() },
        ]);
        return;
      }

      if (!session) {
        console.warn("No session found for AI chat");
        const fallbackMessage: AvatarMessage = {
          text: "Please log in to continue chatting.",
          audio: "",
          facialExpression: "sad" as const,
          animation: "Idle" as const,
        };
        setMessages([fallbackMessage]);
        setConversationHistory((prev) => [
          ...prev,
          { role: "assistant", text: fallbackMessage.text, timestamp: new Date() },
        ]);
        return;
      }

      // Call Supabase Edge Function for AI chat with conversation history
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage,
          isFirstMessage,
          lessonGoal: lessonGoal,
          learningGoals: learningGoals,
          conversationHistory: conversationHistory,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error calling AI chat function:", error);
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
      } else {
        console.warn("AI chat returned unexpected data format");
        const fallbackMessage: AvatarMessage = {
          text: "I received an unexpected response. Please try again.",
          audio: "",
          facialExpression: "sad" as const,
          animation: "Idle" as const,
        };
        setMessages([fallbackMessage]);
        setConversationHistory((prev) => [
          ...prev,
          { role: "assistant", text: fallbackMessage.text, timestamp: new Date() },
        ]);
      }
    } catch (err) {
      console.error("Unexpected error in AI chat:", err);
      const fallbackMessage: AvatarMessage = {
        text: "Something went wrong. Please try again later.",
        audio: "",
        facialExpression: "sad" as const,
        animation: "Idle" as const,
      };
      setMessages([fallbackMessage]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", text: fallbackMessage.text, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = useCallback(() => {
    setMessages((messages) => messages.slice(1));
  }, []);

  const stopSpeaking = useCallback(() => {
    // Clear all queued messages and stop current message
    setMessages([]);
    setMessage(null);
  }, []);

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
        stopSpeaking,
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
  // Return null if no provider, allowing optional usage
  if (!context) {
    return null;
  }
  return context;
};
