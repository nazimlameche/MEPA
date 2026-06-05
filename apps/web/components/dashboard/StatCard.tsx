interface StatCardProps {
  emoji: string;
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ emoji, label, value, sub }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-surface-border)',
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
      >
        {value}
      </p>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}
