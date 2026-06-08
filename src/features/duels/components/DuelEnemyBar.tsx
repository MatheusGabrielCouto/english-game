import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';

import { DUEL_UI } from '../constants/duel-ui';
import { DuelHpBar } from './DuelHpBar';

type DuelEnemyBarProps = {
  name: string;
  emoji: string;
  currentHp: number;
  maxHp: number;
};

export const DuelEnemyBar = ({ name, emoji, currentHp, maxHp }: DuelEnemyBarProps) => (
  <GameCard variant="danger" className="border-danger/40 py-3">
    <View className="flex-row items-center justify-end gap-2">
      <View className="items-end">
        <Text className="text-[10px] font-black uppercase tracking-widest text-danger">Inimigo</Text>
        <Text className=" font-black text-foreground">{name}</Text>
      </View>
      <View className="h-14 w-14 items-center justify-center rounded-2xl border border-danger/40 bg-danger/10">
        <Text className="text-3xl">{emoji}</Text>
      </View>
    </View>
    <View className="mt-3">
      <DuelHpBar
        label={DUEL_UI.enemyLabel}
        current={currentHp}
        max={maxHp}
        align="right"
        tone="enemy"
      />
    </View>
  </GameCard>
);
