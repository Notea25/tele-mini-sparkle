import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import onboardingField from "@/assets/onboarding-field-new.png";
import onboardingTransfers from "@/assets/onboarding-transfers-new.png";
import onboardingPrizes from "@/assets/onboarding-prizes-new.png";
import logo from "@/assets/logo-new.png";

interface OnboardingSlide {
  image: string;
  title: string;
  subtitle: React.ReactNode;
}

const slides: OnboardingSlide[] = [
  {
    image: onboardingField,
    title: "Создай свою команду",
    subtitle: (
      <>
        Собери команду из <span className="text-primary">15 игроков</span> чемпионата
      </>
    ),
  },
  {
    image: onboardingTransfers,
    title: "Определи основной состав",
    subtitle: "Делай трансферы, замены, выбирай капитана и используй бусты",
  },
  {
    image: onboardingPrizes,
    title: "Борись за ценные призы",
    subtitle: (
      <>
        Участвуй в основной и коммерческой
        <br />
        лигах, создавай частные
      </>
    ),
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Preload all images before showing content
  const imagesToPreload = useMemo(
    () => [logo, onboardingField, onboardingTransfers, onboardingPrizes],
    []
  );
  const imagesLoaded = useImagePreloader(imagesToPreload);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

  // Show loading state until all images are ready
  if (!imagesLoaded) {
    return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col bg-background">
      {/* Logo */}
      <div className="px-4 pt-3 pb-4 flex justify-center">
        <img src={logo} alt="Fantasy Sports" className="w-[175px] h-6" />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Image card */}
        <div className="w-full max-w-sm mb-8">
          <div className="relative rounded-xl overflow-hidden border border-border/30 bg-card/50">
            <img src={slide.image} alt={slide.title} className="w-full h-auto object-cover" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl text-center text-foreground mb-4 px-4 font-display">{slide.title}</h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-center text-base mb-8 px-4 font-sans whitespace-pre-line">{slide.subtitle}</p>

        {/* Progress indicators */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-24 rounded-full transition-colors ${
                index === currentSlide ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          onClick={handleNext}
          className="w-full h-[44px] font-rubik text-[16px] font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
        >
          Далее
        </Button>
        <Button
          variant="secondary"
          onClick={handleSkip}
          className="w-full h-[44px] font-rubik text-[16px] font-medium bg-muted hover:bg-muted/80 rounded-lg"
        >
          Пропустить
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
