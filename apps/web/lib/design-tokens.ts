export const colors = {
  bg:           '#FBF8F3',
  surface:      '#FFFFFF',

  ink:          '#1C1917',
  body:         '#44403C',
  muted:        '#78716C',

  border:       '#E7E2D9',
  borderStrong: '#D0C8BB',

  accent:       '#0F766E',
  accentHover:  '#0C5F58',
  accentSoft:   '#E6F0EE',

  complete:     '#4D7C0F',
  completeSoft: '#EEF3E2',

  error:        '#B91C1C',
  errorSoft:    '#FBEAEA',

  streak:       '#92400E',
  streakSoft:   '#FEF3C7',

  // backward-compat aliases
  primary:       '#0F766E',
  primaryHover:  '#0C5F58',
  primarySoft:   '#E6F0EE',
  success:       '#4D7C0F',
  successSoft:   '#EEF3E2',
  danger:        '#B91C1C',
  dangerSoft:    '#FBEAEA',
  text:          '#1C1917',
  textSoft:      '#44403C',
  textMuted:     '#78716C',
  xp:            '#4D7C0F',
  surfaceCard:   '#FFFFFF',
  surfaceBorder: '#E7E2D9',
  textPrimary:   '#1C1917',
  textSecondary: '#44403C',
} as const;

export const fonts = {
  display: "'Fraunces', Georgia, serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;

export const radius = {
  sm:   '8px',
  md:   '8px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(28,25,23,0.04)',
  md: '0 2px 8px rgba(28,25,23,0.06)',
  lg: '0 4px 16px rgba(28,25,23,0.08)',
} as const;
