'use client';

/**
 * Web Audio API sound manager — no external dependencies, no file downloads.
 * All sounds are synthesized on the fly.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  delay = 0,
) {
  try {
    const ac  = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);

    gain.gain.setValueAtTime(0, ac.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ac.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.05);
  } catch {
    // AudioContext can be blocked before user gesture — fail silently
  }
}

export const sounds = {
  /** Petite mélodie ascendante sur bonne réponse */
  correct() {
    playTone(523, 0.12, 'sine', 0.12);       // C5
    playTone(659, 0.12, 'sine', 0.12, 0.13); // E5
    playTone(784, 0.2,  'sine', 0.15, 0.26); // G5
  },

  /** Son grave court sur mauvaise réponse */
  wrong() {
    playTone(220, 0.15, 'sawtooth', 0.08);
    playTone(196, 0.25, 'sawtooth', 0.06, 0.15);
  },

  /** Fanfare sur level up */
  levelUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => playTone(freq, 0.18, 'sine', 0.14, i * 0.14));
  },

  /** Petit ding discret sur gain XP */
  xp() {
    playTone(880, 0.1, 'sine', 0.08);
    playTone(1100, 0.15, 'sine', 0.06, 0.1);
  },

  /** Click discret sur sélection */
  click() {
    playTone(1200, 0.05, 'sine', 0.04);
  },

  /** Fanfare de victoire en fin de leçon — arpège + chord final */
  victory() {
    // Arpège montant
    const arp = [523, 659, 784, 1047];
    arp.forEach((freq, i) => playTone(freq, 0.18, 'sine', 0.13, i * 0.1));
    // Accord final (C maj) après l'arpège
    const chordDelay = arp.length * 0.1 + 0.08;
    [523, 659, 784, 1047].forEach(freq =>
      playTone(freq, 0.55, 'sine', 0.1, chordDelay),
    );
    // Shimmer haute fréquence
    playTone(2093, 0.25, 'sine', 0.05, chordDelay + 0.05);
    // Petite queue descendante
    playTone(784, 0.3, 'sine', 0.08, chordDelay + 0.5);
    playTone(659, 0.3, 'sine', 0.08, chordDelay + 0.7);
    playTone(523, 0.5, 'sine', 0.1,  chordDelay + 0.9);
  },
};
