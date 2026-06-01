import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';

import { DUEL_UI } from '../constants/duel-ui';
import { DuelHpBar } from './DuelHpBar';

type DuelPlayerBarProps = {
  currentHp: number;
  maxHp: number;
};

export const DuelPlayerBar = ({ currentHp, maxHp }: DuelPlayerBarProps) => (
  <GameCard variant="hero" className="border-primary/35 py-3">
    <View className="flex-row items-center gap-2">
      <View className="h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/15">
        <Text className="text-xl">🛡️</Text>
      </View>
      <Text className="text-sm font-black text-foreground">{DUEL_UI.playerLabel}</Text>
    </View>
    <View className="mt-2">
      <DuelHpBar label={DUEL_UI.playerLabel} current={currentHp} max={maxHp} tone="player" />
    </View>
  </GameCard>
);
