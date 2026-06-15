'use client';

import { GraduationCap, BookOpen, Presentation, Briefcase, User } from 'lucide-react';
import type { SignupRole } from '@ai-edu/shared';

const ROLE_OPTIONS: { value: SignupRole; label: string; description: string; Icon: React.FC<{ size?: number }> }[] = [
  { value: 'collegien',      label: 'Collégien',      description: '6e → 3e',               Icon: GraduationCap },
  { value: 'lyceen',         label: 'Lycéen',         description: '2nde → Terminale',      Icon: BookOpen },
  { value: 'enseignant',     label: 'Enseignant',     description: 'Professeur / Formateur', Icon: Presentation },
  { value: 'professionnel',  label: 'Professionnel',  description: 'En activité',            Icon: Briefcase },
  { value: 'autre',          label: 'Autre',          description: 'Curieux / Curieuse',     Icon: User },
];

interface RoleCardsProps {
  value: SignupRole | '';
  onChange: (role: SignupRole) => void;
}

export default function RoleCards({ value, onChange }: RoleCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {ROLE_OPTIONS.map(({ value: role, label, description, Icon }) => {
        const selected = value === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className="flex items-center gap-3 px-4 py-3 text-left transition-all duration-200"
            style={{
              background:   selected ? 'var(--color-accent-soft, rgba(76,31,212,0.15))' : 'var(--color-surface)',
              border:       `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: '8px',
              color:        selected ? 'var(--color-accent)' : 'var(--color-body)',
              transform:    selected ? 'scale(1.02)' : 'scale(1)',
            }}
            onMouseEnter={e => {
              if (!selected) e.currentTarget.style.borderColor = 'var(--color-border-strong, rgba(255,255,255,0.2))';
            }}
            onMouseLeave={e => {
              if (!selected) e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <Icon size={18} />
            <div>
              <p className="text-sm font-semibold leading-none">{label}</p>
              <p className="text-xs mt-0.5" style={{ color: selected ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                {description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
