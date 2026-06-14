'use client';

import { useReducedMotion } from 'framer-motion';

export function useAnimationConfig() {
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden:  { opacity: reduce ? 1 : 0, y: reduce ? 0 : 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden:  {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  };

  const transition = {
    duration: reduce ? 0 : 0.4,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return { fadeUp, staggerContainer, transition };
}
