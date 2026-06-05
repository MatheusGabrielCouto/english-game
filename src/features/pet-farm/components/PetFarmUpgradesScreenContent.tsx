import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';

import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { PetFarmUpgradeService } from '../services/pet-farm-upgrade-service';

export const PetFarmUpgradesScreenContent = () => {
  const [fields, setFields] = useState<Awaited<ReturnType<typeof PetFarmUpgradeService.getFieldsWithCosts>>>([]);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setFields(await PetFarmUpgradeService.getFieldsWithCosts());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpgrade = async (fieldKey: (typeof fields)[0]['key']) => {
    const result = await PetFarmUpgradeService.upgrade(fieldKey);
    setMessage(result.message);
    await load();
  };

  return (
    <View className="gap-3">
      {fields.map((field) => (
        <Card key={field.key} className="gap-2">
          <Text className="font-bold text-foreground">{field.label}</Text>
          <Text className="text-xs text-muted">{field.description}</Text>
          <Text className="text-sm text-foreground">
            Nível {field.level}/{field.maxLevel}
          </Text>
          {field.atMax ? (
            <Text className="text-xs text-gold">{PET_FARM_UI.maxLevel}</Text>
          ) : (
            <PressableScale
              onPress={() => void handleUpgrade(field.key)}
              className="mt-1 items-center rounded-lg border border-primary/40 bg-primary/10 py-2">
              <Text className="text-xs font-bold text-primary">
                {PET_FARM_UI.upgrade} — {field.cost.toLocaleString('pt-BR')} moedas
              </Text>
            </PressableScale>
          )}
        </Card>
      ))}
      {message ? <Text className="text-center text-xs text-muted">{message}</Text> : null}
    </View>
  );
};
