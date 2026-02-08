import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { leaguesApi, teamsApi, usersApi, squadsApi, toursApi, playersApi, boostsApi, customLeaguesApi, commercialLeaguesApi, playerStatusesApi, ApiResponse, BoostType, apiRequest, PlayerStatusCreate, PlayerStatusType } from '@/lib/api';

const BackendTest = () => {
  const navigate = useNavigate();
  const [leagueResponse, setLeagueResponse] = useState<ApiResponse<unknown> | null>(null);
  const [teamsResponse, setTeamsResponse] = useState<ApiResponse<unknown> | null>(null);
  const [usersResponse, setUsersResponse] = useState<ApiResponse<unknown> | null>(null);
  const [squadsCreateResponse, setSquadsCreateResponse] = useState<ApiResponse<unknown> | null>(null);
  const [mySquadsResponse, setMySquadsResponse] = useState<ApiResponse<unknown> | null>(null);
  const [getSquadByIdResponse, setGetSquadByIdResponse] = useState<ApiResponse<unknown> | null>(null);
  const [squadHistoryResponse, setSquadHistoryResponse] = useState<ApiResponse<unknown> | null>(null);
  const [getSquadByIdPublicResponse, setGetSquadByIdPublicResponse] = useState<ApiResponse<unknown> | null>(null);
  const [deadlineResponse, setDeadlineResponse] = useState<ApiResponse<unknown> | null>(null);
  const [toursResponse, setToursResponse] = useState<ApiResponse<unknown> | null>(null);
  const [startTourResponse, setStartTourResponse] = useState<ApiResponse<unknown> | null>(null);
  const [finalizeTourResponse, setFinalizeTourResponse] = useState<ApiResponse<unknown> | null>(null);
  const [playersResponse, setPlayersResponse] = useState<ApiResponse<unknown> | null>(null);
  const [playerFullInfoResponse, setPlayerFullInfoResponse] = useState<ApiResponse<unknown> | null>(null);
  const [leaderboardResponse, setLeaderboardResponse] = useState<ApiResponse<unknown> | null>(null);
  const [updatePlayersResponse, setUpdatePlayersResponse] = useState<ApiResponse<unknown> | null>(null);
  const [replacePlayersResponse, setReplacePlayersResponse] = useState<ApiResponse<unknown> | null>(null);
  const [boostApplyResponse, setBoostApplyResponse] = useState<ApiResponse<unknown> | null>(null);
  const [boostAvailableResponse, setBoostAvailableResponse] = useState<ApiResponse<unknown> | null>(null);
  const [boostRemoveResponse, setBoostRemoveResponse] = useState<ApiResponse<unknown> | null>(null);
  const [commercialLeaguesResponse, setCommercialLeaguesResponse] = useState<ApiResponse<unknown> | null>(null);
  const [commercialLeagueJoinResponse, setCommercialLeagueJoinResponse] = useState<ApiResponse<unknown> | null>(null);
  const [loadingLeague, setLoadingLeague] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSquadsCreate, setLoadingSquadsCreate] = useState(false);
  const [loadingMySquads, setLoadingMySquads] = useState(false);
  const [loadingGetSquadById, setLoadingGetSquadById] = useState(false);
  const [loadingGetSquadByIdPublic, setLoadingGetSquadByIdPublic] = useState(false);
  const [loadingSquadHistory, setLoadingSquadHistory] = useState(false);
  const [loadingDeadline, setLoadingDeadline] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
  const [loadingStartTour, setLoadingStartTour] = useState(false);
  const [loadingFinalizeTour, setLoadingFinalizeTour] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingPlayerFullInfo, setLoadingPlayerFullInfo] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [loadingUpdatePlayers, setLoadingUpdatePlayers] = useState(false);
  const [loadingReplacePlayers, setLoadingReplacePlayers] = useState(false);
  const [loadingBoostApply, setLoadingBoostApply] = useState(false);
  const [loadingBoostAvailable, setLoadingBoostAvailable] = useState(false);
  const [loadingBoostRemove, setLoadingBoostRemove] = useState(false);
  const [loadingCommercialLeagues, setLoadingCommercialLeagues] = useState(false);
  const [loadingCommercialLeagueJoin, setLoadingCommercialLeagueJoin] = useState(false);
  const [commercialLeagueIdInput, setCommercialLeagueIdInput] = useState('116');
  const [joinCommercialLeagueIdInput, setJoinCommercialLeagueIdInput] = useState('1');
  const [joinSquadIdInput, setJoinSquadIdInput] = useState('7');
  const [playerIdInput, setPlayerIdInput] = useState('1');
  const [tourIdInput, setTourIdInput] = useState('2');
  const [startTourIdInput, setStartTourIdInput] = useState('1');
  const [finalizeTourIdInput, setFinalizeTourIdInput] = useState('1');
  const [squadIdInput, setSquadIdInput] = useState('1');
  const [getSquadIdInput, setGetSquadIdInput] = useState('7');
  const [historySquadIdInput, setHistorySquadIdInput] = useState('7');
  const [captainIdInput, setCaptainIdInput] = useState('');
  const [viceCaptainIdInput, setViceCaptainIdInput] = useState('');
  const [mainPlayerIdsInput, setMainPlayerIdsInput] = useState('');
  const [benchPlayerIdsInput, setBenchPlayerIdsInput] = useState('');
  const [replaceSquadIdInput, setReplaceSquadIdInput] = useState('1');
  const [replaceMainPlayerIdsInput, setReplaceMainPlayerIdsInput] = useState('');
  const [replaceBenchPlayerIdsInput, setReplaceBenchPlayerIdsInput] = useState('');
  const [replaceCaptainIdInput, setReplaceCaptainIdInput] = useState('');
  const [replaceViceCaptainIdInput, setReplaceViceCaptainIdInput] = useState('');
  const [boostSquadIdInput, setBoostSquadIdInput] = useState('1');
  const [boostTourIdInput, setBoostTourIdInput] = useState('1');
  const [boostTypeInput, setBoostTypeInput] = useState<BoostType>('bench_boost');
  const [availableBoostSquadIdInput, setAvailableBoostSquadIdInput] = useState('1');
  const [availableBoostTourIdInput, setAvailableBoostTourIdInput] = useState('1');
  const [removeBoostSquadIdInput, setRemoveBoostSquadIdInput] = useState('1');
  const [removeBoostTourIdInput, setRemoveBoostTourIdInput] = useState('1');

  // Collapsible section states
  const [isLeaguesOpen, setIsLeaguesOpen] = useState(true);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isSquadsOpen, setIsSquadsOpen] = useState(false);
  const [isToursOpen, setIsToursOpen] = useState(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isBoostsOpen, setIsBoostsOpen] = useState(false);
  const [isCommercialLeaguesOpen, setIsCommercialLeaguesOpen] = useState(false);
  const [isSquadToursOpen, setIsSquadToursOpen] = useState(false);
  const [isPlayerStatusesOpen, setIsPlayerStatusesOpen] = useState(false);

  // Player Statuses state
  const [statusIdInput, setStatusIdInput] = useState('1');
  const [statusPlayerIdInput, setStatusPlayerIdInput] = useState('1');
  const [statusTourNumberInput, setStatusTourNumberInput] = useState('1');
  const [statusTypeInput, setStatusTypeInput] = useState<PlayerStatusType>('injured');
  const [statusTourStartInput, setStatusTourStartInput] = useState('1');
  const [statusTourEndInput, setStatusTourEndInput] = useState('');
  const [statusDescriptionInput, setStatusDescriptionInput] = useState('');
  const [loadingStatusById, setLoadingStatusById] = useState(false);
  const [loadingPlayerStatuses, setLoadingPlayerStatuses] = useState(false);
  const [loadingStatusForTour, setLoadingStatusForTour] = useState(false);
  const [loadingCreateStatus, setLoadingCreateStatus] = useState(false);
  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);
  const [loadingDeleteStatus, setLoadingDeleteStatus] = useState(false);
  const [statusByIdResponse, setStatusByIdResponse] = useState<ApiResponse<unknown> | null>(null);
  const [playerStatusesResponse, setPlayerStatusesResponse] = useState<ApiResponse<unknown> | null>(null);
  const [statusForTourResponse, setStatusForTourResponse] = useState<ApiResponse<unknown> | null>(null);
  const [createStatusResponse, setCreateStatusResponse] = useState<ApiResponse<unknown> | null>(null);
  const [updateStatusResponse, setUpdateStatusResponse] = useState<ApiResponse<unknown> | null>(null);
  const [deleteStatusResponse, setDeleteStatusResponse] = useState<ApiResponse<unknown> | null>(null);

  // Squad Tours state
  const [squadTourSquadIdInput, setSquadTourSquadIdInput] = useState('7');
  const [squadTourTourIdInput, setSquadTourTourIdInput] = useState('2');
  const [loadingSquadTourSingle, setLoadingSquadTourSingle] = useState(false);
  const [loadingSquadToursAll, setLoadingSquadToursAll] = useState(false);
  const [loadingSquadToursByTour, setLoadingSquadToursByTour] = useState(false);
  const [loadingAllSquadTours, setLoadingAllSquadTours] = useState(false);
  const [squadTourSingleResponse, setSquadTourSingleResponse] = useState<ApiResponse<unknown> | null>(null);
  const [squadToursAllResponse, setSquadToursAllResponse] = useState<ApiResponse<unknown> | null>(null);
  const [squadToursByTourResponse, setSquadToursByTourResponse] = useState<ApiResponse<unknown> | null>(null);
  const [allSquadToursResponse, setAllSquadToursResponse] = useState<ApiResponse<unknown> | null>(null);

  const testLeagueApi = async () => {
    setLoadingLeague(true);
    try {
      const result = await leaguesApi.getMainPage(116);
      setLeagueResponse(result);
    } catch (err) {
      setLeagueResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingLeague(false);
    }
  };

  const testTeamsApi = async () => {
    setLoadingTeams(true);
    try {
      const result = await teamsApi.getByLeague(116);
      setTeamsResponse(result);
    } catch (err) {
      setTeamsResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const testUsersApi = async () => {
    setLoadingUsers(true);
    try {
      const result = await usersApi.getProtected();
      setUsersResponse(result);
    } catch (err) {
      setUsersResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const testSquadsCreateApi = async () => {
    setLoadingSquadsCreate(true);
    try {
      const result = await squadsApi.create({
        name: 'Test Squad',
        league_id: 116,
        fav_team_id: 379,
        main_player_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        bench_player_ids: [12, 13, 14, 15],
      });
      setSquadsCreateResponse(result);
    } catch (err) {
      setSquadsCreateResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingSquadsCreate(false);
    }
  };

  const testMySquadsApi = async () => {
    setLoadingMySquads(true);
    try {
      const result = await squadsApi.getMySquads();
      setMySquadsResponse(result);
    } catch (err) {
      setMySquadsResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingMySquads(false);
    }
  };

  const testGetSquadByIdApi = async () => {
    setLoadingGetSquadById(true);
    try {
      const result = await squadsApi.getSquadById(parseInt(getSquadIdInput) || 7);
      setGetSquadByIdResponse(result);
    } catch (err) {
      setGetSquadByIdResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingGetSquadById(false);
    }
  };

  const testGetSquadByIdPublicApi = async () => {
    setLoadingGetSquadByIdPublic(true);
    try {
      const result = await squadsApi.getSquadByIdPublic(parseInt(getSquadIdInput) || 7);
      setGetSquadByIdPublicResponse(result);
    } catch (err) {
      setGetSquadByIdPublicResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingGetSquadByIdPublic(false);
    }
  };

  const testSquadHistoryApi = async () => {
    setLoadingSquadHistory(true);
    try {
      const result = await squadsApi.getHistory(parseInt(historySquadIdInput) || 7);
      setSquadHistoryResponse(result);
    } catch (err) {
      setSquadHistoryResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingSquadHistory(false);
    }
  };

  const testDeadlineApi = async () => {
    setLoadingDeadline(true);
    try {
      const result = await toursApi.getDeadlineForNextTour(116);
      setDeadlineResponse(result);
    } catch (err) {
      setDeadlineResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingDeadline(false);
    }
  };

  const testToursApi = async () => {
    setLoadingTours(true);
    try {
      const result = await toursApi.getPreviousCurrentNextTour(116);
      setToursResponse(result);
    } catch (err) {
      setToursResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingTours(false);
    }
  };

  const testPlayersApi = async () => {
    setLoadingPlayers(true);
    try {
      const result = await playersApi.getByLeague(116);
      setPlayersResponse(result);
    } catch (err) {
      setPlayersResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingPlayers(false);
    }
  };

  const testPlayerFullInfoApi = async () => {
    setLoadingPlayerFullInfo(true);
    try {
      const result = await playersApi.getFullInfo(parseInt(playerIdInput) || 1);
      setPlayerFullInfoResponse(result);
    } catch (err) {
      setPlayerFullInfoResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingPlayerFullInfo(false);
    }
  };

  const testLeaderboardApi = async () => {
    setLoadingLeaderboard(true);
    try {
      const result = await squadsApi.getLeaderboard(parseInt(tourIdInput) || 2);
      setLeaderboardResponse(result);
    } catch (err) {
      setLeaderboardResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const testBoostAvailableApi = async () => {
    setLoadingBoostAvailable(true);
    try {
      const squadId = parseInt(availableBoostSquadIdInput) || 1;
      const tourId = parseInt(availableBoostTourIdInput) || 1;
      const result = await boostsApi.getAvailable(squadId, tourId);
      setBoostAvailableResponse(result);
    } catch (err) {
      setBoostAvailableResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingBoostAvailable(false);
    }
  };

  const testUpdatePlayersApi = async () => {
    setLoadingUpdatePlayers(true);
    try {
      const data: {
        captain_id?: number;
        vice_captain_id?: number;
        main_player_ids?: number[];
        bench_player_ids?: number[];
      } = {};
      
      if (captainIdInput) data.captain_id = parseInt(captainIdInput);
      if (viceCaptainIdInput) data.vice_captain_id = parseInt(viceCaptainIdInput);
      if (mainPlayerIdsInput) data.main_player_ids = mainPlayerIdsInput.split(',').map(id => parseInt(id.trim()));
      if (benchPlayerIdsInput) data.bench_player_ids = benchPlayerIdsInput.split(',').map(id => parseInt(id.trim()));
      
      const result = await squadsApi.updatePlayers(parseInt(squadIdInput) || 1, data);
      setUpdatePlayersResponse(result);
    } catch (err) {
      setUpdatePlayersResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingUpdatePlayers(false);
    }
  };

  const testReplacePlayersApi = async () => {
    setLoadingReplacePlayers(true);
    try {
      const mainIds = replaceMainPlayerIdsInput 
        ? replaceMainPlayerIdsInput.split(',').map(id => parseInt(id.trim()))
        : [];
      const benchIds = replaceBenchPlayerIdsInput 
        ? replaceBenchPlayerIdsInput.split(',').map(id => parseInt(id.trim()))
        : [];
      const captainId = replaceCaptainIdInput ? parseInt(replaceCaptainIdInput) : null;
      const viceCaptainId = replaceViceCaptainIdInput ? parseInt(replaceViceCaptainIdInput) : null;
      
      const result = await squadsApi.replacePlayers(
        parseInt(replaceSquadIdInput) || 1,
        { main_player_ids: mainIds, bench_player_ids: benchIds },
        captainId,
        viceCaptainId
      );
      setReplacePlayersResponse(result);
    } catch (err) {
      setReplacePlayersResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingReplacePlayers(false);
    }
  };

  const testBoostApplyApi = async () => {
    setLoadingBoostApply(true);
    try {
      const result = await boostsApi.apply({
        squad_id: parseInt(boostSquadIdInput) || 1,
        tour_id: parseInt(boostTourIdInput) || 1,
        type: boostTypeInput,
      });
      setBoostApplyResponse(result);
    } catch (err) {
      setBoostApplyResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingBoostApply(false);
    }
  };

  const testBoostRemoveApi = async () => {
    setLoadingBoostRemove(true);
    try {
      const result = await boostsApi.remove(
        parseInt(removeBoostSquadIdInput) || 1,
        parseInt(removeBoostTourIdInput) || 1
      );
      setBoostRemoveResponse(result);
    } catch (err) {
      setBoostRemoveResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingBoostRemove(false);
    }
  };


  const testCommercialLeagues = async () => {
    setLoadingCommercialLeagues(true);
    try {
      const result = await commercialLeaguesApi.getByLeague(parseInt(commercialLeagueIdInput) || 116);
      setCommercialLeaguesResponse(result);
    } catch (err) {
      setCommercialLeaguesResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingCommercialLeagues(false);
    }
  };

  const testCommercialLeagueJoin = async () => {
    setLoadingCommercialLeagueJoin(true);
    try {
      const result = await commercialLeaguesApi.join(
        parseInt(joinCommercialLeagueIdInput) || 1,
        parseInt(joinSquadIdInput) || 7
      );
      setCommercialLeagueJoinResponse(result);
    } catch (err) {
      setCommercialLeagueJoinResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingCommercialLeagueJoin(false);
    }
  };

  const testSquadTourSingle = async () => {
    setLoadingSquadTourSingle(true);
    try {
      const result = await apiRequest(`/api/squad_tours/squad/${squadTourSquadIdInput}/tour/${squadTourTourIdInput}`);
      setSquadTourSingleResponse(result);
    } catch (err) {
      setSquadTourSingleResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingSquadTourSingle(false);
    }
  };

  const testSquadToursAll = async () => {
    setLoadingSquadToursAll(true);
    try {
      const result = await apiRequest(`/api/squad_tours/squad/${squadTourSquadIdInput}`);
      setSquadToursAllResponse(result);
    } catch (err) {
      setSquadToursAllResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingSquadToursAll(false);
    }
  };

  const testSquadToursByTour = async () => {
    setLoadingSquadToursByTour(true);
    try {
      const result = await apiRequest(`/api/squad_tours/tour/${squadTourTourIdInput}`);
      setSquadToursByTourResponse(result);
    } catch (err) {
      setSquadToursByTourResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingSquadToursByTour(false);
    }
  };

  const testAllSquadTours = async () => {
    setLoadingAllSquadTours(true);
    try {
      const result = await apiRequest('/api/squad_tours/all');
      setAllSquadToursResponse(result);
    } catch (err) {
      setAllSquadToursResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingAllSquadTours(false);
    }
  };

  // Player Statuses test functions
  const testStatusById = async () => {
    setLoadingStatusById(true);
    try {
      const result = await playerStatusesApi.getById(parseInt(statusIdInput) || 1);
      setStatusByIdResponse(result);
    } catch (err) {
      setStatusByIdResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingStatusById(false);
    }
  };

  const testPlayerStatuses = async () => {
    setLoadingPlayerStatuses(true);
    try {
      const result = await playerStatusesApi.getPlayerStatuses(parseInt(statusPlayerIdInput) || 1);
      setPlayerStatusesResponse(result);
    } catch (err) {
      setPlayerStatusesResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingPlayerStatuses(false);
    }
  };

  const testStatusForTour = async () => {
    setLoadingStatusForTour(true);
    try {
      const result = await playerStatusesApi.getStatusForTour(
        parseInt(statusPlayerIdInput) || 1,
        parseInt(statusTourNumberInput) || 1
      );
      setStatusForTourResponse(result);
    } catch (err) {
      setStatusForTourResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingStatusForTour(false);
    }
  };

  const testCreateStatus = async () => {
    setLoadingCreateStatus(true);
    try {
      const data: PlayerStatusCreate = {
        status_type: statusTypeInput,
        tour_start: parseInt(statusTourStartInput) || 1,
        tour_end: statusTourEndInput ? parseInt(statusTourEndInput) : null,
      };
      const result = await playerStatusesApi.createStatus(parseInt(statusPlayerIdInput) || 1, data);
      setCreateStatusResponse(result);
    } catch (err) {
      setCreateStatusResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingCreateStatus(false);
    }
  };

  const testUpdateStatus = async () => {
    setLoadingUpdateStatus(true);
    try {
      const data = {
        status_type: statusTypeInput,
        tour_start: parseInt(statusTourStartInput) || 1,
        tour_end: statusTourEndInput ? parseInt(statusTourEndInput) : null,
      };
      const result = await playerStatusesApi.updateStatus(parseInt(statusIdInput) || 1, data);
      setUpdateStatusResponse(result);
    } catch (err) {
      setUpdateStatusResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingUpdateStatus(false);
    }
  };

  const testDeleteStatus = async () => {
    setLoadingDeleteStatus(true);
    try {
      const result = await playerStatusesApi.deleteStatus(parseInt(statusIdInput) || 1);
      setDeleteStatusResponse(result);
    } catch (err) {
      setDeleteStatusResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoadingDeleteStatus(false);
    }
  };

  // Section component for collapsible groups
  const Section = ({ title, isOpen, onToggle, children }: {
    title: string; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode; 
  }) => (
    <div className="mb-4 border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          // Prevent Section button from being triggered by keyboard when focus is on inputs
          if (e.target !== e.currentTarget) {
            e.stopPropagation();
          }
        }}
        className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
      >
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className="p-4 space-y-4" onClick={(e) => e.stopPropagation()}>{children}</div>}
    </div>
  );

  const renderResponse = (response: ApiResponse<unknown> | null, title: string) => {
    if (!response) return null;
    
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        
        {/* Статус */}
        <div className={`p-4 rounded-lg ${response.success ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
          <div className="font-bold text-lg">
            {response.success ? '✓ Успешно' : '✗ Ошибка'}
          </div>
          {response.status && (
            <div>Статус: <span className="font-mono">{response.status} {response.statusText}</span></div>
          )}
          {response.error && !response.status && (
            <div>Ошибка: <span className="font-mono">{response.error}</span></div>
          )}
        </div>

        {/* Заголовки ответа */}
        {response.headers && Object.keys(response.headers).length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Заголовки ответа:</h3>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key}><span className="text-primary">{key}:</span> {value}</div>
              ))}
            </pre>
          </div>
        )}

        {/* Тело ответа */}
        {response.data && (
          <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
            <h3 className="text-lg font-semibold mb-2">Тело ответа:</h3>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}

        {/* Подсказка при ошибке CORS */}
        {response.error === 'Failed to fetch' && (
          <div className="bg-yellow-500/20 text-yellow-400 p-4 rounded-lg">
            <div className="font-bold mb-2">⚠️ Возможная проблема CORS</div>
            <div className="text-sm">
              Ошибка "Failed to fetch" обычно означает что запрос заблокирован CORS.
              <br />Убедись что в FastAPI добавлен origin:
              <pre className="mt-2 bg-background/50 p-2 rounded font-mono text-xs">
                "https://014afc12-930d-4917-a39f-0e32b2583b24.lovableproject.com"
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-3xl font-bold text-foreground mb-6">Backend API Tester</h1>
      <p className="text-muted-foreground mb-6">Организовано по категориям API</p>
      
      {/* LEAGUES SECTION */}
      <Section title="🏆 Leagues" isOpen={isLeaguesOpen} onToggle={() => setIsLeaguesOpen(!isLeaguesOpen)}>
        <Button onClick={testLeagueApi} disabled={loadingLeague} className="w-full">
          {loadingLeague ? 'Загрузка...' : 'GET /api/leagues/main_page_id_116'}
        </Button>
        {renderResponse(leagueResponse, 'Ответ: Leagues')}
      </Section>

      {/* TEAMS SECTION */}
      <Section title="⚽ Teams" isOpen={isTeamsOpen} onToggle={() => setIsTeamsOpen(!isTeamsOpen)}>
        <Button onClick={testTeamsApi} disabled={loadingTeams} className="w-full">
          {loadingTeams ? 'Загрузка...' : 'GET /api/teams/league_116'}
        </Button>
        {renderResponse(teamsResponse, 'Ответ: Teams')}
      </Section>

      {/* USERS SECTION */}
      <Section title="👤 Users" isOpen={isUsersOpen} onToggle={() => setIsUsersOpen(!isUsersOpen)}>
        <Button onClick={testUsersApi} disabled={loadingUsers} className="w-full">
          {loadingUsers ? 'Загрузка...' : 'GET /api/users/protected'}
        </Button>
        {renderResponse(usersResponse, 'Ответ: Users Protected')}
      </Section>

      {/* SQUADS SECTION */}
      <Section title="🎯 Squads" isOpen={isSquadsOpen} onToggle={() => setIsSquadsOpen(!isSquadsOpen)}>
        <div className="space-y-4">
          <Button onClick={testSquadsCreateApi} disabled={loadingSquadsCreate} variant="destructive" className="w-full">
            {loadingSquadsCreate ? 'Загрузка...' : 'POST /api/squads/create'}
          </Button>
          
          <Button onClick={testMySquadsApi} disabled={loadingMySquads} className="w-full">
            {loadingMySquads ? 'Загрузка...' : 'GET /api/squads/my_squads'}
          </Button>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={getSquadIdInput}
              onChange={(e) => setGetSquadIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Squad ID"
            />
            <Button onClick={testGetSquadByIdApi} disabled={loadingGetSquadById} className="flex-1">
              {loadingGetSquadById ? 'Загрузка...' : `GET /api/squads/get_squad_${getSquadIdInput}`}
            </Button>
          </div>

          <Button onClick={testGetSquadByIdPublicApi} disabled={loadingGetSquadByIdPublic} className="w-full">
            {loadingGetSquadByIdPublic ? 'Загрузка...' : `GET /api/squads/get_squad_by_id/${getSquadIdInput}`}
          </Button>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={historySquadIdInput}
              onChange={(e) => setHistorySquadIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Squad ID"
            />
            <Button onClick={testSquadHistoryApi} disabled={loadingSquadHistory} className="flex-1">
              {loadingSquadHistory ? 'Загрузка...' : `GET /api/squads/${historySquadIdInput}/tours`}
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={tourIdInput}
              onChange={(e) => setTourIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Tour ID"
            />
            <Button onClick={testLeaderboardApi} disabled={loadingLeaderboard} className="flex-1">
              {loadingLeaderboard ? 'Загрузка...' : `GET /api/squads/leaderboard/${tourIdInput}`}
            </Button>
          </div>
        </div>
        {renderResponse(squadsCreateResponse, 'Ответ: Create Squad')}
        {renderResponse(mySquadsResponse, 'Ответ: My Squads')}
        {renderResponse(getSquadByIdResponse, 'Ответ: Get Squad By ID')}
        {renderResponse(getSquadByIdPublicResponse, 'Ответ: Get Squad By ID (public)')}
        {renderResponse(squadHistoryResponse, 'Ответ: Squad History')}
        {renderResponse(leaderboardResponse, 'Ответ: Leaderboard')}
      </Section>

      {/* TOURS SECTION */}
      <Section title="📅 Tours" isOpen={isToursOpen} onToggle={() => setIsToursOpen(!isToursOpen)}>
        <div className="space-y-4">
          <Button onClick={testDeadlineApi} disabled={loadingDeadline} className="w-full">
            {loadingDeadline ? 'Загрузка...' : 'GET /api/tours/get_deadline_for_next_tour/116'}
          </Button>
          <Button onClick={testToursApi} disabled={loadingTours} className="w-full">
            {loadingTours ? 'Загрузка...' : 'GET /api/tours/get_previous_current_next_tour/116'}
          </Button>
          
          <h3 className="text-sm font-semibold text-muted-foreground pt-4">POST /api/tours/start_tour/{'{tour_id}'}</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={startTourIdInput}
              onChange={(e) => setStartTourIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Tour ID"
            />
            <Button onClick={testStartTourApi} disabled={loadingStartTour} variant="destructive" className="flex-1">
              {loadingStartTour ? 'Загрузка...' : `POST /api/tours/start_tour/${startTourIdInput}`}
            </Button>
          </div>
          
          <h3 className="text-sm font-semibold text-muted-foreground pt-2">POST /api/tours/finalize_tour/{'{tour_id}'}</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={finalizeTourIdInput}
              onChange={(e) => setFinalizeTourIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Tour ID"
            />
            <Button onClick={testFinalizeTourApi} disabled={loadingFinalizeTour} variant="destructive" className="flex-1">
              {loadingFinalizeTour ? 'Загрузка...' : `POST /api/tours/finalize_tour/${finalizeTourIdInput}`}
            </Button>
          </div>
        </div>
        {renderResponse(deadlineResponse, 'Ответ: Deadline')}
        {renderResponse(toursResponse, 'Ответ: Tours (prev/current/next)')}
        {renderResponse(startTourResponse, 'Ответ: Start Tour')}
        {renderResponse(finalizeTourResponse, 'Ответ: Finalize Tour')}
      </Section>

      {/* PLAYERS SECTION */}
      <Section title="👥 Players" isOpen={isPlayersOpen} onToggle={() => setIsPlayersOpen(!isPlayersOpen)}>
        <Button onClick={testPlayersApi} disabled={loadingPlayers} className="w-full">
          {loadingPlayers ? 'Загрузка...' : 'GET /api/players/league/116/players_with_points'}
        </Button>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={playerIdInput}
            onChange={(e) => setPlayerIdInput(e.target.value)}
            className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
            placeholder="Player ID"
          />
          <Button onClick={testPlayerFullInfoApi} disabled={loadingPlayerFullInfo} className="flex-1">
            {loadingPlayerFullInfo ? 'Загрузка...' : `GET /api/players/${playerIdInput}/full-info`}
          </Button>
        </div>
        {renderResponse(playersResponse, 'Ответ: Players')}
        {renderResponse(playerFullInfoResponse, 'Ответ: Player Full Info')}
      </Section>

      {/* BOOSTS SECTION */}
      <Section title="⚡ Boosts" isOpen={isBoostsOpen} onToggle={() => setIsBoostsOpen(!isBoostsOpen)}>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">GET /api/boosts/available</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-muted-foreground">Squad ID</label>
              <input
                type="number"
                value={availableBoostSquadIdInput}
                onChange={(e) => setAvailableBoostSquadIdInput(e.target.value)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Tour ID</label>
              <input
                type="number"
                value={availableBoostTourIdInput}
                onChange={(e) => setAvailableBoostTourIdInput(e.target.value)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              />
            </div>
          </div>
          <Button onClick={testBoostAvailableApi} disabled={loadingBoostAvailable} variant="default">
            {loadingBoostAvailable
              ? 'Загрузка...'
              : `Тест: GET /api/boosts/available/${availableBoostSquadIdInput}/${availableBoostTourIdInput}`}
          </Button>
        </div>
        {renderResponse(boostAvailableResponse, 'Ответ: Boost Available')}
      </Section>

      {/* COMMERCIAL LEAGUES SECTION */}
      <Section title="🏆 Commercial Leagues" isOpen={isCommercialLeaguesOpen} onToggle={() => setIsCommercialLeaguesOpen(!isCommercialLeaguesOpen)}>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">GET /api/commercial_leagues/</h3>
          <div>
            <label className="text-sm text-muted-foreground">League ID</label>
            <input
              type="number"
              value={commercialLeagueIdInput}
              onChange={(e) => setCommercialLeagueIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <Button onClick={testCommercialLeagues} disabled={loadingCommercialLeagues} className="w-full">
            {loadingCommercialLeagues ? 'Загрузка...' : `GET /api/commercial_leagues/?league_id=${commercialLeagueIdInput}`}
          </Button>

          <h3 className="text-sm font-semibold text-muted-foreground mt-4">POST /api/commercial_leagues/join</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Commercial League ID</label>
              <input
                type="number"
                value={joinCommercialLeagueIdInput}
                onChange={(e) => setJoinCommercialLeagueIdInput(e.target.value)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Squad ID</label>
              <input
                type="number"
                value={joinSquadIdInput}
                onChange={(e) => setJoinSquadIdInput(e.target.value)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              />
            </div>
          </div>
          <Button onClick={testCommercialLeagueJoin} disabled={loadingCommercialLeagueJoin} className="w-full">
            {loadingCommercialLeagueJoin ? 'Загрузка...' : `POST /api/commercial_leagues/join/${joinCommercialLeagueIdInput}/${joinSquadIdInput}`}
          </Button>
        </div>
        {renderResponse(commercialLeaguesResponse, 'Ответ: Commercial Leagues')}
        {renderResponse(commercialLeagueJoinResponse, 'Ответ: Commercial League Join')}
      </Section>

      {/* SQUAD TOURS SECTION */}
      <Section title="🎖️ Squad Tours" isOpen={isSquadToursOpen} onToggle={() => setIsSquadToursOpen(!isSquadToursOpen)}>
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={squadTourSquadIdInput}
              onChange={(e) => setSquadTourSquadIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Squad ID"
            />
            <input
              type="number"
              value={squadTourTourIdInput}
              onChange={(e) => setSquadTourTourIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Tour ID"
            />
            <Button onClick={testSquadTourSingle} disabled={loadingSquadTourSingle} className="flex-1">
              {loadingSquadTourSingle ? 'Загрузка...' : `GET /api/squad_tours/squad/${squadTourSquadIdInput}/tour/${squadTourTourIdInput}`}
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={squadTourSquadIdInput}
              onChange={(e) => setSquadTourSquadIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Squad ID"
            />
            <Button onClick={testSquadToursAll} disabled={loadingSquadToursAll} className="flex-1">
              {loadingSquadToursAll ? 'Загрузка...' : `GET /api/squad_tours/squad/${squadTourSquadIdInput}`}
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={squadTourTourIdInput}
              onChange={(e) => setSquadTourTourIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Tour ID"
            />
            <Button onClick={testSquadToursByTour} disabled={loadingSquadToursByTour} className="flex-1">
              {loadingSquadToursByTour ? 'Загрузка...' : `GET /api/squad_tours/tour/${squadTourTourIdInput}`}
            </Button>
          </div>

          <Button onClick={testAllSquadTours} disabled={loadingAllSquadTours} className="w-full">
            {loadingAllSquadTours ? 'Загрузка...' : 'GET /api/squad_tours/all'}
          </Button>
        </div>
        {renderResponse(squadTourSingleResponse, 'Ответ: Squad Tour Single')}
        {renderResponse(squadToursAllResponse, 'Ответ: Squad Tours All')}
        {renderResponse(squadToursByTourResponse, 'Ответ: Squad Tours By Tour')}
        {renderResponse(allSquadToursResponse, 'Ответ: All Squad Tours')}
      </Section>

      {/* PLAYER STATUSES SECTION */}
      <Section title="🏥 Player Statuses" isOpen={isPlayerStatusesOpen} onToggle={() => setIsPlayerStatusesOpen(!isPlayerStatusesOpen)}>
        <div className="space-y-4">
          {/* GET by Status ID */}
          <h3 className="text-sm font-semibold text-muted-foreground">GET /api/player-statuses/{'{status_id}'}</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={statusIdInput}
              onChange={(e) => setStatusIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Status ID"
            />
            <Button onClick={testStatusById} disabled={loadingStatusById} className="flex-1">
              {loadingStatusById ? 'Загрузка...' : `GET /api/player-statuses/${statusIdInput}`}
            </Button>
          </div>

          {/* GET Player Statuses */}
          <h3 className="text-sm font-semibold text-muted-foreground">GET /api/player-statuses/players/{'{player_id}'}/statuses</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={statusPlayerIdInput}
              onChange={(e) => setStatusPlayerIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Player ID"
            />
            <Button onClick={testPlayerStatuses} disabled={loadingPlayerStatuses} className="flex-1">
              {loadingPlayerStatuses ? 'Загрузка...' : `GET /api/player-statuses/players/${statusPlayerIdInput}/statuses`}
            </Button>
          </div>

          {/* GET Status for Tour */}
          <h3 className="text-sm font-semibold text-muted-foreground">GET /api/player-statuses/players/{'{player_id}'}/statuses/tour/{'{tour_number}'}</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={statusPlayerIdInput}
              onChange={(e) => setStatusPlayerIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Player ID"
            />
            <input
              type="number"
              value={statusTourNumberInput}
              onChange={(e) => setStatusTourNumberInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Tour"
            />
            <Button onClick={testStatusForTour} disabled={loadingStatusForTour} className="flex-1">
              {loadingStatusForTour ? 'Загрузка...' : `GET .../statuses/tour/${statusTourNumberInput}`}
            </Button>
          </div>

          {/* CREATE Status */}
          <h3 className="text-sm font-semibold text-muted-foreground mt-4">POST /api/player-statuses/players/{'{player_id}'}/statuses</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Player ID</label>
              <input
                type="number"
                value={statusPlayerIdInput}
                onChange={(e) => setStatusPlayerIdInput(e.target.value)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status Type</label>
              <select
                value={statusTypeInput}
                onChange={(e) => setStatusTypeInput(e.target.value as PlayerStatusType)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              >
                <option value="injured">injured</option>
                <option value="red_card">red_card</option>
                <option value="left_league">left_league</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Tour Start</label>
              <input
                type="number"
                value={statusTourStartInput}
                onChange={(e) => setStatusTourStartInput(e.target.value)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Tour End (optional)</label>
              <input
                type="number"
                value={statusTourEndInput}
                onChange={(e) => setStatusTourEndInput(e.target.value)}
                className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
                placeholder="null = indefinite"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Description (optional)</label>
            <input
              type="text"
              value={statusDescriptionInput}
              onChange={(e) => setStatusDescriptionInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              placeholder="Описание статуса"
            />
          </div>
          <Button onClick={testCreateStatus} disabled={loadingCreateStatus} variant="destructive" className="w-full">
            {loadingCreateStatus ? 'Загрузка...' : `POST /api/player-statuses/players/${statusPlayerIdInput}/statuses`}
          </Button>

          {/* UPDATE Status */}
          <h3 className="text-sm font-semibold text-muted-foreground mt-4">PUT /api/player-statuses/{'{status_id}'}</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={statusIdInput}
              onChange={(e) => setStatusIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Status ID"
            />
            <Button onClick={testUpdateStatus} disabled={loadingUpdateStatus} variant="outline" className="flex-1">
              {loadingUpdateStatus ? 'Загрузка...' : `PUT /api/player-statuses/${statusIdInput}`}
            </Button>
          </div>

          {/* DELETE Status */}
          <h3 className="text-sm font-semibold text-muted-foreground mt-4">DELETE /api/player-statuses/{'{status_id}'}</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={statusIdInput}
              onChange={(e) => setStatusIdInput(e.target.value)}
              className="w-24 px-2 py-2 bg-muted text-foreground rounded border border-border"
              placeholder="Status ID"
            />
            <Button onClick={testDeleteStatus} disabled={loadingDeleteStatus} variant="destructive" className="flex-1">
              {loadingDeleteStatus ? 'Загрузка...' : `DELETE /api/player-statuses/${statusIdInput}`}
            </Button>
          </div>
        </div>
        {renderResponse(statusByIdResponse, 'Ответ: Status By ID')}
        {renderResponse(playerStatusesResponse, 'Ответ: Player Statuses')}
        {renderResponse(statusForTourResponse, 'Ответ: Status For Tour')}
        {renderResponse(createStatusResponse, 'Ответ: Create Status')}
        {renderResponse(updateStatusResponse, 'Ответ: Update Status')}
        {renderResponse(deleteStatusResponse, 'Ответ: Delete Status')}
      </Section>

      {/* MATCHES SECTION */}
      <Section title="⚽ Matches" isOpen={false} onToggle={() => {}}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">GET /api/matches/all</p>
          <p className="text-sm text-muted-foreground">GET /api/matches/id_{'{id}'}</p>
          <p className="text-sm text-muted-foreground">GET /api/matches/league_{'{league_id}'}</p>
          <p className="text-sm text-muted-foreground">GET /api/matches/team/{'{team_id}'}</p>
        </div>
      </Section>


      {/* USER LEAGUES SECTION */}
      <Section title="👥 User Leagues" isOpen={false} onToggle={() => {}}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">POST /api/user_leagues/create</p>
          <p className="text-sm text-muted-foreground">GET /api/user_leagues/list</p>
          <p className="text-sm text-muted-foreground">GET /api/user_leagues/{'{user_league_id}'}</p>
          <p className="text-sm text-muted-foreground">POST /api/user_leagues/{'{user_league_id}'}/squads/{'{squad_id}'}/join</p>
          <p className="text-sm text-muted-foreground">DELETE /api/user_leagues/{'{user_league_id}'}/squads/{'{squad_id}'}/leave</p>
          <p className="text-sm text-muted-foreground">DELETE /api/user_leagues/{'{user_league_id}'}/delete</p>
          <p className="text-sm text-muted-foreground">GET /api/user_leagues/list/my_squad_leagues</p>
          <p className="text-sm text-muted-foreground">GET /api/user_leagues/{'{user_league_id}'}/leaderboard/{'{tour_id}'}</p>
        </div>
      </Section>

      {/* CLUB LEAGUES SECTION - REMOVED */}
      {/* Club leagues functionality has been removed from backend */}

      {/* PLAYER MATCH STATS SECTION */}
      <Section title="📊 Player Match Stats" isOpen={false} onToggle={() => {}}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">GET /api/player_match_stats/player_id_{'{player_id}'}</p>
        </div>
      </Section>

      {/* UTILS SECTION */}
      <Section title="🛠️ Utils" isOpen={false} onToggle={() => {}}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">POST /api/utils/parse_tours</p>
          <p className="text-sm text-muted-foreground">POST /api/utils/parse_teams</p>
          <p className="text-sm text-muted-foreground">POST /api/utils/parse_players</p>
          <p className="text-sm text-muted-foreground">POST /api/utils/parse_matches</p>
          <p className="text-sm text-muted-foreground">POST /api/utils/parse_player_match_stats</p>
          <p className="text-sm text-muted-foreground">POST /api/utils/finalize_tour</p>
          <p className="text-sm text-muted-foreground">GET /api/utils/health</p>
        </div>
      </Section>

      {/* Home Button */}
      <div className="mt-8 space-y-3">
        <button
          onClick={() => navigate("/debug-auth")}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          🔐 Debug Auth (Диагностика авторизации)
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  );
};

export default BackendTest;
