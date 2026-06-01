import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckReviewContent } from './FlashDeckReviewContent';

export const FlashDeckReviewScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={FLASH_DECK_UI.reviewTitle}
      subtitle="Missão de memória — vire e classifique"
      emoji={FLASH_DECK_UI.emoji}
    />
    <View className="pt-2">
      <FlashDeckReviewContent />
    </View>
  </ScreenContainer>
);
