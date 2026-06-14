interface PageHeaderProps {
  title:     string;
  subtitle?: string;
  action?:   React.ReactNode;
  children?: React.ReactNode;
  // icon prop kept for API compat but unused — no emojis in headers
  icon?: string;
}

export default function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            style={{
              fontSize:     'clamp(1.5rem, 3vw, 2rem)',
              fontWeight:   600,
              lineHeight:   1.2,
              marginBottom: subtitle ? '6px' : 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: 'var(--color-body)', fontSize: '0.97rem', maxWidth: '56ch' }}>
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="flex items-center gap-3 flex-shrink-0">{action}</div>}
      </div>

      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
