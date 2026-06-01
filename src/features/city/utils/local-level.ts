/** XP necessário para subir do nível atual (1–5). */
export const getLocalXpCapForLevel = (localLevel: number): number =>
  Math.max(50, localLevel * 80);

export const getLocalXpProgress = (
  localLevel: number,
  localXp: number,
  maxLocalLevel: number,
): { xpToNextLevel: number; progressPercent: number } => {
  if (localLevel >= maxLocalLevel) {
    return { xpToNextLevel: 0, progressPercent: 100 };
  }

  const cap = getLocalXpCapForLevel(localLevel);
  const progressPercent = cap > 0 ? Math.min(100, Math.round((localXp / cap) * 100)) : 0;

  return {
    xpToNextLevel: Math.max(0, cap - localXp),
    progressPercent,
  };
};
