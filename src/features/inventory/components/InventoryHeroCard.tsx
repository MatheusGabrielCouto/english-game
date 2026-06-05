import { Text, View } from 'react-native';

import { GameCard, StatPill } from '@/components/ui/game';
import { SHARED_TRANSITION_TAGS } from '@/constants';
import type { InventoryAnalyticsRecord } from '@/types/inventory';

type InventoryHeroCardProps = {
  shields: number;
  lootBoxes: number;
  specialItems: number;
  analytics: InventoryAnalyticsRecord;
};

const formatLootOpenBadge = (count: number): string =>
  count === 1 ? '1 para abrir' : `${count} para abrir`

export const InventoryHeroCard = ({
  shields,
  lootBoxes,
  specialItems,
  analytics,
}: InventoryHeroCardProps) => (
  <GameCard
    variant="hero"
    glow
    sharedTransitionTag={SHARED_TRANSITION_TAGS.inventoryHero}
    className="overflow-hidden">
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">
        🎒 Bolsa do Aventureiro
      </Text>
      {lootBoxes > 0 ? (
        <View className="rounded-full border border-warning/40 bg-warning/15 px-3 py-1">
          <Text className="text-[10px] font-bold text-warning">
            {formatLootOpenBadge(lootBoxes)}
          </Text>
        </View>
      ) : null}
    </View>
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
