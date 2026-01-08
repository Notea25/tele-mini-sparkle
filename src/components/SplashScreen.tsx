import { useEffect, useState } from "react";
import logoSymbolNoDot from "@/assets/logo-symbol-no-dot.png";
import footballBounce from "@/assets/football-bounce.png";

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
      <div className="relative">
        <img 
          src={logoSymbolNoDot} 
          alt="Logo" 
          className="w-24 h-24 object-contain animate-scale-in"
        />
        {/* Bouncing ball replacing the dot in the logo */}
        <div className="absolute top-[35%] right-0">
          <img 
            src={footballBounce} 
            alt="Ball" 
            className="w-6 h-6 object-contain animate-ball-bounce"
          />
        </div>
      </div>

      <style>{`
        @keyframes ball-bounce {
          0% {
            transform: translateY(0) scaleY(1) scaleX(1) rotate(0deg);
          }
          45%, 55% {
            transform: translateY(48px) scaleY(0.7) scaleX(1.2) rotate(50deg);
          }
          100% {
            transform: translateY(0) scaleY(1) scaleX(1) rotate(100deg);
          }
        }
        
        @keyframes shadow-pulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(-50%) scale(1.3);
            opacity: 0.6;
          }
        }
        
        .animate-ball-bounce {
          animation: ball-bounce 1s ease-in-out infinite;
        }
        
        .animate-shadow-pulse {
          animation: shadow-pulse 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
