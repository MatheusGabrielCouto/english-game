import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { VaultGlobalSearchContent } from '@/features/english-journal/components/vault/VaultGlobalSearchContent'
import { VAULT_UI } from '@/features/english-journal/constants/vault-ui'

export default function VaultSearchRoute() {
  return (
    <ScreenContainer scrollable={false} contentClassName="flex-1">
      <ScreenHeader
        showBack
        title={VAULT_UI.globalSearchTitle}
        subtitle={VAULT_UI.globalSearchSubtitle}
        emoji="🔍"
      />
      <VaultGlobalSearchContent />
    </ScreenContainer>
  )
}
