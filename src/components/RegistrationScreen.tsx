import { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import playersWelcome from "@/assets/players-welcome.png";
import logo from "@/assets/logo-new.png";
import { Filter } from "bad-words";
import { usersApi } from "@/lib/api";
import { getUserId } from "@/lib/authStorage";
import { markRegistrationCompleted } from "@/lib/onboardingUtils";
import { toast } from "sonner";

const PROFILE_STORAGE_KEY = "fantasyUserProfile";

// Russian profanity list
const russianBadWords = [
  "блять",
  "сука",
  "хуй",
  "пизда",
  "ебать",
  "бля",
  "нахуй",
  "пиздец",
  "хуйня",
  "ебаный",
  "ебанутый",
  "мудак",
  "дебил",
  "идиот",
  "долбоеб",
  "залупа",
  "хер",
  "жопа",
  "срака",
  "говно",
  "дерьмо",
  "пидор",
  "пидорас",
];

interface RegistrationScreenProps {
  onComplete: () => void;
}

const RegistrationScreen = ({ onComplete }: RegistrationScreenProps) => {
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);
  const [isBirthDateFocused, setIsBirthDateFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Preload all images before showing content
  const imagesToPreload = useMemo(() => [logo, playersWelcome], []);
  const imagesLoaded = useImagePreloader(imagesToPreload);

  const scrollToButton = () => {
    setTimeout(() => {
      buttonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const validateNickname = (name: string): boolean => {
    if (name.length === 0) {
      setNicknameError("Придумай имя пользователя");
      return false;
    }
    if (name.length > 15) {
      setNicknameError("Имя не может быть длиннее 15 символов");
      return false;
    }

    // Check for profanity
    const filter = new Filter();
    filter.addWords(...russianBadWords);

    const lowerName = name.toLowerCase();
    const hasProfanity = russianBadWords.some((word) => lowerName.includes(word)) || filter.isProfane(name);

    if (hasProfanity) {
      setNicknameError("Имя содержит недопустимые слова");
      return false;
    }

    setNicknameError(null);
    return true;
  };

  const validateBirthDate = (date: string): boolean => {
    if (date.length === 0) {
      setBirthDateError("Укажи дату рождения");
      return false;
    }

    // Basic date format validation (DD.MM.YYYY)
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = date.match(dateRegex);

    if (!match) {
      setBirthDateError("Укажи дату в формате ДД.ММ.ГГГГ");
      return false;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) {
      setBirthDateError("Неверный месяц");
      return false;
    }

    if (day < 1 || day > 31) {
      setBirthDateError("Неверный день");
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      setBirthDateError("Неверный год");
      return false;
    }

    // Check if user is at least 6 years old
    const birthDateObj = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (age < 6 || (age === 6 && monthDiff < 0)) {
      setBirthDateError("Тебе должно быть не менее 6 лет");
      return false;
    }

    setBirthDateError(null);
    return true;
  };

  const formatBirthDateToISO = (value: string): string | null => {
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmedNickname = nickname.trim();

    const isNicknameValid = validateNickname(trimmedNickname);
    const isBirthDateValid = validateBirthDate(birthDate);

    if (!isNicknameValid || !isBirthDateValid) return;

    const isoBirthDate = formatBirthDateToISO(birthDate);
    if (!isoBirthDate) {
      setBirthDateError("Укажи дату в формате ДД.ММ.ГГГГ");
      return;
    }

    const userId = getUserId();

    // Если по какой-то причине нет userId (например, не успел сохраниться после логина),
    // не блокируем пользователя и сохраняем данные локально, как раньше.
    if (!userId) {
      const profileData = {
        userName: trimmedNickname,
        birthDate: birthDate,
        profileImage: null,
        createdAt: new Date().toLocaleDateString("ru-RU"),
      };

      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      markRegistrationCompleted();
      onComplete();
      return;
    }

    setIsSubmitting(true);
    try {
      // Get referrer from localStorage
      const referrerId = localStorage.getItem('fantasyReferrer');
      
      const response = await usersApi.update(userId, {
        username: trimmedNickname,
        birth_date: isoBirthDate,
        referrer_id: referrerId ? parseInt(referrerId, 10) : undefined,
      });

      if (!response.success) {
        toast.error("Не удалось сохранить данные, попробуй еще раз");
        return;
      }
      
      // Clear referrer from localStorage after successful registration
      localStorage.removeItem('fantasyReferrer');

      // Сохраняем данные локально (для профиля/аватарки и оффлайна)
      const profileData = {
        userName: trimmedNickname,
        birthDate: birthDate,
        profileImage: null,
        createdAt: new Date().toLocaleDateString("ru-RU"),
      };

      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      markRegistrationCompleted();

      onComplete();
    } catch (error) {
      console.error("Registration update failed", error);
      toast.error("Ошибка при сохранении данных, попробуй еще раз");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Auto-format: add dots after DD and MM
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly.length <= 2) {
      value = digitsOnly;
    } else if (digitsOnly.length <= 4) {
      value = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
    } else {
      value = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
    }

    setBirthDate(value);
    if (birthDateError) setBirthDateError(null);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value.slice(0, 15));
    if (nicknameError) setNicknameError(null);
  };

  // Show loading state until all images are ready
  if (!imagesLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Logo */}
      <div className="px-4 pt-3 pb-4 flex justify-center">
        <img src={logo} alt="Fantasy Sports" className="w-[175px] h-6" />
      </div>

      {/* Players image */}
      <div className="w-full pt-6">
        <img src={playersWelcome} alt="Welcome" className="w-full h-auto object-cover" />
      </div>

      {/* Content area */}
      <div className="flex flex-col items-center px-6 py-6">

        {/* Title */}
        <h1 className="text-2xl md:text-3xl text-center text-foreground mb-2 px-4 font-display">
          Добро пожаловать
        </h1>
        <h2 className="text-2xl md:text-3xl text-center text-foreground mb-4 px-4 font-display">
          в Fantasy Sports
        </h2>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center text-base mb-8 px-4 font-sans">
          До старта твоих побед остался всего один шаг
        </p>

        {/* Form fields */}
        <div className="w-full space-y-3 mb-8">
          <div className="relative">
            <input
              value={nickname}
              onChange={handleNicknameChange}
              onFocus={() => { setIsNicknameFocused(true); scrollToButton(); }}
              onBlur={() => setTimeout(() => setIsNicknameFocused(false), 150)}
              placeholder="Придумай имя пользователя"
              maxLength={15}
              className={`w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-[#4B485F] ${nicknameError ? "ring-2 ring-destructive" : ""}`}
              style={{
                borderColor: isNicknameFocused ? "rgba(255, 255, 255, 0.2)" : "#363546",
                color: isNicknameFocused || nickname ? "#FFFFFF" : "#4B485F",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 font-rubik font-normal text-sm text-[#4B485F] pointer-events-none">
              {nickname.length}/15
            </div>
            {nicknameError && <p className="text-destructive text-sm mt-1 px-1">{nicknameError}</p>}
          </div>
          <div>
            <input
              value={birthDate}
              onChange={handleBirthDateChange}
              onFocus={() => { setIsBirthDateFocused(true); scrollToButton(); }}
              onBlur={() => setTimeout(() => setIsBirthDateFocused(false), 150)}
              placeholder="Укажи дату рождения (ДД.ММ.ГГГГ)"
              maxLength={10}
              inputMode="numeric"
              className={`w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-[#4B485F] ${birthDateError ? "ring-2 ring-destructive" : ""}`}
              style={{
                borderColor: isBirthDateFocused ? "rgba(255, 255, 255, 0.2)" : "#363546",
                color: isBirthDateFocused || birthDate ? "#FFFFFF" : "#4B485F",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            />
            {birthDateError && <p className="text-destructive text-sm mt-1 px-1">{birthDateError}</p>}
          </div>
        </div>

        {/* Button */}
        <Button
          ref={buttonRef}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-[44px] font-rubik text-[16px] font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
        >
          {isSubmitting ? "Сохранение..." : "Готово"}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationScreen;
