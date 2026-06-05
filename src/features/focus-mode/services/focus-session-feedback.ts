import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

export const playFocusSessionEndedFeedback = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // haptics unavailable
  }

  Vibration.vibrate([0, 400, 200, 400]);
};
