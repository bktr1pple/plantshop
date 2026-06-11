// contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeToggleOrigin = Pick<React.MouseEvent, 'clientX' | 'clientY'>;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (origin?: ThemeToggleOrigin) => void;
  isAnimating: boolean;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getStoredTheme(): Theme | null {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = getStoredTheme();
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    const initialTheme = savedTheme ?? systemTheme;

    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    const timeout = window.setTimeout(() => {
      setTheme(initialTheme);
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const toggleTheme = (origin?: ThemeToggleOrigin) => {
    if (isAnimating || !isLoaded) return;

    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    };

    const doc = document as DocumentWithViewTransition;
    const root = document.documentElement;

    // На час перемикання глушимо елементні CSS-transitions: інакше кожен
    // елемент з transition-colors стартує власну анімацію одночасно зі
    // зміною класу .dark (головне джерело лагів на слабких пристроях).
    const muteTransitions = () => root.setAttribute('data-theme-switching', '');
    const unmuteTransitions = () =>
      root.removeAttribute('data-theme-switching');

    // Хвиля по всій сторінці через View Transitions: браузер анімує один
    // знімок сторінки на композиторі (clip-path коло з точки кліку) замість
    // тисяч одночасних CSS-transitions — швидко навіть на слабких пристроях.
    if (!doc.startViewTransition || prefersReducedMotion()) {
      muteTransitions();
      applyTheme();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(unmuteTransitions);
      });
      return;
    }

    const x = origin?.clientX ?? window.innerWidth / 2;
    const y = origin?.clientY ?? 0;
    // Радіус до найдальшого кута, щоб коло гарантовано накрило вʼюпорт.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    root.style.setProperty('--theme-reveal-x', `${x}px`);
    root.style.setProperty('--theme-reveal-y', `${y}px`);
    root.style.setProperty('--theme-reveal-radius', `${radius}px`);

    setIsAnimating(true);
    muteTransitions();
    const transition = doc.startViewTransition(applyTheme);
    transition.finished.finally(() => {
      unmuteTransitions();
      setIsAnimating(false);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAnimating, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
