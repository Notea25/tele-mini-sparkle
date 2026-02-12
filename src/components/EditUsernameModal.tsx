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

interface EditUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (newName: string) => Promise<void>;
}

const EditUsernameModal = ({
  isOpen,
  onClose,
  currentName,
  onSave,
}: EditUsernameModalProps) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      return "Введи имя пользователя";
    }
    
    if (value.trim().length < 2) {
      return "Имя должно содержать минимум 2 символа";
    }
    
    try {
      if (filter.isProfane(value.toLowerCase())) {
        return "Имя содержит недопустимые слова";
      }
    } catch {
      // If filter fails, allow the name
    }
    
    return null;
  };

  const handleSave = async () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
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
        <DialogTitle className="text-foreground text-sm font-normal font-display text-center">
          Изменить имя пользователя
        </DialogTitle>
        
        {/* Input field */}
        <div className="relative mt-2">
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`bg-secondary border-border text-foreground h-14 text-lg pr-16 ${
              error ? "border-destructive" : ""
            }`}
            placeholder="Имя пользователя"
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
            disabled={isSaving}
          >
            Отменить
          </Button>
          <Button
            className="flex-1 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUsernameModal;
