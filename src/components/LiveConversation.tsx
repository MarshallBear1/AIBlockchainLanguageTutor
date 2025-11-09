import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface LiveConversationProps {
  unitNumber: number;
  language: string;
  level: string;
}

const LiveConversation = ({ unitNumber, language, level }: LiveConversationProps) => {
  const navigate = useNavigate();

  const handleStartConversation = () => {
    navigate(`/live-conversation?unit=${unitNumber}&language=${language}&level=${level}`);
  };

  return (
    <Button
      onClick={handleStartConversation}
      size="lg"
      className="w-full gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl py-6"
    >
      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 animate-pulse">
        <Phone className="w-5 h-5" />
      </div>
      <span className="text-lg font-semibold">Call GEM for Live Practice</span>
    </Button>
  );
};

export default LiveConversation;
