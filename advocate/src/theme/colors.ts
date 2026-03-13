export const colors = {
  // ── Backgrounds (layered navy depth) ──────────────────────────
  bgBase:      '#080C14',   // deepest — screen base
  bgScreen:    '#0B1120',   // main background
  bgCard:      '#111827',   // card/surface
  bgElevated:  '#1A2436',   // elevated cards, selected
  bgHigh:      '#1E2D45',   // modals, dialogs
  bgOverlay:   '#243352',   // pressed/hover

  // Legacy aliases (keeps old screens working during migration)
  background:     '#0B1120',
  backgroundAlt:  '#111827',
  surface:        'rgba(17,24,39,0.75)',
  surfaceBright:  '#1A2436',
  surfacePressed: '#1E2D45',

  // ── Gold accents (desaturated — #FFD700 vibrates on navy) ─────
  goldPrimary: '#C9A84C',
  goldBright:  '#E4BF6A',
  goldSoft:    '#D4AF37',
  goldMuted:   '#A8893A',
  goldSubtle:  '#8B7235',

  // Legacy aliases
  primary:      '#C9A84C',
  primaryLight: '#E4BF6A',
  primaryDark:  '#A8893A',
  accent:       '#C9A84C',
  accentDim:    'rgba(201,168,76,0.15)',

  // ── Borders ───────────────────────────────────────────────────
  border:       'rgba(201,168,76,0.15)',
  borderBright: 'rgba(201,168,76,0.30)',
  borderWhite:  'rgba(255,255,255,0.08)',

  // ── Status ────────────────────────────────────────────────────
  success:    '#32D74B',
  successDim: 'rgba(50,215,75,0.15)',
  danger:     '#FF453A',
  dangerDim:  'rgba(255,69,58,0.15)',
  warning:    '#FF9F0A',
  warningDim: 'rgba(255,159,10,0.15)',

  // ── Text (opacity tiers) ──────────────────────────────────────
  text:          'rgba(255,255,255,0.87)',
  textSecondary: 'rgba(255,255,255,0.60)',
  textMuted:     'rgba(255,255,255,0.38)',
  textGold:      '#E4BF6A',

  // ── Gradients ─────────────────────────────────────────────────
  gradientGold:    ['#8B7235', '#C9A84C', '#E4BF6A'] as string[],
  gradientHero:    ['#0B1120', '#162040', '#1E2D45'] as string[],
  gradientCard:    ['#111827', '#1A2436'] as string[],
  gradientPrimary: ['#8B7235', '#C9A84C'] as string[],
  gradientAccent:  ['#C9A84C', '#E4BF6A'] as string[],
  gradientDark:    ['#0B1120', '#080C14'] as string[],

  // ── Shadows ───────────────────────────────────────────────────
  shadowGold: 'rgba(201,168,76,0.25)',
}

// ── Typography scale ──────────────────────────────────────────────
export const typography = {
  display:    { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.64, lineHeight: 40 },
  h1:         { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.28, lineHeight: 36 },
  h2:         { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.24, lineHeight: 32 },
  h3:         { fontSize: 20, fontWeight: '600' as const, letterSpacing:  0,    lineHeight: 28 },
  bodyLarge:  { fontSize: 16, fontWeight: '400' as const, letterSpacing:  0,    lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, letterSpacing:  0,    lineHeight: 21 },
  label:      { fontSize: 14, fontWeight: '500' as const, letterSpacing:  0.28, lineHeight: 20 },
  labelSmall: { fontSize: 12, fontWeight: '500' as const, letterSpacing:  0.24, lineHeight: 16 },
  caption:    { fontSize: 11, fontWeight: '400' as const, letterSpacing:  0.22, lineHeight: 16 },
  overline:   { fontSize: 11, fontWeight: '700' as const, letterSpacing:  1.10, lineHeight: 16 },
}

// ── Spacing (8pt grid) ────────────────────────────────────────────
export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
}

// ── Border radius ─────────────────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 28,
}
