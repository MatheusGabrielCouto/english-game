import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { AppLogService } from '@/services/app-log-service';

import type { LearningAnalyticsSnapshot } from '@/types/learning-analytics';
import { LearningAnalyticsService } from '../services/learning-analytics-service';
import { LearningHeroPanel } from './ui';

const METRIC_UI = {
  title: 'Hall da Fama',
  subtitle: 'Suas estatísticas de duelo e baralho',
  duelWinRate: 'Taxa de vitória',
  flashPerSession: 'Cartas / sessão',
  cardsFromDuel: 'Salvos do duelo',
  weeklyBoss: 'Bosses semanais',
  logsTitle: 'Crônicas recentes',
} as const;

const MetricRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <View className="flex-row items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
    <View className="flex-row items-center gap-2">
      <Text>{icon}</Text>
      <Text className="text-sm text-foreground-secondary">{label}</Text>
    </View>
    <Text className="text-sm font-black text-foreground">{value}</Text>
  </View>
);

export const LearningInsightsContent = () => {
  const [snapshot, setSnapshot] = useState<LearningAnalyticsSnapshot | null>(null);

  const refresh = useCallback(async () => {
    const data = await LearningAnalyticsService.refresh();
    setSnapshot(data);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logs = AppLogService.getRecent(15).filter((entry) => entry.event.startsWith('learning.'));

  return (
    <View className="gap-4">
      <LearningHeroPanel
        variant="review"
        eyebrow="Aprendizado"
        emoji="📊"
        headline={snapshot ? `${snapshot.duelWinRate}% vitórias` : 'Carregando…'}
        subtitle={METRIC_UI.subtitle}
      />

      {snapshot ? (
        <GameCard variant="quest" className="gap-2 border-primary/25">
          <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
            Duelos
          </Text>
          <MetricRow icon="⚔️" label="Vitórias" value={`${snapshot.duelWins}`} />
          <MetricRow icon="💀" label="Derrotas" value={`${snapshot.duelLosses}`} />
          <MetricRow icon="🎯" label={METRIC_UI.duelWinRate} value={`${snapshot.duelWinRate}%`} />
          <MetricRow icon="👹" label={METRIC_UI.weeklyBoss} value={`${snapshot.weeklyBossWins}`} />
          <MetricRow icon="✨" label="Duelos impecáveis" value={`${snapshot.duelFlawlessWins}`} />
        </GameCard>
      ) : null}

      {snapshot ? (
        <GameCard variant="default" className="gap-2 border-accent/25">
          <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
            Baralho Vivo
          </Text>
          <MetricRow icon="📒" label="Sessões" value={`${snapshot.flashSessions}`} />
          <MetricRow icon="🃏" label="Cartas revisadas" value={`${snapshot.flashReviews}`} />
          <MetricRow icon="📈" label={METRIC_UI.flashPerSession} value={`${snapshot.avgFlashReviewsPerSession}`} />
          <MetricRow icon="💾" label={METRIC_UI.cardsFromDuel} value={`${snapshot.cardsSavedFromDuel}`} />
        </GameCard>
      ) : null}

      <GameCard>
        <Text className="text-sm font-black text-foreground">{METRIC_UI.logsTitle}</Text>
        <View className="mt-2 gap-2">
          {logs.length === 0 ? (
            <Text className="text-xs text-muted">Nenhuma crônica ainda.</Text>
          ) : (
            logs.map((entry) => (
              <Text key={entry.id} className="text-xs leading-4 text-foreground-secondary">
                · {entry.event} — {entry.message}
              </Text>
            ))
          )}
        </View>
      </GameCard>
    </View>
  );
};
