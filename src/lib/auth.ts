import { apiRequest, ApiResponse } from "./api";
import { setTokens, setUserId } from "./authStorage";

interface LoginResponseData {
  status?: string;
  user?: unknown;
  access_token?: string;
  refresh_token?: string;
  [key: string]: unknown;
}

export async function loginWithTelegram(initData: string): Promise<ApiResponse<LoginResponseData>> {
  console.log("[loginWithTelegram] Starting login process...");
  console.log("[loginWithTelegram] initData length:", initData.length);
  
  try {
    const response = await apiRequest<LoginResponseData>("/api/users/login", {
      method: "POST",
      body: initData,
      rawBody: true,
      contentType: "text/plain",
      auth: false,
    });

    console.log("[loginWithTelegram] API response received:");
    console.log("- success:", response.success);
    console.log("- status:", response.status);
    console.log("- statusText:", response.statusText);
    console.log("- error:", response.error);
    console.log("- has data:", !!response.data);

    if (response.success && response.data) {
      const { access_token, refresh_token, user } = response.data as LoginResponseData;
      console.log("[loginWithTelegram] Tokens received:", {
        has_access_token: !!access_token,
        has_refresh_token: !!refresh_token,
        has_user: !!user,
      });
      
      if (access_token) {
        setTokens(access_token, refresh_token ?? null);
        console.log("[loginWithTelegram] Tokens saved to storage");
      } else {
        console.warn("[loginWithTelegram] No access_token in response data");
      }

      // Persist current user id for later profile/registration requests
      if (user && typeof user === "object") {
        const anyUser = user as { id?: unknown };
        const rawId = anyUser.id;
        if (typeof rawId === "number") {
          setUserId(rawId);
          console.log("[loginWithTelegram] User ID saved:", rawId);
        } else if (typeof rawId === "string") {
          const parsed = parseInt(rawId, 10);
          if (!Number.isNaN(parsed)) {
            setUserId(parsed);
            console.log("[loginWithTelegram] User ID saved (parsed):", parsed);
          }
        }
      }
    } else {
      console.error("[loginWithTelegram] Login failed or no data returned");
    }

    return response;
  } catch (error) {
    console.error("[loginWithTelegram] Exception during login:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }
}
