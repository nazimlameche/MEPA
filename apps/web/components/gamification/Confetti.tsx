'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
}

const COLORS = ['#4C1FD4', '#7B52F0', '#10B981', '#F59E0B', '#EF4444', '#F0EEFF'];

interface ConfettiProps {
  active: boolean;
  /** Origine en % du parent, défaut centre en haut */
  originX?: number;
  originY?: number;
  count?: number;
}

export default function Confetti({ active, originX = 50, originY = 30, count = 60 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;

    const ox = (originX / 100) * canvas.width;
    const oy = (originY / 100) * canvas.height;

    particles.current = Array.from({ length: count }, () => {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 3 + Math.random() * 7;
      const life  = 60 + Math.random() * 60;
      return {
        x:        ox,
        y:        oy,
        vx:       Math.cos(angle) * speed,
        vy:       Math.sin(angle) * speed - 4,
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        size:     4 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        life,
        maxLife:  life,
      };
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter(p => p.life > 0);

      for (const p of particles.current) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.life--;

        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particles.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, originX, originY, count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ zIndex: 10 }}
    />
  );
}
