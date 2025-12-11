import { useEffect, useState } from "react";

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
        {/* Main "f" shape - the curved part */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* The curved "S/f" shape */}
          <path
            d="M30 85 C30 85, 30 50, 30 40 C30 20, 50 15, 65 25 C75 32, 75 45, 65 50"
            stroke="#a3e635"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        
        {/* Animated dot */}
        <div 
          className="absolute w-4 h-4 bg-[#a3e635] rounded-sm animate-bounce-dot"
          style={{
            right: '12px',
            top: '38px',
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
