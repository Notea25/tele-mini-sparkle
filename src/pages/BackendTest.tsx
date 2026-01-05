import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { leaguesApi } from '@/lib/api';

const BackendTest = () => {
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaguesApi.getMainPage(116);
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold text-foreground mb-4">Backend API Test</h1>
      
      <Button onClick={testApi} disabled={loading} className="mb-4">
        {loading ? 'Загрузка...' : 'Тест API: /api/leagues/main_page_id_116'}
      </Button>

      {error && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-lg mb-4">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {response && (
        <div className="bg-muted p-4 rounded-lg overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Ответ сервера:</h2>
          <pre className="text-sm text-foreground whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BackendTest;
