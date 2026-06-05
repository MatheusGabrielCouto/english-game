import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { CARD_MUTED_CAPTION_CLASS, routes } from '@/constants';
import { useMetagameStore } from '@/features/metagame/store/metagame-store';

export const MetagamePreviewCard = () => {
  const state = useMetagameStore((s) => s.state);
  const currentSeasonTier = useMetagameStore((s) => s.currentSeasonTier);
  const nextSeasonTier = useMetagameStore((s) => s.nextSeasonTier);
  const coreLoop = useMetagameStore((s) => s.coreLoop);
  const legacyCount = useMetagameStore((s) => s.legacy.length);
  const collections = useMetagameStore((s) => s.collections);

  const seasonProgress =
    state && nextSeasonTier && nextSeasonTier.pointsRequired > 0
      ? Math.min(100, Math.round((state.seasonPoints / nextSeasonTier.pointsRequired) * 100))
      : 0;

  if (!state || !coreLoop) {
    return (
      <Card elevated className="border-gold/20">
        <Text className="text-xs font-bold uppercase tracking-widest text-gold">🏛️ Metagame</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">
          Progresso de temporada e coleções em carregamento.
        </Text>
      </Card>
    );
  }

  return (
    <PressableScale
      onPress={() => router.push(routes.metagame as Href)}
      accessibilityRole="button"
      accessibilityLabel="Ver metagame">
      <Card elevated className="border-gold/30">
        <Text className="text-xs font-bold uppercase tracking-widest text-gold">🏛️ Metagame</Text>
        <View className="mt-2 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-surface px-3 py-2">
            <Text className={CARD_MUTED_CAPTION_CLASS}>Temporada</Text>
            <Text className="font-black text-foreground">Tier {currentSeasonTier}</Text>
            <Text className="text-xs text-muted">{state.seasonPoints} pts</Text>
          </View>
          <View className="flex-1 rounded-xl bg-surface px-3 py-2">
            <Text className={CARD_MUTED_CAPTION_CLASS}>Coleções</Text>
            <Text className="font-black text-foreground">{collections?.overallPercentage ?? 0}%</Text>
            <Text className="text-xs text-muted">{legacyCount} marcos</Text>
          </View>
        </View>
        {nextSeasonTier ? (
          <View className="mt-3">
            <Text className="mb-1 text-xs text-muted">Próximo tier: {nextSeasonTier.rewardLabel}</Text>
            <ProgressBar value={seasonProgress} variant="gold" height="sm" animated={false} />
          </View>
        ) : null}
      </Card>
    </PressableScale>
  );
};
