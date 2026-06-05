import { ScreenContainer, ScreenHeader } from '@/components/layout'

import { VaultCollectionsScreenContent } from '@/features/english-journal/components/vault/VaultCollectionsScreenContent'
import { VaultScreenBody } from '@/features/english-journal/components/vault/VaultScreenBody'
import { VAULT_UI } from '@/features/english-journal/constants/vault-ui'

export default function VaultCollectionsRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={VAULT_UI.collectionsTitle}
        subtitle={VAULT_UI.collectionsIntro}
        emoji="📁"
      />
      <VaultScreenBody hubActive="collections" hubLinkMode="tab" helpText={VAULT_UI.collectionsIntro}>
        <VaultCollectionsScreenContent />
      </VaultScreenBody>
    </ScreenContainer>
  )
}
