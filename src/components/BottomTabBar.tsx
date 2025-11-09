import { MessageCircle, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: MessageCircle, label: "Speak", path: "/home" },
    { icon: BookOpen, label: "Vocab", path: "/vocab" },
    { icon: TrendingUp, label: "Progress", path: "/progress" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <Button
              key={tab.path}
              variant="ghost"
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-1 h-16 rounded-none ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
