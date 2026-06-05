import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckDetailContent } from './FlashDeckDetailContent';

export const FlashDeckDetailScreen = () => (
  <ScreenContainer scrollable={false} contentClassName="flex-1">
    <ScreenHeader showBack title={FLASH_DECK_UI.openDeck} emoji={FLASH_DECK_UI.emoji} />
    <View className="flex-1 pt-2">
      <FlashDeckDetailContent />
    </View>
  </ScreenContainer>
);
