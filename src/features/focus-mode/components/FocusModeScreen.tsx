import { Platform, View } from 'react-native';

import { FocusSessionResultModal } from '@/features/focus-mode/components/FocusSessionResultModal';
import { FocusModeScreenContent } from '@/features/focus-mode/components/FocusModeScreenContent';
import { useFocusMode } from '@/features/focus-mode/hooks/use-focus-mode';

export const FocusModeScreen = () => {
  const { lastRewards, clearLastRewards } = useFocusMode();

  const handleCloseResult = () => {
    clearLastRewards();
  };

  return (
    <>
      <View className="pt-2">
        <FocusModeScreenContent />
      </View>
      <FocusSessionResultModal
        visible={Boolean(lastRewards)}
        rewards={lastRewards}
        onClose={handleCloseResult}
      />
    </>
  );
};

export const isFocusModeAvailable = Platform.OS === 'android';
