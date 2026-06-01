import { type Href, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components';
import { routes, theme } from '@/constants';

import {
    LearningOutcomePanel,
    LearningProgressHeader,
} from '@/features/learning/components/ui';
import { DUEL_PROGRESSION_CONFIG } from '../constants/duel-progression-config';
import { DUEL_UI } from '../constants/duel-ui';
import { DuelCombatService } from '../services/duel-combat-service';
import { DuelPatentService } from '../services/duel-patent-service';
import { DuelService } from '../services/duel-service';
import { getPlayerMaxHp, useDuelStore } from '../store/duel-store';
import { McqQuestionCard } from './McqQuestionCard';

export const PatentExamContent = () => {
  const setBattle = useDuelStore((s) => s.setBattle);
  const resetBattle = useDuelStore((s) => s.resetBattle);
  const profileView = useDuelStore((s) => s.profileView);

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof DuelService.startSession>>['questions']>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const startedAt = useRef(Date.now());

  const patent = profileView?.currentPatent ?? 'tourist';

  useEffect(() => {
    if (!DuelPatentService.canTakePatentExam(patent)) {
      router.replace(routes.duels as Href);
      return;
    }

    void (async () => {
      try {
        const started = await DuelService.startSession({ mode: 'patent_exam' });
        setSessionId(started.session.id);
        setQuestions(started.questions);
        setBattle({
          sessionId: started.session.id,
          enemyKey: started.session.enemyKey,
          enemyName: started.enemyName,
          enemyEmoji: started.enemyEmoji,
          patent: started.session.patentAtStart,
          mode: 'patent_exam',
          playerMaxHp: getPlayerMaxHp(),
          enemyMaxHp: 1,
          questions: started.questions,
          combat: DuelCombatService.createInitialState(getPlayerMaxHp(), 1),
          questionIndex: 0,
        });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      resetBattle();
    };
  }, [patent, resetBattle, setBattle]);

  const current = questions[index] ?? null;

  const handleConfirm = useCallback(async () => {
    if (!sessionId || !current || selectedIndex === null || submitting || finished) return;

    setSubmitting(true);
    const isCorrect = current.prompt.correctIndex === selectedIndex;
    if (isCorrect) {
      setCorrectCount((value) => value + 1);
    }

    const responseMs = Date.now() - startedAt.current;
    await DuelService.answerQuestion({
      sessionId,
      questionId: current.id,
      selectedIndex,
      responseMs,
      combat: DuelCombatService.createInitialState(getPlayerMaxHp(), 1),
    });

    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      const result = await DuelService.finishSession(
        sessionId,
        'won',
        DuelCombatService.createInitialState(getPlayerMaxHp(), 1),
      );
      const didPass = result.session.status === 'won';
      setPassed(didPass);
      setFinished(true);
    } else {
      setIndex(nextIndex);
      setSelectedIndex(null);
      startedAt.current = Date.now();
    }

    setSubmitting(false);
  }, [sessionId, current, selectedIndex, submitting, finished, index, questions.length]);

  const handleBack = useCallback(() => {
    resetBattle();
    router.replace(routes.duels as Href);
  }, [resetBattle]);

  if (loading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (finished) {
    return (
      <LearningOutcomePanel
        variant={passed ? 'victory' : 'defeat'}
        title={passed ? DUEL_UI.examPass : DUEL_UI.examFail}
        body={DUEL_UI.examScore(correctCount, DUEL_PROGRESSION_CONFIG.patentExamQuestionCount)}
        emoji={passed ? '📜' : '📋'}>
        <Button label={DUEL_UI.backToArena} onPress={handleBack} />
      </LearningOutcomePanel>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <View className="gap-5">
      <LearningProgressHeader
        questLabel="Prova de patente"
        current={index + 1}
        total={questions.length}
      />

      <McqQuestionCard
        prompt={current.prompt}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        disabled={submitting}
      />

      <Button
        label="Confirmar resposta"
        onPress={() => void handleConfirm()}
        disabled={selectedIndex === null}
        loading={submitting}
        loadingLabel="Salvando…"
      />
    </View>
  );
};
