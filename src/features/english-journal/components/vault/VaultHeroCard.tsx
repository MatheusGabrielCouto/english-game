import { Pressable, Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { JournalStatsRecord } from '@/types/journal';

import { VAULT_UI } from '../../constants/vault-ui';

type VaultHeroCardProps = {
  stats: JournalStatsRecord | null;
  dueReviewCount: number;
  spaceFilterLabel?: string;
  onClearSpaceFilter?: () => void;
};

export const VaultHeroCard = ({
  stats,
  dueReviewCount,
  spaceFilterLabel,
  onClearSpaceFilter,
}: VaultHeroCardProps) => (
  <GameCard variant="quest" glow className="gap-3">
    <View>
      <Text className="text-xs font-bold uppercase tracking-widest text-primary">
        {VAULT_UI.vaultTagline}
      </Text>
      <Text className="mt-1 text-lg font-black text-foreground">{VAULT_UI.vaultName}</Text>
    </View>

    {spaceFilterLabel ? (
      <View className="flex-row items-center justify-between rounded-xl bg-primary/10 px-3 py-2">
        <Text className="text-xs font-semibold text-primary">
          {VAULT_UI.filterSpace(spaceFilterLabel)}
        </Text>
        {onClearSpaceFilter ? (
          <Pressable onPress={onClearSpaceFilter} accessibilityRole="button">
            <Text className="text-xs font-bold text-foreground">{VAULT_UI.clearFilter}</Text>
          </Pressable>
        ) : null}
      </View>
    ) : null}

    {stats ? (
      <View className="flex-row flex-wrap gap-2">
        <Pill label={VAULT_UI.statsNotes(stats.totalEntries)} />
        <Pill label={VAULT_UI.statsVoice(stats.totalVoiceNotes)} />
        <Pill label={VAULT_UI.knowledgeLevel(stats.knowledgeLevel)} highlight />
        {dueReviewCount > 0 ? (
          <Pill label={VAULT_UI.statsReviewsDue(dueReviewCount)} highlight />
        ) : null}
      </View>
    ) : null}

    <Text className="text-xs leading-4 text-foreground-secondary">
      {VAULT_UI.libraryBuilding} — {stats ? VAULT_UI.libraryTier(stats.libraryTier) : '—'}
    </Text>
  </GameCard>
);

const Pill = ({ label, highlight }: { label: string; highlight?: boolean }) => (
  <View
    className={`rounded-full px-2.5 py-1 ${highlight ? 'bg-primary/20' : 'bg-background border border-border'}`}>
    <Text className={`text-[11px] font-semibold ${highlight ? 'text-primary' : 'text-muted'}`}>
      {label}
    </Text>
  </View>
);
