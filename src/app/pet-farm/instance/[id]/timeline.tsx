import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetInstanceTimelineScreenContent } from '@/features/pet-farm/components/PetInstanceTimelineScreenContent';
import { PET_TIMELINE_UI } from '@/features/pet-farm/constants/pet-timeline-ui';

export default function PetFarmInstanceTimelineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const instanceId = Number(id);

  if (!Number.isFinite(instanceId)) {
    return null;
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_TIMELINE_UI.title} />
      <View className="pt-2">
        <PetInstanceTimelineScreenContent instanceId={instanceId} />
      </View>
    </ScreenContainer>
  );
}
