import { useRouter, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { PetStage } from '@/types/pet';
import type { PetInstance } from '@/types/pet-instance';

import { PET_INSTANCE_HUB_UI } from '../constants/pet-instance-hub-ui';

type PetInstanceHubActionsProps = {
  instance: PetInstance;
  onSetActive: () => void;
  onRemoveFromPasture: () => void;
};

const isAdult = (stage: PetInstance['stage']) =>
  stage === PetStage.ADULT || stage === PetStage.LEGENDARY;

export const PetInstanceHubActions = ({
  instance,
  onSetActive,
  onRemoveFromPasture,
}: PetInstanceHubActionsProps) => {
  const router = useRouter();

  const actions: {
    key: string;
    label: string;
    onPress: () => void;
    primary?: boolean;
    disabled?: boolean;
  }[] = [];

  if (!instance.isActive) {
    actions.push({
      key: 'active',
      label: PET_INSTANCE_HUB_UI.setActive,
      onPress: onSetActive,
      primary: true,
    });
  }

  actions.push({
    key: 'pasture',
    label: PET_INSTANCE_HUB_UI.openPasture,
    onPress: () => router.push(routes.petFarmPasture as Href),
  });

  if (isAdult(instance.stage)) {
    actions.push({
      key: 'breed',
      label: PET_INSTANCE_HUB_UI.openBreed,
      onPress: () => router.push(routes.petFarmBreeding as Href),
    });
  }

  actions.push(
    {
      key: 'adventure',
      label: PET_INSTANCE_HUB_UI.openAdventure,
      onPress: () => router.push(routes.petFarmAdventures as Href),
    },
    {
      key: 'academy',
      label: PET_INSTANCE_HUB_UI.openAcademy,
      onPress: () => router.push(routes.petFarmAcademy as Href),
    },
  );

  if (instance.passiveFieldSlot !== null) {
    actions.push({
      key: 'remove-pasture',
      label: 'Remover do pasto',
      onPress: onRemoveFromPasture,
    });
  }

  return (
    <Card className="gap-2">
      <Text className="text-sm font-bold text-foreground">{PET_INSTANCE_HUB_UI.actionsTitle}</Text>
      <View className="flex-row flex-wrap gap-2">
        {actions.map((action) => (
          <PressableScale
            key={action.key}
            onPress={action.onPress}
            className={`min-w-[46%] flex-1 items-center rounded-xl px-2 py-2.5 ${
              action.primary ? 'bg-primary' : 'border border-border bg-surface'
            }`}
            accessibilityRole="button"
            accessibilityLabel={action.label}>
            <Text
              className={`text-center text-[11px] font-bold ${
                action.primary ? 'text-background' : 'text-foreground'
              }`}>
              {action.label}
            </Text>
          </PressableScale>
        ))}
      </View>
    </Card>
  );
};
