'use client';

import { type HTMLAttributes } from 'react';
import { motion, type MotionStyle } from 'framer-motion';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?:   Padding;
}

const PADDING_STYLES: Record<Padding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export default function Card({
  hoverable = false,
  padding = 'md',
  children,
  className = '',
  style,
  onDrag: _onDrag,   // exclude HTML onDrag — conflicts with Framer Motion's
  ...props
}: CardProps) {
  return (
    <motion.div
      className={[
        'border border-[var(--color-border)] bg-[var(--color-surface)]',
        hoverable ? 'cursor-pointer' : '',
        PADDING_STYLES[padding],
        className,
      ].join(' ')}
      style={{ borderRadius: '8px', ...(style as MotionStyle) }}
      whileHover={hoverable ? { y: -3, boxShadow: '0 6px 24px rgba(76,31,212,0.12)', borderColor: 'var(--color-border-strong)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}
