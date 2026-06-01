import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';

import { DUEL_PROGRESSION_CONFIG } from '../constants/duel-progression-config';
import { DUEL_UI } from '../constants/duel-ui';
import type { DuelProfileView } from '../services/duel-profile-service';

type DuelStaminaCardProps = {
  profile: DuelProfileView;
};

export const DuelStaminaCard = ({ profile }: DuelStaminaCardProps) => {
  const staminaRatio = profile.staminaCap > 0 ? profile.stamina / profile.staminaCap : 0;

  return (
    <GameCard variant="quest" className="border-primary/30">
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          {DUEL_UI.staminaTitle}
        </Text>
        <Text className="text-xl">⚡</Text>
      </View>
      <Text className="mt-2 text-3xl font-black text-foreground">
        {DUEL_UI.staminaLine(profile.stamina, profile.staminaCap)}
      </Text>
      <View className="mt-3 h-2.5 overflow-hidden rounded-full border border-border bg-background/80">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(staminaRatio * 100, 4)}%` }}
        />
      </View>
      <Text className="mt-2 text-xs text-foreground-secondary">
        {DUEL_UI.dailyRankedLine(profile.dailyDuelCount, DUEL_PROGRESSION_CONFIG.dailyRankedCap)}
      </Text>
      {profile.nextStaminaRegenAt ? (
        <Text className="mt-1 text-xs font-semibold text-gold">
          {DUEL_UI.nextStaminaRegen(profile.nextStaminaRegenAt)}
        </Text>
      ) : null}
      <Text className="mt-2 text-[10px] text-muted">{DUEL_UI.staminaRegenHint}</Text>
    </GameCard>
  );
};
