'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className = '', delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  return (
    <motion.h2
      ref={ref}
      className={`text-3xl md:text-4xl font-black text-gray-900 dark:text-white ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {text}
    </motion.h2>
  );
}