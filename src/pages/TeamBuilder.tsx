import { safeGetItem } from "@/lib/safeStorage";
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
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Pencil,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PointsColumnHeader } from "@/components/PointsColumnHeader";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import FooterNav from "@/components/FooterNav";
import FormationField from "@/components/FormationField";
import TeamListView from "@/components/TeamListView";
import PlayerCard from "@/components/PlayerCard";
import EditTeamNameModal from "@/components/EditTeamNameModal";
import clubLogo from "@/assets/club-logo.png";
import homeIcon from "@/assets/home-icon.png";
import { clubLogos } from "@/lib/clubLogos";
import { useDeadline } from "@/hooks/useDeadline";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers, TransformedPlayer } from "@/hooks/usePlayers";
import { squadsApi, customLeaguesApi } from "@/lib/api";
import { getNextOpponentData } from "@/lib/scheduleUtils";

const ITEMS_PER_PAGE = 8;

const TeamBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const playerListRef = useRef<HTMLDivElement>(null);
  const listViewPlayerListRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [activeFilter, setActiveFilter] = useState("Все");

  // Track initial state for unsaved changes detection
  const initialPlayersRef = useRef<string>("");

  const [selectedPlayers, setSelectedPlayers] = useState<{ id: number; slotIndex: number }[]>(() => {
    const parsed = safeGetItem<{ id: number; slotIndex: number }[]>("fantasyTeamPlayers", []);
    initialPlayersRef.current = JSON.stringify(parsed);
    return parsed;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Все команды");
  const [selectedPoints, setSelectedPoints] = useState("Фильтр по очкам");
  const [priceFrom, setPriceFrom] = useState(3);
  const [priceTo, setPriceTo] = useState(14);
  const [captain, setCaptain] = useState<number | null>(() => {
    return safeGetItem<number | null>("fantasyTeamCaptain", null);
  });
  const [viceCaptain, setViceCaptain] = useState<number | null>(() => {
    return safeGetItem<number | null>("fantasyTeamViceCaptain", null);
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
  // Sorting state: default to price descending (most expensive first)
  const [sortField, setSortField] = useState<"name" | "points" | "price" | null>("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

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
  const leagueId = localStorage.getItem('fantasySelectedLeagueId') || '116';
  const { deadlineDate, isLoading: deadlineLoading, timeLeft, formattedDeadline } = useDeadline(leagueId);

  // API teams and players
  const { teams: apiTeams, isLoading: isLoadingTeams } = useTeams(leagueId);
  const { players: apiPlayers, isLoading: isLoadingPlayers } = usePlayers(leagueId);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const scrollSearchIntoView = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = searchInputRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: Math.max(0, top), behavior });
    },
    [headerHeight],
  );

  // Track if initial scroll has been done for this focus session
  const initialScrollDoneRef = useRef(false);

  // Reset the flag when search loses focus
  useEffect(() => {
    if (!isSearchFocused) {
      initialScrollDoneRef.current = false;
    }
  }, [isSearchFocused]);

  const ensureSearchVisibleOnce = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      if (initialScrollDoneRef.current) return;
      initialScrollDoneRef.current = true;
      scrollSearchIntoView(behavior);
      window.setTimeout(() => scrollSearchIntoView("auto"), 120);
      window.setTimeout(() => scrollSearchIntoView("auto"), 360);
    },
    [scrollSearchIntoView],
  );

  // Scroll search into view only on initial keyboard open
  useEffect(() => {
    if (!isSearchFocused) return;

    const vv = window.visualViewport;
    let initialHeight = vv?.height ?? window.innerHeight;

    const onViewportResize = () => {
      const currentHeight = vv?.height ?? window.innerHeight;
      // Only scroll when keyboard appears (height decreases significantly)
      if (currentHeight < initialHeight - 100 && !initialScrollDoneRef.current) {
        ensureSearchVisibleOnce("auto");
      }
    };

    vv?.addEventListener("resize", onViewportResize);

    return () => {
      vv?.removeEventListener("resize", onViewportResize);
    };
  }, [isSearchFocused, ensureSearchVisibleOnce]);

  // Use API players
  const teams = ["Все команды", ...(apiTeams.map(t => t.name))];
  const pointsOptions = [
    { label: "Фильтр по очкам", value: "Фильтр по очкам" },
    { label: "80+", value: "80+" },
    { label: "70-79", value: "70-79" },
    { label: "60-69", value: "60-69" },
    { label: "< 60", value: "<60" },
  ];

  const filters = ["Все", "Вратари", "Защитники", "Полузащитники", "Нападающие"];

  // Use API players
  const players = apiPlayers;

  const selectedPlayerIds = selectedPlayers.map((sp) => sp.id);
  const selectedPlayersData = players
    .filter((p) => selectedPlayerIds.includes(p.id))
    .map((p) => {
      const slotInfo = selectedPlayers.find((sp) => sp.id === p.id);
      const opponentData = getNextOpponentData(p.team);
      return { 
        ...p, 
        slotIndex: slotInfo?.slotIndex,
        nextOpponent: opponentData.nextOpponent,
        nextOpponentHome: opponentData.nextOpponentHome,
      };
    });

  // Filter players based on activeFilter, search query, team, and points
  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.trim().toLowerCase();
    // Ищем по фамилии (последнее слово в ФИО), но если её нет — по полному имени
    const [firstName, ...lastNameParts] = player.name.split(" ");
    const lastName = lastNameParts.join(" ").toLowerCase();
    const fullName = player.name.toLowerCase();
    const searchTarget = lastName || fullName;
    const matchesSearch = query === "" || searchTarget.includes(query);
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

  // Apply sorting (default to price descending if no sort is set)
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const effectiveSortField = sortField || "price";
    const effectiveSortDirection = sortDirection || "desc";

    if (effectiveSortField === "name") {
      // Сортируем по фамилии (последнее слово в ФИО). Если фамилии нет, используем полное имя.
      const [aFirst, ...aLastParts] = a.name.split(" ");
      const [bFirst, ...bLastParts] = b.name.split(" ");
      const aLast = (aLastParts.join(" ") || a.name).toLowerCase();
      const bLast = (bLastParts.join(" ") || b.name).toLowerCase();
      const comparison = aLast.localeCompare(bLast, "ru");
      return effectiveSortDirection === "asc" ? comparison : -comparison;
    }
    if (effectiveSortField === "points") {
      return effectiveSortDirection === "desc" ? b.points - a.points : a.points - b.points;
    }
    if (effectiveSortField === "price") {
      return effectiveSortDirection === "desc" ? b.price - a.price : a.price - b.price;
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
    setPriceTo(14);
    setCurrentPage(1);
    // Reset sorting to default (price descending)
    setSortField("price");
    setSortDirection("desc");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    activeFilter !== "Все" ||
    selectedTeam !== "Все команды" ||
    selectedPoints !== "Фильтр по очкам" ||
    priceFrom !== 3 ||
    priceTo !== 14;

  // Price control handlers
  const handlePriceFromIncrease = () => {
    setPriceFrom((prev) => Math.min(prev + 1, priceTo));
    setCurrentPage(1);
  };
  const handlePriceFromDecrease = () => {
    setPriceFrom((prev) => Math.max(prev - 1, 3));
    setCurrentPage(1);
  };
  const handlePriceToIncrease = () => {
    setPriceTo((prev) => Math.min(prev + 1, 14));
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
      const targetRef = activeTab === "list" ? listViewPlayerListRef : playerListRef;
      targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const BUDGET = 100;
  const MAX_PLAYERS_PER_CLUB = 3;
  const currentTeamCost = Math.round(selectedPlayersData.reduce((sum, p) => sum + p.price, 0) * 10) / 10;
  const currentBalance = Math.round((BUDGET - currentTeamCost) * 10) / 10;

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
      // Check budget before adding (round to 1 decimal for comparison)
      const roundedPrice = Math.round(player.price * 10) / 10;
      const roundedBalance = Math.round(currentBalance * 10) / 10;
      if (roundedPrice > roundedBalance) {
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

    // Round to 1 decimal place before comparison (prices are only to tenths)
    const roundedMinCost = Math.round(minCostToFillAll * 10) / 10;
    const roundedBudget = Math.round(availableBudget * 10) / 10;
    if (roundedMinCost > roundedBudget) {
      toast.error(
        `Недостаточно бюджета. Требуется минимум ${roundedMinCost.toFixed(1)}, доступно ${roundedBudget.toFixed(1)}`,
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    if (selectedPlayers.length < 15) {
      setShowSquadError(true);
      toast.error(`Состав не сформирован. Выбрано ${selectedPlayers.length} из 15 игроков`);
      return;
    }

    // Separate main players (11) from bench players (4)
    // Bench = rightmost slot for each position (last slotIndex)
    // POSITION_SLOTS: ВР: 2, ЗЩ: 5, ПЗ: 5, НП: 3
    // Bench slots: ВР slot 1, ЗЩ slot 4, ПЗ slot 4, НП slot 2
    const benchSlotIndices: Record<string, number> = {
      ВР: 1,  // rightmost of 2 (0, 1)
      ЗЩ: 4,  // rightmost of 5 (0, 1, 2, 3, 4)
      ПЗ: 4,  // rightmost of 5 (0, 1, 2, 3, 4)
      НП: 2,  // rightmost of 3 (0, 1, 2)
    };

    const mainPlayerIds: number[] = [];
    const benchPlayerIds: number[] = [];

    selectedPlayers.forEach((sp) => {
      const player = players.find((p) => p.id === sp.id);
      if (!player) return;

      const isBench = sp.slotIndex === benchSlotIndices[player.position];
      if (isBench) {
        benchPlayerIds.push(sp.id);
      } else {
        mainPlayerIds.push(sp.id);
      }
    });

    // Validate we have correct counts
    if (mainPlayerIds.length !== 11 || benchPlayerIds.length !== 4) {
      toast.error("Ошибка разделения состава на основной и запасных");
      return;
    }

    setIsSaving(true);
    try {
      const leagueId = parseInt(localStorage.getItem('fantasySelectedLeagueId') || '116');
      const favTeamRaw = localStorage.getItem('fantasyFavoriteTeam') || '0';
      const favTeamId = Number.isNaN(Number(favTeamRaw)) ? 0 : Number(favTeamRaw);

      const response = await squadsApi.create({
        name: teamName,
        league_id: leagueId,
        fav_team_id: favTeamId,
        main_player_ids: mainPlayerIds,
        bench_player_ids: benchPlayerIds,
      });

      if (!response.success) {
        toast.error(response.error || "Ошибка при сохранении команды");
        return;
      }

      // Save to localStorage
      localStorage.setItem("fantasyTeamPlayers", JSON.stringify(selectedPlayers));
      localStorage.setItem("fantasyTeamName", teamName);
      localStorage.setItem("fantasyTeamCaptain", JSON.stringify(captain));
      localStorage.setItem("fantasyTeamViceCaptain", JSON.stringify(viceCaptain));
      if (response.data?.id) {
        localStorage.setItem("fantasySquadId", response.data.id.toString());
      }
      initialPlayersRef.current = JSON.stringify(selectedPlayers);
      toast.success("Команда сохранена!");
    } catch (error) {
      console.error('Failed to save squad:', error);
      toast.error("Ошибка при сохранении команды");
    } finally {
      setIsSaving(false);
    }
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
      {/* Header - sticky wrapper to match /league */}
      <div ref={headerRef} className="sticky top-0 z-50">
        <SportHeader
          hasUnsavedChanges={hasUnsavedChanges}
          onDiscardChanges={handleDiscardChanges}
        />
      </div>


      {/* Team Header */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-transparent"
            onClick={() => setIsEditTeamNameModalOpen(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Дедлайн: {deadlineLoading ? '...' : formattedDeadline || '—'}
          </span>
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
      <div className="px-4 mt-4">
        <div className="flex bg-secondary rounded-lg p-1">
          <Button
            onClick={() => setActiveTab("formation")}
            className={`flex-1 rounded-md ${
              activeTab === "formation"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Расстановка
          </Button>
          <Button
            onClick={() => setActiveTab("list")}
            className={`flex-1 rounded-md ${
              activeTab === "list"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Список
          </Button>
        </div>
      </div>

      {activeTab === "formation" && (
        <>
          {/* Football Field - clip bottom like before, but reserve top space for goal/sponsor logos */}
          <div className="mt-10 sm:mt-14 md:mt-16 lg:mt-20 overflow-hidden pt-[6%]">
            <div className="mb-[-18%]">
              <FormationField
              mode="create"
              players={selectedPlayersData}
              onRemovePlayer={(id) => togglePlayer(id)}
              onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
              onEmptySlotClick={(position) => handleEmptySlotClick(position)}
              captain={captain}
              viceCaptain={viceCaptain}
              showCaptainBadges={false}
            />
            </div>
          </div>

          {/* Divider between selected players and available players */}
          <div className="mx-4 mt-6 mb-2 border-t border-border" />
          <div className="px-4 mb-4">
            <h3 className="text-foreground text-xl font-semibold">Доступные игроки</h3>
          </div>

          {/* Search */}
          <div className="px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Поиск"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  window.setTimeout(() => {
                    scrollSearchIntoView("smooth");
                  }, 350);
                }}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                className="pl-10 pr-10 h-10 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Очистить поиск"
                  onClick={() => {
                    handleSearchChange("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible filters - animated hide when search is focused */}
          <div 
            className={`transition-all duration-300 ease-out overflow-hidden ${
              isSearchFocused ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
            }`}
          >
            {/* Teams Filter */}
            <div className="px-4 mt-2 relative z-20">
                <Select value={selectedTeam} onValueChange={handleTeamChange}>
                  <SelectTrigger className="w-full h-10 bg-card border-border rounded-xl text-foreground cursor-pointer">
                    <SelectValue placeholder="Все команды" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="Все команды" className="text-foreground hover:bg-secondary cursor-pointer">
                      <span>Все команды</span>
                    </SelectItem>
                    {isLoadingTeams ? (
                      <div className="px-4 py-2 text-muted-foreground">Загрузка...</div>
                    ) : apiTeams.length > 0 ? (
                      apiTeams.map((team) => (
                        <SelectItem key={team.id} value={team.name} className="text-foreground hover:bg-secondary cursor-pointer">
                          <div className="flex items-center gap-2">
                            <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                            <span>{team.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      teams.filter(t => t !== "Все команды").map((team) => (
                        <SelectItem key={team} value={team} className="text-foreground hover:bg-secondary cursor-pointer">
                          <div className="flex items-center gap-2">
                            {clubLogos[team] && (
                              <img src={clubLogos[team]} alt={team} className="w-5 h-5 object-contain" />
                            )}
                            <span>{team}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Position Filters */}
              <div ref={playerListRef} className="px-4 mt-2 flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    size="sm"
                    className={`flex-shrink-0 rounded-full h-8 px-4 ${
                      activeFilter === filter
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
                        : "bg-card text-muted-foreground hover:bg-card/80 border border-border"
                    }`}
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              {/* Price Range */}
              <div className="px-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Цена:</span>
                  <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
                    <button
                      onClick={handlePriceFromDecrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-primary-foreground" />
                    </button>
                    <span className="text-foreground text-sm w-9 text-center">{priceFrom.toFixed(1)}</span>
                    <button
                      onClick={handlePriceFromIncrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-primary-foreground" />
                    </button>
                  </div>
                  <span className="text-muted-foreground text-sm">—</span>
                  <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
                    <button
                      onClick={handlePriceToDecrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-primary-foreground" />
                    </button>
                    <span className="text-foreground text-sm w-9 text-center">{priceTo.toFixed(1)}</span>
                    <button
                      onClick={handlePriceToIncrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-primary-foreground" />
                    </button>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "list" && (
        <>
          <div className="px-4 mt-6">
            <h2 className="text-foreground text-xl font-bold mb-4">Состав команды</h2>
          </div>
          <TeamListView
            selectedPlayers={selectedPlayersData}
            onRemovePlayer={(id) => togglePlayer(id)}
            onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
            onEmptySlotClick={handleEmptySlotClick}
            clubIcons={clubLogos}
          />

          {/* Divider between selected players and available players */}
          <div className="mx-4 mt-6 mb-2 border-t border-border" />
          <div className="px-4 mb-4">
            <h3 className="text-foreground text-xl font-semibold">Доступные игроки</h3>
          </div>

          {/* Search for List View */}
          <div className="px-4 relative z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                className="pl-10 pr-10 h-10 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Очистить поиск"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible filters for List View - animated hide when search is focused */}
          <div 
            className={`transition-all duration-300 ease-out overflow-hidden ${
              isSearchFocused ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
            }`}
          >
            {/* Teams Filter for List View */}
            <div className="px-4 mt-2 relative z-20">
                <Select value={selectedTeam} onValueChange={handleTeamChange}>
                  <SelectTrigger className="w-full h-10 bg-card border-border rounded-xl text-foreground cursor-pointer">
                    <SelectValue placeholder="Все команды" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="Все команды" className="text-foreground hover:bg-secondary cursor-pointer">
                      <span>Все команды</span>
                    </SelectItem>
                    {isLoadingTeams ? (
                      <div className="px-4 py-2 text-muted-foreground">Загрузка...</div>
                    ) : apiTeams.length > 0 ? (
                      apiTeams.map((team) => (
                        <SelectItem key={team.id} value={team.name} className="text-foreground hover:bg-secondary cursor-pointer">
                          <div className="flex items-center gap-2">
                            <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                            <span>{team.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      teams.filter(t => t !== "Все команды").map((team) => (
                        <SelectItem key={team} value={team} className="text-foreground hover:bg-secondary cursor-pointer">
                          <div className="flex items-center gap-2">
                            {clubLogos[team] && (
                              <img src={clubLogos[team]} alt={team} className="w-5 h-5 object-contain" />
                            )}
                            <span>{team}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Position Filters for List View */}
              <div ref={listViewPlayerListRef} className="px-4 mt-2 flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    size="sm"
                    className={`flex-shrink-0 rounded-full h-8 px-4 ${
                      activeFilter === filter
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
                        : "bg-card text-muted-foreground hover:bg-card/80 border border-border"
                    }`}
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              {/* Price Range for List View */}
              <div className="px-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Цена:</span>
                  <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
                    <button
                      onClick={handlePriceFromDecrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-primary-foreground" />
                    </button>
                    <span className="text-foreground text-sm w-9 text-center">{priceFrom.toFixed(1)}</span>
                    <button
                      onClick={handlePriceFromIncrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-primary-foreground" />
                    </button>
                  </div>
                  <span className="text-muted-foreground text-sm">—</span>
                  <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
                    <button
                      onClick={handlePriceToDecrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-primary-foreground" />
                    </button>
                    <span className="text-foreground text-sm w-9 text-center">{priceTo.toFixed(1)}</span>
                    <button
                      onClick={handlePriceToIncrease}
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-primary-foreground" />
                    </button>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}


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
        <div className="w-14 flex items-center justify-center">
          <button
            onClick={() => handleSort("points")}
            className={`flex items-center gap-1 transition-colors ${sortField === "points" ? "text-primary" : "hover:text-foreground"}`}
          >
            <PointsColumnHeader type="season" className={sortField === "points" ? "text-primary" : ""}>
              <span>Очки</span>
            </PointsColumnHeader>
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
        </div>
        <div className="w-14 flex items-center justify-center mr-8">
          <button
            onClick={() => handleSort("price")}
            className={`flex items-center gap-1 transition-colors ${sortField === "price" ? "text-primary" : "hover:text-foreground"}`}
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
        </div>
      </div>

      {/* Players List */}
      <div className={`px-4 mt-3 space-y-2 ${totalPages <= 1 ? 'pb-[100px]' : 'pb-6'}`}>
        {paginatedPlayers.map((player) => {
          const isSelected = selectedPlayerIds.includes(player.id);
          return (
            <div key={player.id} className="bg-card rounded-xl px-4 py-2 flex items-center">
              {/* Club icon */}
              <div className="w-6 flex-shrink-0 flex justify-center mr-2">
                <img src={(player as TransformedPlayer).team_logo || clubLogos[player.team] || clubLogo} alt={player.team} className="w-5 h-5 object-contain" />
              </div>

              {/* Player name + position - flexible */}
              <div
                className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                onClick={() => setSelectedPlayerForCard(player.id)}
              >
                <span className="text-foreground font-medium truncate">{player.name}</span>
                <span className="text-muted-foreground text-xs flex-shrink-0">{player.position}</span>
              </div>

              {/* Points - fixed width, centered */}
              <div className="w-14 flex-shrink-0 flex items-center justify-center">
                <span className={`text-sm font-medium ${
                  player.points > 0 ? "text-success" : player.points < 0 ? "text-destructive" : "text-foreground"
                }`}>
                  {player.points > 0 ? `+${player.points}` : player.points}
                </span>
              </div>

              {/* Price - fixed width, centered */}
              <div className="w-14 flex-shrink-0 flex items-center justify-center">
                <span className="text-foreground text-sm">{player.price.toFixed(1)}</span>
              </div>

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
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-foreground text-sm font-bold">!</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Ты не можешь добавлять более трёх игроков из одного клуба в свою команду
          </p>
        </div>
      </div>

      {/* Team Cost & Balance - Sticky */}
      <div className="sticky left-0 right-0 bg-background border-t border-border px-4 py-2 z-40" style={{ bottom: 0 }}>
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
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-foreground text-sm font-bold">!</span>
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
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-lg py-3"
          >
            Автосбор
          </Button>
          <Button
            onClick={handleReset}
            disabled={selectedPlayers.length === 0}
            className={`flex-1 font-semibold rounded-lg py-3 ${
              selectedPlayers.length === 0
                ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                : "bg-secondary hover:bg-secondary/80 text-foreground"
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
          disabled={isSaving}
          className={`w-full rounded-lg py-3 font-semibold transition-all ${
            selectedPlayers.length < 15 || isSaving
              ? "bg-primary/30 text-muted-foreground"
              : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
          }`}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <AlertDialogContent className="bg-card border-border rounded-xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-center">
              Сохранить команду?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center">
              Твоя команда "{teamName}" будет сохранена. Именно с этим составом ты входишь в сезон.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 justify-center mt-2">
            <AlertDialogCancel className="flex-1 m-0 bg-secondary hover:bg-secondary/80 text-foreground border-none rounded-lg h-11">
              Вернуться
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  // Small delay to ensure auth tokens are synced
                  await new Promise(resolve => setTimeout(resolve, 300));
                  
                  const benchSlotIndices: Record<string, number> = {
                    ВР: 1,
                    ЗЩ: 4,
                    ПЗ: 4,
                    НП: 2,
                  };
                  const mainPlayerIds: number[] = [];
                  const benchPlayerIds: number[] = [];

                  selectedPlayers.forEach((sp) => {
                    const player = players.find((p) => p.id === sp.id);
                    if (!player) return;
                    const isBench = sp.slotIndex === benchSlotIndices[player.position];
                    if (isBench) {
                      benchPlayerIds.push(sp.id);
                    } else {
                      mainPlayerIds.push(sp.id);
                    }
                  });

                  const leagueIdNum = parseInt(localStorage.getItem('fantasySelectedLeagueId') || '116');
                  const favTeamId = parseInt(localStorage.getItem('fantasyFavoriteTeam') || '0');

                  // Auto-assign captain and vice-captain if not selected
                  // Choose most expensive players from main squad
                  let finalCaptain = captain;
                  let finalViceCaptain = viceCaptain;
                  
                  if (!finalCaptain || !finalViceCaptain) {
                    const mainSquadPlayers = mainPlayerIds
                      .map(id => players.find(p => p.id === id))
                      .filter((p): p is typeof players[0] => p !== undefined)
                      .sort((a, b) => (b.price || 0) - (a.price || 0));
                    
                    if (!finalCaptain && mainSquadPlayers.length > 0) {
                      finalCaptain = mainSquadPlayers[0].id;
                    }
                    if (!finalViceCaptain && mainSquadPlayers.length > 1) {
                      // Vice-captain must be different from captain
                      const viceCaptainCandidate = mainSquadPlayers.find(p => p.id !== finalCaptain);
                      if (viceCaptainCandidate) {
                        finalViceCaptain = viceCaptainCandidate.id;
                      }
                    }
                  }

                  const requestBody: any = {
                    name: teamName,
                    league_id: leagueIdNum,
                    fav_team_id: favTeamId,
                    main_player_ids: mainPlayerIds,
                    bench_player_ids: benchPlayerIds,
                  };
                  
                  // Always include captain/vice-captain (auto-assigned if needed)
                  if (finalCaptain !== null) {
                    requestBody.captain_id = finalCaptain;
                  }
                  if (finalViceCaptain !== null) {
                    requestBody.vice_captain_id = finalViceCaptain;
                  }

                  console.log("Creating squad with data:", requestBody);
                  const response = await squadsApi.create(requestBody);
                  console.log("Squad creation response:", response);
                  if (response.success && response.data) {
                    toast.success("Команда успешно создана!");
                    localStorage.setItem("fantasyTeamPlayers", JSON.stringify(selectedPlayers));
                    localStorage.setItem("fantasyTeamCaptain", JSON.stringify(captain));
                    localStorage.setItem("fantasyTeamViceCaptain", JSON.stringify(viceCaptain));
                    initialPlayersRef.current = JSON.stringify(selectedPlayers);
                    setShowSaveConfirmation(false);
                    
                    // Invalidate cache to ensure fresh data on next pages
                    await queryClient.invalidateQueries({ queryKey: ['my-squads'] });
                    await queryClient.invalidateQueries({ queryKey: ['players', leagueIdNum] });
                    await queryClient.invalidateQueries({ queryKey: ['tours', leagueIdNum] });
                    
                    // Mark that team was just created to handle back button properly
                    sessionStorage.setItem("fantasyTeamJustCreated", "true");
                    
                    // Check if there's a pending league invite
                    const pendingInvite = localStorage.getItem("fantasyLeagueInvite");
                    if (pendingInvite) {
                      try {
                        const inviteData = JSON.parse(pendingInvite);
                        const userLeagueId = parseInt(inviteData.leagueId, 10);
                        const newSquadId = response.data.id;
                        
                        if (Number.isFinite(userLeagueId) && newSquadId) {
                          // Automatically join the league without additional confirmation
                          const joinResponse = await customLeaguesApi.joinUserLeague(userLeagueId, newSquadId);
                          
                          if (joinResponse.success) {
                            // Remove invite from localStorage after successful join
                            localStorage.removeItem("fantasyLeagueInvite");
                            // Invalidate cache so league list refreshes
                            await queryClient.invalidateQueries({ queryKey: ["mySquadLeagues"] });
                            toast.success(`Вы автоматически добавлены в лигу "${inviteData.leagueName}"`);
                            // Navigate directly to the league
                            navigate(`/view-user-league/${userLeagueId}`);
                            return;
                          } else {
                            // Check if user is already in the league
                            if (joinResponse.error && (joinResponse.error.includes('уже') || joinResponse.error.includes('already'))) {
                              // User is already in this league (shouldn't normally happen but handle it)
                              localStorage.removeItem("fantasyLeagueInvite");
                              await queryClient.invalidateQueries({ queryKey: ["mySquadLeagues"] });
                              toast.success(`Вы уже вступили в лигу по данной ссылке-приглашению`);
                              navigate(`/view-user-league/${userLeagueId}`);
                              return;
                            }
                            // If auto-join fails for other reason, don't show error - just keep invite for manual join
                            console.warn("Auto-join failed:", joinResponse.error);
                            // Navigate to home to show the modal for manual join
                            navigate("/");
                            return;
                          }
                        }
                      } catch (error) {
                        console.error("Error auto-joining league:", error);
                        // If parsing or joining fails, keep invite for manual join
                        navigate("/");
                        return;
                      }
                    }
                    
                    // No pending invite, go to league page
                    navigate("/league");
                  } else {
                    console.error("Squad creation failed:", response.error);
                    const errorMsg = response.error || "Не удалось создать команду";
                    toast.error(`Ошибка: ${errorMsg}`);
                  }
                } catch (err) {
                  console.error("Exception during squad creation:", err);
                  const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
                  toast.error(`Ошибка при отправке запроса: ${errorMessage}`);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="flex-1 m-0 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-lg h-11 shadow-neon"
            >
              {isSaving ? "Сохранение..." : "Подтвердить"}
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
        hidePointsBreakdown
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

      {/* Home Button */}
      {/* <div className="px-4 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div> */}
    </div>
  );
};

export default TeamBuilder;
