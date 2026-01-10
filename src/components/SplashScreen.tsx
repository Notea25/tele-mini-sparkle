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
        <div className="absolute top-[35%] right-0 animate-ball-bounce">
          <img 
            src={footballBounce} 
            alt="Ball" 
            className="w-5 h-5 object-contain animate-ball-spin"
          />
        </div>
      </div>

      <style>{`
        @keyframes ball-bounce {
          0%, 100% {
            transform: translateY(0) scaleY(1) scaleX(1);
          }
          45%, 55% {
            transform: translateY(48px) scaleY(0.7) scaleX(1.2);
          }
        }
        
        @keyframes ball-spin {
          from {
            rotate: 0deg;
          }
          to {
            rotate: 360deg;
          }
        }
        
        .animate-ball-bounce {
          animation: ball-bounce 1s ease-in-out infinite;
        }
        
        .animate-ball-spin {
          animation: ball-spin 2s linear infinite;
        }
        
        .animate-shadow-pulse {
          animation: shadow-pulse 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
