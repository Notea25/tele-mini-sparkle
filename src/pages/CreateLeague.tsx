import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SportHeader from "@/components/SportHeader";
import leaguePlayersImg from "@/assets/league-creation-players.png";

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
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader backTo="/league" />
      
      <div className="flex-1 px-4 pt-4 flex flex-col">
        {/* Title */}
        <h1 className="text-xl font-medium text-muted-foreground text-center mb-6">
          Создание лиги
        </h1>

        {/* Players Image */}
        <div className="flex justify-center mb-12">
          <img 
            src={leaguePlayersImg} 
            alt="League players" 
            className="w-full max-w-sm object-contain"
          />
        </div>

        {/* League Name Input */}
        <Input
          type="text"
          placeholder="Название лиги"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          className="w-full bg-secondary/80 border-none rounded-xl py-6 px-4 text-foreground placeholder:text-muted-foreground mb-4"
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
    </div>
  );
};

export default CreateLeague;
