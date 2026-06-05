import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card, EmptyState } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/utils';

type Tone = 'default' | 'primary' | 'amber' | 'emerald' | 'sky' | 'violet';

const toneBorder: Record<Tone, string> = {
  default: 'border-border',
  primary: 'border-primary/35',
  amber: 'border-amber-500/40',
  emerald: 'border-emerald-500/40',
  sky: 'border-sky-500/40',
  violet: 'border-violet-500/40',
};

const toneText: Record<Tone, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  amber: 'text-amber-300',
  emerald: 'text-emerald-300',
  sky: 'text-sky-300',
  violet: 'text-violet-300',
};

export const PetFarmStatPill = ({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: Tone;
}) => (
  <View
    className={cn(
      'min-w-[30%] flex-1 rounded-xl border bg-surface px-2.5 py-2',
      toneBorder[tone],
    )}>
    <Text className="text-[9px] font-bold uppercase tracking-wide text-muted">{label}</Text>
    <Text className={cn('text-sm font-black', toneText[tone])}>{value}</Text>
  </View>
);

export const PetFarmCardHeader = ({
  emoji,
  title,
  badge,
}: {
  emoji?: string;
  title: string;
  badge?: string;
}) => (
  <View className="flex-row items-center justify-between gap-2">
    <View className="flex-1 flex-row items-center gap-2">
      {emoji ? <Text className="text-lg">{emoji}</Text> : null}
      <Text className="text-sm font-bold text-foreground">{title}</Text>
    </View>
    {badge ? (
      <View className="rounded-full bg-primary/15 px-2.5 py-0.5">
        <Text className="text-[10px] font-bold text-primary">{badge}</Text>
      </View>
    ) : null}
  </View>
);

export const PetFarmSectionHint = ({ children }: { children: string }) => (
  <Text className="text-[10px] leading-relaxed text-muted">{children}</Text>
);

/** @deprecated Use `<EmptyState variant="farm" />` from `@/components`. */
export const PetFarmEmptyState = ({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) => <EmptyState variant="farm" emoji={emoji} title={title} description={subtitle} />;

export const PetFarmAlertCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) => (
  <Card className="gap-3 border-primary/35 bg-primary/10">
    <View className="flex-row items-start gap-2">
      <Text className="text-base">✨</Text>
      <View className="flex-1 gap-1">
        <Text className="text-sm font-bold text-foreground">{title}</Text>
        {subtitle ? <Text className="text-xs text-muted">{subtitle}</Text> : null}
      </View>
    </View>
    {children}
  </Card>
);

export const PetFarmCapacityBar = ({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) => {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  const full = used >= max;

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-bold text-muted">{label}</Text>
        <Text className={cn('text-[10px] font-bold', full ? 'text-amber-300' : 'text-primary')}>
          {used} / {max}
        </Text>
      </View>
      <ProgressBar
        value={pct}
        max={100}
        height="sm"
        variant={full ? 'gold' : 'xp'}
        animated={false}
        accessibilityLabel={`${label} ${used} de ${max}`}
      />
    </View>
  );
};

export const PetFarmPrimaryCta = ({
  label,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) => (
  <PressableScale
    onPress={onPress}
    disabled={disabled}
    className="items-center rounded-2xl bg-primary py-3.5"
    style={{ opacity: disabled ? 0.45 : 1 } as StyleProp<ViewStyle>}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ disabled: !!disabled }}>
    <Text className="text-sm font-black text-background">{label}</Text>
  </PressableScale>
);

export const PetFarmSecondaryCta = ({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) => (
  <PressableScale
    onPress={onPress}
    className="items-center rounded-2xl border border-border bg-surface-elevated py-3"
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? label}>
    <Text className="text-sm font-bold text-foreground">{label}</Text>
  </PressableScale>
);

export const PetFarmNavTile = ({
  emoji,
  title,
  subtitle,
  onPress,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) => (
  <PressableScale
    onPress={onPress}
    className="flex-1 flex-row items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-3 py-3"
    accessibilityRole="button"
    accessibilityLabel={title}>
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface">
      <Text className="text-xl">{emoji}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-xs font-bold text-foreground">{title}</Text>
      {subtitle ? <Text className="text-[10px] text-muted">{subtitle}</Text> : null}
    </View>
    <Text className="text-lg text-muted">›</Text>
  </PressableScale>
);

export const PetFarmFeedback = ({ message }: { message: string }) => (
  <View className="rounded-xl border border-border bg-surface px-3 py-2">
    <Text className="text-center text-xs text-foreground-secondary">{message}</Text>
  </View>
);

export const PetFarmStepRow = ({
  steps,
}: {
  steps: { label: string; done: boolean; active: boolean }[];
}) => (
  <View className="flex-row gap-2">
    {steps.map((step) => (
      <View
        key={step.label}
        className={cn(
          'flex-1 items-center rounded-xl border px-1 py-2',
          step.active
            ? 'border-primary bg-primary/15'
            : step.done
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-border bg-surface',
        )}>
        <Text
          className={cn(
            'text-[9px] font-bold',
            step.active ? 'text-primary' : step.done ? 'text-emerald-300' : 'text-muted',
          )}>
          {step.label}
        </Text>
      </View>
    ))}
  </View>
);
