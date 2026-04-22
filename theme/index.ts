// RituAI Design System — "Digital Ritual"
// Every color, gradient, and phase palette lives here

export const Colors = {
  // Brand core
  auroraRose: '#E8B4C8',
  templeMaroon: '#7B2D3F',
  moonlitLilac: '#C9B8E8',
  saffronGold: '#E8A87C',
  ragiCream: '#F5E6D3',
  lotusMist: '#FFF5F7',
  midnightPlum: '#2D1B2E',
  emeraldBreath: '#8BA888',

  // Semantic
  textPrimary: '#2D1B2E',
  textSecondary: '#6B5566',
  textMuted: '#9B8B98',
  textOnDark: '#FFF5F7',

  // Surfaces
  surface1: 'rgba(255, 245, 247, 0.88)',
  surface2: 'rgba(255, 245, 247, 0.68)',
  glassBorder: 'rgba(255, 255, 255, 0.55)',
  glassShadow: 'rgba(45, 27, 46, 0.12)',

  // Status
  success: '#8BA888',
  warning: '#E8A87C',
  danger: '#C94F5D',
  info: '#C9B8E8',

  // Overlays
  overlay: 'rgba(45, 27, 46, 0.55)',
  overlayDeep: 'rgba(45, 27, 46, 0.85)',
};

// Phase palettes — the whole app breathes with the user's cycle
export const PhaseColors = {
  menstrual: {
    primary: '#C94F5D',
    secondary: '#C9B8E8',
    bgStart: '#F5D9DD',
    bgEnd: '#E4D4F0',
    accent: '#7B2D3F',
    name: 'Menstrual',
    emoji: '🌑',
  },
  follicular: {
    primary: '#8BA888',
    secondary: '#E8B4C8',
    bgStart: '#E8F0E4',
    bgEnd: '#FCE4EC',
    accent: '#5B7A57',
    name: 'Follicular',
    emoji: '🌱',
  },
  ovulatory: {
    primary: '#E8A87C',
    secondary: '#FFD89B',
    bgStart: '#FFF0E0',
    bgEnd: '#FFE4C4',
    accent: '#C47847',
    name: 'Ovulatory',
    emoji: '☀️',
  },
  luteal: {
    primary: '#A08CB8',
    secondary: '#E8B4C8',
    bgStart: '#EDE4F5',
    bgEnd: '#F5DCE4',
    accent: '#6D5988',
    name: 'Luteal',
    emoji: '🌙',
  },
};

export type PhaseKey = keyof typeof PhaseColors;

export const Gradients = {
  heroAurora: ['#FFF5F7', '#F5E6D3', '#E8B4C8'] as const,
  heroNight: ['#2D1B2E', '#4A2C4D', '#7B2D3F'] as const,
  goldShimmer: ['#FFD89B', '#E8A87C', '#C47847'] as const,
  lotus: ['#FFF5F7', '#E8B4C8', '#C9B8E8'] as const,
  emerald: ['#E8F0E4', '#8BA888'] as const,
  danger: ['#F5D9DD', '#C94F5D'] as const,
  moonlit: ['#EDE4F5', '#C9B8E8', '#A08CB8'] as const,
  saffronDawn: ['#FFF5F7', '#FFE4C4', '#E8A87C'] as const,
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const Typography = {
  // Using system fonts — zero asset bundle issues, still luxurious via weight & spacing
  display: {
    fontSize: 48,
    fontWeight: '300' as const,
    letterSpacing: -1,
    fontStyle: 'italic' as const,
  },
  h1: {
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  numeral: {
    fontSize: 72,
    fontWeight: '200' as const,
    letterSpacing: -2,
    fontStyle: 'italic' as const,
  },
};

export const Shadows = {
  soft: {
    shadowColor: Colors.midnightPlum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.midnightPlum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  heavy: {
    shadowColor: Colors.midnightPlum,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: {
    shadowColor: Colors.saffronGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};
