import { type HTMLAttributes } from 'react';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
}

export default function Tag({ selected = false, children, className = '', style, ...props }: TagProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-medium transition-colors duration-150 ${className}`}
      style={{
        borderRadius: '8px',
        background:   selected ? 'var(--color-accent-soft)' : 'var(--color-bg)',
        color:        selected ? 'var(--color-accent)'      : 'var(--color-muted)',
        border:       selected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        cursor:       'default',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
