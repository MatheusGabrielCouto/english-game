import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashCardEditorContent } from './FlashCardEditorContent';

export const FlashDeckCreateScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={FLASH_DECK_UI.createTitle}
      subtitle={FLASH_DECK_UI.createSubtitle}
      emoji={FLASH_DECK_UI.emoji}
    />
    <View className="pt-2">
      <FlashCardEditorContent />
    </View>
  </ScreenContainer>
);
