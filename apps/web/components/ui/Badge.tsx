import { type HTMLAttributes } from 'react';

type Tone = 'accent' | 'complete' | 'error' | 'streak' | 'neutral'
          | 'primary' | 'success' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const TONE_STYLES: Record<Tone, string> = {
  accent:   'bg-[var(--color-accent-soft)]   text-[var(--color-accent)]',
  complete: 'bg-[var(--color-complete-soft)] text-[var(--color-complete)]',
  error:    'bg-[var(--color-error-soft)]    text-[var(--color-error)]',
  streak:   'bg-[var(--color-streak-soft)]   text-[var(--color-streak)]',
  neutral:  'bg-[var(--color-bg)]            text-[var(--color-muted)] border border-[var(--color-border)]',
  // backward-compat aliases
  primary: 'bg-[var(--color-accent-soft)]   text-[var(--color-accent)]',
  success: 'bg-[var(--color-complete-soft)] text-[var(--color-complete)]',
  danger:  'bg-[var(--color-error-soft)]    text-[var(--color-error)]',
  info:    'bg-[var(--color-info-soft)]     text-[var(--color-info)]',
};

export default function Badge({
  tone = 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium',
        TONE_STYLES[tone],
        className,
      ].join(' ')}
      style={{ borderRadius: '8px' }}
      {...props}
    >
      {children}
    </span>
  );
}
