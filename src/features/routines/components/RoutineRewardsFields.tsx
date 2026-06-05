import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { RoutineCategoryValue, RoutineFrequencyValue } from '@/types/routine';
import { haptics } from '@/utils';

import { resolveRoutineRewards } from '../constants/routine-rewards';
import { ROUTINE_UI } from '../constants/routine-ui';
import {
  validateOptionalDuration,
  validateOptionalReward,
} from '../utils/routine-form-input';
import { RoutineFormNumberField } from './RoutineFormNumberField';

type RoutineRewardsFieldsProps = {
  category: RoutineCategoryValue;
  frequency: RoutineFrequencyValue;
  customXp: string;
  customCoins: string;
  expectedDurationMin: string;
  onChangeXp: (value: string) => void;
  onChangeCoins: (value: string) => void;
  onChangeDuration: (value: string) => void;
  rewardsPairError?: string | null;
  forceShowError?: boolean;
};

export const RoutineRewardsFields = ({
  category,
  frequency,
  customXp,
  customCoins,
  expectedDurationMin,
  onChangeXp,
  onChangeCoins,
  onChangeDuration,
  rewardsPairError,
  forceShowError = false,
}: RoutineRewardsFieldsProps) => {
  const defaultRewards = useMemo(
    () =>
      resolveRoutineRewards({
        category,
        frequency,
        customXp: null,
        customCoins: null,
      }),
    [category, frequency],
  );

  const hasCustom = customXp.trim().length > 0 || customCoins.trim().length > 0;

  const handleUseDefaults = () => {
    haptics.press();
    onChangeXp('');
    onChangeCoins('');
  };

  const handleFillDefaults = () => {
    haptics.press();
    onChangeXp(String(defaultRewards.xp));
    onChangeCoins(String(defaultRewards.coins));
  };

  return (
    <View className="gap-4">
      <View className="rounded-2xl border border-border bg-surface-elevated px-3.5 py-3">
        <Text className="text-xs font-bold uppercase tracking-wider text-primary">
          {ROUTINE_UI.rewardsDefaultTitle}
        </Text>
        <Text className="mt-1 text-xs leading-4 text-foreground-secondary">
          {ROUTINE_UI.rewardsDefaultHint}
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <RewardPill emoji="✨" label={`${defaultRewards.xp} XP`} />
          <RewardPill emoji="🪙" label={`${defaultRewards.coins} moedas`} />
          <RewardPill emoji="📚" label={`${defaultRewards.studyPoints} pts estudo`} />
        </View>
      </View>

      <View>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-foreground">{ROUTINE_UI.rewardsCustomTitle}</Text>
          {hasCustom ? (
            <Pressable
              onPress={handleUseDefaults}
              accessibilityRole="button"
              accessibilityLabel={ROUTINE_UI.rewardsClearCustom}>
              <Text className="text-xs font-bold text-primary">{ROUTINE_UI.rewardsClearCustom}</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleFillDefaults}
              accessibilityRole="button"
              accessibilityLabel={ROUTINE_UI.rewardsFillDefaults}>
              <Text className="text-xs font-bold text-primary">{ROUTINE_UI.rewardsFillDefaults}</Text>
            </Pressable>
          )}
        </View>
        <Text className="mt-1 text-xs leading-4 text-foreground-secondary">
          {ROUTINE_UI.rewardsCustomHint}
        </Text>

        {rewardsPairError ? (
          <Text className="mt-2 text-xs text-danger" accessibilityLiveRegion="polite">
            {rewardsPairError}
          </Text>
        ) : null}

        <View className="mt-3 gap-4">
          <RoutineFormNumberField
            label={ROUTINE_UI.customXpLabel}
            hint={ROUTINE_UI.customXpHint}
            value={customXp}
            onChange={onChangeXp}
            validate={(v) => validateOptionalReward(v, 'xp')}
            placeholder={String(defaultRewards.xp)}
            maxDigits={3}
            suffix={ROUTINE_UI.customXpSuffix}
            forceShowError={forceShowError}
          />
          <RoutineFormNumberField
            label={ROUTINE_UI.customCoinsLabel}
            hint={ROUTINE_UI.customCoinsHint}
            value={customCoins}
            onChange={onChangeCoins}
            validate={(v) => validateOptionalReward(v, 'coins')}
            placeholder={String(defaultRewards.coins)}
            maxDigits={3}
            suffix={ROUTINE_UI.customCoinsSuffix}
            forceShowError={forceShowError}
          />
          <RoutineFormNumberField
            label={ROUTINE_UI.durationLabel}
            hint={ROUTINE_UI.durationHint}
            value={expectedDurationMin}
            onChange={onChangeDuration}
            validate={validateOptionalDuration}
            placeholder={ROUTINE_UI.durationPlaceholder}
            maxDigits={3}
            suffix={ROUTINE_UI.durationSuffix}
            optionalDefaultHint={ROUTINE_UI.durationDefaultHint}
            forceShowError={forceShowError}
          />
        </View>
      </View>
    </View>
  );
};

const RewardPill = ({ emoji, label }: { emoji: string; label: string }) => (
  <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1">
    <Text className="text-sm">{emoji}</Text>
    <Text className="text-xs font-semibold text-foreground">{label}</Text>
  </View>
);
