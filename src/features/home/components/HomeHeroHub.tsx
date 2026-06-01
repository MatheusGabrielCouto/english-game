import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { XPBar } from '@/components';
import { Avatar } from '@/components/ui/Avatar';
import { GameCard, LevelBadge, PressableScale, StatPill, StreakFlame } from '@/components/ui/game';
import { CoinDisplay } from '@/components/ui/game/CoinDisplay';
import { routes } from '@/constants';
import { useAppStore } from '@/features/app/store/app-store';
import { CityPreviewCard, useCity } from '@/features/city';
import { ActiveBonusesCard } from '@/features/game-design/components/ActiveBonusesCard';
import { ActiveContractPreview } from '@/features/home/components/ActiveContractPreview';
import { DailyMissionsPreview } from '@/features/home/components/DailyMissionsPreview';
import { LearningHubCard } from '@/features/home/components/LearningHubCard';
import { isDuelsEnabled, isFlashDeckEnabled } from '@/constants/feature-flags';
import { DuelService } from '@/features/duels/services/duel-service';
import { useDuelStore } from '@/features/duels/store/duel-store';
import { useFlashDeckStore } from '@/features/flash-deck/store/flash-deck-store';
import { PetPreviewCard } from '@/features/pet';
import { usePlayerStore, usePlayerXP } from '@/features/player';

export const HomeHeroHub = () => {
  const setProfileView = useDuelStore((s) => s.setProfileView);
  const refreshFlash = useFlashDeckStore((s) => s.refresh);
  const showLearningHub = isFlashDeckEnabled() || isDuelsEnabled();

  useEffect(() => {
    if (!showLearningHub) return;
    void refreshFlash();
    void DuelService.getProfile().then(setProfileView);
  }, [refreshFlash, setProfileView, showLearningHub]);

  const name = usePlayerStore((s) => s.name);
  const title = usePlayerStore((s) => s.title);
  const level = usePlayerStore((s) => s.level);
  const coins = usePlayerStore((s) => s.coins);
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const avatarFrame = useAppStore((s) => s.avatarFrame);
  const avatarBadge = useAppStore((s) => s.avatarBadge);
  const { current, required } = usePlayerXP();
  const { summary: citySummary } = useCity();

  return (
    <View className="gap-5">
      <GameCard variant="hero" glow className="overflow-hidden">
        <View className="flex-row items-start gap-4">
          <PressableScale onPress={() => router.push('/(tabs)/profile' as Href)} accessibilityLabel="Ver perfil">
            <Avatar name={name} size="lg" frameKey={avatarFrame} badgeKey={avatarBadge} ring />
          </PressableScale>

          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-primary">English Quest</Text>
            <Text className="mt-1 text-2xl font-black text-foreground">{name}</Text>
            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              <View className="rounded-lg bg-gold/20 px-2 py-1">
                <Text className="text-xs font-bold text-gold">👑 {title}</Text>
              </View>
              <LevelBadge level={level} size="sm" />
            </View>
          </View>

          <CoinDisplay amount={coins} size="md" />
        </View>

        <View className="mt-5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase text-foreground-secondary">Experiência</Text>
            <Text className="text-xs font-bold text-xp">
              {current}/{required} XP
            </Text>
          </View>
          <XPBar showLevel={false} />
        </View>

        <View className="mt-4 flex-row gap-2">
          <StatPill
            emoji="🔥"
            label="Streak"
            value={currentStreak}
            tone="warning"
          />
          <StatPill
            emoji="🏙️"
            label="Cidade"
            value={`${citySummary.unlocked}/${citySummary.total}`}
            tone="accent"
          />
        </View>

        <View className="mt-4">
          <ActiveBonusesCard />
        </View>
      </GameCard>

      <View className="flex-row items-center gap-3">
        <StreakFlame streak={currentStreak} size={28} showLabel />
        <Text className="flex-1 text-sm text-foreground-secondary">
          {currentStreak > 0
            ? 'Mantenha o fogo aceso completando missões hoje!'
            : 'Complete uma missão para iniciar sua sequência.'}
        </Text>
      </View>

      <DailyMissionsPreview />
      {showLearningHub ? <LearningHubCard /> : null}
      <ActiveContractPreview />
      <PetPreviewCard />
      <CityPreviewCard summary={citySummary} onPress={() => router.push(routes.city as Href)} />
    </View>
  );
};
