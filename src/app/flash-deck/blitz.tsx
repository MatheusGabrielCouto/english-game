import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { FlashDeckBlitzContent } from '@/features/flash-deck/components/FlashDeckBlitzContent';
import { FLASH_DECK_UI } from '@/features/flash-deck/constants/flash-deck-ui';

export default function FlashDeckBlitzScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={FLASH_DECK_UI.blitzReview}
        subtitle={FLASH_DECK_UI.blitzReviewHint}
        emoji="⚡"
      />
      <View className="pt-2">
        <FlashDeckBlitzContent />
      </View>
    </ScreenContainer>
  );
}
