// components/ThemeToggle.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme, isAnimating } = useTheme();
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setRipple({ x, y });
    toggleTheme();
    
    setTimeout(() => setRipple(null), 1000);
  };

  const lightGradient = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
  const darkGradient = 'linear-gradient(135deg, #4b5563, #374151)';

  return (
    <motion.button
      onClick={handleClick}
      disabled={isAnimating}
      className={`
        relative flex items-center justify-center
        w-12 h-12 rounded-2xl
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        shadow-lg hover:shadow-xl
        backdrop-blur-sm bg-opacity-80
        transition-all duration-300
        overflow-hidden
        group
        ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Ripple effect for the button itself */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            className="absolute rounded-full bg-white dark:bg-gray-800 opacity-20"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
            }}
            initial={{ width: 0, height: 0, opacity: 0.3 }}
            animate={{ width: 100, height: 100, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: theme === 'light' ? lightGradient : darkGradient,
        }}
        initial={false}
        animate={{ opacity: theme === 'light' ? 0.1 : 0.05 }}
        transition={{ duration: 0.3 }}
      />

      {/* Icons */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
        style={{
          background: theme === 'light' ? lightGradient : darkGradient,
        }}
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}
