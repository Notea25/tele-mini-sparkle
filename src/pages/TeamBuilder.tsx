import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  X,
  ChevronDown,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Pencil,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import FooterNav from "@/components/FooterNav";
import FormationField from "@/components/FormationField";
import TeamListView from "@/components/TeamListView";
import PlayerCard from "@/components/PlayerCard";
import EditTeamNameModal from "@/components/EditTeamNameModal";
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";
import homeIcon from "@/assets/home-icon.png";

import { allPlayers, allTeams } from "@/lib/teamData";

const ITEMS_PER_PAGE = 8;

// Club icons mapping - default logo for all teams
const clubIcons: Record<string, string> = Object.fromEntries(
  allTeams.map((team) => [team, team === "Белшина" ? clubBelshina : clubLogo]),
);

const TeamBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerListRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [activeFilter, setActiveFilter] = useState("Все");

  // Track initial state for unsaved changes detection
  const initialPlayersRef = useRef<string>("");

  const [selectedPlayers, setSelectedPlayers] = useState<{ id: number; slotIndex: number }[]>(() => {
    const saved = localStorage.getItem("fantasyTeamPlayers");
    const parsed = saved ? JSON.parse(saved) : [];
    initialPlayersRef.current = JSON.stringify(parsed);
    return parsed;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Все команды");
  const [selectedPoints, setSelectedPoints] = useState("Фильтр по очкам");
  const [priceFrom, setPriceFrom] = useState(3);
  const [priceTo, setPriceTo] = useState(10);
  const [captain, setCaptain] = useState<number | null>(() => {
    const saved = localStorage.getItem("fantasyTeamCaptain");
    return saved ? JSON.parse(saved) : null;
  });
  const [viceCaptain, setViceCaptain] = useState<number | null>(() => {
    const saved = localStorage.getItem("fantasyTeamViceCaptain");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  const [teamName, setTeamName] = useState(() => {
    const state = location.state as { teamName?: string } | null;
    if (state?.teamName) {
      localStorage.setItem("fantasyTeamName", state.teamName);
      return state.teamName;
    }
    const saved = localStorage.getItem("fantasyTeamName");
    return saved || "Lucky Team";
  });
  const [isEditTeamNameModalOpen, setIsEditTeamNameModalOpen] = useState(false);
  const [showSquadError, setShowSquadError] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  // Sorting state: null = no sort, 'asc' = ascending, 'desc' = descending
  const [sortField, setSortField] = useState<"name" | "points" | "price" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Check for unsaved changes
  const hasUnsavedChanges = JSON.stringify(selectedPlayers) !== initialPlayersRef.current;

  const handleSort = (field: "name" | "points" | "price") => {
    if (sortField !== field) {
      // New field: start with desc for points/price, asc for name
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    } else {
      // Same field: cycle through directions
      if (field === "name") {
        // name: asc → desc → clear
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else {
          setSortField(null);
          setSortDirection(null);
        }
      } else {
        // points/price: desc → asc → clear
        if (sortDirection === "desc") {
          setSortDirection("asc");
        } else {
          setSortField(null);
          setSortDirection(null);
        }
      }
    }
    setCurrentPage(1);
  };

  // Deadline countdown
  const deadlineDate = new Date("2025-12-14T19:00:00");
  const tournamentStartDate = new Date("2025-12-04T19:00:00"); // Tournament start (10 days before deadline)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();
      const totalDuration = deadlineDate.getTime() - tournamentStartDate.getTime();
      const elapsed = now.getTime() - tournamentStartDate.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        setTimeLeft({ days, hours, minutes, seconds, progress });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const teams = ["Все команды", ...allTeams];
  const pointsOptions = [
    { label: "Фильтр по очкам", value: "Фильтр по очкам" },
    { label: "80+", value: "80+" },
    { label: "70-79", value: "70-79" },
    { label: "60-69", value: "60-69" },
    { label: "< 60", value: "<60" },
  ];

  const filters = ["Все", "Вратари", "Защитники", "Полузащитники", "Нападающие"];

  const players = allPlayers;

  const selectedPlayerIds = selectedPlayers.map((sp) => sp.id);
  const selectedPlayersData = players
    .filter((p) => selectedPlayerIds.includes(p.id))
    .map((p) => {
      const slotInfo = selectedPlayers.find((sp) => sp.id === p.id);
      return { ...p, slotIndex: slotInfo?.slotIndex };
    });

  // Filter players based on activeFilter, search query, team, and points
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const matchesTeam = selectedTeam === "Все команды" || player.team === selectedTeam;
    if (!matchesTeam) return false;

    // Points filter
    let matchesPoints = true;
    if (selectedPoints === "80+") matchesPoints = player.points >= 80;
    else if (selectedPoints === "70-79") matchesPoints = player.points >= 70 && player.points < 80;
    else if (selectedPoints === "60-69") matchesPoints = player.points >= 60 && player.points < 70;
    else if (selectedPoints === "<60") matchesPoints = player.points < 60;
    // "Фильтр по очкам" means show all, so matchesPoints stays true
    if (!matchesPoints) return false;

    // Price filter
    if (player.price < priceFrom) return false;
    if (player.price > priceTo) return false;

    if (activeFilter === "Все") return true;
    if (activeFilter === "Вратари") return player.position === "ВР";
    if (activeFilter === "Защитники") return player.position === "ЗЩ";
    if (activeFilter === "Полузащитники") return player.position === "ПЗ";
    if (activeFilter === "Нападающие") return player.position === "НП";
    return true;
  });

  // Apply sorting
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    if (sortField === "name") {
      const comparison = a.name.localeCompare(b.name, "ru");
      return sortDirection === "asc" ? comparison : -comparison;
    }
    if (sortField === "points") {
      return sortDirection === "desc" ? b.points - a.points : a.points - b.points;
    }
    if (sortField === "price") {
      return sortDirection === "desc" ? b.price - a.price : a.price - b.price;
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = sortedPlayers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Reset to page 1 when team changes
  const handleTeamChange = (team: string) => {
    setSelectedTeam(team);
    setCurrentPage(1);
  };

  // Reset to page 1 when points filter changes
  const handlePointsChange = (points: string) => {
    setSelectedPoints(points);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("Все");
    setSelectedTeam("Все команды");
    setSelectedPoints("Фильтр по очкам");
    setPriceFrom(3);
    setPriceTo(10);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    activeFilter !== "Все" ||
    selectedTeam !== "Все команды" ||
    selectedPoints !== "Фильтр по очкам" ||
    priceFrom !== 3 ||
    priceTo !== 10;

  // Price control handlers
  const handlePriceFromIncrease = () => {
    setPriceFrom((prev) => Math.min(prev + 1, priceTo));
    setCurrentPage(1);
  };
  const handlePriceFromDecrease = () => {
    setPriceFrom((prev) => Math.max(prev - 1, 1));
    setCurrentPage(1);
  };
  const handlePriceToIncrease = () => {
    setPriceTo((prev) => Math.min(prev + 1, 15));
    setCurrentPage(1);
  };
  const handlePriceToDecrease = () => {
    setPriceTo((prev) => Math.max(prev - 1, priceFrom));
    setCurrentPage(1);
  };

  const positionToFilter: Record<string, string> = {
    ВР: "Вратари",
    ЗЩ: "Защитники",
    ПЗ: "Полузащитники",
    НП: "Нападающие",
  };

  const handleEmptySlotClick = (position: string) => {
    const filterName = positionToFilter[position] || "Все";
    setActiveFilter(filterName);
    setCurrentPage(1);

    setTimeout(() => {
      playerListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const BUDGET = 100;
  const MAX_PLAYERS_PER_CLUB = 3;
  const currentTeamCost = selectedPlayersData.reduce((sum, p) => sum + p.price, 0);
  const currentBalance = BUDGET - currentTeamCost;

  const getPlayersCountByClub = (playerSelections: { id: number; slotIndex: number }[], clubName: string) => {
    return playerSelections.filter((sel) => {
      const p = players.find((player) => player.id === sel.id);
      return p?.team === clubName;
    }).length;
  };

  // Formation slots per position
  const POSITION_SLOTS: Record<string, number> = {
    ВР: 2,
    ЗЩ: 5,
    ПЗ: 5,
    НП: 3,
  };

  const getPlayersCountByPosition = (playerSelections: { id: number; slotIndex: number }[], position: string) => {
    return playerSelections.filter((sel) => {
      const p = players.find((player) => player.id === sel.id);
      return p?.position === position;
    }).length;
  };

  const getNextAvailableSlot = (position: string): number => {
    const maxSlots = POSITION_SLOTS[position] || 0;
    const usedSlots = selectedPlayers
      .filter((sp) => {
        const p = players.find((player) => player.id === sp.id);
        return p?.position === position;
      })
      .map((sp) => sp.slotIndex);

    for (let i = 0; i < maxSlots; i++) {
      if (!usedSlots.includes(i)) return i;
    }
    return -1;
  };

  const togglePlayer = (playerId: number) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const existingSelection = selectedPlayers.find((sp) => sp.id === playerId);
    if (existingSelection) {
      // Remove player - also clear captain/vice-captain if needed
      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
      setSelectedPlayers((prev) => prev.filter((sp) => sp.id !== playerId));
    } else {
      // Check available position slots
      const positionCount = getPlayersCountByPosition(selectedPlayers, player.position);
      const maxSlots = POSITION_SLOTS[player.position] || 0;
      if (positionCount >= maxSlots) {
        toast.error(`Все слоты для позиции "${player.position}" заняты`);
        return;
      }
      // Check budget before adding
      if (player.price > currentBalance) {
        toast.error("Недостаточно бюджета для добавления этого игрока");
        return;
      }
      // Check club limit
      const clubCount = getPlayersCountByClub(selectedPlayers, player.team);
      if (clubCount >= MAX_PLAYERS_PER_CLUB) {
        toast.error(`Нельзя добавить больше ${MAX_PLAYERS_PER_CLUB} игроков из одного клуба`);
        return;
      }
      const slotIndex = getNextAvailableSlot(player.position);
      setSelectedPlayers((prev) => [...prev, { id: playerId, slotIndex }]);
    }
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    setCaptain(null);
    setViceCaptain(null);
  };

  const handleAutoFill = () => {
    // Formation: 2 ВР, 5 ЗЩ, 5 ПЗ, 3 НП = 15 total
    const formation: Record<string, number> = { ВР: 2, ЗЩ: 5, ПЗ: 5, НП: 3 };
    const TOTAL_PLAYERS = 15;

    // Shuffle function for randomness
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Start with currently selected players
    let newSelectedPlayers = [...selectedPlayers];
    let totalCost = selectedPlayersData.reduce((sum, p) => sum + p.price, 0);

    // Count existing club selections
    const clubCounts: Record<string, number> = {};
    selectedPlayersData.forEach((p) => {
      clubCounts[p.team] = (clubCounts[p.team] || 0) + 1;
    });

    // Count existing position selections and used slots
    const positionCounts: Record<string, number> = {};
    const usedSlotsByPosition: Record<string, number[]> = { ВР: [], ЗЩ: [], ПЗ: [], НП: [] };
    selectedPlayersData.forEach((p) => {
      positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
      if (p.slotIndex !== undefined) {
        usedSlotsByPosition[p.position].push(p.slotIndex);
      }
    });

    const selectedIdsSet = new Set(newSelectedPlayers.map((sp) => sp.id));

    // Calculate slots needed per position
    const slotsNeeded: Record<string, number> = {};
    Object.entries(formation).forEach(([position, maxCount]) => {
      const currentCount = positionCounts[position] || 0;
      slotsNeeded[position] = maxCount - currentCount;
    });

    const totalSlotsNeeded = Object.values(slotsNeeded).reduce((sum, n) => sum + n, 0);

    if (totalSlotsNeeded === 0) {
      toast.info("Команда уже полностью укомплектована");
      return;
    }

    // Get available budget
    const availableBudget = BUDGET - totalCost;

    // Build list of cheapest available players per position (respecting club limits)
    const getCheapestPlayersForPosition = (
      position: string,
      needed: number,
      currentClubCounts: Record<string, number>,
      excludeIds: Set<number>,
    ): typeof players => {
      const available = players
        .filter((p) => p.position === position && !excludeIds.has(p.id))
        .sort((a, b) => a.price - b.price);

      const result: typeof players = [];
      const tempClubCounts = { ...currentClubCounts };

      for (const player of available) {
        if (result.length >= needed) break;
        const clubCount = tempClubCounts[player.team] || 0;
        if (clubCount < MAX_PLAYERS_PER_CLUB) {
          result.push(player);
          tempClubCounts[player.team] = clubCount + 1;
        }
      }
      return result;
    };

    // Calculate minimum cost to fill all remaining slots
    let minCostToFillAll = 0;
    const tempClubCounts = { ...clubCounts };

    Object.entries(slotsNeeded).forEach(([position, needed]) => {
      if (needed <= 0) return;
      const cheapest = getCheapestPlayersForPosition(position, needed, tempClubCounts, selectedIdsSet);
      cheapest.forEach((p) => {
        minCostToFillAll += p.price;
        tempClubCounts[p.team] = (tempClubCounts[p.team] || 0) + 1;
      });
    });

    if (minCostToFillAll > availableBudget) {
      toast.error(
        `Недостаточно бюджета. Требуется минимум ${minCostToFillAll.toFixed(1)}, доступно ${availableBudget.toFixed(1)}`,
      );
      return;
    }

    // Randomized fill with guaranteed 15 players
    // Strategy: shuffle positions order, then for each position shuffle and try players randomly
    // while ensuring we can still fill remaining positions

    const positionsToFill = shuffleArray(
      Object.entries(slotsNeeded)
        .filter(([_, needed]) => needed > 0)
        .map(([pos]) => pos),
    );

    // Function to calculate min cost for remaining positions
    const getMinCostForRemaining = (
      remainingPositions: string[],
      currentClubCounts: Record<string, number>,
      excludeIds: Set<number>,
    ): number => {
      let cost = 0;
      const tempCounts = { ...currentClubCounts };
      const tempExclude = new Set(excludeIds);

      for (const pos of remainingPositions) {
        const needed = slotsNeeded[pos];
        const cheapest = getCheapestPlayersForPosition(pos, needed, tempCounts, tempExclude);
        cheapest.forEach((p) => {
          cost += p.price;
          tempCounts[p.team] = (tempCounts[p.team] || 0) + 1;
          tempExclude.add(p.id);
        });
      }
      return cost;
    };

    // Fill positions one by one
    for (let posIndex = 0; posIndex < positionsToFill.length; posIndex++) {
      const position = positionsToFill[posIndex];
      const needed = slotsNeeded[position];
      const remainingPositions = positionsToFill.slice(posIndex + 1);

      // Get all available players for this position and SHUFFLE them
      const availablePlayers = shuffleArray(
        players.filter((p) => p.position === position && !selectedIdsSet.has(p.id)),
      );

      let added = 0;
      for (const player of availablePlayers) {
        if (added >= needed) break;

        const currentClubCount = clubCounts[player.team] || 0;
        if (currentClubCount >= MAX_PLAYERS_PER_CLUB) continue;

        // Calculate if we can afford this player AND still fill remaining positions
        const potentialCost = totalCost + player.price;
        const remainingBudget = BUDGET - potentialCost;

        // Simulate adding this player
        const testClubCounts = { ...clubCounts };
        testClubCounts[player.team] = currentClubCount + 1;
        const testExcludeIds = new Set(selectedIdsSet);
        testExcludeIds.add(player.id);

        // Calculate min cost for remaining slots in this position + other positions
        const remainingSlotsInPosition = needed - added - 1;
        let minCostRemaining = 0;

        if (remainingSlotsInPosition > 0) {
          const cheapestRemaining = getCheapestPlayersForPosition(
            position,
            remainingSlotsInPosition,
            testClubCounts,
            testExcludeIds,
          );
          cheapestRemaining.forEach((p) => {
            minCostRemaining += p.price;
            testClubCounts[p.team] = (testClubCounts[p.team] || 0) + 1;
            testExcludeIds.add(p.id);
          });
        }

        minCostRemaining += getMinCostForRemaining(remainingPositions, testClubCounts, testExcludeIds);

        // Check if we can afford
        if (minCostRemaining <= remainingBudget) {
          // Add this player
          let slotIndex = 0;
          while (usedSlotsByPosition[position].includes(slotIndex)) {
            slotIndex++;
          }

          newSelectedPlayers.push({ id: player.id, slotIndex });
          usedSlotsByPosition[position].push(slotIndex);
          selectedIdsSet.add(player.id);
          totalCost += player.price;
          clubCounts[player.team] = currentClubCount + 1;
          added++;
        }
      }

      // Fallback: if we couldn't add enough players, fill with cheapest available
      if (added < needed) {
        const cheapestPlayers = players
          .filter((p) => p.position === position && !selectedIdsSet.has(p.id))
          .sort((a, b) => a.price - b.price);

        for (const player of cheapestPlayers) {
          if (added >= needed) break;

          const currentClubCount = clubCounts[player.team] || 0;
          if (currentClubCount >= MAX_PLAYERS_PER_CLUB) continue;
          if (totalCost + player.price > BUDGET) continue;

          let slotIndex = 0;
          while (usedSlotsByPosition[position].includes(slotIndex)) {
            slotIndex++;
          }

          newSelectedPlayers.push({ id: player.id, slotIndex });
          usedSlotsByPosition[position].push(slotIndex);
          selectedIdsSet.add(player.id);
          totalCost += player.price;
          clubCounts[player.team] = currentClubCount + 1;
          added++;
        }
      }
    }

    // Final verification
    if (newSelectedPlayers.length < TOTAL_PLAYERS) {
      toast.error("Не удалось заполнить все позиции из-за ограничений клуба или бюджета");
    }

    setSelectedPlayers(newSelectedPlayers);
  };

  const handleSaveChanges = () => {
    if (selectedPlayers.length < 15) {
      setShowSquadError(true);
      toast.error(`Состав не сформирован. Выбрано ${selectedPlayers.length} из 15 игроков`);
      return;
    }
    localStorage.setItem("fantasyTeamPlayers", JSON.stringify(selectedPlayers));
    localStorage.setItem("fantasyTeamName", teamName);
    localStorage.setItem("fantasyTeamCaptain", JSON.stringify(captain));
    localStorage.setItem("fantasyTeamViceCaptain", JSON.stringify(viceCaptain));
    initialPlayersRef.current = JSON.stringify(selectedPlayers);
    toast.success("Изменения сохранены");
  };

  const handleDiscardChanges = () => {
    // Reset to initial state
    const initial = JSON.parse(initialPlayersRef.current || "[]");
    setSelectedPlayers(initial);
  };

  const leaderboard = Array(10)
    .fill(null)
    .map((_, i) => ({
      rank: i + 1,
      name: "Lucky Team",
      games: 32,
      points: 2125,
      trend: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "same",
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SportHeader
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveChanges={handleSaveChanges}
        onDiscardChanges={handleDiscardChanges}
      />

      {/* Breadcrumbs */}
      <div className="px-4 mt-4">
        <Breadcrumbs
          items={[
            { label: "Футбол", path: "/" },
            { label: "Беларусь", path: "/" },
            { label: "Создание команды", path: "/create-team" },
            { label: teamName },
          ]}
        />
      </div>

      {/* Team Header */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setIsEditTeamNameModalOpen(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Дедлайн: 14.12.2025 в 19:00</span>
          <span className="text-foreground">
            {timeLeft.days} дн. {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Deadline Progress Bar */}
      <div className="px-4 mt-4">
        <div className="w-full h-2 bg-card rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${timeLeft.progress}%` }}
          />
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
          <div className="mt-4">
            <FormationField
              selectedPlayers={selectedPlayersData}
              onRemovePlayer={(id) => togglePlayer(id)}
              onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
              onEmptySlotClick={handleEmptySlotClick}
              captain={captain}
              viceCaptain={viceCaptain}
            />
          </div>

          {/* Price Range */}
          <div className="px-4 -mt-36 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-foreground text-sm">Цена</span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Сбросить фильтры
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">от</span>
                <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2">
                  <button
                    onClick={handlePriceFromDecrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary-foreground" />
                  </button>
                  <span className="text-foreground font-medium min-w-[40px] text-center">{priceFrom.toFixed(1)}</span>
                  <button
                    onClick={handlePriceFromIncrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">до</span>
                <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2">
                  <button
                    onClick={handlePriceToDecrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary-foreground" />
                  </button>
                  <span className="text-foreground font-medium min-w-[40px] text-center">{priceTo.toFixed(1)}</span>
                  <button
                    onClick={handlePriceToIncrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Teams Filter */}
          <div className="px-4 mt-4 relative z-20">
            <Select value={selectedTeam} onValueChange={handleTeamChange}>
              <SelectTrigger className="w-full bg-card border-border text-foreground cursor-pointer">
                <SelectValue placeholder="Команды" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {teams.map((team) => (
                  <SelectItem key={team} value={team} className="text-foreground hover:bg-secondary cursor-pointer">
                    {team === "Все команды" ? "Команды" : team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {activeTab === "list" && (
        <>
          <TeamListView
            selectedPlayers={selectedPlayersData}
            onRemovePlayer={(id) => togglePlayer(id)}
            onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
            onEmptySlotClick={handleEmptySlotClick}
            clubIcons={clubIcons}
          />

          {/* Price Range for List View */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-foreground text-sm">Цена</span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Сбросить фильтры
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">от</span>
                <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2">
                  <button
                    onClick={handlePriceFromDecrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary-foreground" />
                  </button>
                  <span className="text-foreground font-medium min-w-[40px] text-center">{priceFrom.toFixed(1)}</span>
                  <button
                    onClick={handlePriceFromIncrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">до</span>
                <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2">
                  <button
                    onClick={handlePriceToDecrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary-foreground" />
                  </button>
                  <span className="text-foreground font-medium min-w-[40px] text-center">{priceTo.toFixed(1)}</span>
                  <button
                    onClick={handlePriceToIncrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Teams Filter for List View */}
          <div className="px-4 mt-4 relative z-20">
            <Select value={selectedTeam} onValueChange={handleTeamChange}>
              <SelectTrigger className="w-full bg-card border-border text-foreground cursor-pointer">
                <SelectValue placeholder="Команды" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {teams.map((team) => (
                  <SelectItem key={team} value={team} className="text-foreground hover:bg-secondary cursor-pointer">
                    {team === "Все команды" ? "Команды" : team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Position Filters */}
      <div ref={playerListRef} className="px-4 mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            size="sm"
            className={`flex-shrink-0 rounded-full px-5 ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
                : "bg-card text-muted-foreground hover:bg-card/80 border border-border"
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
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Players List Header */}
      <div className="px-4 mt-6 flex items-center text-xs text-muted-foreground">
        <button
          onClick={() => handleSort("name")}
          className={`flex-1 flex items-center gap-1 transition-colors ${sortField === "name" ? "text-primary" : "hover:text-foreground"}`}
        >
          <span>Игрок</span>
          {sortField === "name" ? (
            sortDirection === "asc" ? (
              <ChevronDown className="w-3 h-3 text-primary" />
            ) : (
              <ChevronUp className="w-3 h-3 text-primary" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          )}
        </button>
        <span className="w-8"></span>
        <span className="w-6"></span>
        <button
          onClick={() => handleSort("points")}
          className={`w-14 flex items-center justify-end gap-1 transition-colors ${sortField === "points" ? "text-primary" : "hover:text-foreground"}`}
        >
          <span>Очки</span>
          {sortField === "points" ? (
            sortDirection === "desc" ? (
              <ChevronDown className="w-3 h-3 text-primary" />
            ) : (
              <ChevronUp className="w-3 h-3 text-primary" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          )}
        </button>
        <button
          onClick={() => handleSort("price")}
          className={`w-12 flex items-center justify-end gap-1 transition-colors ${sortField === "price" ? "text-primary" : "hover:text-foreground"}`}
        >
          <span>Цена</span>
          {sortField === "price" ? (
            sortDirection === "desc" ? (
              <ChevronDown className="w-3 h-3 text-primary" />
            ) : (
              <ChevronUp className="w-3 h-3 text-primary" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          )}
        </button>
        <span className="w-8"></span>
      </div>

      {/* Players List */}
      <div className="px-4 mt-3 space-y-2">
        {paginatedPlayers.map((player) => {
          const isSelected = selectedPlayerIds.includes(player.id);
          return (
            <div key={player.id} className="bg-card rounded-full px-4 py-2 flex items-center">
              {/* Player name - flexible */}
              <div
                className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                onClick={() => setSelectedPlayerForCard(player.id)}
              >
                <span className="text-foreground font-medium truncate">{player.name}</span>
              </div>

              {/* Position - fixed width */}
              <span className="w-8 text-center text-muted-foreground text-xs flex-shrink-0">{player.position}</span>

              {/* Club icon - fixed width */}
              <div className="w-6 flex-shrink-0 flex justify-center">
                <img src={clubIcons[player.team] || clubLogo} alt={player.team} className="w-5 h-5 object-contain" />
              </div>

              {/* Points - fixed width */}
              <div className="w-12 flex-shrink-0 flex items-center justify-end gap-1 text-primary">
                <span className="text-sm font-medium">{player.points}</span>
              </div>

              {/* Price - fixed width */}
              <span className="w-10 flex-shrink-0 text-foreground text-sm text-right">{player.price.toFixed(1)}</span>

              {/* Add/Remove button */}
              <button
                onClick={() => togglePlayer(player.id)}
                className={`w-6 h-6 ml-2 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                  isSelected ? "bg-muted hover:bg-muted/80" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isSelected ? (
                  <X className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Plus className="w-3 h-3 text-primary-foreground" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 hover:text-primary transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Page numbers */}
          {(() => {
            const pages: (number | string)[] = [];

            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              // Always show first page
              pages.push(1);

              // Calculate window around current page
              if (currentPage <= 3) {
                pages.push(2, 3, 4);
                pages.push("...", totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push("...");
                pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push("...");
                pages.push(currentPage - 1, currentPage, currentPage + 1);
                pages.push("...", totalPages);
              }
            }

            return pages.map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="text-muted-foreground text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`text-sm font-medium transition-colors ${
                    page === currentPage ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {page}
                </button>
              ),
            );
          })()}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 hover:text-primary transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Warning */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#6B6B8D] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Вы не можете добавить более трёх игроков из одного клуба в свою команду
          </p>
        </div>
      </div>

      {/* Team Cost & Balance - Sticky */}
      <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-40">
        <div className="flex justify-between mb-2">
          <div>
            <span className="text-muted-foreground text-xs">Стоимость команды</span>
            <p className="text-foreground text-base font-bold">{currentTeamCost.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-xs">Баланс</span>
            <p className="text-foreground text-base font-bold">{currentBalance.toFixed(1)}</p>
          </div>
        </div>

        {/* Squad Error Message */}
        {showSquadError && selectedPlayers.length < 15 && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#6B6B8D] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Состав не сформирован. Выбрано {selectedPlayers.length} из 15 игроков
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-3">
          <Button
            onClick={handleAutoFill}
            className="flex-1 bg-[#2A2A3E] hover:bg-[#3A3A4E] text-white font-semibold rounded-full py-3"
          >
            Автосбор
          </Button>
          <Button
            onClick={handleReset}
            disabled={selectedPlayers.length === 0}
            className={`flex-1 font-semibold rounded-full py-3 ${
              selectedPlayers.length === 0
                ? "bg-[#1A1A2E] text-muted-foreground opacity-50 cursor-not-allowed"
                : "bg-[#2A2A3E] hover:bg-[#3A3A4E] text-white"
            }`}
          >
            Сбросить
          </Button>
        </div>

        <Button
          onClick={() => {
            if (selectedPlayers.length < 15) {
              setShowSquadError(true);
            } else {
              setShowSaveConfirmation(true);
            }
          }}
          className={`w-full rounded-full py-3 font-semibold text-black ${
            selectedPlayers.length < 15 ? "bg-[#4A5D23]" : "bg-[#A8FF00] hover:bg-[#98EE00]"
          }`}
        >
          Сохранить
        </Button>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <AlertDialogContent className="bg-[#1A1A2E] border-border rounded-2xl max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-center">
              Сохранить команду?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center">
              Твоя команда "{teamName}" будет сохранена. Именно с этим составом ты входишь в сезон.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 justify-center mt-2">
            <AlertDialogCancel className="flex-1 m-0 bg-[#2A2A3E] hover:bg-[#3A3A4E] text-foreground border-none rounded-full h-11">
              Вернуться
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                localStorage.setItem("fantasyTeamPlayers", JSON.stringify(selectedPlayers));
                localStorage.setItem("fantasyTeamName", teamName);
                localStorage.setItem("fantasyTeamCaptain", JSON.stringify(captain));
                localStorage.setItem("fantasyTeamViceCaptain", JSON.stringify(viceCaptain));
                navigate("/league");
              }}
              className="flex-1 m-0 bg-[#A8FF00] hover:bg-[#98EE00] text-black font-semibold rounded-full h-11"
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Player Card Drawer */}
      <PlayerCard
        player={players.find((p) => p.id === selectedPlayerForCard) || null}
        isOpen={selectedPlayerForCard !== null}
        onClose={() => setSelectedPlayerForCard(null)}
        isSelected={selectedPlayerForCard !== null && selectedPlayerIds.includes(selectedPlayerForCard)}
        onToggleSelect={togglePlayer}
        isCaptain={selectedPlayerForCard === captain}
        isViceCaptain={selectedPlayerForCard === viceCaptain}
        onSetCaptain={setCaptain}
        onSetViceCaptain={setViceCaptain}
      />

      <EditTeamNameModal
        isOpen={isEditTeamNameModalOpen}
        onClose={() => setIsEditTeamNameModalOpen(false)}
        currentName={teamName}
        onSave={(newName) => {
          setTeamName(newName);
          localStorage.setItem("fantasyTeamName", newName);
        }}
      />
    </div>
  );
};

export default TeamBuilder;
