import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isAvailable = Platform.OS !== 'web';

export const haptics = {
  light: () => {
    if (!isAvailable) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  medium: () => {
    if (!isAvailable) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  heavy: () => {
    if (!isAvailable) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  success: () => {
    if (!isAvailable) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  warning: () => {
    if (!isAvailable) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  error: () => {
    if (!isAvailable) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  selection: () => {
    if (!isAvailable) return;
    void Haptics.selectionAsync();
  },
};
