import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { VocabularyItem } from "@/data/lessonData";

interface WordBankSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vocabulary?: VocabularyItem[];
}

const WordBankSheet = ({ open, onOpenChange, vocabulary = [] }: WordBankSheetProps) => {
  // Category to color mapping
  const getCategoryColor = (category: VocabularyItem['category']) => {
    switch (category) {
      case 'greeting': return 'bg-light-blue';
      case 'question': return 'bg-light-pink';
      case 'answer': return 'bg-light-green';
      case 'phrase': return 'bg-light-yellow';
      case 'verb': return 'bg-light-purple';
      case 'noun': return 'bg-light-orange';
      default: return 'bg-light-blue';
    }
  };

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
          {vocabulary.length > 0 ? (
            vocabulary.map((item, index) => (
              <Card key={index} className={`p-4 ${getCategoryColor(item.category)}`}>
                <div className="font-semibold text-foreground mb-1">{item.word}</div>
                <div className="text-sm text-muted-foreground">{item.translation}</div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center text-muted-foreground py-8">
              No vocabulary available for this lesson yet.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WordBankSheet;
