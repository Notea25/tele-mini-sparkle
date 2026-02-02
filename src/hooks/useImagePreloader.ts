import { useState, useEffect } from "react";

/**
 * Hook to preload images and track loading state
 * Returns true when all images are loaded
 */
export const useImagePreloader = (imageSources: string[]): boolean => {
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (imageSources.length === 0) {
      setAllLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageSources.length;

    const handleLoad = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setAllLoaded(true);
      }
    };

    const handleError = () => {
      // Still count errors as "loaded" to prevent infinite loading
      loadedCount++;
      if (loadedCount >= totalImages) {
        setAllLoaded(true);
      }
    };

    imageSources.forEach((src) => {
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = src;
    });

    // Cleanup not needed for Image objects
  }, [imageSources]);

  return allLoaded;
};

export default useImagePreloader;
