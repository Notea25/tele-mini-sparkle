import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface SwipeableTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode[];
  className?: string;
}

const SwipeableTabs = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = "",
}: SwipeableTabsProps) => {
  const isNavigatingRef = useRef(false);
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);
  const [scrollProgress, setScrollProgress] = useState(activeIndex >= 0 ? activeIndex : 0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: false,
    startIndex: activeIndex >= 0 ? activeIndex : 0,
    dragFree: false,
    containScroll: "trimSnaps",
    watchDrag: (_emblaApi, event) => {
      const target = event.target as HTMLElement;
      
      // Check for elements that should prevent swipe
      const swipeIgnore = target.closest('[data-swipe-ignore="true"]');
      if (swipeIgnore) return false;
      
      // Check for horizontally scrollable containers
      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        const overflowX = style.overflowX;
        
        if (
          (overflowX === "auto" || overflowX === "scroll") &&
          el.scrollWidth > el.clientWidth
        ) {
          // Element has horizontal scroll - check scroll position
          const isAtStart = el.scrollLeft <= 1;
          const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
          
          // Determine swipe direction from touch event
          if ("touches" in event) {
            // For touch events, we'll allow swipe at edges
            // If scrolled to the left edge and swiping right, allow
            // If scrolled to the right edge and swiping left, allow
            // Otherwise prevent swipe to allow horizontal scroll
            if (!isAtStart && !isAtEnd) {
              return false;
            }
          } else {
            // For mouse/pointer events, prevent if scrollable
            if (!isAtStart && !isAtEnd) {
              return false;
            }
          }
        }
        el = el.parentElement;
      }
      
      return true;
    },
  });
  
  // Track scroll progress for indicator animation
  useEffect(() => {
    if (!emblaApi) return;
    
    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      const maxIndex = tabs.length - 1;
      // Convert 0-1 progress to tab index range
      const currentProgress = progress * maxIndex;
      setScrollProgress(currentProgress);
    };
    
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, tabs.length]);
  
  // Handle tab button click
  const handleTabClick = useCallback((tabId: string) => {
    const index = tabs.findIndex((t) => t.id === tabId);
    if (index >= 0 && emblaApi) {
      isNavigatingRef.current = true;
      emblaApi.scrollTo(index);
      onTabChange(tabId);
      
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    }
  }, [emblaApi, tabs, onTabChange]);
  
  // Sync carousel position when activeTab changes externally
  useEffect(() => {
    if (!emblaApi || isNavigatingRef.current) return;
    
    const targetIndex = tabs.findIndex((t) => t.id === activeTab);
    const currentIndex = emblaApi.selectedScrollSnap();
    
    if (targetIndex >= 0 && targetIndex !== currentIndex) {
      emblaApi.scrollTo(targetIndex, true);
    }
  }, [emblaApi, activeTab, tabs]);
  
  // Handle carousel selection from swipe
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      if (isNavigatingRef.current) return;
      
      const selectedIndex = emblaApi.selectedScrollSnap();
      const selectedTab = tabs[selectedIndex];
      
      if (selectedTab && selectedTab.id !== activeTab) {
        onTabChange(selectedTab.id);
      }
    };
    
    emblaApi.on("select", onSelect);
    
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, tabs, activeTab, onTabChange]);

  // Calculate indicator position and width based on scroll progress
  const getIndicatorStyle = () => {
    if (tabRefs.current.length === 0) return {};
    
    const floorIndex = Math.floor(scrollProgress);
    const ceilIndex = Math.min(Math.ceil(scrollProgress), tabs.length - 1);
    const fraction = scrollProgress - floorIndex;
    
    const currentTab = tabRefs.current[floorIndex];
    const nextTab = tabRefs.current[ceilIndex];
    
    if (!currentTab) return {};
    
    const currentLeft = currentTab.offsetLeft;
    const currentWidth = currentTab.offsetWidth;
    
    if (floorIndex === ceilIndex || !nextTab) {
      return {
        left: currentLeft,
        width: currentWidth,
      };
    }
    
    const nextLeft = nextTab.offsetLeft;
    const nextWidth = nextTab.offsetWidth;
    
    // Interpolate position and width
    const left = currentLeft + (nextLeft - currentLeft) * fraction;
    const width = currentWidth + (nextWidth - currentWidth) * fraction;
    
    return { left, width };
  };

  const indicatorStyle = getIndicatorStyle();
  
  return (
    <div className={cn("swipeable-tabs", className)}>
      {/* Tab Headers */}
      <div className="relative bg-secondary/50 rounded-lg p-1 flex mb-6">
        {/* Animated indicator */}
        <div 
          className="absolute top-1 bottom-1 bg-primary rounded-md transition-[left,width] duration-75 ease-out shadow-neon"
          style={{
            left: indicatorStyle.left ?? 0,
            width: indicatorStyle.width ?? 0,
          }}
        />
        
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative z-10 flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Swipeable Content */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y" style={{ gap: '16px' }}>
          {children.map((child, index) => (
            <div 
              key={tabs[index]?.id || index} 
              className="flex-[0_0_100%] min-w-0"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabs;
