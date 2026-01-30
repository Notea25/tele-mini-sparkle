import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy, Users, TrendingUp, Shield } from "lucide-react";
import { squadsApi, TourHistorySnapshot } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PlayerCard from "@/components/PlayerCard";

interface TourHistoryProps {
  squadId?: number;
}

export default function TourHistory({ squadId: propSquadId }: TourHistoryProps) {
  const { squadId: paramSquadId } = useParams<{ squadId: string }>();
  const navigate = useNavigate();
  const squadId = propSquadId || Number(paramSquadId);

  const [history, setHistory] = useState<TourHistorySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTourIndex, setSelectedTourIndex] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      if (!squadId) {
        setError("Squad ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await squadsApi.getHistory(squadId);

        if (response.success && response.data) {
          // Сортируем по номеру тура по убыванию (сначала последние)
          const sortedHistory = [...response.data].sort(
            (a, b) => b.tour_number - a.tour_number
          );
          setHistory(sortedHistory);
          setError(null);
        } else {
          setError(response.error || "Failed to load tour history");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [squadId]);

  const selectedTour = history[selectedTourIndex];

  const getPositionIcon = (position: string) => {
    switch (position.toLowerCase()) {
      case "goalkeeper":
        return Shield;
      case "defender":
        return Shield;
      case "midfielder":
        return TrendingUp;
      case "attacker":
      case "forward":
        return Trophy;
      default:
        return Users;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mt-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Alert>
            <AlertDescription>
              No tour history available yet. Complete at least one tour to see your history.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Tour History</h1>
            <p className="text-gray-400 text-sm">
              View your squad's performance across different tours
            </p>
          </div>
        </div>

        {/* Tour selector */}
        <Card className="bg-[#1e2a3e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Select Tour</CardTitle>
            <CardDescription>
              Browse through your past tours to see historic squad compositions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {history.map((tour, index) => (
                <Button
                  key={tour.tour_id}
                  onClick={() => setSelectedTourIndex(index)}
                  variant={index === selectedTourIndex ? "default" : "outline"}
                  className={
                    index === selectedTourIndex
                      ? "bg-[#00ff87] text-black hover:bg-[#00dd77]"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  }
                >
                  Tour {tour.tour_number}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedTour && (
          <>
            {/* Tour stats */}
            <Card className="bg-[#1e2a3e] border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-2xl">
                      Tour {selectedTour.tour_number}
                    </CardTitle>
                    <CardDescription>
                      Snapshot of your squad for this tour
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#00ff87]">
                      {selectedTour.points}
                    </div>
                    <div className="text-sm text-gray-400">Points</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTour.used_boost && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                      Boost Used: {selectedTour.used_boost}
                    </Badge>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Main Squad</div>
                    <div className="text-white font-semibold">
                      {selectedTour.main_players.length} players
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Bench</div>
                    <div className="text-white font-semibold">
                      {selectedTour.bench_players.length} players
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Main Squad Points</div>
                    <div className="text-white font-semibold">
                      {selectedTour.main_players.reduce(
                        (sum, p) => sum + p.tour_points,
                        0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Top Scorer</div>
                    <div className="text-white font-semibold">
                      {
                        [...selectedTour.main_players].sort(
                          (a, b) => b.tour_points - a.tour_points
                        )[0]?.name
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Squad */}
            <Card className="bg-[#1e2a3e] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Main Squad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTour.main_players.map((player) => {
                    const Icon = getPositionIcon(player.position);
                    const isCaptain = player.id === selectedTour.captain_id;
                    const isViceCaptain = player.id === selectedTour.vice_captain_id;

                    return (
                      <div
                        key={player.id}
                        className={`relative p-3 rounded-lg border ${
                          isCaptain
                            ? "border-yellow-500 bg-yellow-500/10"
                            : isViceCaptain
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-700 bg-gray-800/50"
                        }`}
                      >
                        {isCaptain && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                            Captain
                          </Badge>
                        )}
                        {isViceCaptain && (
                          <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                            Vice
                          </Badge>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {player.photo ? (
                              <img
                                src={player.photo}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <span>{player.position}</span>
                              <span>•</span>
                              <span>{player.team_name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#00ff87]">
                              {player.tour_points}
                            </div>
                            <div className="text-xs text-gray-500">pts</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Bench */}
            <Card className="bg-[#1e2a3e] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Bench
                </CardTitle>
                <CardDescription>
                  Reserve players for this tour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTour.bench_players.map((player) => {
                    const Icon = getPositionIcon(player.position);

                    return (
                      <div
                        key={player.id}
                        className="p-3 rounded-lg border border-gray-700 bg-gray-800/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {player.photo ? (
                              <img
                                src={player.photo}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <span>{player.position}</span>
                              <span>•</span>
                              <span>{player.team_name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-500">
                              {player.tour_points}
                            </div>
                            <div className="text-xs text-gray-600">pts</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
