// contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isAnimating: boolean;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_ANIMATION_MS = 450;

function getStoredTheme(): Theme | null {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
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

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const timeout = window.setTimeout(() => {
      setTheme(initialTheme);
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const toggleTheme = () => {
    if (isAnimating || !isLoaded) return;

    setIsAnimating(true);
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => setIsAnimating(false), THEME_ANIMATION_MS);
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
