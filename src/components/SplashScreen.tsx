import { useEffect, useState } from "react";
import logoSymbol from "@/assets/logo-symbol-purple.png";
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
          src={logoSymbol} 
          alt="Logo" 
          className="w-24 h-24 object-contain animate-scale-in"
        />
        {/* Bouncing ball replacing the dot */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <img 
            src={footballBounce} 
            alt="Ball" 
            className="w-6 h-6 object-contain animate-ball-bounce"
          />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/20 rounded-full blur-sm animate-shadow-pulse" />
        </div>
      </div>

      <style>{`
        @keyframes ball-bounce {
          0%, 100% {
            transform: translateY(0) scaleY(1) scaleX(1);
          }
          50% {
            transform: translateY(20px) scaleY(0.8) scaleX(1.1);
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
          animation: ball-bounce 0.6s ease-in-out infinite;
        }
        
        .animate-shadow-pulse {
          animation: shadow-pulse 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
