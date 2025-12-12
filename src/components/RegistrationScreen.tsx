import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import playersWelcome from "@/assets/players-welcome.png";
import { Filter } from "bad-words";

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
    <div className="fixed inset-0 z-[9998] flex flex-col bg-background overflow-auto">
      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 min-h-0">
        {/* Players image */}
        <div className="w-full max-w-sm mb-8 flex-shrink-0">
          <img src={playersWelcome} alt="Welcome" className="w-full h-auto object-cover rounded-2xl" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-foreground italic mb-2 px-4">
          Добро пожаловать
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground italic mb-4 px-4">
          в Fantasy Sports
        </h2>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center text-base mb-8 px-4">
          До старта твоих побед остался всего один шаг
        </p>

        {/* Form fields */}
        <div className="w-full space-y-3 mb-8 flex-shrink-0">
          <div>
            <Input
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="Придумай имя пользователя"
              className={`w-full h-14 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground text-base px-4 ${nicknameError ? "ring-2 ring-destructive" : ""}`}
            />
            {nicknameError && <p className="text-destructive text-sm mt-1 px-1">{nicknameError}</p>}
          </div>
          <div>
            <Input
              value={birthDate}
              onChange={handleBirthDateChange}
              placeholder="Укажи дату рождения (ДД.ММ.ГГГГ)"
              className={`w-full h-14 bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground text-base px-4 ${birthDateError ? "ring-2 ring-destructive" : ""}`}
              maxLength={10}
              inputMode="numeric"
            />
            {birthDateError && <p className="text-destructive text-sm mt-1 px-1">{birthDateError}</p>}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="px-6 pb-8 flex-shrink-0">
        <Button onClick={handleSubmit} className="w-full h-14 text-lg font-semibold">
          Готово
        </Button>
      </div>
    </div>
  );
};

export default RegistrationScreen;
