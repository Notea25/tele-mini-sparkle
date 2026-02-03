import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";

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
  
  return (
    <div className={`swipeable-tabs ${className}`}>
      {/* Tab Headers */}
      <div className="bg-secondary/50 rounded-lg p-1 flex mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Swipeable Content */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {children.map((child, index) => (
            <div key={tabs[index]?.id || index} className="flex-[0_0_100%] min-w-0">
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabs;
