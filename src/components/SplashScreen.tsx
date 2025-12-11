import { useEffect, useState } from "react";
import logoSymbol from "@/assets/logo-symbol.png";

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
        
        {/* Animated dot */}
        <div 
          className="absolute w-[14%] h-[12%] bg-primary rounded-[3px] animate-bounce-dot"
          style={{
            right: '6%',
            top: '38%',
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
