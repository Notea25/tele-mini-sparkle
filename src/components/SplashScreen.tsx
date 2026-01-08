import { useEffect, useState } from "react";
import logoSymbol from "@/assets/logo-symbol-purple.png";

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

const SplashScreen = ({ onComplete, minDuration = 2000 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0f]">
      <img 
        src={logoSymbol} 
        alt="Logo" 
        className="w-24 h-24 object-contain animate-scale-in"
      />
    </div>
  );
};

export default SplashScreen;
