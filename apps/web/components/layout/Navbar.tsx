'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-surface-200 md:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="font-display text-lg font-bold text-primary-600">AI-Edu</Link>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-surface-100 transition">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      {open && (
        <nav className="border-t border-surface-200 px-4 py-2 space-y-1 bg-white">
          {[
            { label: 'Tableau de bord', href: '/dashboard' },
            { label: 'Théorie', href: '/modules/theory' },
            { label: 'Prompting', href: '/modules/prompting' },
            { label: 'Bac à Sable', href: '/sandbox' },
            { label: 'Cours Sur-Mesure', href: '/custom-course' },
            { label: 'Mon profil', href: '/profile' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-surface-100">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
