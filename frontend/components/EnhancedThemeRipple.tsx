// components/EnhancedThemeRipple.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';

interface RippleState {
  x: number;
  y: number;
  theme: 'light' | 'dark';
}

export function EnhancedThemeRipple() {
  const { theme, isAnimating } = useTheme();
  const [ripple, setRipple] = useState<RippleState | null>(null);

  useEffect(() => {
    if (isAnimating && !ripple) {
      // In a real app, you'd get these from the button click
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setRipple({ x: centerX, y: centerY, theme: theme === 'light' ? 'dark' : 'light' });
    } else if (!isAnimating && ripple) {
      const timer = setTimeout(() => setRipple(null), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, ripple, theme]);

  if (!ripple) return null;

  const size = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
  
  // Beautiful gradients for both themes
  const lightGradient = `
    radial-gradient(
      circle at center,
      rgba(16, 185, 129, 0.9) 0%,
      rgba(14, 165, 233, 0.8) 40%,
      rgba(139, 92, 246, 0.7) 70%,
      transparent 100%
    )
  `;
  
  const darkGradient = `
    radial-gradient(
      circle at center,
      rgba(6, 95, 70, 0.9) 0%,
      rgba(3, 105, 161, 0.8) 40%,
      rgba(76, 29, 149, 0.7) 70%,
      transparent 100%
    )
  `;

  return (
    <AnimatePresence>
      {ripple && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 mix-blend-soft-light"
          style={{
            left: ripple.x - size / 2,
            top: ripple.y - size / 2,
            width: size,
            height: size,
            background: ripple.theme === 'light' ? lightGradient : darkGradient,
            borderRadius: '50%',
            filter: 'blur(20px)',
          }}
          initial={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: 2,
            opacity: [0, 0.8, 0],
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: {
              duration: 1.2,
              times: [0, 0.3, 1],
            },
          }}
        >
          {/* Additional glow layer */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: ripple.theme === 'light' 
                ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.2, times: [0, 0.2, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}