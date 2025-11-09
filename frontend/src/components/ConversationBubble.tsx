import { cn } from "@/lib/utils";

interface ConversationBubbleProps {
  role: "user" | "assistant";
  text: string;
  timestamp?: Date;
}

const ConversationBubble = ({ role, text, timestamp }: ConversationBubbleProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-5 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card text-card-foreground rounded-bl-sm border border-border"
        )}
      >
        <p className="text-base leading-relaxed">{text}</p>
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-2 opacity-70",
              isUser ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConversationBubble;
