import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { theme } from '@/constants';
import type { VaultDashboardSnapshot } from '@/types/knowledge-vault';

import { VaultDashboardPanel } from '@/features/english-journal/components/vault/VaultDashboardPanel';
import { VaultScreenBody } from '@/features/english-journal/components/vault/VaultScreenBody';
import { VAULT_UI } from '@/features/english-journal/constants/vault-ui';
import { KnowledgeVaultService } from '@/features/english-journal/services/knowledge-vault-service';

export default function VaultDashboardRoute() {
  const [snapshot, setSnapshot] = useState<VaultDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setLoading(true);
        setSnapshot(await KnowledgeVaultService.getDashboard());
        setLoading(false);
      })();
    }, []),
  );

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={VAULT_UI.dashboardTitle} subtitle={VAULT_UI.dashboardIntro} emoji="📊" />
      <VaultScreenBody hubActive="dashboard" showHelp={false}>
        {loading || !snapshot ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <VaultDashboardPanel snapshot={snapshot} />
        )}
      </VaultScreenBody>
    </ScreenContainer>
  );
};
