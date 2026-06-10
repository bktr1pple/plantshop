// components/ThemeRipple.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';

interface RippleState {
  x: number;
  y: number;
  theme: 'light' | 'dark';
}

export function ThemeRipple() {
  const { theme, isAnimating } = useTheme();
  const [ripple, setRipple] = useState<RippleState | null>(null);

  useEffect(() => {
    if (isAnimating && !ripple) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const frame = window.requestAnimationFrame(() => {
        setRipple({ x: centerX, y: centerY, theme });
      });
      return () => window.cancelAnimationFrame(frame);
    } else if (!isAnimating && ripple) {
      const timer = setTimeout(() => setRipple(null), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, ripple, theme]);

  if (!ripple) return null;

  const size = Math.max(window.innerWidth, window.innerHeight) * 2;
  
  const lightGradient = 'linear-gradient(135deg, #10b981, #0ea5e9, #8b5cf6)';
  const darkGradient = 'linear-gradient(135deg, #047857, #0369a1, #7c3aed)';
  
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        left: ripple.x - size / 2,
        top: ripple.y - size / 2,
        width: size,
        height: size,
        background: ripple.theme === 'light' ? lightGradient : darkGradient,
        borderRadius: '50%',
      }}
      initial={{
        scale: 0,
        opacity: 0.8,
      }}
      animate={{
        scale: 1,
        opacity: [0.8, 0.9, 0],
      }}
      transition={{
        duration: 1,
        ease: [0.4, 0, 0.2, 1],
        opacity: {
          duration: 1,
          times: [0, 0.5, 1],
        },
      }}
    />
  );
}
