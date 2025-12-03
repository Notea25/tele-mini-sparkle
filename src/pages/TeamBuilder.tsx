import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, Search, Plus, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SportHeader from "@/components/SportHeader";
import FooterNav from "@/components/FooterNav";
import FormationField from "@/components/FormationField";

const TeamBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [activeFilter, setActiveFilter] = useState("Все");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

  const filters = ["Все", "Вратари", "Защитники", "Полузащитники"];

  const players = [
    { id: 0, name: "Вакулич", team: "Динамо Минск", position: "ВР", points: 79, price: 9 },
    { id: 1, name: "Петров", team: "БАТЭ", position: "ВР", points: 65, price: 8 },
    { id: 2, name: "Сидоров", team: "Шахтер", position: "ЗЩ", points: 72, price: 7 },
    { id: 3, name: "Иванов", team: "Динамо Минск", position: "ЗЩ", points: 68, price: 6 },
    { id: 4, name: "Козлов", team: "БАТЭ", position: "ПЗ", points: 81, price: 9 },
    { id: 5, name: "Новиков", team: "Шахтер", position: "ПЗ", points: 75, price: 8 },
    { id: 6, name: "Морозов", team: "Динамо Минск", position: "НП", points: 88, price: 10 },
    { id: 7, name: "Волков", team: "БАТЭ", position: "НП", points: 82, price: 9 },
    { id: 8, name: "Соколов", team: "Шахтер", position: "ЗЩ", points: 70, price: 7 },
    { id: 9, name: "Лебедев", team: "Динамо Минск", position: "ПЗ", points: 77, price: 8 },
  ];

  const selectedPlayersData = players.filter(p => selectedPlayers.includes(p.id));

  const togglePlayer = (playerId: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const leaderboard = Array(10).fill(null).map((_, i) => ({
    rank: i + 1,
    name: "Lucky Team",
    games: 32,
    points: 2125,
    trend: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "same",
  }));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <SportHeader />
      
      {/* Back Button */}
      <div className="px-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/create-team")}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </Button>
      </div>

      {/* Team Header */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🏠</span>
            <span>⚽ Футбол</span>
            <span>•</span>
            <span>Беларусь</span>
            <span>•</span>
            <span className="text-primary">Lucky Team</span>
          </div>
        </div>
        <h1 className="text-foreground text-3xl font-bold mb-2">Lucky Team</h1>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Дедлайн: 04.04 в 19:00</span>
          <span className="text-foreground">3 дня 08:36:53</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6 flex gap-2">
        <Button
          onClick={() => setActiveTab("formation")}
          className={`flex-1 ${
            activeTab === "formation"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Расстановка
        </Button>
        <Button
          onClick={() => setActiveTab("list")}
          className={`flex-1 ${
            activeTab === "list"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Список
        </Button>
      </div>

      {activeTab === "formation" && (
        <>
          {/* Football Field */}
          <div className="px-4 mt-6">
            <FormationField 
              selectedPlayers={selectedPlayersData}
              onRemovePlayer={(id) => togglePlayer(id)}
            />
          </div>

          {/* Team Filters */}
          <div className="px-4 mt-6 flex gap-2">
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-foreground text-sm">Команды</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-foreground text-sm">Очки</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Price Range */}
          <div className="px-4 mt-4 flex gap-2">
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Цена</span>
              <span className="text-foreground text-sm">от</span>
              <span className="text-foreground text-sm font-semibold">4.5</span>
            </div>
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Цена</span>
              <span className="text-foreground text-sm">до</span>
              <span className="text-foreground text-sm font-semibold">9</span>
            </div>
          </div>
        </>
      )}

      {/* Position Filters */}
      <div className="px-4 mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            size="sm"
            className={`flex-shrink-0 ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск"
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Players List Header */}
      <div className="px-4 mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="w-20">Игрок</span>
          <span className="w-8"></span>
          <span>Клуб</span>
        </div>
        <div className="flex items-center gap-3 pr-10">
          <span>Очки</span>
          <span>Цена</span>
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 mt-3 space-y-2">
        {players.map((player) => {
          const isSelected = selectedPlayers.includes(player.id);
          return (
            <div
              key={player.id}
              className="bg-card rounded-full px-4 py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-foreground font-medium">{player.name}</span>
                <span className="text-muted-foreground text-sm">{player.position}</span>
                <span className="text-muted-foreground text-sm">{player.team}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-foreground font-medium">{player.points}</span>
                </div>
                <span className="text-foreground font-medium">9</span>
                <Button
                  size="icon"
                  onClick={() => togglePlayer(player.id)}
                  className={`h-8 w-8 rounded-full ${
                    isSelected
                      ? "bg-muted hover:bg-muted/80 text-muted-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="px-4 mt-6 flex items-center justify-center gap-2">
        <button className="p-2 hover:bg-accent rounded transition-colors">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        {[1, 2, 3, "...", 10].map((page, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              page === 1 ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            {page}
          </button>
        ))}
        <button className="p-2 hover:bg-accent rounded transition-colors">
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Captain Selection */}
      <div className="px-4 mt-6 flex gap-2">
        <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
          <span className="text-foreground text-sm">Капитан</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
          <span className="text-foreground text-sm">Вице капитан</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Warning */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#6B6B8D] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Вы не можете добавить больше 2-ух игроков из одного клуба в свою команду
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 flex gap-3">
        <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          Автосбор
        </Button>
        <Button variant="secondary" className="flex-1">
          Сбросить
        </Button>
      </div>

      {/* Leaderboard */}
      <div className="px-4 mt-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">Топ-10 общей лиги</h2>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <div className="divide-y divide-border">
            {leaderboard.map((team) => (
              <div key={team.rank} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {team.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {team.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {team.trend === "same" && <Minus className="w-4 h-4 text-muted-foreground" />}
                    <span className={`font-bold ${team.rank <= 3 ? "text-primary" : "text-foreground"}`}>
                      {team.rank}
                    </span>
                  </div>
                  <span className="text-foreground font-semibold">🏆</span>
                  <span className="text-foreground">{team.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-sm">{team.games}</span>
                  <span className="text-foreground font-bold">{team.points}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team Balance */}
      <div className="px-4 mt-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-muted-foreground text-sm mb-1">Стоимость команды</div>
            <div className="text-foreground text-3xl font-bold">0</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm mb-1">Баланс</div>
            <div className="text-foreground text-3xl font-bold">100</div>
          </div>
        </div>
      </div>

      <FooterNav />
    </div>
  );
};

export default TeamBuilder;
