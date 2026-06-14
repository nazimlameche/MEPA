interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div
      className="p-5 flex flex-col gap-1"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <p
        className="text-2xl font-semibold"
        style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--color-body)' }}>{label}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{sub}</p>}
    </div>
  );
}
