'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  vx: number; vy: number;
  size: number;
  progress: number;
  delay: number;
  startTime: number;
}

interface XPParticlesProps {
  /** Source DOM element (le badge XP) */
  sourceEl:       HTMLElement | null;
  /** Sélecteur CSS de la cible (ex: "#xp-counter") */
  targetSelector: string;
  /** Déclenche la rafale quand true */
  active:         boolean;
  /** Appelé une fois toutes les particules arrivées */
  onDone?:        () => void;
}

const XP_COLOR = '#10B981';
const DURATION = 1000; // ms
const COUNT    = 28;

export default function XPParticles({ sourceEl, targetSelector, active, onDone }: XPParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const firedRef  = useRef(false);

  useEffect(() => {
    if (!active || firedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !sourceEl) return;

    firedRef.current = true;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const srcRect = sourceEl.getBoundingClientRect();
    const srcX    = srcRect.left + srcRect.width  / 2;
    const srcY    = srcRect.top  + srcRect.height / 2;

    const tgtEl   = document.querySelector<HTMLElement>(targetSelector);
    const tgtRect  = tgtEl?.getBoundingClientRect();
    const tgtX    = tgtRect ? tgtRect.left + tgtRect.width  / 2 : canvas.width  / 2;
    const tgtY    = tgtRect ? tgtRect.top  + tgtRect.height / 2 : 20;

    const now = performance.now();
    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r     = 20 + Math.random() * 30;
      return {
        x: srcX + Math.cos(angle) * r, y: srcY + Math.sin(angle) * r,
        tx: tgtX + (Math.random() - 0.5) * 16,
        ty: tgtY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 2, vy: -(1 + Math.random() * 2),
        size: 3 + Math.random() * 4,
        progress: 0,
        delay: i * 30,
        startTime: now + i * 30,
      };
    });

    const animate = (ts: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let remaining = 0;

      for (const p of particles) {
        if (ts < p.startTime) { remaining++; continue; }

        const elapsed  = ts - p.startTime;
        p.progress     = Math.min(elapsed / DURATION, 1);

        const t  = easeInOutCubic(p.progress);
        const cx = p.x + (p.tx - p.x) * t + p.vx * (1 - p.progress) * 8;
        const cy = p.y + (p.ty - p.y) * t + p.vy * (1 - p.progress) * 8;
        const alpha = p.progress < 0.85 ? 1 : (1 - p.progress) / 0.15;

        if (p.progress < 1) remaining++;

        ctx.save();
        ctx.globalAlpha  = Math.max(0, alpha);
        ctx.shadowColor  = XP_COLOR;
        ctx.shadowBlur   = 8;
        ctx.fillStyle    = XP_COLOR;
        drawStar(ctx, cx, cy, p.size * 0.45, p.size, 4);
        ctx.fill();
        ctx.restore();
      }

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Reset fired flag when active goes false→true
  useEffect(() => { if (!active) firedRef.current = false; }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 9999 }}
    />
  );
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, innerR: number, outerR: number, points: number) {
  const step = Math.PI / points;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}
