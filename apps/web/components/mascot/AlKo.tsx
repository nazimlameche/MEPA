'use client';

import { motion, type Transition, type MotionStyle } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ALKO_TIPS } from '@/lib/alko-tips';

export type AlKoVariant = 'wave' | 'celebrate' | 'idle' | 'sad';

interface AlKoProps {
  variant?:    AlKoVariant;
  size?:       number;
  /** Forcer un message fixe dans la bulle */
  bubble?:     string;
  hideBubble?: boolean;
  hideName?:   boolean;
  /** Intervalle en ms entre deux tips (défaut 6000) */
  tipInterval?: number;
  /** Décalage horizontal de la bulle en px (négatif = gauche) */
  bubbleOffsetX?: number;
  /** Décalage vertical de la bulle en px (positif = plus haut) */
  bubbleOffsetY?: number;
  /** Active l'animation de coucou du bras droit */
  armWave?: boolean;
  /** Expression faciale spéciale (remplace bouche + yeux) */
  expression?: 'thumbsUp' | 'grimace' | 'lol' | 'cool';
  className?:  string;
}

export default function AlKo({
  variant        = 'wave',
  size           = 120,
  bubble,
  hideBubble     = false,
  hideName       = false,
  tipInterval    = 6000,
  bubbleOffsetX  = 0,
  bubbleOffsetY  = 0,
  armWave        = false,
  expression,
  className      = '',
}: AlKoProps) {
  const [tip, setTip]               = useState(() => ALKO_TIPS[Math.floor(Math.random() * ALKO_TIPS.length)]);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (bubble || hideBubble) return;
    const t = setInterval(() => {
      setTip(ALKO_TIPS[Math.floor(Math.random() * ALKO_TIPS.length)]);
    }, tipInterval);
    return () => clearInterval(t);
  }, [bubble, hideBubble, tipInterval]);

  useEffect(() => {
    if (hideBubble) return;
    const t = setTimeout(() => setShowBubble(true), 600);
    return () => clearTimeout(t);
  }, [hideBubble]);

  // Corps : flotte (y) + se balance légèrement (rotate)
  const bodyTransition: Transition = {
    duration: variant === 'celebrate' ? 0.55 : 2.6,
    repeat:   Infinity,
    ease:     'easeInOut',
  };

  const isCelebrate = variant === 'celebrate';
  const isSad       = variant === 'sad';

  const containerH = hideBubble ? size : size + 40;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width: size, height: containerH }}
    >
      {/* Bulle */}
      {!hideBubble && showBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            position:      'absolute',
            bottom:        size + 12 + bubbleOffsetY,
            left:          `calc(50% + ${bubbleOffsetX}px)`,
            transform:     'translateX(-50%)',
            background:    'var(--color-surface-card)',
            border:        '1px solid var(--color-surface-border)',
            borderRadius:  12,
            padding:       '6px 12px',
            whiteSpace:    'nowrap',
            fontSize:      12,
            color:         'var(--color-text-primary)',
            boxShadow:     '0 4px 20px rgba(76,31,212,0.25)',
            zIndex:        10,
            pointerEvents: 'none',
          }}
        >
          <motion.span
            key={tip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {bubble ?? tip}
          </motion.span>
          <span style={{
            position:    'absolute',
            bottom:      -7,
            left:        '50%',
            transform:   'translateX(-50%)',
            width:       0,
            height:      0,
            borderLeft:  '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop:   '7px solid var(--color-surface-card)',
          }} />
        </motion.div>
      )}

      {/* Robot — un seul motion.div pour float + tilt, pas de motion dans SVG pour les bras */}
      <motion.div
        animate={{
          y:      isCelebrate ? [-8, 8, -8] : isSad ? [-2, 2, -2] : [-4, 4, -4],
          rotate: isCelebrate ? 0 : isSad ? [-1, 1, -1] : [-3, 3, -3],
        }}
        transition={bodyTransition}
        style={{ transformOrigin: 'bottom center' }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(76,31,212,0.4))' }}
        >
          {/* Ombre au sol */}
          <ellipse cx="60" cy="110" rx="28" ry="6" fill="rgba(76,31,212,0.18)" />

          {/* Jambes */}
          <rect x="40" y="92" width="12" height="16" rx="4" fill="#2d8c4e" />
          <rect x="68" y="92" width="12" height="16" rx="4" fill="#2d8c4e" />
          <rect x="38" y="104" width="16" height="6"  rx="3" fill="#246140" />
          <rect x="66" y="104" width="16" height="6"  rx="3" fill="#246140" />

          {/* Corps */}
          <rect x="30" y="60" width="60" height="36" rx="12" fill="#38a169" />
          <rect x="34" y="64" width="24" height="8"  rx="4"  fill="rgba(255,255,255,0.12)" />
          <circle cx="60" cy="80" r="6" fill="#246140" />
          <circle cx="60" cy="80" r="3" fill="#4ade80" />
          <rect x="33" y="72" width="6" height="2" rx="1" fill="#246140" />
          <rect x="33" y="76" width="6" height="2" rx="1" fill="#246140" />
          <rect x="81" y="72" width="6" height="2" rx="1" fill="#246140" />
          <rect x="81" y="76" width="6" height="2" rx="1" fill="#246140" />

          {/* Bras gauche */}
          {isCelebrate ? (
            // Bras gauche levé (applaudir)
            <>
              <rect x="14" y="48" width="16" height="10" rx="5" fill="#38a169" transform="rotate(-40 22 53)" />
              <rect x="8"  y="42" width="14" height="10" rx="5" fill="#2d8c4e" transform="rotate(-40 15 47)" />
            </>
          ) : (
            <>
              <rect x="14" y="62" width="16" height="10" rx="5" fill="#38a169" />
              <rect x="10" y="68" width="14" height="10" rx="5" fill="#2d8c4e" />
            </>
          )}

          {/* Bras droit */}
          {isCelebrate ? (
            <>
              <rect x="90" y="48" width="16" height="10" rx="5" fill="#38a169" transform="rotate(40 98 53)" />
              <rect x="98" y="42" width="14" height="10" rx="5" fill="#2d8c4e" transform="rotate(40 105 47)" />
            </>
          ) : (
            /* transformBox fill-box + transformOrigin top left = pivot sur l'épaule */
            <motion.g
              animate={armWave ? { rotate: [-10, 30, -10] } : { rotate: 0 }}
              transition={armWave
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }
                : { duration: 0 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'top left' } as MotionStyle}
            >
              <rect x="90" y="62" width="16" height="10" rx="5" fill="#38a169" />
              <rect x="96" y="68" width="14" height="10" rx="5" fill="#2d8c4e" />
            </motion.g>
          )}

          {/* Tête */}
          <rect x="28" y="24" width="64" height="44" rx="16" fill="#48bb78" />
          <rect x="34" y="28" width="28" height="10" rx="5"  fill="rgba(255,255,255,0.15)" />

          {/* Yeux */}
          <circle cx="44" cy="44" r="10" fill="#1a1a2e" />
          <circle cx="76" cy="44" r="10" fill="#1a1a2e" />
          <motion.circle
            cx="44" cy="44" r="6" fill="#60a5fa"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="76" cy="44" r="6" fill="#60a5fa"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <circle cx="46" cy="42" r="2" fill="white" opacity="0.7" />
          <circle cx="78" cy="42" r="2" fill="white" opacity="0.7" />

          {/* Bouche */}
          <rect x="46" y="57" width="28" height="5" rx="2.5" fill="#246140" />
          {isCelebrate ? (
            <path d="M46 58 Q60 68 74 58" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : isSad ? (
            <path d="M49 64 Q60 57 71 64" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : expression === 'grimace' ? (
            // 😬 dents serrées
            <g>
              <path d="M49 59 Q60 63 71 59" stroke="#4ade80" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <rect x="50" y="59" width="20" height="4" rx="0" fill="#e2e8f0" />
              <line x1="55" y1="59" x2="55" y2="63" stroke="#246140" strokeWidth="1" />
              <line x1="60" y1="59" x2="60" y2="63" stroke="#246140" strokeWidth="1" />
              <line x1="65" y1="59" x2="65" y2="63" stroke="#246140" strokeWidth="1" />
            </g>
          ) : expression === 'lol' ? (
            // 😂 bouche grande ouverte
            <path d="M46 57 Q60 72 74 57" stroke="#4ade80" strokeWidth="2.5" fill="#246140" strokeLinecap="round" />
          ) : expression === 'cool' ? (
            // 😎 sourire en coin
            <path d="M52 60 Q62 65 71 60" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M49 59 Q60 65 71 59" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Overlay expressions — yeux */}
          {expression === 'grimace' && (
            // Yeux légèrement plissés
            <g>
              <rect x="36" y="42" width="16" height="4" rx="2" fill="#1a1a2e" />
              <rect x="68" y="42" width="16" height="4" rx="2" fill="#1a1a2e" />
            </g>
          )}
          {expression === 'lol' && (
            // Yeux X (mort de rire)
            <g>
              <line x1="38" y1="38" x2="50" y2="50" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="38" x2="38" y2="50" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
              <line x1="70" y1="38" x2="82" y2="50" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
              <line x1="82" y1="38" x2="70" y2="50" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
          {expression === 'cool' && (
            // Lunettes de soleil 😎
            <g>
              <rect x="32" y="37" width="26" height="16" rx="5" fill="#1a1a2e" opacity="0.95" />
              <rect x="62" y="37" width="26" height="16" rx="5" fill="#1a1a2e" opacity="0.95" />
              <rect x="57" y="42" width="6" height="3"  rx="1" fill="#1a1a2e" />
              <rect x="28" y="42" width="4"  height="3"  rx="1" fill="#1a1a2e" />
              <rect x="88" y="42" width="4"  height="3"  rx="1" fill="#1a1a2e" />
              {/* Reflet */}
              <rect x="35" y="40" width="8" height="3" rx="1.5" fill="white" opacity="0.2" />
              <rect x="65" y="40" width="8" height="3" rx="1.5" fill="white" opacity="0.2" />
            </g>
          )}
          {expression === 'thumbsUp' && (
            // Pouce levé sur le côté droit — emoji SVG simple
            <text x="98" y="72" fontSize="18" textAnchor="middle">👍</text>
          )}

          {/* Larme (variant sad uniquement) */}
          {isSad && (
            <motion.g
              animate={{ y: [0, 8, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeIn', repeatDelay: 0.6 }}
            >
              {/* Forme larme sous l'œil gauche */}
              <path
                d="M44 55 C42 58 40 61 44 63 C48 61 46 58 44 55 Z"
                fill="#93c5fd"
                opacity="0.9"
              />
            </motion.g>
          )}

          {/* Antenne */}
          <rect x="57" y="6" width="6" height="20" rx="3" fill="#2d8c4e" />
          <motion.circle
            cx="60" cy="6" r="6" fill="#fbbf24"
            animate={{ scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Étoiles celebrate */}
          {isCelebrate && (
            <>
              <motion.circle cx="12" cy="28" r="3" fill="#fbbf24"
                animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity }} />
              <motion.circle cx="108" cy="32" r="2.5" fill="#a78bfa"
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: 0.25 }} />
              <motion.circle cx="18" cy="56" r="2" fill="#34d399"
                animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.75, repeat: Infinity, delay: 0.15 }} />
            </>
          )}

          {/* Badge nom */}
          {!hideName && (
            <>
              <rect x="38" y="108" width="44" height="10" rx="5" fill="rgba(76,31,212,0.6)" />
              <text x="60" y="116" textAnchor="middle" fontSize="7" fill="white"
                fontFamily="DM Sans, sans-serif" fontWeight="600" letterSpacing="1">AL-KO</text>
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
