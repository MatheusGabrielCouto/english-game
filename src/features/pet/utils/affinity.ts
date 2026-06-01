export const PET_AFFINITY_MAX = 1000;

export const AFFINITY_TIERS = [
  { min: 0, label: 'Conhecido', emoji: '👋', bonusLabel: 'Diálogos básicos' },
  { min: 100, label: 'Amigo', emoji: '🤝', bonusLabel: '+2% XP do pet' },
  { min: 300, label: 'Melhor Amigo', emoji: '💛', bonusLabel: 'Animações especificadas' },
  { min: 600, label: 'Parceiro', emoji: '⭐', bonusLabel: '+5% moedas em dailies' },
  { min: 850, label: 'Alma Gêmea', emoji: '💖', bonusLabel: 'Evolução especial' },
] as const;

export const getAffinityTier = (affinity: number) => {
  const clamped = Math.min(Math.max(affinity, 0), PET_AFFINITY_MAX);
  let tier: (typeof AFFINITY_TIERS)[number] = AFFINITY_TIERS[0];
  for (const candidate of AFFINITY_TIERS) {
    if (clamped >= candidate.min) tier = candidate;
  }
  return { ...tier, value: clamped, percentage: Math.round((clamped / PET_AFFINITY_MAX) * 100) };
};

export const clampAffinity = (value: number): number =>
  Math.min(Math.max(Math.round(value), 0), PET_AFFINITY_MAX);

export const clampVital = (value: number): number => Math.min(Math.max(Math.round(value), 0), 100);
