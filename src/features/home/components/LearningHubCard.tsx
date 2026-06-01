import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { GameCard, PressableScale, StatPill } from '@/components/ui/game';
import { routes } from '@/constants';
import { isDuelsEnabled, isFlashDeckEnabled } from '@/constants/feature-flags';
import { useDuelStore } from '@/features/duels/store/duel-store';
import { useFlashDeckStore } from '@/features/flash-deck/store/flash-deck-store';
import { DUEL_PATENT_LABELS } from '@/types/duel';

const LEARNING_UI = {
  title: 'Baralho & Duelos',
  subtitle: 'Treine inglês como num RPG',
  duelsCta: 'Arena',
  deckCta: 'Baralho',
} as const;

export const LearningHubCard = () => {
  const flashEnabled = isFlashDeckEnabled();
  const duelsEnabled = isDuelsEnabled();

  if (!flashEnabled && !duelsEnabled) {
    return null;
  }

  const totalDueCount = useFlashDeckStore((s) => s.totalDueCount);
  const profileView = useDuelStore((s) => s.profileView);
  const duelsToday = profileView?.dailyDuelCount ?? 0;
  const patent = profileView?.currentPatent ?? 'tourist';

  return (
    <GameCard variant="quest" glow className="border-primary/30 overflow-hidden">
      <View className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/10" />
      <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
        {LEARNING_UI.title}
      </Text>
      <Text className="mt-1 text-sm text-foreground-secondary">{LEARNING_UI.subtitle}</Text>

      <View className="mt-3 flex-row flex-wrap gap-2">
        {duelsEnabled ? (
          <StatPill label="Patente" value={DUEL_PATENT_LABELS[patent]} emoji="⚔️" />
        ) : null}
        {flashEnabled ? (
          <StatPill
            label="Na mesa"
            value={totalDueCount === 0 ? 'Em dia' : String(totalDueCount)}
            emoji="📒"
          />
        ) : null}
        {duelsEnabled ? (
          <StatPill label="Duelos hoje" value={String(duelsToday)} emoji="🏟️" />
        ) : null}
      </View>

      <View className="mt-4 flex-row gap-2">
        {duelsEnabled ? (
          <PressableScale
            className="flex-1 rounded-xl border-2 border-primary/40 bg-primary/15 px-3 py-3.5"
            onPress={() => router.push(routes.duels as Href)}
            accessibilityLabel={LEARNING_UI.duelsCta}
          >
            <Text className="text-center text-2xl">⚔️</Text>
            <Text className="mt-1 text-center text-sm font-black text-primary">
              {LEARNING_UI.duelsCta}
            </Text>
          </PressableScale>
        ) : null}
        {flashEnabled ? (
          <PressableScale
            className="flex-1 rounded-xl border-2 border-accent/40 bg-accent/15 px-3 py-3.5"
            onPress={() => router.push(routes.flashDeck as Href)}
            accessibilityLabel={LEARNING_UI.deckCta}
          >
            <Text className="text-center text-2xl">📒</Text>
            <Text className="mt-1 text-center text-sm font-black text-accent">
              {LEARNING_UI.deckCta}
            </Text>
            {totalDueCount > 0 ? (
              <View className="absolute -right-1 -top-1 rounded-full bg-danger px-2 py-0.5">
                <Text className="text-[10px] font-black text-white">{totalDueCount}</Text>
              </View>
            ) : null}
          </PressableScale>
        ) : null}
      </View>
    </GameCard>
  );
};
