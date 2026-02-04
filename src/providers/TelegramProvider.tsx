import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import {
  init,
  miniApp,
  themeParams,
  viewport,
  closingBehavior,
  backButton,
  mainButton,
  initData,
  type User,
} from "@telegram-apps/sdk-react";
import { loginWithTelegram } from "@/lib/auth";

interface TelegramContextType {
  isReady: boolean;
  isTelegram: boolean;
  user: User | null;
  colorScheme: "light" | "dark";
  close: () => void;
  showBackButton: (show: boolean) => void;
  onBackButtonClick: (callback: () => void) => void;
  hapticFeedback: (type: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
}

const TelegramContext = createContext<TelegramContextType>({
  isReady: false,
  isTelegram: false,
  user: null,
  colorScheme: "dark",
  close: () => {},
  showBackButton: () => {},
  onBackButtonClick: () => {},
  hapticFeedback: () => {},
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Check if running inside Telegram
        const isTelegramEnv = window.location.hash.includes("tgWebAppData") || 
                              window.location.search.includes("tgWebAppData") ||
                              // @ts-ignore
                              !!window.Telegram?.WebApp;

        if (!isTelegramEnv) {
          console.log("Not running in Telegram environment");
          setIsReady(true);
          return;
        }

        // Initialize the SDK
        init();

        // Mount components
        if (miniApp.mount.isAvailable()) {
          await miniApp.mount();
          miniApp.ready();
        }

        if (themeParams.mount.isAvailable()) {
          await themeParams.mount();
          setColorScheme(themeParams.isDark() ? "dark" : "light");
        }

        if (viewport.mount.isAvailable()) {
          await viewport.mount();
          viewport.expand();
        }

        if (closingBehavior.mount.isAvailable()) {
          await closingBehavior.mount();
          closingBehavior.enableConfirmation();
        }

        if (backButton.mount.isAvailable()) {
          await backButton.mount();
        }

        if (mainButton.mount.isAvailable()) {
          await mainButton.mount();
        }

        // Get user data
        if (initData.user()) {
          setUser(initData.user()!);
        }

        // Попробуем выполнить авторизацию на бэкенде через Telegram initData
        try {
          // @ts-ignore
          const rawInitData: string | undefined = window.Telegram?.WebApp?.initData;
          console.log("Telegram initData available:", !!rawInitData);
          console.log("Telegram initData (first 50 chars):", rawInitData?.substring(0, 50));
          
          if (rawInitData) {
            console.log("Attempting Telegram login...");
            const loginResponse = await loginWithTelegram(rawInitData);
            console.log("Login response:", JSON.stringify(loginResponse, null, 2));
            
            if (!loginResponse.success) {
              console.error("Telegram login failed:");
              console.error("- success:", loginResponse.success);
              console.error("- status:", loginResponse.status);
              console.error("- statusText:", loginResponse.statusText);
              console.error("- error:", loginResponse.error);
              console.error("- data:", loginResponse.data);
              
              // Формируем детальное сообщение об ошибке
              const errorDetails = [
                loginResponse.error,
                loginResponse.statusText,
                loginResponse.status ? `Код: ${loginResponse.status}` : null,
              ].filter(Boolean).join(', ');
              
              alert(`Ошибка авторизации: ${errorDetails || 'Неизвестная ошибка'}. Попробуйте перезапустить приложение.`);
            } else {
              console.log("Telegram login successful!");
              console.log("- access_token:", loginResponse.data?.access_token ? "present" : "missing");
              console.log("- refresh_token:", loginResponse.data?.refresh_token ? "present" : "missing");
            }
          } else {
            console.warn("No initData available from Telegram WebApp");
            alert("Не удалось получить данные авторизации от Telegram. Попробуйте перезапустить приложение.");
          }
        } catch (authError) {
          console.error("Telegram login exception:", authError);
          console.error("Exception details:", authError instanceof Error ? authError.message : authError);
          console.error("Stack trace:", authError instanceof Error ? authError.stack : "N/A");
          alert(`Критическая ошибка авторизации: ${authError instanceof Error ? authError.message : 'Неизвестная ошибка'}`);
        }

        setIsTelegram(true);
        setIsReady(true);
        console.log("Telegram SDK initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Telegram SDK:", error);
        setIsReady(true);
      }
    };

    initTelegram();
  }, []);

  const close = () => {
    if (isTelegram && miniApp.close.isAvailable()) {
      miniApp.close();
    } else {
      window.close();
    }
  };

  const showBackButton = (show: boolean) => {
    if (!isTelegram) return;
    
    if (show && backButton.show.isAvailable()) {
      backButton.show();
    } else if (!show && backButton.hide.isAvailable()) {
      backButton.hide();
    }
  };

  const onBackButtonClick = (callback: () => void) => {
    if (!isTelegram) return;
    
    backButton.onClick(callback);
  };

  const hapticFeedback = (type: "light" | "medium" | "heavy" | "rigid" | "soft") => {
    if (!isTelegram) return;
    
    try {
      // @ts-ignore
      if (window.Telegram?.WebApp?.HapticFeedback) {
        // @ts-ignore
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    } catch (error) {
      console.log("Haptic feedback not available");
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        isReady,
        isTelegram,
        user,
        colorScheme,
        close,
        showBackButton,
        onBackButtonClick,
        hapticFeedback,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};
