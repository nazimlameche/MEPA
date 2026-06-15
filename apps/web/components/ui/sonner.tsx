'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'var(--color-surface-card)',
          border:     '1px solid var(--color-surface-border)',
          color:      'var(--color-text-primary)',
          fontFamily: 'var(--font-body, sans-serif)',
        },
      }}
    />
  );
}
