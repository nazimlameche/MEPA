'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { revalidateParcours } from '@/app/actions/revalidate';
import { CHAPTER_TEMPLATES } from '@/lib/types/custom-course';
import type { Parcours } from '@/lib/types/custom-course';
import ChapterCard from './ChapterCard';

interface ParcoursDashboardProps {
  parcours: Parcours;
}

export default function ParcoursDashboard({ parcours }: ParcoursDashboardProps) {
  const router            = useRouter();
  const { data: session } = useSession();
  const [showDeleteModal,      setShowDeleteModal]      = useState(false);
  const [showChangeThemeModal, setShowChangeThemeModal] = useState(false);
  const [deleting, setDeleting]                         = useState(false);
  const [changing, setChanging]                         = useState(false);

  const completed    = parcours.chapters.filter(c => c.status === 'completed').length;
  const progressPct  = Math.round((completed / 6) * 100);

  const sorted = [...parcours.chapters].sort((a, b) => a.chapterIndex - b.chapterIndex);

  /**
   * Supprime le parcours — idempotent : si 404 (déjà supprimé), on considère
   * l'opération réussie et on redirige quand même vers la page de sélection.
   */
  const deleteParcours = async (): Promise<void> => {
    const token = session?.accessToken;
    if (!token) throw new Error('Non authentifié');
    try {
      await apiClient.delete(`/custom-course/parcours/${parcours.id}`, token);
    } catch (err) {
      // Parcours déjà supprimé (ex : tentative précédente partiellement échouée)
      if (err instanceof Error && err.message.includes('introuvable')) return;
      throw err;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteParcours();
      await revalidateParcours();
      router.push('/modules/custom-course');
    } catch (err) {
      console.error('[ParcoursDashboard] delete', err);
      toast.error('Erreur lors de la suppression.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleChangeTheme = async () => {
    setChanging(true);
    try {
      await deleteParcours();
      await revalidateParcours();
      router.push('/modules/custom-course');
    } catch (err) {
      console.error('[ParcoursDashboard] changeTheme', err);
      toast.error('Erreur lors du changement de thème.');
      setChanging(false);
      setShowChangeThemeModal(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            Ton parcours IA &mdash; <span style={{ color: 'var(--color-primary-light)' }}>{parcours.theme}</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {completed}/6 chapitres terminés
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowChangeThemeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors duration-200"
            style={{
              border:       '1px solid var(--color-surface-border)',
              borderRadius: '8px',
              color:        'var(--color-text-secondary)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
          >
            <RefreshCw size={12} />
            Changer de thème
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors duration-200"
            style={{
              border:       '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color:        'var(--color-danger)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-danger)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)')}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="h-2 w-full overflow-hidden"
          style={{ background: 'var(--color-surface-border)', borderRadius: '4px' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full"
            style={{ background: 'var(--color-xp)', borderRadius: '4px' }}
          />
        </div>
        <p className="mt-1 text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>
          {progressPct}%
        </p>
      </div>

      {/* Chapter grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {sorted.map((chapter, i) => {
          const meta = CHAPTER_TEMPLATES[chapter.chapterIndex];
          return (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              meta={meta}
              parcoursId={parcours.id}
              index={i}
            />
          );
        })}
      </div>

      {/* Change theme confirmation modal */}
      <AnimatePresence>
        {showChangeThemeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-sm p-6"
              style={{
                background:   'var(--color-surface-card)',
                border:       '1px solid var(--color-surface-border)',
                borderRadius: '12px',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Changer de thème ?
                </h3>
                <button onClick={() => setShowChangeThemeModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <p className="mb-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Ton parcours actuel <strong style={{ color: 'var(--color-primary-light)' }}>{parcours.theme}</strong> et tous ses chapitres seront supprimés. Tu pourras choisir un nouveau thème.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowChangeThemeModal(false)}
                  className="flex-1 py-2 text-sm font-medium transition-colors duration-200"
                  style={{
                    border:       '1px solid var(--color-surface-border)',
                    borderRadius: '8px',
                    color:        'var(--color-text-secondary)',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => { void handleChangeTheme(); }}
                  disabled={changing}
                  className="flex-1 py-2 text-sm font-semibold transition-colors duration-200"
                  style={{
                    background:   'var(--color-primary)',
                    color:        '#fff',
                    borderRadius: '8px',
                    opacity:      changing ? 0.6 : 1,
                  }}
                >
                  {changing ? 'Chargement…' : 'Changer de thème'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-sm p-6"
              style={{
                background:   'var(--color-surface-card)',
                border:       '1px solid rgba(239,68,68,0.3)',
                borderRadius: '12px',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Supprimer ce parcours ?
                </h3>
                <button onClick={() => setShowDeleteModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <p className="mb-5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Tous les chapitres générés seront perdus. Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 text-sm font-medium transition-colors duration-200"
                  style={{
                    border:       '1px solid var(--color-surface-border)',
                    borderRadius: '8px',
                    color:        'var(--color-text-secondary)',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => { void handleDelete(); }}
                  disabled={deleting}
                  className="flex-1 py-2 text-sm font-semibold transition-colors duration-200"
                  style={{
                    background:   'var(--color-danger)',
                    color:        '#fff',
                    borderRadius: '8px',
                    opacity:      deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
