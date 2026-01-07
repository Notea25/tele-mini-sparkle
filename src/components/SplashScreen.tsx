import { useEffect, useState } from "react";
import logoSymbol from "@/assets/logo-symbol-purple.png";
import footballBall from "@/assets/football-ball.png";

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
      <div className="relative w-20 h-24">
        {/* Main logo without dot - using CSS mask to hide only the dot area */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${logoSymbol})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            clipPath: 'polygon(0 0, 100% 0, 100% 35%, 72% 35%, 72% 55%, 100% 55%, 100% 100%, 0 100%)',
          }}
        />
        
        {/* Shadow under the ball */}
        <div 
          className="absolute animate-shadow-pulse"
          style={{
            right: '4%',
            top: '72%',
            width: '18%',
            height: '4%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        
        {/* Animated football ball */}
        <div 
          className="absolute w-[14%] h-[12%] animate-bounce-dot-to-ball"
          style={{
            right: '6%',
            top: '38%',
          }}
        >
          {/* Football - always visible, with squish effect at bottom */}
          <img 
            src={footballBall}
            alt=""
            className="absolute inset-0 w-full h-full object-contain animate-ball-squish"
            style={{ 
              filter: 'brightness(0) saturate(100%) invert(21%) sepia(95%) saturate(6000%) hue-rotate(275deg) brightness(95%) contrast(120%)',
              transform: 'scale(1.5)',
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes ball-squish {
          0% { 
            transform: scale(1.5) scaleX(1) scaleY(1) rotate(0deg);
          }
          45%, 55% { 
            transform: scale(1.5) scaleX(1.12) scaleY(0.88) rotate(45deg);
          }
          100% { 
            transform: scale(1.5) scaleX(1) scaleY(1) rotate(90deg);
          }
        }
        @keyframes shadow-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(0.6);
          }
          45%, 55% { 
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        .animate-ball-squish {
          animation: ball-squish 0.8s ease-in-out infinite;
        }
        .animate-shadow-pulse {
          animation: shadow-pulse 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
