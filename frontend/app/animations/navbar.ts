// animations/navbar.ts
import { Variants, cubicBezier } from 'framer-motion';

export const navVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    willChange: "transform, opacity",
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
    },
  },
};

export const mobileMenuVariants = {
  hidden: { 
    opacity: 0,
    willChange: "opacity"
  },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

export const slideInVariants: Variants = {
  hidden: {
    x: "100%",
    willChange: "transform",
  },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
    },
  },
};

export const scaleInVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9, 
    y: -20,
    willChange: "transform, opacity"
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

export const modalBackdropVariants = {
  hidden: { 
    opacity: 0,
    willChange: "opacity"
  },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

export const tabContentVariants = {
  hidden: (direction: number) => ({ 
    opacity: 0, 
    x: direction * 20,
    willChange: "transform, opacity"
  }),
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3, 
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
    }
  },
  exit: (direction: number) => ({ 
    opacity: 0, 
    x: direction * -20,
    transition: { duration: 0.2 }
  })
};

export const mobileSubmenuVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    willChange: "height, opacity",
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};