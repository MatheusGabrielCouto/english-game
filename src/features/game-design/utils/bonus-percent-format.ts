/** Arredonda bônus % para exibição e cálculo (evita 7.351619900031 na UI). */
export const roundBonusPercent = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
};

export const formatBonusPercent = (value: number): string => {
  const rounded = roundBonusPercent(value);
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `+${text}%`;
};
