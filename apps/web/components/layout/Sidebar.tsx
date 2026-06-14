'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Wand2, MessageSquare, Sparkles, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@ai-edu/ui';


const NAV = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Parcours Théorique', href: '/modules/theory', icon: BookOpen },
  { label: 'Atelier Prompting', href: '/modules/prompting', icon: Wand2 },
  { label: 'Bac à Sable', href: '/sandbox', icon: MessageSquare },
  { label: 'Cours Sur-Mesure', href: '/modules/custom-course', icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white border-r border-surface-200 py-6 px-3">
      <Link href="/dashboard" className="px-3 mb-8">
        <span className="font-display text-xl font-bold text-primary-600">AI-Edu</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-surface-100 hover:text-gray-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link href="/profile"
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          pathname === '/profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-surface-100',
        )}>
        <User className="h-4 w-4" />
        Mon profil
      </Link>
    </aside>
  );
}
