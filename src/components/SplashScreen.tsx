import { useEffect, useState } from "react";
import logoSymbol from "@/assets/logo-symbol-purple.png";
import footballBall from "@/assets/football-bounce.png";

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
      <div className="relative w-24 h-24">
        {/* Main logo - mask out the dot area */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${logoSymbol})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            clipPath: 'polygon(0 0, 100% 0, 100% 32%, 68% 32%, 68% 58%, 100% 58%, 100% 100%, 0 100%)',
          }}
        />
        
        {/* Shadow under the ball */}
        <div 
          className="absolute animate-shadow-pulse"
          style={{
            right: '8%',
            top: '78%',
            width: '22%',
            height: '6%',
            background: 'radial-gradient(ellipse, rgba(156, 0, 240, 0.4) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        
        {/* Animated football ball */}
        <div 
          className="absolute animate-ball-bounce"
          style={{
            right: '6%',
            top: '34%',
            width: '24%',
            height: '24%',
          }}
        >
          <img 
            src={footballBall}
            alt=""
            className="w-full h-full object-contain animate-ball-squish"
            style={{ 
              filter: 'brightness(0) saturate(100%) invert(13%) sepia(95%) saturate(6697%) hue-rotate(276deg) brightness(99%) contrast(133%)',
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes ball-bounce {
          0%, 100% { 
            transform: translateY(0);
          }
          50% { 
            transform: translateY(80%);
          }
        }
        @keyframes ball-squish {
          0%, 100% { 
            transform: scaleX(1) scaleY(1) rotate(0deg);
          }
          45%, 55% { 
            transform: scaleX(1.15) scaleY(0.85) rotate(45deg);
          }
        }
        @keyframes shadow-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(0.6);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.3);
          }
        }
        .animate-ball-bounce {
          animation: ball-bounce 0.7s ease-in-out infinite;
        }
        .animate-ball-squish {
          animation: ball-squish 0.7s ease-in-out infinite;
        }
        .animate-shadow-pulse {
          animation: shadow-pulse 0.7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
