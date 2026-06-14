import { type HTMLAttributes } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: Padding;
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
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'border border-[var(--color-border)] bg-[var(--color-surface)]',
        hoverable ? 'transition-colors duration-200 cursor-pointer hover:border-[var(--color-border-strong)]' : '',
        PADDING_STYLES[padding],
        className,
      ].join(' ')}
      style={{ borderRadius: '8px', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
