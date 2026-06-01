import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { GameCard, LevelBadge, PressableScale } from '@/components/ui/game';
import type { InventoryPetSnapshot } from '@/types/inventory';

import { InventorySectionHeader } from './InventorySectionHeader';

type InventoryPetCardProps = {
  pet: InventoryPetSnapshot | null;
};

export const InventoryPetCard = ({ pet }: InventoryPetCardProps) => {
  const handleOpenPet = () => {
    router.push('/pet' as Href);
  };

  if (!pet) {
    return (
      <View className="gap-3">
        <InventorySectionHeader
          emoji="🐾"
          title="Companheiro"
          subtitle="Seu pet de aventura"
        />
        <GameCard variant="default" className="items-center py-6">
          <Text className="text-4xl opacity-40">🥚</Text>
          <Text className="mt-3 text-sm font-semibold text-foreground">Nenhum companheiro</Text>
          <Text className="mt-1 text-center text-xs text-muted">
            Seu pet aparecerá aqui assim que for criado.
          </Text>
        </GameCard>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <InventorySectionHeader
        emoji="🐾"
        title="Companheiro"
        subtitle="Toque para cuidar do seu pet"
        badge={`Nv. ${pet.level}`}
      />

      <PressableScale
        onPress={handleOpenPet}
        accessibilityRole="button"
        accessibilityLabel={`Abrir pet ${pet.name}`}>
        <GameCard variant="hero" glow className="overflow-hidden p-0">
          <View className="h-1 w-full bg-primary/60" />
          <View className="flex-row items-center gap-4 p-4">
            <View className="relative">
              <View className="h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10">
                <Text className="text-5xl">{pet.emoji}</Text>
              </View>
              <View className="absolute -bottom-2 -right-2">
                <LevelBadge level={pet.level} size="sm" />
              </View>
            </View>

            <View className="min-w-0 flex-1">
              <Text className="text-xs font-bold uppercase tracking-widest text-primary">
                Companheiro ativo
              </Text>
              <Text className="mt-1 text-xl font-black text-foreground">{pet.name}</Text>
              <Text className="mt-0.5 text-sm text-foreground-secondary">
                {pet.speciesName} · {pet.stageLabel} · Nv. {pet.level}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                <View className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1">
                  <Text className="text-[10px] font-bold text-accent">😊 {pet.mood}</Text>
                </View>
                <View className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1">
                  <Text className="text-[10px] font-bold text-gold">Ver pet →</Text>
                </View>
              </View>
            </View>
          </View>
        </GameCard>
      </PressableScale>
    </View>
  );
};
