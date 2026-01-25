import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { leaguesApi, teamsApi, usersApi, squadsApi, toursApi, playersApi, boostsApi, customLeaguesApi, commercialLeaguesApi, ApiResponse, BoostType } from '@/lib/api';

const BackendTest = () => {
  const navigate = useNavigate();
  const [leagueResponse, setLeagueResponse] = useState<ApiResponse<unknown> | null>(null);
  const [teamsResponse, setTeamsResponse] = useState<ApiResponse<unknown> | null>(null);
  const [usersResponse, setUsersResponse] = useState<ApiResponse<unknown> | null>(null);
  const [squadsCreateResponse, setSquadsCreateResponse] = useState<ApiResponse<unknown> | null>(null);
  const [mySquadsResponse, setMySquadsResponse] = useState<ApiResponse<unknown> | null>(null);
  const [getSquadByIdResponse, setGetSquadByIdResponse] = useState<ApiResponse<unknown> | null>(null);
  const [getSquadByIdPublicResponse, setGetSquadByIdPublicResponse] = useState<ApiResponse<unknown> | null>(null);
  const [deadlineResponse, setDeadlineResponse] = useState<ApiResponse<unknown> | null>(null);
  const [toursResponse, setToursResponse] = useState<ApiResponse<unknown> | null>(null);
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
  const [loadingDeadline, setLoadingDeadline] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
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
  const [squadIdInput, setSquadIdInput] = useState('1');
  const [getSquadIdInput, setGetSquadIdInput] = useState('7');
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

  const testBoostAvailableApi = async () => {
    setLoadingBoostAvailable(true);
    try {
      const result = await boostsApi.getAvailable(
        parseInt(availableBoostSquadIdInput) || 1,
        parseInt(availableBoostTourIdInput) || 1
      );
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
      <h1 className="text-2xl font-bold text-foreground mb-4">Backend API Test</h1>
      
      <div className="flex gap-4 flex-wrap">
        <Button onClick={testLeagueApi} disabled={loadingLeague}>
          {loadingLeague ? 'Загрузка...' : 'Тест: /api/leagues/main_page_id_116'}
        </Button>

        <Button onClick={testTeamsApi} disabled={loadingTeams} variant="secondary">
          {loadingTeams ? 'Загрузка...' : 'Тест: /api/teams/league_116'}
        </Button>

        <Button onClick={testUsersApi} disabled={loadingUsers} variant="outline">
          {loadingUsers ? 'Загрузка...' : 'Тест: GET /api/users/protected'}
        </Button>

        <Button onClick={testSquadsCreateApi} disabled={loadingSquadsCreate} variant="destructive">
          {loadingSquadsCreate ? 'Загрузка...' : 'Тест: POST /api/squads/create'}
        </Button>

        <Button onClick={testMySquadsApi} disabled={loadingMySquads} variant="outline">
          {loadingMySquads ? 'Загрузка...' : 'Тест: GET /api/squads/my_squads'}
        </Button>

        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={getSquadIdInput}
            onChange={(e) => setGetSquadIdInput(e.target.value)}
            className="w-20 px-2 py-2 bg-muted text-foreground rounded border border-border"
            placeholder="Squad ID"
          />
          <Button onClick={testGetSquadByIdApi} disabled={loadingGetSquadById} variant="default">
            {loadingGetSquadById ? 'Загрузка...' : `Тест: GET /api/squads/get_squad_${getSquadIdInput}`}
          </Button>
          <Button onClick={testGetSquadByIdPublicApi} disabled={loadingGetSquadByIdPublic} variant="secondary">
            {loadingGetSquadByIdPublic ? 'Загрузка...' : `Тест: GET /api/squads/get_squad_by_id/${getSquadIdInput}`}
          </Button>
        </div>

        <Button onClick={testDeadlineApi} disabled={loadingDeadline} variant="secondary">
          {loadingDeadline ? 'Загрузка...' : 'Тест: GET /api/tours/get_deadline_for_next_tour/116'}
        </Button>

        <Button onClick={testToursApi} disabled={loadingTours} variant="secondary">
          {loadingTours ? 'Загрузка...' : 'Тест: GET /api/tours/get_previous_current_next_tour/116'}
        </Button>

        <Button onClick={testPlayersApi} disabled={loadingPlayers} variant="outline">
          {loadingPlayers ? 'Загрузка...' : 'Тест: GET /api/players/league/116/players_with_points'}
        </Button>

        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={playerIdInput}
            onChange={(e) => setPlayerIdInput(e.target.value)}
            className="w-20 px-2 py-2 bg-muted text-foreground rounded border border-border"
            placeholder="ID"
          />
          <Button onClick={testPlayerFullInfoApi} disabled={loadingPlayerFullInfo} variant="default">
            {loadingPlayerFullInfo ? 'Загрузка...' : `Тест: GET /api/players/${playerIdInput}/full-info`}
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={tourIdInput}
            onChange={(e) => setTourIdInput(e.target.value)}
            className="w-20 px-2 py-2 bg-muted text-foreground rounded border border-border"
            placeholder="Tour ID"
          />
          <Button onClick={testLeaderboardApi} disabled={loadingLeaderboard} variant="default">
            {loadingLeaderboard ? 'Загрузка...' : `Тест: GET /api/squads/leaderboard/${tourIdInput}`}
          </Button>
        </div>
      </div>

      {/* Boosts Available Test Section */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">GET /api/boosts/available/{'{squad_id}/{tour_id}'}</h2>
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

      {/* Update Players Test Section */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">PUT /api/squads/update_players/{'{squad_id}'}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground">Squad ID</label>
            <input
              type="number"
              value={squadIdInput}
              onChange={(e) => setSquadIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Captain ID (опционально)</label>
            <input
              type="number"
              value={captainIdInput}
              onChange={(e) => setCaptainIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Vice Captain ID (опционально)</label>
            <input
              type="number"
              value={viceCaptainIdInput}
              onChange={(e) => setViceCaptainIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Main Player IDs (через запятую)</label>
            <input
              type="text"
              value={mainPlayerIdsInput}
              onChange={(e) => setMainPlayerIdsInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              placeholder="1,2,3,4,5,6,7,8,9,10,11"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted-foreground">Bench Player IDs (через запятую)</label>
            <input
              type="text"
              value={benchPlayerIdsInput}
              onChange={(e) => setBenchPlayerIdsInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              placeholder="12,13,14,15"
            />
          </div>
        </div>
        <Button onClick={testUpdatePlayersApi} disabled={loadingUpdatePlayers} variant="default">
          {loadingUpdatePlayers ? 'Загрузка...' : `Тест: PUT /api/squads/update_players/${squadIdInput}`}
        </Button>
      </div>

      {/* Replace Players Test Section */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">POST /api/squads/{'{squad_id}'}/replace_players</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground">Squad ID</label>
            <input
              type="number"
              value={replaceSquadIdInput}
              onChange={(e) => setReplaceSquadIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Captain ID (query, опционально)</label>
            <input
              type="number"
              value={replaceCaptainIdInput}
              onChange={(e) => setReplaceCaptainIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Vice Captain ID (query, опционально)</label>
            <input
              type="number"
              value={replaceViceCaptainIdInput}
              onChange={(e) => setReplaceViceCaptainIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Main Player IDs (через запятую)</label>
            <input
              type="text"
              value={replaceMainPlayerIdsInput}
              onChange={(e) => setReplaceMainPlayerIdsInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              placeholder="1,2,3,4,5,6,7,8,9,10,11"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted-foreground">Bench Player IDs (через запятую)</label>
            <input
              type="text"
              value={replaceBenchPlayerIdsInput}
              onChange={(e) => setReplaceBenchPlayerIdsInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
              placeholder="12,13,14,15"
            />
          </div>
        </div>
        <Button onClick={testReplacePlayersApi} disabled={loadingReplacePlayers} variant="default">
          {loadingReplacePlayers ? 'Загрузка...' : `Тест: POST /api/squads/${replaceSquadIdInput}/replace_players`}
        </Button>
      </div>

      {/* Boost Apply Test Section */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">POST /api/boosts/apply</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground">Squad ID</label>
            <input
              type="number"
              value={boostSquadIdInput}
              onChange={(e) => setBoostSquadIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Tour ID</label>
            <input
              type="number"
              value={boostTourIdInput}
              onChange={(e) => setBoostTourIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Boost Type</label>
            <select
              value={boostTypeInput}
              onChange={(e) => setBoostTypeInput(e.target.value as BoostType)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            >
              <option value="bench_boost">bench_boost</option>
              <option value="triple_captain">triple_captain</option>
              <option value="double_bet">double_bet</option>
              <option value="transfers_plus">transfers_plus</option>
              <option value="gold_tour">gold_tour</option>
            </select>
          </div>
        </div>
        <Button onClick={testBoostApplyApi} disabled={loadingBoostApply} variant="default">
          {loadingBoostApply ? 'Загрузка...' : 'Тест: POST /api/boosts/apply'}
        </Button>
      </div>

      {/* Boost Available Test Section */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">GET /api/boosts/available/{'{squad_id}'}/{'{tour_id}'}</h2>
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
          {loadingBoostAvailable ? 'Загрузка...' : `Тест: GET /api/boosts/available/${availableBoostSquadIdInput}/${availableBoostTourIdInput}`}
        </Button>
      </div>

      {/* Boost Remove Test Section */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">DELETE /api/boosts/remove/{'{squad_id}'}/{'{tour_id}'}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground">Squad ID</label>
            <input
              type="number"
              value={removeBoostSquadIdInput}
              onChange={(e) => setRemoveBoostSquadIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Tour ID</label>
            <input
              type="number"
              value={removeBoostTourIdInput}
              onChange={(e) => setRemoveBoostTourIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
        </div>
        <Button onClick={testBoostRemoveApi} disabled={loadingBoostRemove} variant="destructive">
          {loadingBoostRemove ? 'Загрузка...' : `Тест: DELETE /api/boosts/remove/${removeBoostSquadIdInput}/${removeBoostTourIdInput}`}
        </Button>
      </div>


      {/* Commercial Leagues Test Section */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">GET /api/commercial_leagues/?league_id={'{league_id}'}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground">League ID</label>
            <input
              type="number"
              value={commercialLeagueIdInput}
              onChange={(e) => setCommercialLeagueIdInput(e.target.value)}
              className="w-full px-2 py-2 bg-background text-foreground rounded border border-border"
            />
          </div>
        </div>
        <Button onClick={testCommercialLeagues} disabled={loadingCommercialLeagues} variant="default">
          {loadingCommercialLeagues ? 'Загрузка...' : `Тест: GET /api/commercial_leagues/?league_id=${commercialLeagueIdInput}`}
        </Button>
      </div>

      {/* Commercial League Join Test */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-4">POST /api/commercial_leagues/join/{'{commercial_league_id}'}/{'{squad_id}'}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
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
        <Button onClick={testCommercialLeagueJoin} disabled={loadingCommercialLeagueJoin} variant="default">
          {loadingCommercialLeagueJoin ? 'Загрузка...' : `Тест: POST join/${joinCommercialLeagueIdInput}/${joinSquadIdInput}`}
        </Button>
      </div>

      {renderResponse(commercialLeagueJoinResponse, 'Ответ: Commercial League Join')}
      {renderResponse(commercialLeaguesResponse, 'Ответ: Commercial Leagues')}
      {renderResponse(boostRemoveResponse, 'Ответ: Boost Remove')}
      {renderResponse(boostApplyResponse, 'Ответ: Boost Apply')}
      {renderResponse(replacePlayersResponse, 'Ответ: Replace Players')}
      {renderResponse(updatePlayersResponse, 'Ответ: Update Players')}
      {renderResponse(leaderboardResponse, 'Ответ: Leaderboard')}
      {renderResponse(playerFullInfoResponse, 'Ответ: Player Full Info')}
      {renderResponse(leagueResponse, 'Ответ: Лиги')}
      {renderResponse(teamsResponse, 'Ответ: Команды')}
      {renderResponse(usersResponse, 'Ответ: Users Protected')}
      {renderResponse(squadsCreateResponse, 'Ответ: Squads Create')}
      {renderResponse(mySquadsResponse, 'Ответ: My Squads')}
      {renderResponse(getSquadByIdResponse, 'Ответ: Get Squad By ID')}
      {renderResponse(getSquadByIdPublicResponse, 'Ответ: Get Squad By ID (public)')}
      {renderResponse(deadlineResponse, 'Ответ: Deadline')}
      {renderResponse(toursResponse, 'Ответ: Tours (prev/current/next)')}
      {renderResponse(playersResponse, 'Ответ: Players')}
      {renderResponse(boostAvailableResponse, 'Ответ: Boost Available')}

      {/* Home Button */}
      <div className="mt-8">
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
