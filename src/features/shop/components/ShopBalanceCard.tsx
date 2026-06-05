import { Text, View } from 'react-native';

import { GameCard, StatPill } from '@/components/ui/game';
import { CoinDisplay } from '@/components/ui/game/CoinDisplay';

import { SHOP_TEXT } from '../constants/shop-ui';

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
    <Text className={SHOP_TEXT.kickerGold}>🛒 Loja do Quest</Text>

    <View className="mt-4 flex-row gap-3">
      <View className="flex-1 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
        <Text className={SHOP_TEXT.kickerGold}>Moedas</Text>
        <View className="mt-2">
          <CoinDisplay amount={coins} size="lg" />
        </View>
      </View>

      <View className="flex-1 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
        <Text className={SHOP_TEXT.kickerAccent}>Study Points</Text>
        <Text className="mt-2 text-2xl font-black text-accent">{studyPoints.toLocaleString('pt-BR')}</Text>
        <Text className="text-[10px] font-bold text-accent">SP</Text>
      </View>
    </View>

    <Text className={`mt-4 ${SHOP_TEXT.body}`}>
      Loja viva no topo — ofertas e estoque rotativo. Abaixo, catálogos fixos de moedas e Study Points.
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
