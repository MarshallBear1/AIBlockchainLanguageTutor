import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";

interface WordBankSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WordBankSheet = ({ open, onOpenChange }: WordBankSheetProps) => {
  // TODO: Load actual vocabulary from conversation context
  const words = [
    { word: "Hello", translation: "Hola", color: "bg-light-blue" },
    { word: "Thank you", translation: "Gracias", color: "bg-light-pink" },
    { word: "Please", translation: "Por favor", color: "bg-light-yellow" },
    { word: "Goodbye", translation: "Adiós", color: "bg-light-blue" },
    { word: "Yes", translation: "Sí", color: "bg-light-pink" },
    { word: "No", translation: "No", color: "bg-light-yellow" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl h-[80vh]">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-2xl">Word Bank</SheetTitle>
          <SheetDescription className="text-base">
            Key phrases for this conversation
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[calc(80vh-140px)]">
          {words.map((item, index) => (
            <Card key={index} className={`p-4 ${item.color}`}>
              <div className="font-semibold text-foreground mb-1">{item.word}</div>
              <div className="text-sm text-muted-foreground">{item.translation}</div>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WordBankSheet;
