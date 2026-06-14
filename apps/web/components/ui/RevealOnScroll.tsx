'use client';

import { motion } from 'framer-motion';
import { useAnimationConfig } from '@/hooks/useAnimationConfig';

export default function RevealOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { fadeUp, transition } = useAnimationConfig();
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
