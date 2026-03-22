// components/MobileThemeToggle.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useState } from 'react';

export function MobileThemeToggle() {
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

  const label = theme === 'light' ? 'Темна' : 'Світла';
  const lightGradient = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
  const darkGradient = 'linear-gradient(135deg, #4b5563, #374151)';

  return (
    <motion.button
      onClick={handleClick}
      disabled={isAnimating}
      className={`
        relative flex items-center gap-2 px-4 py-3
        rounded-2xl
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        shadow-lg hover:shadow-xl
        backdrop-blur-sm bg-opacity-80
        transition-all duration-300
        overflow-hidden
        group
        ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Ripple effect */}
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
            animate={{ width: 120, height: 120, opacity: 0 }}
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

      {/* Icon and label */}
      <div className="relative z-10 flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </motion.div>
        </AnimatePresence>
        
        <motion.span
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          initial={false}
          key={theme}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
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
