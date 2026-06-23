'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type MotionStyle } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  fullWidth?: boolean;
}

const SIZES: Record<Size, string> = {
  sm:  'px-4 py-2 text-sm',
  md:  'px-5 py-2.5 text-sm',
  lg:  'px-7 py-3 text-base',
};

const STYLES: Record<Variant, MotionStyle> = {
  primary:   { background: 'var(--color-accent)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--color-surface)', color: 'var(--color-body)', border: '1px solid var(--color-border)' },
  ghost:     { background: 'transparent', color: 'var(--color-accent)', border: 'none' },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth, className = '', style, children, disabled, onMouseEnter, onMouseLeave, onDrag: _onDrag, ...props }, ref) => {
    const isDisabled = disabled ?? loading;
    const base = `inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={`${base} ${className}`}
        style={{ borderRadius: '8px', ...STYLES[variant], ...(style as MotionStyle | undefined) }}
        whileHover={isDisabled ? {} : { scale: 1.03, y: -1 }}
        whileTap={isDisabled ? {} : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onMouseEnter={e => {
          if (!isDisabled) {
            const el = e.currentTarget as HTMLButtonElement;
            if (variant === 'primary')   el.style.background = 'var(--color-accent-hover)';
            if (variant === 'secondary') el.style.borderColor = 'var(--color-border-strong)';
            if (variant === 'ghost')     el.style.color = 'var(--color-accent-hover)';
          }
          onMouseEnter?.(e as React.MouseEvent<HTMLButtonElement>);
        }}
        onMouseLeave={e => {
          if (!isDisabled) {
            const el = e.currentTarget as HTMLButtonElement;
            if (variant === 'primary')   el.style.background = 'var(--color-accent)';
            if (variant === 'secondary') el.style.borderColor = 'var(--color-border)';
            if (variant === 'ghost')     el.style.color = 'var(--color-accent)';
          }
          onMouseLeave?.(e as React.MouseEvent<HTMLButtonElement>);
        }}
        {...(props as object)}
      >
        {loading ? (
          <>
            <span
              className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin"
              aria-hidden="true"
            />
            {children}
          </>
        ) : children}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';
export default Button;
