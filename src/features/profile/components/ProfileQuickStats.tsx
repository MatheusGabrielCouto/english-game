import { StatPill } from '@/components/ui/game';
import { usePlayerStore } from '@/features/player';
import { View } from 'react-native';

export const ProfileQuickStats = () => {
  const shields = usePlayerStore((state) => state.shields);
  const currentStreak = usePlayerStore((state) => state.currentStreak);
  const totalStudyDays = usePlayerStore((state) => state.totalStudyDays);

  return (
    <View className="flex-row gap-2">
      <StatPill emoji="🔥" label="Streak" value={currentStreak} tone="warning" />
      <StatPill emoji="📅" label="Dias" value={totalStudyDays} tone="accent" />
      <StatPill emoji="🛡️" label="Escudos" value={shields} tone="primary" />
    </View>
  );
};
