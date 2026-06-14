'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname  = usePathname();
  const [active, setActive] = useState(false);
  const [width,  setWidth]  = useState(0);
  const rafRef   = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect internal link clicks → start bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto') ||
        anchor.getAttribute('target') === '_blank'
      ) return;
      // Same-page click — skip
      if (href === pathname) return;

      setActive(true);
      setWidth(0);

      // Grow to ~70% quickly, then slow down (mimics real progress)
      let w = 0;
      const tick = () => {
        w = w < 60 ? w + 4 : w < 80 ? w + 0.8 : w < 90 ? w + 0.2 : w;
        setWidth(w);
        if (w < 90) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pathname]);

  // Pathname changed → navigation done → complete and fade
  useEffect(() => {
    if (!active) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setWidth(100);
    timerRef.current = setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!active && width === 0) return null;

  return (
    <div
      style={{
        position:   'fixed',
        top:        0,
        left:       0,
        height:     '2px',
        width:      `${width}%`,
        background: 'var(--color-accent)',
        zIndex:     9999,
        transition: width === 100 ? 'width 0.15s ease, opacity 0.3s ease' : 'width 0.1s linear',
        opacity:    active ? 1 : 0,
        pointerEvents: 'none',
      }}
    />
  );
}
