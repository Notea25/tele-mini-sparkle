export const ACCESS_TOKEN_KEY = "fantasyAccessToken";
export const REFRESH_TOKEN_KEY = "fantasyRefreshToken";
export const USER_ID_KEY = "fantasyUserId";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(accessToken?: string | null, refreshToken?: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch {
    // ignore storage errors
  }
}

export function getUserId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_ID_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export function setUserId(id?: number | null) {
  if (typeof window === "undefined") return;
  try {
    if (id == null) {
      window.localStorage.removeItem(USER_ID_KEY);
    } else {
      window.localStorage.setItem(USER_ID_KEY, String(id));
    }
  } catch {
    // ignore storage errors
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_ID_KEY);
  } catch {
    // ignore storage errors
  }
}
