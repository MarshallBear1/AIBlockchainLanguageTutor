import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ModeCardProps {
  emoji: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  onClick: () => void;
  buttonText: string;
}

const ModeCard = ({
  emoji,
  title,
  description,
  badge,
  badgeColor,
  onClick,
  buttonText,
}: ModeCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="text-5xl">{emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{title}</h3>
            <Badge className={badgeColor}>{badge}</Badge>
          </div>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Button onClick={onClick} className="w-full">
            {buttonText}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ModeCard;
