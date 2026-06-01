import { useAchievementsStore } from '../store/achievements-store';

export const useAchievements = () => {
  const achievements = useAchievementsStore((state) => state.achievements);
  const summary = useAchievementsStore((state) => state.summary);
  const analytics = useAchievementsStore((state) => state.analytics);
  const isLoading = useAchievementsStore((state) => state.isLoading);

  return {
    achievements,
    summary,
    analytics,
    isLoading,
  };
};
