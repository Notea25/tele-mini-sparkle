import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BACKEND_URL = "http://31.222.229.78";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body to get path, method, and body
    const requestData = await req.json();
    const { path = '/', method = 'GET', body: requestBody } = requestData;
    
    console.log(`Proxying ${method} request to: ${BACKEND_URL}${path}`);
    
    const backendUrl = `${BACKEND_URL}${path}`;
    
    const fetchOptions: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Forward body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    console.log(`Fetching: ${backendUrl}`);
    const response = await fetch(backendUrl, fetchOptions);
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      data = await response.text();
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
    };

    console.log(`Response status: ${response.status}`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown proxy error',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
