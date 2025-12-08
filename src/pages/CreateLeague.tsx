import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CreateLeague = () => {
  const navigate = useNavigate();
  const [leagueName, setLeagueName] = useState("");

  const handleCreateLeague = () => {
    if (leagueName.trim()) {
      // TODO: Save league to backend
      navigate("/league");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 pt-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground italic mb-6">
        Создай свою лигу
      </h1>

      {/* League Name Input */}
      <Input
        type="text"
        placeholder="Название лиги"
        value={leagueName}
        onChange={(e) => setLeagueName(e.target.value)}
        className="w-full bg-secondary/50 border-none rounded-xl py-6 px-4 text-foreground placeholder:text-muted-foreground mb-4"
      />

      {/* Create Button */}
      <Button 
        onClick={handleCreateLeague}
        disabled={!leagueName.trim()}
        className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground disabled:opacity-50"
      >
        Создать лигу
      </Button>
    </div>
  );
};

export default CreateLeague;
