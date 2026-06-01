import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { usePet } from '@/features/pet/hooks/use-pet';

import { CITY_UI } from '../constants/city-ui';
import { CityLivingService } from '../services/city-living-service';

type CityPoiParkSectionProps = {
  petVisitedParkToday: boolean;
};

export const CityPoiParkSection = ({ petVisitedParkToday }: CityPoiParkSectionProps) => {
  const { pet } = usePet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleBringPet = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await CityLivingService.bringPetToPark();
      if (!result.ok) {
        if (result.reason === 'already_brought') {
          setMessage(CITY_UI.parkPetAlready);
        } else {
          setMessage(CITY_UI.parkPetFailed);
        }
        return;
      }
      setMessage(CITY_UI.parkPetSuccess);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      <Text className="text-sm font-semibold text-foreground">{CITY_UI.parkPetTitle}</Text>
      <Text className="text-xs leading-5 text-foreground-secondary">{CITY_UI.parkPetHint}</Text>

      {pet ? (
        <View className="flex-row items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-3">
          <Text className="text-3xl">🐾</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">{pet.name}</Text>
            <Text className="text-xs text-foreground-secondary">
              Felicidade {pet.happiness}% · Energia {pet.energy}%
            </Text>
          </View>
        </View>
      ) : (
        <Text className="text-sm text-muted">{CITY_UI.parkPetNoPet}</Text>
      )}

      {petVisitedParkToday ? (
        <Text className="text-center text-sm font-medium text-success">{CITY_UI.parkPetAlready}</Text>
      ) : (
        <Button
          label={CITY_UI.parkPetButton}
          variant="primary"
          disabled={!pet || loading}
          onPress={() => void handleBringPet()}
          accessibilityLabel={CITY_UI.parkPetButton}
        />
      )}

      {message ? <Text className="text-center text-sm text-foreground-secondary">{message}</Text> : null}
    </View>
  );
};
