// hooks/useScrollEffect.ts
import { useEffect } from 'react';

export function useScrollEffect(onScroll: (scrolled: boolean) => void) {
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onScroll]);
}