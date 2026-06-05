import { Vibration } from 'react-native';

import { haptics } from '@/utils/haptics';

export const playFocusSessionEndedFeedback = async (): Promise<void> => {
  haptics.success();
  Vibration.vibrate([0, 400, 200, 400]);
};
