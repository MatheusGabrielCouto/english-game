import { type ReactNode } from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { GameCard, PressableScale } from '@/components/ui/game';
import { cn } from '@/utils';

export type LearningHeroVariant = 'deck' | 'duel' | 'review' | 'battle' | 'exam';

const heroBorder: Record<LearningHeroVariant, string> = {
  deck: 'border-accent/40 bg-accent/5',
  duel: 'border-primary/40 bg-primary/8',
  review: 'border-gold/40 bg-gold/8',
  battle: 'border-danger/35 bg-danger/5',
  exam: 'border-gold/50 bg-gold/10',
};

type LearningHeroPanelProps = {
  variant?: LearningHeroVariant;
  eyebrow: string;
  headline: string;
  subtitle: string;
  emoji?: string;
  trailing?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const LearningHeroPanel = ({
  variant = 'deck',
  eyebrow,
  headline,
  subtitle,
  emoji,
  trailing,
  children,
  className,
}: LearningHeroPanelProps) => (
  <GameCard variant="hero" glow className={cn('overflow-hidden', heroBorder[variant], className)}>
    <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
    <View className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gold/10" />
    <View className="relative">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </Text>
          {emoji ? <Text className="mt-2 text-4xl">{emoji}</Text> : null}
        </View>
        {trailing}
      </View>
      <Text className="mt-2 text-3xl font-black leading-tight text-foreground">{headline}</Text>
      <Text className="mt-2 text-sm leading-5 text-foreground-secondary">{subtitle}</Text>
      {children ? <View className="mt-4">{children}</View> : null}
    </View>
  </GameCard>
);

export type LearningModeVariant = 'ranked' | 'dojo' | 'boss' | 'deck' | 'review' | 'exam' | 'neutral';

const modeStyles: Record<LearningModeVariant, { box: string; title: string }> = {
  ranked: { box: 'border-primary/45 bg-primary/12', title: 'text-primary' },
  dojo: { box: 'border-border bg-surface-elevated', title: 'text-foreground' },
  boss: { box: 'border-danger/45 bg-danger/10', title: 'text-danger' },
  deck: { box: 'border-accent/45 bg-accent/10', title: 'text-accent' },
  review: { box: 'border-gold/45 bg-gold/10', title: 'text-gold' },
  exam: { box: 'border-gold/50 bg-gold/12', title: 'text-gold' },
  neutral: { box: 'border-border bg-surface', title: 'text-foreground' },
};

type LearningModeTileProps = {
  emoji: string;
  title: string;
  description?: string;
  badge?: string;
  variant?: LearningModeVariant;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
};

export const LearningModeTile = ({
  emoji,
  title,
  description,
  badge,
  variant = 'neutral',
  disabled = false,
  onPress,
  accessibilityLabel,
}: LearningModeTileProps) => {
  const styles = modeStyles[variant];

  const content = (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border px-4 py-3.5',
        styles.box,
        disabled && 'opacity-45',
      )}>
      <View className="h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-background/40">
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className={cn(' font-black', styles.title)}>{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary">{description}</Text>
        ) : null}
      </View>
      {badge ? (
        <View className="rounded-full border border-border bg-background/60 px-2.5 py-1">
          <Text className="text-[10px] font-bold uppercase text-foreground">{badge}</Text>
        </View>
      ) : (
        <Text className="text-lg text-muted">›</Text>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}>
      {content}
    </PressableScale>
  );
};

type LearningProgressHeaderProps = {
  questLabel: string;
  current: number;
  total: number;
  timerLabel?: string;
};

export const LearningProgressHeader = ({
  questLabel,
  current,
  total,
  timerLabel,
}: LearningProgressHeaderProps) => {
  const progress = total > 0 ? Math.min(1, current / total) : 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-black uppercase tracking-[0.18em] text-gold">
          {questLabel}
        </Text>
        {timerLabel ? (
          <Text className="text-xs font-bold text-danger">{timerLabel}</Text>
        ) : (
          <Text className="text-xs font-bold text-muted">
            {current}/{total}
          </Text>
        )}
      </View>
      <View className="h-3 overflow-hidden rounded-full border-2 border-border/80 bg-background/80">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(progress * 100, 4)}%` }}
        />
      </View>
      {total <= 10 ? (
        <View className="flex-row justify-between px-0.5">
          {Array.from({ length: total }).map((_, index) => {
            const segment = index + 1;
            const filled = segment <= current;
            return (
              <View
                key={segment}
                className={cn(
                  'mx-px h-2 flex-1 rounded-full',
                  filled ? 'bg-gold/90' : 'bg-border/60',
                )}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

export type LearningOutcomeVariant = 'victory' | 'defeat' | 'complete' | 'empty';

const outcomeEmoji: Record<LearningOutcomeVariant, string> = {
  victory: '🏆',
  defeat: '💀',
  complete: '✨',
  empty: '📭',
};

const outcomeAccent: Record<LearningOutcomeVariant, string> = {
  victory: 'border-gold/50 bg-gold/10',
  defeat: 'border-danger/40 bg-danger/8',
  complete: 'border-primary/40 bg-primary/10',
  empty: 'border-border bg-surface',
};

type LearningOutcomePanelProps = {
  variant: LearningOutcomeVariant;
  title: string;
  body: string;
  emoji?: string;
  children?: ReactNode;
};

export const LearningOutcomePanel = ({
  variant,
  title,
  body,
  emoji,
  children,
}: LearningOutcomePanelProps) => (
  <View className="gap-5 py-6">
    <GameCard glow className={cn('items-center py-8', outcomeAccent[variant])}>
      <Text className="text-5xl">{emoji ?? outcomeEmoji[variant]}</Text>
      <Text className="mt-4 text-center text-2xl font-black text-foreground">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-foreground-secondary">{body}</Text>
    </GameCard>
    {children ? <View className="gap-2">{children}</View> : null}
  </View>
);

type LearningBattleFrameProps = ViewProps & {
  children: ReactNode;
  label?: string;
};

export const LearningBattleFrame = ({
  children,
  label,
  className,
  ...props
}: LearningBattleFrameProps) => (
  <View
    className={cn(
      'overflow-hidden rounded-2xl border-2 border-primary/25 bg-surface-elevated p-4',
      className,
    )}
    {...props}>
    {label ? (
      <Text className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary">
        {label}
      </Text>
    ) : null}
    {children}
  </View>
);

type LearningSectionHeaderProps = {
  emoji: string;
  title: string;
  hint?: string;
};

export const LearningSectionHeader = ({ emoji, title, hint }: LearningSectionHeaderProps) => (
  <View className="flex-row items-start gap-2 px-0.5">
    <Text className="text-lg">{emoji}</Text>
    <View className="min-w-0 flex-1">
      <Text className="text-sm font-black text-foreground">{title}</Text>
      {hint ? <Text className="mt-0.5 text-xs text-foreground-secondary">{hint}</Text> : null}
    </View>
  </View>
);

export const LEARNING_CHOICE_LETTERS = ['A', 'B', 'C', 'D'] as const;
