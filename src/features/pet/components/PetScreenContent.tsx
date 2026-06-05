import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PressableScale } from '@/components/ui/game';
import { routes, theme } from '@/constants';

import { PET_UI } from '../constants/pet-ui';
import { usePet } from '../hooks/use-pet';
import { usePetScreenStore } from '../store/pet-screen-store';
import { isPetIncubating } from '../utils/display';
import { PetCollectionSection } from './PetCollectionSection';
import { PetDialogueBubble } from './PetDialogueBubble';
import { PetHeroDisplay } from './PetHeroDisplay';
import { PetIncubationLab } from './PetIncubationLab';
import { PetInteractionGrid } from './PetInteractionGrid';
import { PetMemoriesSection } from './PetMemoriesSection';
import { PetNameEditor } from './PetNameEditor';
import { PetVitalsPanel } from './PetVitalsPanel';
import { PetXPBar } from './PetXPBar';

const PetFarmLink = () => {
  const router = useRouter();
  return (
    <PressableScale
      onPress={() => router.push(routes.petFarm as Href)}
      accessibilityRole="button"
      accessibilityLabel={PET_UI.farmCta}
      className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3">
      <Text className="font-bold text-foreground">{PET_UI.farmCta}</Text>
      <Text className="mt-0.5 text-xs text-muted">{PET_UI.farmCtaHint}</Text>
    </PressableScale>
  );
};

export const PetScreenContent = () => {
  const { pet, isLoading, isRefreshing, refresh } = usePet();
  const dialogueMessage = usePetScreenStore((s) => s.dialogueMessage);
  const incubating = pet ? isPetIncubating(pet) : false;

  if (isLoading || !pet) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (incubating) {
    return (
      <View className="gap-4 pb-8">
        <PetIncubationLab pet={pet} />
        <PetFarmLink />
        <PetMemoriesSection />
        <PetCollectionSection />
      </View>
    );
  }

  return (
    <View className="gap-4 pb-8">
      <PetFarmLink />
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
  const { pet, isRefreshing, refresh } = usePet();
  const incubating = pet ? isPetIncubating(pet) : false;

  return (
    <ScreenContainer
      scrollable
      scrollViewProps={{
        refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />,
      }}>
      <ScreenHeader
        showBack
        title={incubating ? PET_UI.labTitle : PET_UI.screenTitle}
        subtitle={incubating ? PET_UI.labSubtitle : PET_UI.screenSubtitle}
        emoji={incubating ? '🧪' : '🐾'}
      />
      <View className="pt-2">
        <PetScreenContent />
      </View>
    </ScreenContainer>
  );
};

export { PetPreviewCard } from './PetPreviewCard';
