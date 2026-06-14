export function Blob({ color, size = 360, blur = 70, opacity = 0.6, className = '', style }: {
  color: string;
  size?: number;
  blur?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none rounded-full ${className}`}
      style={{ width: size, height: size, background: color, filter: `blur(${blur}px)`, opacity, ...style }}
    />
  );
}

export function DotsPattern({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: 'radial-gradient(var(--color-border) 1.2px, transparent 1.2px)',
        backgroundSize:  '22px 22px',
        opacity:         0.5,
        ...style,
      }}
    />
  );
}
