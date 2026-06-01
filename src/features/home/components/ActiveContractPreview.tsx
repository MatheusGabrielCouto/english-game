import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { useContractsStore } from '@/features/contracts/store/contracts-store';

export const ActiveContractPreview = () => {
  const activeContract = useContractsStore((state) => state.activeContract);

  if (!activeContract) {
    return (
      <Card elevated className="border-warning/15">
        <Text className="text-xs font-bold uppercase tracking-widest text-warning">📜 Contratos</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">Nenhum contrato ativo no momento.</Text>
      </Card>
    )
  }

  const progress =
    activeContract.targetDays > 0
      ? Math.round((activeContract.progressDays / activeContract.targetDays) * 100)
      : 0

  return (
    <PressableScale
      onPress={() => router.push(routes.contracts as Href)}
      accessibilityRole="button"
      accessibilityLabel="Ver contrato ativo">
      <Card elevated className="border-warning/35">
        <Text className="text-xs font-bold uppercase tracking-widest text-warning">📜 Contrato ativo</Text>
        <Text className="mt-1 text-lg font-black text-foreground">{activeContract.name}</Text>
        <Text className="mt-1 text-sm text-foreground-secondary">
          {activeContract.progressDays}/{activeContract.targetDays} dias · Aposta: {activeContract.stakeAmount} moedas
        </Text>
        <View className="mt-3">
          <ProgressBar value={progress} variant="gold" height="md" animated={false} />
        </View>
      </Card>
    </PressableScale>
  );
};
