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
  const response = await apiRequest<LoginResponseData>("/api/users/login", {
    method: "POST",
    body: initData,
    rawBody: true,
    contentType: "text/plain",
    auth: false,
  });

  if (response.success && response.data) {
    const { access_token, refresh_token, user } = response.data as LoginResponseData;
    if (access_token) {
      setTokens(access_token, refresh_token ?? null);
    }

    // Persist current user id for later profile/registration requests
    if (user && typeof user === "object") {
      const anyUser = user as { id?: unknown };
      const rawId = anyUser.id;
      if (typeof rawId === "number") {
        setUserId(rawId);
      } else if (typeof rawId === "string") {
        const parsed = parseInt(rawId, 10);
        if (!Number.isNaN(parsed)) {
          setUserId(parsed);
        }
      }
    }
  }

  return response;
}
