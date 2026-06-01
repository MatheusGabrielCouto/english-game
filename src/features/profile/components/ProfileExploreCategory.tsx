import { Text, View } from 'react-native';

import type { ExploreCategoryDef, ExploreItemId } from '../constants/profile-explore-catalog';
import type { ExploreBadge } from '../hooks/use-explore-badges';
import { ProfileExploreTile } from './ProfileExploreTile';

type ProfileExploreCategoryProps = {
  category: ExploreCategoryDef;
  badges: Record<ExploreItemId, ExploreBadge>;
};

export const ProfileExploreCategory = ({ category, badges }: ProfileExploreCategoryProps) => (
  <View className="gap-3">
    <View className="flex-row items-center gap-2">
      <Text className="text-lg">{category.emoji}</Text>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-black text-foreground">{category.title}</Text>
        <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary" numberOfLines={2}>
          {category.subtitle}
        </Text>
      </View>
    </View>

    <View className="gap-2">
      {category.items.map((item) => (
        <ProfileExploreTile key={item.id} item={item} badge={badges[item.id]} />
      ))}
    </View>
  </View>
);
