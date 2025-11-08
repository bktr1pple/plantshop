"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Particles() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pre-defined positions to avoid hydration mismatch
  const particlePositions = [
    { left: 10, top: 15 },
    { left: 25, top: 40 },
    { left: 50, top: 20 },
    { left: 75, top: 60 },
    { left: 90, top: 30 },
    { left: 15, top: 70 },
    { left: 40, top: 85 },
    { left: 60, top: 45 },
    { left: 85, top: 75 },
    { left: 30, top: 25 },
    { left: 70, top: 15 },
    { left: 5, top: 50 },
    { left: 45, top: 65 },
    { left: 65, top: 35 },
    { left: 80, top: 55 },
    { left: 20, top: 80 },
    { left: 35, top: 10 },
    { left: 55, top: 90 },
    { left: 95, top: 40 },
    { left: 12, top: 35 }
  ];

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <>
      {particlePositions.map((position, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -80, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: (i * 0.3) % 5,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full"
          style={{
            left: `${position.left}%`,
            top: `${position.top}%`
          }}
        />
      ))}
    </>
  );
}