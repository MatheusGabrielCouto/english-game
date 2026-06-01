import { Text, View } from 'react-native';

import {
  AchievementStatus,
  type AchievementCategoryValue,
  type AchievementViewModel,
} from '@/types/achievement';

import { CATEGORY_META } from '../constants/achievements-ui';
import { AchievementCard } from './AchievementCard';

type AchievementsCategorySectionProps = {
  category: AchievementCategoryValue;
  achievements: AchievementViewModel[];
};

export const AchievementsCategorySection = ({
  category,
  achievements,
}: AchievementsCategorySectionProps) => {
  const meta = CATEGORY_META[category];
  const unlockedCount = achievements.filter(
    (a) => a.progress.status === AchievementStatus.UNLOCKED,
  ).length;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2 px-1">
        <Text className="text-lg">{meta.emoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-black text-foreground">{meta.title}</Text>
          <Text className="text-xs leading-4 text-foreground-secondary" numberOfLines={2}>
            {meta.subtitle}
          </Text>
        </View>
        <Text className="shrink-0 text-xs font-bold text-primary">
          {unlockedCount}/{achievements.length}
        </Text>
      </View>

      <View className="gap-2">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.key} achievement={achievement} />
        ))}
      </View>
    </View>
  );
};
