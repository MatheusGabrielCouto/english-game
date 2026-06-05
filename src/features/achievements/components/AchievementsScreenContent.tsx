import { View } from 'react-native';

import { ScreenSkeleton } from '@/components/ui/skeleton';
import { AchievementCategory } from '@/types/achievement';

import { useAchievements } from '../hooks/use-achievements';
import { AchievementsCategorySection } from './AchievementsCategorySection';
import { AchievementsHeroCard } from './AchievementsHeroCard';
import { AchievementsHowItWorksCard } from './AchievementsHowItWorksCard';

const CATEGORY_ORDER = [
  AchievementCategory.STREAK,
  AchievementCategory.MISSIONS,
  AchievementCategory.XP,
  AchievementCategory.LEVEL,
  AchievementCategory.PET,
  AchievementCategory.LOOT_BOXES,
] as const;

export const AchievementsScreenContent = () => {
  const { achievements, summary, isLoading } = useAchievements();

  if (isLoading) {
    return <ScreenSkeleton variant="hero-list" listCount={4} />;
  }

  return (
    <View className="gap-4 pb-4">
      <AchievementsHeroCard summary={summary} />
      <AchievementsHowItWorksCard />

      {CATEGORY_ORDER.map((category) => {
        const categoryAchievements = achievements.filter((item) => item.category === category);
        if (categoryAchievements.length === 0) return null;

        return (
          <AchievementsCategorySection
            key={category}
            category={category}
            achievements={categoryAchievements}
          />
        );
      })}
    </View>
  );
};
