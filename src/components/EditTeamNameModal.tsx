import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    onSave(name || "Lucky Team");
    onClose();
  };

  const handleCancel = () => {
    setName(currentName);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-t border-border">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-foreground text-xl font-bold">
            Изменить название команды
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary border-border text-foreground h-12 text-base"
            placeholder="Название команды"
            autoFocus
          />
          <div className="flex gap-3 mt-6">
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
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EditTeamNameModal;
