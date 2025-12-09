import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import SportHeader from "@/components/SportHeader";
import homeIcon from "@/assets/home-icon.png";
import leagueCreationPlayers from "@/assets/league-creation-players.png";

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
      
      <div className="flex-1 px-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 text-sm mb-4">
          <Link to="/">
            <img src={homeIcon} alt="Home" className="w-5 h-5" />
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Футбол</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Беларусь</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Создание лиги</span>
        </div>

        {/* Players Image */}
        <div className="flex justify-center mb-6">
          <img 
            src={leagueCreationPlayers} 
            alt="League players" 
            className="w-full max-w-md object-contain"
          />
        </div>

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
    </div>
  );
};

export default CreateLeague;
