import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card, ProgressBar } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import { routes } from '@/constants/routes';
import { LEGACY_CATEGORY_EMOJI } from '@/features/metagame/constants/collections-catalog';
import { getDaysLeftInSeason, PRESTIGE_TIERS } from '@/features/metagame/constants/metagame-catalog';
import { useMetagameStore } from '@/features/metagame/store/metagame-store';

import { CollectionsSection } from './CollectionsSection';
import { SeasonPointsGuide } from './SeasonPointsGuide';
import { SeasonTierTimeline } from './SeasonTierTimeline';

export const MetagameScreenContent = () => {
  const state = useMetagameStore((s) => s.state);
  const legacy = useMetagameStore((s) => s.legacy);
  const annualGoals = useMetagameStore((s) => s.annualGoals);
  const collections = useMetagameStore((s) => s.collections);
  const currentSeasonTier = useMetagameStore((s) => s.currentSeasonTier);
  const nextSeasonTier = useMetagameStore((s) => s.nextSeasonTier);
  const prestigeTier = useMetagameStore((s) => s.prestigeTier);
  const canPrestige = useMetagameStore((s) => s.canPrestige);
  const seasonTierViews = useMetagameStore((s) => s.seasonTierViews);
  const claimableSeasonTiers = useMetagameStore((s) => s.claimableSeasonTiers);

  if (!state || !collections) return null;

  const seasonProgress = nextSeasonTier
    ? Math.min(100, Math.round((state.seasonPoints / nextSeasonTier.pointsRequired) * 100))
    : 100;

  const daysLeft = getDaysLeftInSeason();
  const completedGoals = annualGoals.filter((goal) => goal.completed).length;

  return (
    <View className="gap-5">
      <GameCard variant="reward" glow>
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-gold">
              🏛️ Temporada {state.seasonKey}
            </Text>
            <Text className="mt-2 text-4xl font-black text-foreground">Tier {currentSeasonTier}</Text>
            <Text className="mt-1 text-sm text-foreground-secondary">
              {state.seasonPoints} pontos · {daysLeft} dias restantes
              {claimableSeasonTiers > 0
                ? ` · ${claimableSeasonTiers} recompensa(s) para resgatar`
                : ''}
            </Text>
          </View>
          <View className="rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2">
            <Text className="text-center text-[10px] font-bold uppercase text-gold">Prestígio</Text>
            <Text className="text-center text-2xl font-black text-foreground">{state.prestigeLevel}</Text>
          </View>
        </View>

        {nextSeasonTier ? (
          <View className="mt-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-muted">Próxima recompensa</Text>
              <Text className="text-xs font-bold text-gold">{nextSeasonTier.rewardLabel}</Text>
            </View>
            <ProgressBar value={seasonProgress} variant="gold" height="md" showLabel />
            <Text className="mt-1 text-[10px] text-muted">
              Faltam {Math.max(0, nextSeasonTier.pointsRequired - state.seasonPoints)} pts
            </Text>
          </View>
        ) : (
          <Text className="mt-4 text-sm font-semibold text-success">Temporada no tier máximo! 🎉</Text>
        )}

        <SeasonTierTimeline tiers={seasonTierViews} seasonPoints={state.seasonPoints} />

        <SeasonPointsGuide />
      </GameCard>

      <CollectionsSection collections={collections} />

      <Card elevated>
        <Text className="text-xs font-bold uppercase tracking-widest text-muted">🎯 Objetivos Anuais</Text>
        <View className="mt-3 flex-row gap-2">
          <StatPill
            label="Concluídos"
            value={completedGoals}
            emoji="✅"
            tone="success"
            className="flex-1"
          />
          <StatPill
            label="Em progresso"
            value={annualGoals.length - completedGoals}
            emoji="⏳"
            tone="accent"
            className="flex-1"
          />
        </View>

        <View className="mt-4 gap-4">
          {annualGoals.map((goal) => (
            <View
              key={goal.key}
              className={goal.completed ? 'rounded-xl border border-success/30 bg-success/5 p-3' : ''}>
              <View className="mb-1.5 flex-row items-center justify-between">
                <Text className="flex-1 text-sm font-semibold text-foreground">
                  {goal.icon} {goal.name}
                </Text>
                <Text className="text-xs font-bold text-muted">
                  {goal.current}/{goal.target}
                </Text>
              </View>
              <Text className="mb-2 text-xs text-foreground-secondary">{goal.description}</Text>
              <ProgressBar
                value={goal.percentage}
                variant={goal.completed ? 'streak' : 'xp'}
                height="sm"
                showLabel={goal.percentage >= 15}
              />
            </View>
          ))}
        </View>
      </Card>

      <GameCard variant="hero" className="border-accent/30">
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">⭐ Prestígio</Text>
        <Text className="mt-2 text-sm leading-6 text-foreground-secondary">
          Marcos de longo prazo com recompensas exclusivas e bônus permanentes — sem perder seu progresso atual.
        </Text>

        <View className="mt-4 flex-row gap-2">
          <StatPill label="Nível" value={state.prestigeLevel} emoji="🌟" tone="gold" />
          {prestigeTier ? (
            <StatPill label="Próximo" value={prestigeTier.name.split(' ')[0]} emoji="🚀" tone="primary" />
          ) : null}
        </View>

        {prestigeTier ? (
          <Text className="mt-3 text-xs text-muted">
            Recompensa: {prestigeTier.rewardLabel}
          </Text>
        ) : null}

        {canPrestige && state.prestigeLevel < PRESTIGE_TIERS.length ? (
          <View className="mt-4 gap-2">
            <Button
              label="Iniciar ascensão"
              onPress={() => router.push(routes.prestige as Href)}
            />
            <Button
              label="Ver tela completa de Prestígio"
              variant="secondary"
              onPress={() => router.push(routes.prestige as Href)}
            />
          </View>
        ) : (
          <View className="mt-4">
            <Button
              label="Explorar Roadmap de Prestígio"
              variant="secondary"
              onPress={() => router.push(routes.prestige as Href)}
            />
          </View>
        )}
      </GameCard>

      <Card elevated>
        <Text className="text-xs font-bold uppercase tracking-widest text-muted">📖 Legado</Text>
        <Text className="mt-1 text-sm text-foreground-secondary">
          Marcos permanentes da sua história no English Quest
        </Text>

        {legacy.length === 0 ? (
          <View className="mt-4 rounded-xl border border-dashed border-border px-4 py-6">
            <Text className="text-center text-sm text-muted">
              Sua história será registrada conforme você progride.
            </Text>
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {legacy.map((milestone, index) => (
              <View
                key={milestone.milestoneKey}
                className="flex-row gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <Text className="text-lg">
                    {LEGACY_CATEGORY_EMOJI[milestone.category] ?? '📌'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">{milestone.title}</Text>
                  <Text className="text-xs text-foreground-secondary">{milestone.description}</Text>
                  <Text className="mt-1 text-[10px] text-muted">
                    {new Date(milestone.occurredAt).toLocaleDateString('pt-BR')}
                    {index === 0 ? ' · Mais recente' : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
};
