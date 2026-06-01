export const theme = {
  colors: {
    background: '#06060b',
    surface: '#0f0f18',
    surfaceElevated: '#161622',
    border: '#2a2a3d',
    primary: '#8b5cf6',
    primaryMuted: '#6d28d9',
    accent: '#38bdf8',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    muted: '#71717a',
    foreground: '#fafafa',
    glow: '#a78bfa',
    gold: '#fbbf24',
    epic: '#c084fc',
    legendary: '#f472b6',
    rare: '#60a5fa',
    common: '#94a3b8',
    streak: '#fb923c',
    xp: '#a78bfa',
    coin: '#38bdf8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    glow: {
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
    gold: {
      shadowColor: '#fbbf24',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof theme;

export const RARITY_COLORS = {
  common: theme.colors.common,
  rare: theme.colors.rare,
  epic: theme.colors.epic,
  legendary: theme.colors.legendary,
} as const;
