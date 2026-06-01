import { Text, View } from 'react-native';

import { SEASON_POINT_SOURCES } from '../constants/season-pass-catalog';

export const SeasonPointsGuide = () => (
  <View className="mt-4 rounded-xl border border-border bg-surface px-3 py-3">
    <Text className="text-xs font-bold uppercase tracking-wide text-muted">Como ganhar pontos</Text>
    <View className="mt-2 gap-2">
      {SEASON_POINT_SOURCES.map((source) => (
        <View key={source.key} className="flex-row items-center justify-between">
          <Text className="text-xs text-foreground-secondary">
            {source.emoji} {source.label}
          </Text>
          <Text className="text-xs font-bold text-gold">+{source.points}</Text>
        </View>
      ))}
    </View>
    <Text className="mt-2 text-[10px] leading-relaxed text-muted">
      A temporada reinicia no dia 1 de cada mês. Tiers desbloqueados precisam ser resgatados manualmente.
    </Text>
  </View>
);
