// src/hooks/useSafeScroll.ts
'use client';

import { useScroll, useTransform, useMotionValue, MotionValue } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export function useSafeScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Fallback MotionValue для безопасного состояния до монтирования
  const defaultYProgress = useMotionValue(0);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const scrollInfo = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Всегда возвращаем MotionValue (тип безопасен)
  const safeScrollYProgress: MotionValue<number> = isReady
    ? scrollInfo.scrollYProgress
    : defaultYProgress;

  const opacity = useTransform(safeScrollYProgress, [0, 0.2], [0, 1]);
  const y = useTransform(safeScrollYProgress, [0, 0.2], [30, 0]);

  return { ref, opacity, y, isReady };
}
