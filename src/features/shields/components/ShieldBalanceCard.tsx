import { Text, View } from 'react-native';

import { Card } from '@/components';
import { AppIcon } from '@/components/ui/AppIcon';
import { theme } from '@/constants';
import { usePlayerStore } from '@/features/player';

export const ShieldBalanceCard = () => {
  const shields = usePlayerStore((s) => s.shields);

  return (
    <Card elevated accent>
      <View className="flex-row items-center gap-4">
        <View className="rounded-xl bg-accent/15 p-3">
          <AppIcon name="shield-checkmark" size={28} color={theme.colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-foreground-secondary">Escudos disponíveis</Text>
          <Text className="text-3xl font-bold text-foreground">{shields}</Text>
          <Text className="mt-1 text-xs text-muted">
            {shields === 0
              ? 'Você não possui escudos disponíveis.'
              : shields === 1
                ? '1 escudo protege sua sequência por 1 dia.'
                : `${shields} escudos protegem sua sequência.`}
          </Text>
        </View>
      </View>
    </Card>
  );
};
