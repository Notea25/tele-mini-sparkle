import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import playersWelcome from "@/assets/players-welcome.png";
import logo from "@/assets/logo.png";
import { Filter } from "bad-words";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

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
  const formRef = useRef<HTMLDivElement>(null);
  const keyboardInset = useKeyboardInset();

  const scrollToElement = (el: HTMLElement | null) => {
    if (!el) return;
    // Delay a bit so the keyboard/viewport has time to settle.
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ensure the focused input is visible above the keyboard.
    scrollToElement(e.currentTarget);
  };

  useEffect(() => {
    // When keyboard opens, prefer showing the form area.
    if (keyboardInset > 0) scrollToElement(formRef.current);
  }, [keyboardInset]);

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
      setBirthDateError("Вам должно быть не менее 6 лет");
      return false;
    }

    setBirthDateError(null);
    return true;
  };

  const handleSubmit = () => {
    const trimmedNickname = nickname.trim();

    const isNicknameValid = validateNickname(trimmedNickname);
    const isBirthDateValid = validateBirthDate(birthDate);

    if (!isNicknameValid || !isBirthDateValid) return;

    // Save to profile storage
    const profileData = {
      userName: trimmedNickname,
      birthDate: birthDate,
      profileImage: null,
      createdAt: new Date().toLocaleDateString("ru-RU"),
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    localStorage.setItem("fantasyRegistrationCompleted", "true");

    onComplete();
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

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col bg-background overflow-auto overscroll-contain"
      style={{ paddingBottom: keyboardInset }}
    >
      {/* Logo */}
      <div className="px-4 pt-3 pb-4 flex justify-center flex-shrink-0">
        <img src={logo} alt="Fantasy Sports" className="w-[175px] h-6" />
      </div>

      {/* Players image - collapses when keyboard is open */}
      <div
        className="w-full flex-shrink-0 overflow-hidden transition-all duration-200"
        style={{
          maxHeight: keyboardInset > 0 ? 0 : 320,
          paddingTop: keyboardInset > 0 ? 0 : 24,
          opacity: keyboardInset > 0 ? 0 : 1,
        }}
      >
        <img src={playersWelcome} alt="Welcome" className="w-full h-auto object-cover" />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center px-6 py-6">

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2 px-4 font-display">
          Добро пожаловать
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4 px-4 font-display">
          в Fantasy Sports
        </h2>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center text-base mb-8 px-4 font-sans">
          До старта твоих побед остался всего один шаг
        </p>

        {/* Form fields */}
        <div ref={formRef} className="w-full space-y-3 mb-8">
          <div className="relative">
            <input
              value={nickname}
              onChange={handleNicknameChange}
              onFocus={handleInputFocus}
              placeholder="Придумай имя пользователя"
              maxLength={15}
              className={`w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-[#4B485F] ${nicknameError ? "ring-2 ring-destructive" : ""}`}
              style={{
                borderColor: nickname ? "rgba(255, 255, 255, 0.2)" : "#363546",
                color: nickname ? "#FFFFFF" : "#4B485F",
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
              onFocus={handleInputFocus}
              placeholder="Укажи дату рождения (ДД.ММ.ГГГГ)"
              maxLength={10}
              inputMode="numeric"
              className={`w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-[#4B485F] ${birthDateError ? "ring-2 ring-destructive" : ""}`}
              style={{
                borderColor: birthDate ? "rgba(255, 255, 255, 0.2)" : "#363546",
                color: birthDate ? "#FFFFFF" : "#4B485F",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            />
            {birthDateError && <p className="text-destructive text-sm mt-1 px-1">{birthDateError}</p>}
          </div>
        </div>

        {/* Button - stays visible above keyboard */}
        <div className="sticky bottom-0 w-full pb-8 pt-3 bg-background/80 backdrop-blur">
          <Button
            onClick={handleSubmit}
            className="w-full h-[44px] font-rubik text-[16px] font-bold bg-primary hover:bg-primary/90 text-[#212121] rounded-[24px]"
            style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
          >
            Готово
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;
