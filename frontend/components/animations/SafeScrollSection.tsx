// src/components/animations/SafeScrollSection.tsx
'use client';

import { motion } from 'framer-motion';
import { useSafeScroll } from '@/hooks/useSafeScroll';
import { ReactNode } from 'react';

interface SafeScrollSectionProps {
  children: ReactNode;
  className?: string;
}

export function SafeScrollSection({ children, className = '' }: SafeScrollSectionProps) {
  const { ref, opacity, y, isReady } = useSafeScroll();

  if (!isReady) {
    return (
      <section ref={ref} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      className={className}
      style={{ opacity, y }}
    >
      {children}
    </motion.section>
  );
}