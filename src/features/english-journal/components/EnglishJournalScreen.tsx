import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { VAULT_UI } from '../constants/vault-ui';
import { EnglishJournalScreenContent } from './EnglishJournalScreenContent';

export const EnglishJournalScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={VAULT_UI.vaultName}
      subtitle={VAULT_UI.vaultSubtitle}
      emoji="📓"
    />
    <EnglishJournalScreenContent />
  </ScreenContainer>
);
