import { useEffect, useState } from "react";

/**
 * Returns the current bottom inset (in px) caused by the on-screen keyboard.
 * Uses VisualViewport when available (best for mobile browsers / in-app webviews).
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;

    const compute = () => {
      // Fallback: no visualViewport support
      if (!vv) {
        setInset(0);
        return;
      }

      // Layout viewport height minus visual viewport height ~= keyboard height
      const heightDiff = window.innerHeight - vv.height;
      const nextInset = Math.max(0, Math.round(heightDiff));
      setInset(nextInset);
    };

    compute();

    if (!vv) return;

    vv.addEventListener("resize", compute);
    vv.addEventListener("scroll", compute);
    window.addEventListener("orientationchange", compute);

    return () => {
      vv.removeEventListener("resize", compute);
      vv.removeEventListener("scroll", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  return inset;
}
