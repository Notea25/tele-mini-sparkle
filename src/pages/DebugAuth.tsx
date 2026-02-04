import { useState } from "react";
import { useTelegram } from "@/providers/TelegramProvider";
import { loginWithTelegram } from "@/lib/auth";
import { getAccessToken, getRefreshToken } from "@/lib/authStorage";

export default function DebugAuth() {
  const { user, isTelegram } = useTelegram();
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = async () => {
    setIsLoading(true);
    const info: string[] = [];

    info.push("=== TELEGRAM INFO ===");
    info.push(`Is Telegram: ${isTelegram}`);
    info.push(`User: ${user ? JSON.stringify(user) : "null"}`);
    info.push("");

    // @ts-ignore
    const rawInitData = window.Telegram?.WebApp?.initData;
    info.push("=== INIT DATA ===");
    info.push(`Available: ${!!rawInitData}`);
    if (rawInitData) {
      info.push(`Length: ${rawInitData.length}`);
      info.push(`First 100 chars: ${rawInitData.substring(0, 100)}`);
    }
    info.push("");

    info.push("=== STORAGE ===");
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    info.push(`Access Token: ${accessToken ? "present" : "missing"}`);
    info.push(`Refresh Token: ${refreshToken ? "present" : "missing"}`);
    info.push("");

    if (rawInitData) {
      info.push("=== LOGIN ATTEMPT ===");
      try {
        const response = await loginWithTelegram(rawInitData);
        info.push(`Success: ${response.success}`);
        info.push(`Status: ${response.status}`);
        info.push(`Status Text: ${response.statusText}`);
        info.push(`Error: ${response.error || "none"}`);
        info.push(`Has Data: ${!!response.data}`);
        if (response.data) {
          info.push(`Has Access Token: ${!!(response.data as any).access_token}`);
          info.push(`Has Refresh Token: ${!!(response.data as any).refresh_token}`);
          info.push(`Has User: ${!!(response.data as any).user}`);
        }
      } catch (error) {
        info.push(`Exception: ${error instanceof Error ? error.message : "Unknown"}`);
      }
    }

    setDebugInfo(info.join("\n"));
    setIsLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", fontSize: "12px" }}>
      <h2>Auth Debug Page</h2>
      
      <button
        onClick={checkAuth}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          fontSize: "14px",
          marginBottom: "20px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Проверка..." : "Проверить авторизацию"}
      </button>

      {debugInfo && (
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {debugInfo}
        </pre>
      )}

      <div style={{ marginTop: "20px", fontSize: "14px" }}>
        <h3>Инструкции:</h3>
        <ol>
          <li>Нажмите "Проверить авторизацию"</li>
          <li>Посмотрите результаты выше</li>
          <li>Проверьте консоль браузера для детальных логов</li>
          <li>Если есть ошибка, скопируйте информацию выше</li>
        </ol>
      </div>
    </div>
  );
}
