import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import { RPG_ATTRIBUTE_LABELS, RPG_PERKS } from '@/features/game-design/constants/rpg';
import { useRpgStore } from '@/features/rpg/store/rpg-store';
import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { useCityStore } from '@/features/city/store/city-store';
import { useTitlesStore } from '@/features/titles/store/titles-store';

const ATTRIBUTE_MAX = 50;

export const RpgAttributesCard = () => {
  const record = useRpgStore((state) => state.record);
  const achievementSummary = useAchievementsStore((state) => state.summary);
  const titleSummary = useTitlesStore((state) => state.summary);
  const citySummary = useCityStore((state) => state.summary);

  if (!record) return null;

  return (
    <GameCard variant="quest">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">⚔️ Ficha RPG</Text>
      <Text className="mt-1 text-sm text-foreground-secondary">
        Atributos evoluem conforme você completa missões.
      </Text>

      <View className="mt-4 flex-row gap-2">
        <StatPill label="Conquistas" value={`${achievementSummary.unlocked}/${achievementSummary.total}`} emoji="🏆" tone="gold" />
        <StatPill label="Títulos" value={`${titleSummary.unlocked}/${titleSummary.total}`} emoji="👑" tone="primary" />
        <StatPill label="Cidade" value={`${citySummary.unlocked}/${citySummary.total}`} emoji="🏙️" tone="accent" />
      </View>

      <View className="mt-5 gap-4">
        {Object.entries(RPG_ATTRIBUTE_LABELS).map(([key, label]) => {
          const value = record[key as keyof typeof RPG_ATTRIBUTE_LABELS];
          const percentage = Math.min(100, Math.round((value / ATTRIBUTE_MAX) * 100));

          return (
            <View key={key}>
              <View className="mb-1.5 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground">{label}</Text>
                <Text className="text-sm font-black text-primary">{value}</Text>
              </View>
              <ProgressBar value={percentage} variant="xp" height="sm" animated={false} />
            </View>
          );
        })}
      </View>

      {record.unlockedPerks.length > 0 ? (
        <View className="mt-5 gap-2 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <Text className="text-xs font-bold uppercase text-primary">✨ Perks desbloqueados</Text>
          {record.unlockedPerks.map((perkKey) => {
            const perk = RPG_PERKS.find((entry) => entry.key === perkKey);
            if (!perk) return null;
            return (
              <View key={perkKey}>
                <Text className="text-sm font-semibold text-foreground">{perk.name}</Text>
                <Text className="text-xs text-foreground-secondary">{perk.description}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text className="mt-4 text-xs text-muted">
          Complete missões de categorias diferentes para desbloquear perks.
        </Text>
      )}
    </GameCard>
  );
};
