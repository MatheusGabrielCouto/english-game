/**
 * Escala tipográfica do English Quest.
 * Classes NativeWind em `classes`; valores numéricos para StyleSheet em `native`.
 */
export const typography = {
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900' as const,
  },
  hero: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900' as const,
  },
  caption: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
} as const

export type TypographyVariant = keyof typeof typography

/** Classes Tailwind/NativeWind por variante semântica. */
export const typographyClasses = {
  label: 'text-xs font-bold uppercase tracking-widest text-muted',
  body: 'text-sm leading-relaxed text-foreground-secondary',
  title: 'text-base font-black text-foreground',
  hero: 'text-2xl font-black text-foreground',
  caption: 'text-[10px] font-semibold text-foreground-secondary',
  subtitle: 'text-xs leading-relaxed text-foreground-secondary',
} as const satisfies Record<TypographyVariant, string>

export const getTypographyStyle = (variant: TypographyVariant) => typography[variant]
