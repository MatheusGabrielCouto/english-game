import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { GameCard } from '@/components/ui/game';
import { theme } from '@/constants';

import { useFlashDeckStore } from '@/features/flash-deck/store/flash-deck-store';

import { EXPLORE_CATEGORIES } from '../constants/profile-explore-catalog';
import { PROFILE_UI } from '../constants/profile-ui';
import { useExploreBadges } from '../hooks/use-explore-badges';
import { ProfileExploreCategory } from './ProfileExploreCategory';
import { ProfileExploreHero } from './ProfileExploreHero';

const ADVENTURE_CATEGORY = EXPLORE_CATEGORIES.find((c) => c.id === 'adventure')!;
const COLLECTION_CATEGORY = EXPLORE_CATEGORIES.find((c) => c.id === 'collection')!;
const META_CATEGORY = EXPLORE_CATEGORIES.find((c) => c.id === 'meta')!;

export const ProfileExploreGrid = () => {
  const [showEndgame, setShowEndgame] = useState(false);
  const refreshFlashDeck = useFlashDeckStore((s) => s.refresh);
  const badges = useExploreBadges();

  useEffect(() => {
    void refreshFlashDeck();
  }, [refreshFlashDeck]);

  const hasLiveBadge = Object.values(badges).some((b) => b.tone === 'live');
  const hasRewardBadge = Object.values(badges).some((b) => b.tone === 'reward');

  return (
    <View className="gap-5">
      <ProfileExploreHero />

      {(hasLiveBadge || hasRewardBadge) && (
        <GameCard variant="reward" className="gap-2 p-4">
          {hasLiveBadge ? (
            <Text className="text-sm font-semibold leading-5 text-gold">
              🔴 Sessão ou contrato em andamento
            </Text>
          ) : null}
          {hasRewardBadge ? (
            <Text className="text-sm font-semibold leading-5 text-gold">
              ✨ Recompensas esperando por você
            </Text>
          ) : null}
        </GameCard>
      )}

      <ProfileExploreCategory category={ADVENTURE_CATEGORY} badges={badges} />
      <ProfileExploreCategory category={COLLECTION_CATEGORY} badges={badges} />

      <Pressable
        onPress={() => setShowEndgame((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showEndgame }}
        accessibilityLabel={showEndgame ? PROFILE_UI.exploreEndgameLess : PROFILE_UI.exploreEndgameMore}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-sm font-bold text-primary">
          {showEndgame ? PROFILE_UI.exploreEndgameLess : PROFILE_UI.exploreEndgameMore}
        </Text>
        <AppIcon
          name={showEndgame ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.colors.primary}
        />
      </Pressable>

      {showEndgame ? (
        <ProfileExploreCategory category={META_CATEGORY} badges={badges} />
      ) : null}
    </View>
  );
};
