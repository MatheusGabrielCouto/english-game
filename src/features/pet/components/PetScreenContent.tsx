import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { theme } from '@/constants';

import { PetCollectionSection } from './PetCollectionSection';
import { PetDialogueBubble } from './PetDialogueBubble';
import { PetHeroDisplay } from './PetHeroDisplay';
import { PetInteractionGrid } from './PetInteractionGrid';
import { PetMemoriesSection } from './PetMemoriesSection';
import { PetNameEditor } from './PetNameEditor';
import { PetVitalsPanel } from './PetVitalsPanel';
import { PetXPBar } from './PetXPBar';
import { usePet } from '../hooks/use-pet';
import { usePetScreenStore } from '../store/pet-screen-store';

export const PetScreenContent = () => {
  const { pet, isLoading, isRefreshing, refresh } = usePet();
  const dialogueMessage = usePetScreenStore((s) => s.dialogueMessage);

  if (isLoading || !pet) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View className="gap-4 pb-8">
      <PetHeroDisplay pet={pet} />
      <PetDialogueBubble message={dialogueMessage} petName={pet.name} />
      <PetVitalsPanel pet={pet} />
      <PetInteractionGrid />
      <PetNameEditor pet={pet} onUpdated={refresh} />
      <View className="rounded-2xl border border-border bg-surface px-4 py-3">
        <PetXPBar pet={pet} />
      </View>
      <PetMemoriesSection />
      <PetCollectionSection />
    </View>
  );
};

export const PetScreen = () => {
  const { isRefreshing, refresh } = usePet();

  return (
    <ScreenContainer
      scrollable
      scrollViewProps={{
        refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />,
      }}>
      <ScreenHeader
        showBack
        title="Meu Companheiro"
        subtitle="Cuide, evolua e colecione memórias"
        emoji="🐾"
      />
      <View className="pt-2">
        <PetScreenContent />
      </View>
    </ScreenContainer>
  );
};

export { PetPreviewCard } from './PetPreviewCard';
