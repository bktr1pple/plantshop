// src/components/ui/StatCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'emerald' | 'green' | 'blue';
  delay?: number;
}

export function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsClient(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
  };

  if (!isClient) {
    return (
      <div
        ref={ref}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white`}>
            {icon}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <motion.p
            className="text-3xl font-black text-gray-900 dark:text-white mt-2"
            initial={{ scale: 0.5 }}
            animate={isInView ? { scale: 1 } : { scale: 0.5 }}
            transition={{
              duration: 0.8,
              delay: delay + 0.2,
              type: 'spring',
              stiffness: 100,
            }}
          >
            {value}
          </motion.p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
