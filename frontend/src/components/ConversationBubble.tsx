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
        "flex w-full mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card text-card-foreground rounded-bl-sm border border-border"
        )}
      >
        <p className="text-sm leading-relaxed">{text}</p>
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-1 opacity-70",
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
