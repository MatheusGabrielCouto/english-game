import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { useCareerStore } from '@/features/career/store/career-store';
import { usePlayerStore } from '@/features/player';

export const CareerPreviewCard = () => {
  const journey = useCareerStore((state) => state.journey);
  const dreams = useCareerStore((state) => state.dreams);
  const level = usePlayerStore((state) => state.level);

  const nextDream = dreams.find((dream) => !dream.completed);

  const levelSpan =
    journey?.nextRole != null
      ? journey.nextRole.requiredLevel - journey.currentRole.requiredLevel
      : 0;
  const roleProgress =
    journey?.nextRole && levelSpan > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((level - journey.currentRole.requiredLevel) / levelSpan) * 100,
            ),
          ),
        )
      : journey?.nextRole
        ? 0
        : 100;

  if (!journey) {
    return (
      <Card elevated accent className="border-accent/20">
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">💼 Carreira</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">
          Sua jornada de carreira aparecerá aqui em breve.
        </Text>
      </Card>
    );
  }

  return (
    <PressableScale
      onPress={() => router.push(routes.career as Href)}
      accessibilityRole="button"
      accessibilityLabel="Ver jornada de carreira">
      <Card elevated accent className="border-accent/35">
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">💼 Carreira Internacional</Text>
        <View className="mt-2 flex-row items-center gap-3">
          <Text className="text-4xl">{journey.currentRole.icon}</Text>
          <View className="flex-1">
            <Text className="text-lg font-black text-foreground">{journey.currentRole.name}</Text>
            <Text className="text-sm text-foreground-secondary">{journey.currentCompany.name}</Text>
            {journey.nextRole ? (
              <Text className="mt-1 text-xs text-muted">
                Próximo: {journey.nextRole.name} em {journey.levelsUntilNext} níveis
              </Text>
            ) : null}
          </View>
        </View>
        {journey.nextRole ? (
          <View className="mt-3">
            <ProgressBar value={roleProgress} variant="default" height="sm" animated={false} />
          </View>
        ) : null}
        {nextDream ? (
          <Text className="mt-3 text-xs text-primary">
            🌟 Sonho: {nextDream.name} ({nextDream.percentage}%)
          </Text>
        ) : null}
      </Card>
    </PressableScale>
  );
};
