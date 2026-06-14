'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

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

const STYLES: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'var(--color-accent)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--color-surface)', color: 'var(--color-body)', border: '1px solid var(--color-border)' },
  ghost:     { background: 'transparent', color: 'var(--color-accent)', border: 'none' },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth, className = '', style, children, disabled, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const isDisabled = disabled ?? loading;
    const base = `inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${base} ${className}`}
        style={{ borderRadius: '8px', ...STYLES[variant], ...style }}
        onMouseEnter={e => {
          if (!isDisabled) {
            if (variant === 'primary')   e.currentTarget.style.background = 'var(--color-accent-hover)';
            if (variant === 'secondary') e.currentTarget.style.borderColor = 'var(--color-border-strong)';
            if (variant === 'ghost')     e.currentTarget.style.color = 'var(--color-accent-hover)';
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={e => {
          if (!isDisabled) {
            if (variant === 'primary')   e.currentTarget.style.background = 'var(--color-accent)';
            if (variant === 'secondary') e.currentTarget.style.borderColor = 'var(--color-border)';
            if (variant === 'ghost')     e.currentTarget.style.color = 'var(--color-accent)';
          }
          onMouseLeave?.(e);
        }}
        {...props}
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
      </button>
    );
  },
);
Button.displayName = 'Button';
export default Button;
