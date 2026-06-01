import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';

import { InventoryItemSlot } from './InventoryItemSlot';
import { InventorySectionHeader } from './InventorySectionHeader';

type InventoryShieldCardProps = {
  quantity: number;
};

export const InventoryShieldCard = ({ quantity }: InventoryShieldCardProps) => (
  <View className="gap-3">
    <InventorySectionHeader
      emoji="🛡️"
      title="Escudos de Streak"
      subtitle="Protegem sua sequência nos dias perdidos"
      badge={quantity > 0 ? `${quantity} em estoque` : 'Vazio'}
    />

    <GameCard variant="quest" className="p-4">
      <View className="flex-row items-center gap-4">
        <View className="w-[38%]">
          <InventoryItemSlot
            emoji="🛡️"
            label="Escudo"
            sublabel="Streak"
            quantity={quantity}
            size="lg"
            borderClass="border-accent/45 bg-accent/8"
            highlighted={quantity > 0}
          />
        </View>
        <View className="min-w-0 flex-1 gap-2">
          <Text className="text-base font-bold text-foreground">
            {quantity > 0 ? 'Proteção ativa' : 'Sem escudos'}
          </Text>
          <Text className="text-sm leading-relaxed text-foreground-secondary">
            {quantity > 0
              ? 'Escudos são consumidos automaticamente quando você perde um dia de streak.'
              : 'Compre na loja ou ganhe em missões para manter sua sequência.'}
          </Text>
          {quantity > 0 ? (
            <View className="self-start rounded-full border border-accent/30 bg-accent/10 px-3 py-1">
              <Text className="text-[10px] font-bold uppercase text-accent">Auto-equipado</Text>
            </View>
          ) : null}
        </View>
      </View>
    </GameCard>
  </View>
);
