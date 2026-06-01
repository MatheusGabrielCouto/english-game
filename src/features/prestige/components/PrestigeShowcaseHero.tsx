import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import type { PrestigeTierDefinition } from '@/types/prestige';
import { cn } from '@/utils';

import { PRESTIGE_ASCENSION_COPY } from '../constants/prestige-ascension';

const TIER_EMBLEM: Record<number, string> = {
  0: '🌱',
  1: '⚔️',
  2: '🌐',
  3: '🔥',
  4: '👑',
  5: '🏛️',
};

type PrestigeShowcaseHeroProps = {
  prestigeLevel: number;
  currentTier: PrestigeTierDefinition | null;
  nextTier: PrestigeTierDefinition | null;
  playerLevel: number;
  currentStreak: number;
  levelProgress: number;
  canAscend: boolean;
  maxPrestige: boolean;
  onStartAscension: () => void;
};

export const PrestigeShowcaseHero = ({
  prestigeLevel,
  currentTier,
  nextTier,
  playerLevel,
  currentStreak,
  levelProgress,
  canAscend,
  maxPrestige,
  onStartAscension,
}: PrestigeShowcaseHeroProps) => {
  const emblem = TIER_EMBLEM[prestigeLevel] ?? '⭐';

  return (
    <GameCard variant="reward" glow className="items-center border-gold/30 py-8">
      <View
        className={cn(
          'mb-4 h-28 w-28 items-center justify-center rounded-full border-4',
          canAscend ? 'border-gold bg-gold/20' : 'border-primary/40 bg-primary/10',
        )}>
        <Text className="text-5xl">{emblem}</Text>
      </View>

      <Text className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Prestígio</Text>
      <Text className="mt-2 text-center text-3xl font-black text-foreground">
        {prestigeLevel > 0 ? currentTier?.name ?? `Nível ${prestigeLevel}` : 'Iniciante'}
      </Text>
      <Text className="mt-1 text-center text-sm text-foreground-secondary">
        {prestigeLevel > 0
          ? `Marco ${currentTier?.roman ?? prestigeLevel} · Run #${prestigeLevel + 1}`
          : 'Nenhuma ascensão ainda — sua jornada começa aqui'}
      </Text>

      <View className="mt-5 w-full flex-row gap-2">
        <StatPill label="Nível" value={playerLevel} emoji="📈" tone="primary" className="flex-1" />
        <StatPill label="Streak" value={currentStreak} emoji="🔥" tone="success" className="flex-1" />
      </View>

      {nextTier && !maxPrestige ? (
        <View className="mt-6 w-full rounded-2xl border border-gold/25 bg-gold/5 px-4 py-4">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-gold">Próximo portal</Text>
          <Text className="mt-1 text-lg font-black text-foreground">
            {nextTier.roman} · {nextTier.name}
          </Text>
          <Text className="mt-1 text-xs text-muted">Requer nível {nextTier.requiredPlayerLevel}</Text>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-surface-elevated">
            <View className="h-full rounded-full bg-gold" style={{ width: `${levelProgress}%` }} />
          </View>
          <Text className="mt-1.5 text-[10px] text-muted">
            {playerLevel} / {nextTier.requiredPlayerLevel} níveis
          </Text>
        </View>
      ) : null}

      {canAscend && nextTier ? (
        <View className="mt-5 w-full">
          <Button label={PRESTIGE_ASCENSION_COPY.cta} onPress={onStartAscension} />
          <Text className="mt-2 text-center text-[10px] leading-4 text-warning">
            Ascensão reinicia nível e XP. Você escolhe um sacrifício extra. Streak protegida.
          </Text>
        </View>
      ) : null}

      {maxPrestige ? (
        <Text className="mt-4 text-center text-sm font-semibold text-success">
          Prestígio máximo — lenda do English Quest
        </Text>
      ) : null}
    </GameCard>
  );
};
