import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const handleGetHelp = () => {
    // TODO: Trigger help mode in conversation
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-2xl">Need help?</SheetTitle>
          <SheetDescription className="text-base">
            Toki will slow down, explain in English, and give you hints to keep the conversation going.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          <Button
            onClick={handleGetHelp}
            className="w-full h-12 text-lg"
            size="lg"
          >
            Get Help from Toki
          </Button>
          
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;
