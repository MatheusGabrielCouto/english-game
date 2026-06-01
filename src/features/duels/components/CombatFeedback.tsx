import { Text, View } from 'react-native';

import { cn } from '@/utils';

import { DUEL_UI } from '../constants/duel-ui';
import type { DuelFeedback } from '../store/duel-store';

type CombatFeedbackProps = {
  feedback: DuelFeedback;
};

export const CombatFeedback = ({ feedback }: CombatFeedbackProps) => (
  <View
    className={cn(
      'overflow-hidden rounded-2xl border-2 px-4 py-4',
      feedback.isCorrect ? 'border-gold/50 bg-gold/15' : 'border-danger/50 bg-danger/15',
    )}>
    <Text className="text-center text-3xl">{feedback.isCorrect ? '⚡' : '💥'}</Text>
    <Text
      className={cn(
        'mt-2 text-center text-lg font-black uppercase tracking-wide',
        feedback.isCorrect ? 'text-gold' : 'text-danger',
      )}>
      {feedback.isCorrect ? DUEL_UI.correctFeedback : DUEL_UI.wrongFeedback}
    </Text>
    {feedback.damageDealt != null ? (
      <Text className="mt-2 text-center text-sm font-bold text-foreground">
        {DUEL_UI.damageDealt(feedback.damageDealt)} no inimigo
      </Text>
    ) : null}
    {feedback.damageTaken != null ? (
      <Text className="mt-1 text-center text-sm font-bold text-danger">
        {DUEL_UI.damageTaken(feedback.damageTaken)} em você
      </Text>
    ) : null}
    {!feedback.isCorrect && feedback.hint ? (
      <Text className="mt-3 text-center text-sm leading-5 text-foreground-secondary">
        💡 {feedback.hint}
      </Text>
    ) : null}
  </View>
);
