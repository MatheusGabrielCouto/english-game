import { Text, View } from 'react-native';

import type { BackupPreviewSummary } from '@/types/backup';

type BackupPreviewCardProps = {
  preview: BackupPreviewSummary;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const PreviewStat = ({ label, value }: { label: string; value: string }) => (
  <View className="min-w-[46%] flex-1 rounded-lg border border-border bg-surface px-3 py-2">
    <Text className="text-[10px] font-semibold uppercase text-muted">{label}</Text>
    <Text className="mt-0.5 text-sm font-bold text-foreground" numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export const BackupPreviewCard = ({ preview }: BackupPreviewCardProps) => (
  <View className="gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
    <Text className="text-xs font-bold uppercase tracking-widest text-gold">Preview do backup</Text>

    <View className="flex-row flex-wrap gap-2">
      <PreviewStat label="Jogador" value={preview.playerName ?? 'Aventureiro'} />
      <PreviewStat label="Nível" value={String(preview.level)} />
      <PreviewStat label="XP" value={preview.xp.toLocaleString('pt-BR')} />
      <PreviewStat label="Moedas" value={preview.coins.toLocaleString('pt-BR')} />
      <PreviewStat label="Streak" value={`${preview.streak}d`} />
      <PreviewStat label="Recorde" value={`${preview.bestStreak}d`} />
      <PreviewStat label="Pet" value={preview.petLabel ?? '—'} />
      <PreviewStat label="Inventário" value={String(preview.inventoryItemCount)} />
      <PreviewStat label="Conquistas" value={String(preview.achievementCount)} />
      <PreviewStat label="Rotinas" value={String(preview.routineCount)} />
      <PreviewStat label="Flash decks" value={String(preview.flashDeckCount)} />
      <PreviewStat label="Favoritos menu" value={String(preview.menuFavoritesCount)} />
    </View>

    <View className="rounded-lg border border-border/60 bg-surface/80 px-3 py-2">
      <Text className="text-[10px] font-semibold uppercase text-muted">Data do backup</Text>
      <Text className="mt-0.5 text-sm font-medium text-foreground">{formatDate(preview.exportedAt)}</Text>
      <Text className="mt-1 text-xs text-foreground-secondary">
        App v{preview.appVersion} · formato v{preview.formatVersion} · {preview.totalRows} registros
      </Text>
    </View>

    <Text className="text-xs leading-5 text-warning">
      Restaurar substitui o progresso local por estes dados. O Knowledge Vault e gravações de voz não
      são restaurados.
    </Text>
  </View>
);
