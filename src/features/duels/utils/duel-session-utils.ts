import { DUEL_COMBAT_CONFIG } from '../constants/duel-combat-config';

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export type ResolveQuestionCountOptions = {
  enemyHp?: number;
  playerDamage?: number;
};

export const resolveQuestionCount = (
  seed: string,
  options?: ResolveQuestionCountOptions,
): number => {
  const span = DUEL_COMBAT_CONFIG.questionCountMax - DUEL_COMBAT_CONFIG.questionCountMin + 1;
  const offset = hashString(seed) % span;
  const randomCount = DUEL_COMBAT_CONFIG.questionCountMin + offset;

  if (!options?.enemyHp || !options?.playerDamage) {
    return randomCount;
  }

  const minToKill = Math.ceil(options.enemyHp / options.playerDamage);
  return Math.max(randomCount, minToKill, DUEL_COMBAT_CONFIG.questionCountMin);
};
