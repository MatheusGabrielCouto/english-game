import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashCardDetailContent } from './FlashCardDetailContent';

export const FlashCardDetailScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader showBack title={FLASH_DECK_UI.editCard} emoji={FLASH_DECK_UI.emoji} />
    <View className="pt-2">
      <FlashCardDetailContent />
    </View>
  </ScreenContainer>
);
