import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { ScreenSkeleton } from '@/components/ui/skeleton'
import { VaultDashboardPanel } from '@/features/english-journal/components/vault/VaultDashboardPanel'
import { VaultScreenBody } from '@/features/english-journal/components/vault/VaultScreenBody'
import { VAULT_UI } from '@/features/english-journal/constants/vault-ui'
import { KnowledgeVaultService } from '@/features/english-journal/services/knowledge-vault-service'
import type { VaultDashboardSnapshot } from '@/types/knowledge-vault'

export default function VaultDashboardRoute() {
  const [snapshot, setSnapshot] = useState<VaultDashboardSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setLoading(true)
        setSnapshot(await KnowledgeVaultService.getDashboard())
        setLoading(false)
      })()
    }, []),
  )

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={VAULT_UI.dashboardTitle} subtitle={VAULT_UI.dashboardIntro} emoji="📊" />
      <VaultScreenBody hubActive="dashboard" hubLinkMode="tab" showHelp={false}>
        {loading || !snapshot ? (
          <ScreenSkeleton variant="hero-list" listCount={4} />
        ) : (
          <VaultDashboardPanel snapshot={snapshot} />
        )}
      </VaultScreenBody>
    </ScreenContainer>
  )
}
