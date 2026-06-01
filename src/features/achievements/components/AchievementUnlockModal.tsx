import { Text, View } from 'react-native';

import { Modal } from '@/components/ui/Modal';
import { AchievementService } from '@/features/achievements/services/achievement-service';
import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { useFeedbackStore } from '@/features/feedback/store/feedback-store';

export const AchievementUnlockModal = () => {
  const celebration = useAchievementsStore((state) => state.celebration);
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti);

  const handleClose = () => {
    clearConfetti();
    AchievementService.dequeueCelebration();
  };

  return (
    <Modal
      visible={celebration !== null}
      onRequestClose={handleClose}
      title="🏆 Conquista desbloqueada!"
      description="Um marco épico na sua jornada!"
      confirmLabel="Incrível!"
      cancelLabel="Fechar"
      onConfirm={handleClose}
      onCancel={handleClose}
      className="border-gold/40">
      {celebration ? (
        <View className="items-center gap-4 py-4">
          <View className="rounded-full border-4 border-gold/50 bg-gold/10 p-5">
            <Text className="text-6xl">{celebration.achievement.icon}</Text>
          </View>
          <Text className="px-2 text-center text-xl font-black text-gold" numberOfLines={2}>
            {celebration.achievement.name}
          </Text>
          <Text className="px-2 text-center text-sm leading-5 text-foreground-secondary">
            {celebration.achievement.description}
          </Text>
          <View className="w-full gap-2 rounded-xl border border-accent/30 bg-accent/10 p-4">
            <Text className="text-sm font-bold text-foreground">🎁 Recompensas</Text>
            {celebration.rewards.map((reward) => (
              <View
                key={`${celebration.achievement.key}-${reward.label}`}
                className="flex-row gap-2 rounded-lg border border-border/60 bg-surface px-3 py-2">
                <Text className="text-accent">✦</Text>
                <Text className="min-w-0 flex-1 text-sm font-semibold text-accent" numberOfLines={2}>
                  {reward.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Modal>
  );
};
