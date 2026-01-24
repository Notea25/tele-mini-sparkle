import { apiRequest, ApiResponse } from "./api";
import { setTokens } from "./authStorage";

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
    const { access_token, refresh_token } = response.data as LoginResponseData;
    if (access_token) {
      setTokens(access_token, refresh_token ?? null);
    }
  }

  return response;
}
