export const PET_EVOLUTION_UI = {
  title: 'Evolução!',
  skipHint: 'Toque para continuar',
  rewardTitle: 'Recompensa de evolução',
  rewardCoins: (n: number) => `+${n} moedas`,
  fromTo: (from: string, to: string) => `${from} → ${to}`,
  subtitle: 'Nova forma desbloqueada — continue a jornada!',
} as const;

/** Total cinematic duration before auto-dismiss (ms). */
export const PET_EVOLUTION_AUTO_DISMISS_MS = 4200;

/** Tap-to-skip enabled after (ms). */
export const PET_EVOLUTION_SKIP_AFTER_MS = 1000;
