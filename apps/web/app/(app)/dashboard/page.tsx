import { auth } from '@/lib/auth';
import Link from 'next/link';
import { BookOpen, Wand2, MessageSquare, Sparkles } from 'lucide-react';
import { MODULE_CONFIGS } from '@ai-edu/shared';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Wand2,
  MessageSquare,
  Sparkles,
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Bonjour{session?.user?.name ? `, ${session.user.name}` : ''} 👋
        </h1>
        <p className="text-gray-500 mt-1">Prêt à explorer l&apos;IA ? Choisis ton module ci-dessous.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULE_CONFIGS.map((mod) => {
          const Icon = ICONS[mod.icon] ?? BookOpen;
          return (
            <Link
              key={mod.id}
              href={mod.route}
              className="group flex items-start gap-4 rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {mod.label}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{mod.category}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
