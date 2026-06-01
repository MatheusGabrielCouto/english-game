import { View } from 'react-native';

import { Toast } from '@/components';

import { useShields } from '../hooks/use-shields';
import { ShieldBalanceCard } from './ShieldBalanceCard';
import { ShieldExplanationCard } from './ShieldExplanationCard';
import { ShieldHistoryList } from './ShieldHistoryList';
import { ShieldStatsCard } from './ShieldStatsCard';

export const ShieldSection = () => {
  const { feedback, clearFeedback } = useShields();

  return (
    <View className="gap-4">
      <ShieldBalanceCard />
      <ShieldExplanationCard />
      <ShieldStatsCard />
      <ShieldHistoryList />
      <Toast
        message={feedback?.message ?? null}
        onDismiss={clearFeedback}
        variant={feedback?.type === 'none_left' ? 'info' : 'success'}
      />
    </View>
  );
};
