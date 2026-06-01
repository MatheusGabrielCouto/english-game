import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { DUEL_UI } from '../constants/duel-ui';
import { DuelArenaContent } from './DuelArenaContent';

export const DuelArenaScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={DUEL_UI.screenTitle}
      subtitle="Entre na arena e derrote o léxico"
      emoji={DUEL_UI.emoji}
    />
    <View className="pt-2">
      <DuelArenaContent />
    </View>
  </ScreenContainer>
);
