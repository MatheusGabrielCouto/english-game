import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { DUEL_UI } from '../constants/duel-ui';

type DuelQuestionTimerProps = {
  seconds: number;
  active: boolean;
  onExpire: () => void;
};

export const DuelQuestionTimer = ({ seconds, active, onExpire }: DuelQuestionTimerProps) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds, active]);

  useEffect(() => {
    if (!active || remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [active, remaining, onExpire]);

  if (!active) return null;

  return (
    <View className="items-center">
      <Text
        className={`text-sm font-bold tabular-nums ${remaining <= 5 ? 'text-warning' : 'text-muted'}`}
        accessibilityLabel={DUEL_UI.timerAccessibility(remaining)}
      >
        {DUEL_UI.timerLabel(remaining)}
      </Text>
    </View>
  );
};
