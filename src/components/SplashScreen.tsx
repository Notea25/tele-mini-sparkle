import { useEffect, useState } from "react";
import logoSymbol from "@/assets/logo-symbol.png";
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
        
        {/* Animated morphing element - dot to football */}
        <div 
          className="absolute w-[14%] h-[12%] animate-bounce-dot-to-ball"
          style={{
            right: '6%',
            top: '38%',
          }}
        >
          {/* Green dot - fades out as it goes down */}
          <div 
            className="absolute inset-0 bg-primary rounded-[3px] animate-dot-fade"
          />
          {/* Football - fades in as it goes down */}
          <img 
            src={footballBall}
            alt=""
            className="absolute inset-0 w-full h-full object-contain animate-ball-fade"
            style={{ transform: 'scale(1.8)' }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes dot-fade {
          0%, 100% { opacity: 1; }
          35%, 65% { opacity: 0; }
        }
        @keyframes ball-fade {
          0%, 100% { opacity: 0; }
          35%, 65% { opacity: 1; }
        }
        .animate-dot-fade {
          animation: dot-fade 0.8s ease-in-out infinite;
        }
        .animate-ball-fade {
          animation: ball-fade 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
