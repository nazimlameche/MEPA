'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';

const STORAGE_KEY = 'm4-consent';

interface ConsentBannerProps {
  onConsent: () => void;
}

export default function ConsentBanner({ onConsent }: ConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setVisible(true);
    } else {
      onConsent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onConsent();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md p-6"
            style={{
              background:    'var(--color-surface-card)',
              border:        '1px solid var(--color-surface-border)',
              borderRadius:  '12px',
            }}
          >
            <button
              onClick={() => setVisible(false)}
              className="absolute top-4 right-4 transition-colors duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center w-10 h-10"
                style={{ background: 'rgba(76,31,212,0.15)', borderRadius: '8px' }}
              >
                <Shield size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Tes données &amp; ce module
              </h2>
            </div>

            <div className="space-y-3 mb-6" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <p>
                Le module <strong style={{ color: 'var(--color-text-primary)' }}>Cours Sur-Mesure</strong> utilise
                le thème que tu choisis pour personnaliser tes cours avec une IA.
              </p>
              <p>
                Ton thème est <strong style={{ color: 'var(--color-text-primary)' }}>anonymisé</strong> avant
                d'être envoyé — nous ne transmettons jamais ton nom, ton école ou ton âge à l'IA.
              </p>
              <p>
                Tes cours générés sont sauvegardés <strong style={{ color: 'var(--color-text-primary)' }}>90 jours</strong>,
                puis supprimés automatiquement. Tu peux supprimer ton parcours à tout moment.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                Aucune donnée n'est partagée avec des tiers à des fins publicitaires — conformément au RGPD.
              </p>
            </div>

            <button
              onClick={accept}
              className="w-full py-3 font-semibold text-sm transition-colors duration-200"
              style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '8px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              J'accepte et je continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
