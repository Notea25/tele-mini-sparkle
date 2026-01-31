import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BACKEND_URL = Deno.env.get("BACKEND_URL") || "http://31.222.229.78";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-refresh-token",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
};

// Allowlist of valid API path prefixes - only these paths can be proxied
const ALLOWED_PATH_PREFIXES = [
  "/api/leagues/",
  "/api/tours/",
  "/api/teams/",
  "/api/squads/",
  "/api/squad_tours/",
  "/api/users/",
  "/api/players/",
  "/api/boosts/",
  "/api/custom_leagues/",
  "/api/user_leagues/",
  "/api/commercial_leagues/",
];

// Paths that require authentication (must have Authorization header)
const AUTH_REQUIRED_PATHS = [
  "/api/squads/create",
  "/api/squads/my_squads",
  "/api/squads/update_players/",
  "/api/squads/replace_players",
  "/api/squads/rename",
  "/api/boosts/apply",
  "/api/boosts/remove/",
  "/api/boosts/available/",
  "/api/custom_leagues/",
  "/api/user_leagues/create",
  "/api/user_leagues/delete",
  "/api/user_leagues/leave",
  "/api/user_leagues/join",
  "/api/users/protected",
];

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/api/users/login",
  "/api/users/refresh",
  "/api/leagues/",
  "/api/tours/",
  "/api/teams/",
  "/api/players/",
  "/api/squads/leaderboard/",
  "/api/squads/get_squad_",
  "/api/squad_tours/",
  "/api/commercial_leagues/",
];

// Valid HTTP methods
const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

// Maximum request body size (1MB)
const MAX_BODY_SIZE = 1024 * 1024;

function isPathAllowed(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
}

function requiresAuth(path: string): boolean {
  // Check if path matches any auth-required pattern
  const isAuthRequired = AUTH_REQUIRED_PATHS.some(pattern => path.includes(pattern));
  
  // Check if path is explicitly public
  const isPublic = PUBLIC_PATHS.some(pattern => path.includes(pattern));
  
  // Auth is required if the path matches auth patterns and is not explicitly public
  return isAuthRequired && !isPublic;
}

function validateRequestBody(body: unknown): { valid: boolean; error?: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Invalid request body: expected object" };
  }

  const reqBody = body as Record<string, unknown>;
  
  // Path must be a string starting with /api/
  if (typeof reqBody.path !== "string" || !reqBody.path.startsWith("/api/")) {
    return { valid: false, error: "Invalid path: must start with /api/" };
  }

  // Method must be a valid HTTP method
  if (reqBody.method !== undefined) {
    if (typeof reqBody.method !== "string" || !ALLOWED_METHODS.includes(reqBody.method)) {
      return { valid: false, error: `Invalid method: must be one of ${ALLOWED_METHODS.join(", ")}` };
    }
  }

  // Headers must be an object if provided
  if (reqBody.headers !== undefined && (typeof reqBody.headers !== "object" || reqBody.headers === null)) {
    return { valid: false, error: "Invalid headers: must be an object" };
  }

  return { valid: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST method to the proxy
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed",
    }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Check content length to prevent oversized requests
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return new Response(JSON.stringify({
        success: false,
        error: "Request body too large",
      }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    let requestData: unknown;
    try {
      requestData = await req.json();
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid JSON in request body",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request structure
    const validation = validateRequestBody(requestData);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: validation.error,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      path = "/",
      method = "GET",
      body: requestBody,
      headers: clientHeaders = {},
      rawBody = false,
      contentType,
    } = requestData as Record<string, unknown>;

    const pathStr = path as string;
    const methodStr = method as string;

    // Validate path is in allowlist
    if (!isPathAllowed(pathStr)) {
      console.warn(`Blocked request to non-allowed path: ${pathStr}`);
      return new Response(JSON.stringify({
        success: false,
        error: "Path not allowed",
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if authorization is required
    const headersObj = clientHeaders as Record<string, string>;
    if (requiresAuth(pathStr) && !headersObj["Authorization"]) {
      return new Response(JSON.stringify({
        success: false,
        error: "Authorization required",
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Log request without revealing backend URL
    console.log(`Proxying ${methodStr} request to path: ${pathStr}`);
    
    const backendUrl = `${BACKEND_URL}${pathStr}`;
    
    const backendHeaders: Record<string, string> = { ...headersObj };

    if (rawBody) {
      if (contentType) {
        backendHeaders["Content-Type"] = contentType as string;
      }
    } else {
      if (!backendHeaders["Content-Type"]) {
        backendHeaders["Content-Type"] = "application/json";
      }
    }

    const fetchOptions: RequestInit = {
      method: methodStr,
      headers: backendHeaders,
    };

    // Forward body for POST/PUT/PATCH requests
    if (["POST", "PUT", "PATCH"].includes(methodStr)) {
      if (rawBody && typeof requestBody === "string") {
        fetchOptions.body = requestBody;
      } else if (requestBody !== undefined && requestBody !== null) {
        fetchOptions.body = JSON.stringify(requestBody);
      }
    }

    const response = await fetch(backendUrl, fetchOptions);
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data;
    const respContentType = response.headers.get("content-type");
    
    if (respContentType?.includes("application/json")) {
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Proxy error:", error instanceof Error ? error.message : "Unknown error");
    
    return new Response(JSON.stringify({
      success: false,
      error: "Proxy request failed",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
