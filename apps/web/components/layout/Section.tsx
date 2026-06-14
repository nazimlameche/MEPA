interface SectionProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function Section({ title, action, children }: SectionProps) {
  return (
    <section className="mb-10 last:mb-0">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-[0.08em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
