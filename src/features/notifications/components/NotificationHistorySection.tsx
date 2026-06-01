import { Text, View } from 'react-native';

import { Card } from '@/components';
import { CATEGORY_LABELS } from '../constants/categories';
import { useNotifications } from '../hooks/use-notifications';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  delivered: 'Exibida',
  opened: 'Aberta',
  cancelled: 'Cancelada',
};

export const NotificationHistorySection = () => {
  const { history, isLoading } = useNotifications();

  if (isLoading || history.length === 0) {
    return null;
  }

  return (
    <Card elevated>
      <Text className="text-sm font-semibold text-foreground">Histórico recente</Text>
      <Text className="mt-1 text-xs text-muted">Últimos lembretes agendados e exibidos</Text>
      <View className="mt-4 gap-3">
        {history.map((entry) => (
          <View key={entry.id} className="rounded-xl border border-border bg-surface px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase text-primary">
                {CATEGORY_LABELS[entry.category] ?? entry.category}
              </Text>
              <Text className="text-[10px] text-muted">
                {STATUS_LABELS[entry.status] ?? entry.status}
              </Text>
            </View>
            <Text className="mt-1 text-sm text-foreground-secondary" numberOfLines={2}>
              {entry.body}
            </Text>
            <Text className="mt-1 text-[10px] text-muted">
              {new Date(entry.createdAt).toLocaleString('pt-BR')}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};
