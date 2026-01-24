import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "bad-words";

const MAX_NAME_LENGTH = 15;

// Russian profanity words list
const russianBadWords = [
  "хуй", "хуя", "хуе", "хуи", "пизд", "блять", "бля", "блядь", "ебать", "еба", 
  "ебу", "ебан", "ебл", "сука", "суки", "сучк", "мудак", "мудил", "пидор", 
  "пидар", "гандон", "залупа", "шлюх", "дрочи", "хер", "жопа", "срань", 
  "говно", "дерьмо", "засранец", "уебан", "уёб", "ёб", "долбоёб", "мразь"
];

interface EditTeamNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (newName: string) => void;
}

const EditTeamNameModal = ({
  isOpen,
  onClose,
  currentName,
  onSave,
}: EditTeamNameModalProps) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  // Initialize filter with Russian words
  const filter = useMemo(() => {
    const f = new Filter();
    f.addWords(...russianBadWords);
    return f;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  const handleNameChange = (value: string) => {
    // Limit to max length
    const trimmedValue = value.slice(0, MAX_NAME_LENGTH);
    setName(trimmedValue);
    setError(null);
  };

  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return "Введи название команды";
    }
    
    try {
      if (filter.isProfane(value.toLowerCase())) {
        return "Название содержит недопустимые слова";
      }
    } catch {
      // If filter fails, allow the name
    }
    
    return null;
  };

  const handleSave = () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onSave(name.trim() || "Lucky Team");
    onClose();
  };

  const handleCancel = () => {
    setName(currentName);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="bg-card border-border w-[calc(100%-32px)] max-w-md top-[20%] translate-y-0 rounded-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-foreground text-xl font-bold text-center">
          Изменить название команды
        </DialogTitle>
        
        {/* Input field */}
        <div className="relative mt-2">
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`bg-secondary border-border text-foreground h-14 text-lg pr-16 ${
              error ? "border-destructive" : ""
            }`}
            placeholder="Название команды"
            autoFocus
            maxLength={MAX_NAME_LENGTH}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {name.length}/{MAX_NAME_LENGTH}
          </span>
        </div>
        
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
        
        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            className="flex-1 h-12 text-base border-border bg-secondary text-foreground hover:bg-secondary/80"
            onClick={handleCancel}
          >
            Отменить
          </Button>
          <Button
            className="flex-1 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamNameModal;
