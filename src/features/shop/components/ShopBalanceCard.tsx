import { Text, View } from 'react-native';

import { GameCard, StatPill } from '@/components/ui/game';
import { CoinDisplay } from '@/components/ui/game/CoinDisplay';

type ShopBalanceCardProps = {
  coins: number;
  studyPoints: number;
  productCount: number;
  purchasableLootBoxes: number;
  totalLootBoxes: number;
};

export const ShopBalanceCard = ({
  coins,
  studyPoints,
  productCount,
  purchasableLootBoxes,
  totalLootBoxes,
}: ShopBalanceCardProps) => (
  <GameCard variant="reward" glow className="overflow-hidden">
    <Text className="text-xs font-bold uppercase tracking-widest text-gold">🛒 Loja do Quest</Text>

    <View className="mt-4 flex-row gap-3">
      <View className="flex-1 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-gold">Moedas</Text>
        <View className="mt-2">
          <CoinDisplay amount={coins} size="lg" />
        </View>
      </View>

      <View className="flex-1 rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-accent">Study Points</Text>
        <Text className="mt-2 text-2xl font-black text-accent">{studyPoints.toLocaleString('pt-BR')}</Text>
        <Text className="text-[10px] font-bold text-accent/70">SP</Text>
      </View>
    </View>

    <Text className="mt-4 text-sm leading-5 text-foreground-secondary">
      Escudos e loot boxes com moedas. Role para baixo para a loja de Study Points e upgrades.
    </Text>

    <View className="mt-4 flex-row flex-wrap gap-2">
      <StatPill emoji="🛍️" label="Com moedas" value={productCount} tone="gold" />
      <StatPill
        emoji="📦"
        label="Loot boxes"
        value={`${purchasableLootBoxes}/${totalLootBoxes}`}
        tone="warning"
      />
    </View>
  </GameCard>
);
