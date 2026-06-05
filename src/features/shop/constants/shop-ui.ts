/** Classes de texto otimizadas para fundo escuro — evitar `text-muted` na loja. */
export const SHOP_TEXT = {
  kickerGold: 'text-xs font-bold uppercase tracking-widest text-gold',
  kickerAccent: 'text-xs font-bold uppercase tracking-widest text-accent',
  kickerPrimary: 'text-xs font-bold uppercase tracking-widest text-primary',
  kickerNeutral: 'text-xs font-bold uppercase tracking-widest text-foreground-secondary',
  heading: 'text-lg font-black text-foreground',
  headingSm: 'text-base font-bold text-foreground',
  body: 'text-sm leading-relaxed text-foreground-secondary',
  bodySmall: 'text-xs leading-relaxed text-foreground-secondary',
  label: 'text-sm text-foreground-secondary',
  caption: 'text-xs font-semibold text-foreground-secondary',
  badge: 'text-[10px] font-bold uppercase tracking-widest text-foreground-secondary',
  priceStrike: 'text-sm text-foreground-secondary line-through',
  price: 'text-xl font-black text-foreground',
  priceCoin: 'text-xl font-black text-coin',
  priceAccent: 'text-xl font-black text-accent',
  hint: 'text-xs text-foreground-secondary',
  warning: 'text-xs font-medium text-warning',
  success: 'text-xs font-bold text-success',
  countPill: 'text-xs font-bold text-foreground-secondary',
  stockDaily: 'text-[10px] font-bold uppercase tracking-widest text-accent',
  stockWeekly: 'text-[10px] font-bold uppercase tracking-widest text-primary',
} as const;

export const SHOP_SURFACE = {
  storyBox: 'rounded-xl border border-border/60 bg-surface-elevated px-4 py-3',
  metaBox: 'rounded-xl border border-border/60 bg-surface px-4 py-3',
} as const;
