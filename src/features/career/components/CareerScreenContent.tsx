import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { usePlayerStore } from '@/features/player';
import { cn } from '@/utils';
import { CAREER_ROLES } from '../constants/career-catalog';
import { useCareerStore } from '../store/career-store';

export const CareerScreenContent = () => {
  const journey = useCareerStore((state) => state.journey);
  const interviews = useCareerStore((state) => state.interviews);
  const dreams = useCareerStore((state) => state.dreams);
  const offers = useCareerStore((state) => state.offers);
  const events = useCareerStore((state) => state.events);
  const level = usePlayerStore((state) => state.level);

  if (!journey) return null;

  const roleProgress =
    journey.nextRole && journey.levelsUntilNext !== null
      ? Math.min(
          100,
          Math.round(
            ((level - journey.currentRole.requiredLevel) /
              (journey.nextRole.requiredLevel - journey.currentRole.requiredLevel)) *
              100,
          ),
        )
      : 100;

  return (
    <View className="gap-4">
      <GameCard variant="hero" glow>
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">💼 Career Journey</Text>
        <View className="mt-3 flex-row items-center gap-4">
          <Text className="text-5xl">{journey.currentRole.icon}</Text>
          <View className="flex-1">
            <Text className="text-2xl font-black text-foreground">{journey.currentRole.name}</Text>
            <Text className="text-sm text-foreground-secondary">{journey.currentCompany.icon} {journey.currentCompany.name}</Text>
            <Text className="mt-1 text-xs text-muted">{journey.currentRole.description}</Text>
          </View>
        </View>
        {journey.nextRole ? (
          <View className="mt-4">
            <Text className="mb-1 text-xs text-muted">Próxima promoção: {journey.nextRole.name}</Text>
            <ProgressBar value={roleProgress} variant="xp" height="md" showLabel />
          </View>
        ) : null}
        <Text className="mt-3 text-xs text-accent">{journey.promotionsCount} promoções · English score {journey.englishScore}</Text>
      </GameCard>

      <Card elevated>
        <Text className="mb-3  font-bold text-foreground">🗺️ Trilha de Carreira</Text>
        <View className="gap-2">
          {CAREER_ROLES.map((role) => {
            const unlocked = level >= role.requiredLevel;
            const isCurrent = journey.currentRole.key === role.key;
            return (
              <View
                key={role.key}
                className={cn(
                  'flex-row items-center gap-3 rounded-xl border px-3 py-2',
                  isCurrent ? 'border-primary bg-primary/10' : 'border-border bg-surface',
                  !unlocked && 'opacity-40',
                )}>
                <Text className="text-xl">{role.icon}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{role.name}</Text>
                  <Text className="text-[10px] text-muted">Nível {role.requiredLevel}</Text>
                </View>
                {isCurrent ? <Text className="text-xs font-bold text-primary">Atual</Text> : null}
                {unlocked && !isCurrent ? <Text className="text-xs text-success">✓</Text> : null}
              </View>
            );
          })}
        </View>
      </Card>

      <Card elevated>
        <Text className="mb-3  font-bold text-foreground">🎤 Entrevistas</Text>
        <View className="gap-3">
          {interviews.map((interview) => (
            <View key={interview.key} className="rounded-xl border border-border bg-surface p-4">
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">{interview.icon}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-foreground">{interview.name}</Text>
                  <Text className="text-xs text-foreground-secondary">{interview.description}</Text>
                </View>
                <Text className={cn('text-xs font-bold', interview.completed ? 'text-success' : 'text-muted')}>
                  {interview.completed ? '✓' : `Nv.${interview.requiredLevel}`}
                </Text>
              </View>
              {!interview.completed && level >= interview.requiredLevel ? (
                <View className="mt-3">
                  <ProgressBar
                    value={interview.target > 0 ? (interview.progress / interview.target) * 100 : 0}
                    variant="default"
                    height="sm"
                    label={`${interview.progress}/${interview.target} missões career`}
                    showLabel
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Card>

      <Card elevated>
        <Text className="mb-3  font-bold text-foreground">📩 Ofertas de Trabalho</Text>
        <View className="gap-3">
          {offers.map((offer) => (
            <View
              key={offer.key}
              className={cn(
                'rounded-xl border p-4',
                offer.unlocked ? 'border-success/40 bg-success/10' : 'border-border bg-surface',
              )}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">{offer.icon}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-foreground">{offer.name}</Text>
                  <Text className="text-xs text-accent">{offer.salaryLabel}</Text>
                  <Text className="text-xs text-foreground-secondary">{offer.description}</Text>
                </View>
                <Text className="text-xs font-bold text-muted">
                  {offer.unlocked ? 'Desbloqueada' : offer.eligible ? 'Elegível' : 'Bloqueada'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card elevated accent>
        <Text className="mb-3  font-bold text-foreground">🌟 Sistema de Sonhos</Text>
        <View className="gap-3">
          {dreams.map((dream) => (
            <View key={dream.key} className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">{dream.icon}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">{dream.name}</Text>
                  <Text className="text-xs text-foreground-secondary">{dream.description}</Text>
                </View>
                <Text className="text-xs font-bold text-primary">{dream.percentage}%</Text>
              </View>
              <ProgressBar value={dream.percentage} variant="gold" height="sm" animated={false} />
            </View>
          ))}
        </View>
      </Card>

      {events.length > 0 ? (
        <Card elevated>
          <Text className="mb-3  font-bold text-foreground">📜 Histórico de Carreira</Text>
          <View className="gap-2">
            {events.slice(0, 8).map((event) => (
              <View key={event.id} className="rounded-lg border border-border px-3 py-2">
                <Text className="text-sm font-semibold text-foreground">{event.title}</Text>
                <Text className="text-xs text-muted">{new Date(event.occurredAt).toLocaleDateString('pt-BR')}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </View>
  );
};
