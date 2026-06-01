import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { FlashDeckMcqReviewContent } from '@/features/flash-deck/components/FlashDeckMcqReviewContent';
import { FLASH_DECK_UI } from '@/features/flash-deck/constants/flash-deck-ui';

export default function FlashDeckMcqScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={FLASH_DECK_UI.mcqReview}
        subtitle={FLASH_DECK_UI.mcqReviewHint}
        emoji="🎯"
      />
      <View className="pt-2">
        <FlashDeckMcqReviewContent />
      </View>
    </ScreenContainer>
  );
}
