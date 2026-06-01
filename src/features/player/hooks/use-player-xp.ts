import { usePlayerStore } from '../store';
import { getXPProgress } from '../utils/xp';

export const usePlayerXP = () => {
  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);

  return getXPProgress(level, xp);
};
