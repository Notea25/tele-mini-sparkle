const API_BASE_URL = 'http://31.222.229.78';

export interface ApiResponse<T> {
  success: boolean;
  status?: number;
  statusText?: string;
  data?: T;
  error?: string;
  headers?: Record<string, string>;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Собираем заголовки ответа
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: T | undefined;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // JSON parsing failed
      }
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      headers: responseHeaders,
      error: response.ok ? undefined : `${response.status} ${response.statusText}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// Методы для работы с лигами
export const leaguesApi = {
  getMainPage: (id: number) => apiRequest<unknown>(`/api/leagues/main_page_id_${id}`),
};
