import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { DUEL_UI } from '../constants/duel-ui';
import { DuelBattleContent } from './DuelBattleContent';

export const DuelRematchReviewScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={DUEL_UI.rematchReview}
      subtitle="Segunda chance nas perguntas que você errou"
      emoji="📖"
    />
    <View className="pt-2">
      <DuelBattleContent />
    </View>
  </ScreenContainer>
);
