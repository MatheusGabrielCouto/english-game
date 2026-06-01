import { Text, View } from 'react-native';

import { GameCard, StatPill } from '@/components/ui/game';
import type { InventoryAnalyticsRecord } from '@/types/inventory';

type InventoryHeroCardProps = {
  shields: number;
  lootBoxes: number;
  specialItems: number;
  analytics: InventoryAnalyticsRecord;
};

export const InventoryHeroCard = ({
  shields,
  lootBoxes,
  specialItems,
  analytics,
}: InventoryHeroCardProps) => (
  <GameCard variant="hero" glow className="overflow-hidden">
    <Text className="text-xs font-bold uppercase tracking-widest text-accent">
      🎒 Bolsa do Aventureiro
    </Text>
    <View className="mt-3 flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="text-sm text-foreground-secondary">Itens na jornada</Text>
        <Text className="mt-1 text-3xl font-black text-foreground">
          {analytics.totalItemsAcquired.toLocaleString('pt-BR')}
        </Text>
        <Text className="mt-1 text-xs text-muted">adquiridos desde o início</Text>
      </View>
      <Text className="text-5xl">🎒</Text>
    </View>
    <View className="mt-4 flex-row gap-2">
      <StatPill emoji="🛡️" label="Escudos" value={shields} tone="accent" />
      <StatPill emoji="📦" label="Caixas" value={lootBoxes} tone="primary" />
      <StatPill emoji="✨" label="Especiais" value={specialItems} tone="gold" />
    </View>
  </GameCard>
);
