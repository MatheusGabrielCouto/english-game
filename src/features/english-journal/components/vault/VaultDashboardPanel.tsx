import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { VaultDashboardSnapshot } from '@/types/knowledge-vault';
import { VAULT_UI } from '../../constants/vault-ui';

type VaultDashboardPanelProps = {
  snapshot: VaultDashboardSnapshot;
};

export const VaultDashboardPanel = ({ snapshot }: VaultDashboardPanelProps) => {
  const router = useRouter();
  const { stats } = snapshot;
  const masteryPct = Math.min(100, Math.round(stats.knowledgeMasteryBps / 100));

  return (
    <View className="gap-4">
      {snapshot.dueReviewCount > 0 ? (
        <GameCard className="border-primary/40 bg-primary/10 gap-3">
          <Text className="text-sm font-bold text-primary">
            {VAULT_UI.reviewBanner(snapshot.dueReviewCount)}
          </Text>
          <Text className="text-xs text-foreground-secondary">{VAULT_UI.dashboardReviewHint}</Text>
          <Button
            label={VAULT_UI.dashboardReviewCta}
            size="sm"
            onPress={() => router.replace('/english-journal' as never)}
          />
        </GameCard>
      ) : null}

      <GameCard variant="quest" glow className="gap-4">
        <View>
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            {VAULT_UI.dashboardProgressTitle}
          </Text>
          <Text className="mt-1 text-2xl font-black text-foreground">
            {VAULT_UI.knowledgeLevel(stats.knowledgeLevel)}
          </Text>
          <Text className="mt-1 text-sm text-foreground-secondary">
            {VAULT_UI.knowledgePoints(stats.knowledgePoints)} · {VAULT_UI.libraryTier(stats.libraryTier)}
          </Text>
        </View>

        <View>
          <View className="mb-1 flex-row justify-between">
            <Text className="text-xs font-semibold text-foreground">{VAULT_UI.dashboardMasteryLabel}</Text>
            <Text className="text-xs font-bold text-primary">{masteryPct}%</Text>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full bg-background">
            <View className="h-full rounded-full bg-primary" style={{ width: `${masteryPct}%` }} />
          </View>
          <Text className="mt-1 text-[10px] text-muted">{VAULT_UI.libraryBuilding}</Text>
        </View>
      </GameCard>

      <Text className="text-xs font-bold uppercase tracking-wider text-muted">
        {VAULT_UI.dashboardStatsTitle}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <StatTile emoji="📝" label={VAULT_UI.statsNotes(stats.totalEntries)} />
        <StatTile emoji="🎙️" label={VAULT_UI.statsVoice(stats.totalVoiceNotes)} />
        <StatTile emoji="🗂️" label={VAULT_UI.dashboardActiveSpaces(snapshot.spaceCount)} />
        <StatTile emoji="📌" label={VAULT_UI.dashboardPinned(snapshot.pinnedCount)} />
        <StatTile emoji="📁" label={VAULT_UI.statsCollections(stats.totalCollections)} />
        <StatTile emoji="🔗" label={VAULT_UI.statsConnections(stats.totalConnections)} />
      </View>

      {snapshot.topTags.length > 0 ? (
        <GameCard>
          <Text className="text-sm font-bold text-foreground">{VAULT_UI.dashboardTagsTitle}</Text>
          <Text className="mt-1 text-xs text-foreground-secondary">{VAULT_UI.dashboardTagsHint}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {snapshot.topTags.map((t) => (
              <View key={t.tag} className="rounded-full bg-primary/15 px-3 py-1">
                <Text className="text-xs font-semibold text-primary">
                  #{t.tag} <Text className="text-muted">({t.count})</Text>
                </Text>
              </View>
            ))}
          </View>
        </GameCard>
      ) : (
        <GameCard className="border-dashed">
          <Text className="text-sm text-foreground-secondary">{VAULT_UI.dashboardNoTags}</Text>
        </GameCard>
      )}
    </View>
  );
};

const StatTile = ({ emoji, label }: { emoji: string; label: string }) => (
  <View className="min-w-[46%] flex-grow rounded-2xl border border-border bg-surface px-3 py-3">
    <Text className="text-lg">{emoji}</Text>
    <Text className="mt-1 text-xs font-semibold leading-4 text-foreground">{label}</Text>
  </View>
);
