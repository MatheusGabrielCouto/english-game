import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { COLLECTION_BOOK_UI } from '../constants/collection-book-ui';
import { CollectionBookScreenContent } from './CollectionBookScreenContent';

export const CollectionBookScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={COLLECTION_BOOK_UI.screenTitle}
      subtitle={COLLECTION_BOOK_UI.screenSubtitle}
      emoji="📖"
    />
    <CollectionBookScreenContent />
  </ScreenContainer>
);
