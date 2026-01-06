import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { leaguesApi, teamsApi, usersApi, squadsApi, toursApi, playersApi, ApiResponse } from '@/lib/api';

const BackendTest = () => {
  const [leagueResponse, setLeagueResponse] = useState<ApiResponse<unknown> | null>(null);
  const [teamsResponse, setTeamsResponse] = useState<ApiResponse<unknown> | null>(null);
  const [usersResponse, setUsersResponse] = useState<ApiResponse<unknown> | null>(null);
  const [squadsCreateResponse, setSquadsCreateResponse] = useState<ApiResponse<unknown> | null>(null);
  const [mySquadsResponse, setMySquadsResponse] = useState<ApiResponse<unknown> | null>(null);
  const [deadlineResponse, setDeadlineResponse] = useState<ApiResponse<unknown> | null>(null);
  const [playersResponse, setPlayersResponse] = useState<ApiResponse<unknown> | null>(null);
  const [playerFullInfoResponse, setPlayerFullInfoResponse] = useState<ApiResponse<unknown> | null>(null);
  const [loadingLeague, setLoadingLeague] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSquadsCreate, setLoadingSquadsCreate] = useState(false);
  const [loadingMySquads, setLoadingMySquads] = useState(false);
  const [loadingDeadline, setLoadingDeadline] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingPlayerFullInfo, setLoadingPlayerFullInfo] = useState(false);
  const [playerIdInput, setPlayerIdInput] = useState('1');

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

  const renderResponse = (response: ApiResponse<unknown> | null, title: string) => {
    if (!response) return null;
    
    return (
      <div className="space-y-4 mt-4">
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

        <Button onClick={testDeadlineApi} disabled={loadingDeadline} variant="secondary">
          {loadingDeadline ? 'Загрузка...' : 'Тест: GET /api/tours/get_deadline_for_next_tour/116'}
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
      </div>

      {renderResponse(playerFullInfoResponse, 'Ответ: Player Full Info')}
      {renderResponse(leagueResponse, 'Ответ: Лиги')}
      {renderResponse(teamsResponse, 'Ответ: Команды')}
      {renderResponse(usersResponse, 'Ответ: Users Protected')}
      {renderResponse(squadsCreateResponse, 'Ответ: Squads Create')}
      {renderResponse(mySquadsResponse, 'Ответ: My Squads')}
      {renderResponse(deadlineResponse, 'Ответ: Deadline')}
      {renderResponse(playersResponse, 'Ответ: Players')}
    </div>
  );
};

export default BackendTest;
