import { type Href, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button } from '@/components';
import { routes } from '@/constants';
import { FlashDeckService } from '@/features/flash-deck/services/flash-deck-service';
import { AudioDirector } from '@/services/audio';
import { haptics } from '@/utils/haptics';

import {
    LearningOutcomePanel,
    LearningProgressHeader,
} from '@/features/learning/components/ui';
import { LearningAnalyticsService } from '@/features/learning/services/learning-analytics-service';
import { DUEL_COMBAT_CONFIG } from '../constants/duel-combat-config';
import { DUEL_UI } from '../constants/duel-ui';
import { DuelCombatService } from '../services/duel-combat-service';
import type { DuelBattleQuestion } from '../services/duel-service';
import { DuelService } from '../services/duel-service';
import { getPlayerMaxHp, useDuelStore } from '../store/duel-store';
import { resolveQuestionTimeLimitSec } from '../utils/duel-timer';
import { CombatFeedback } from './CombatFeedback';
import { DuelEnemyBar } from './DuelEnemyBar';
import { DuelPlayerBar } from './DuelPlayerBar';
import { DuelQuestionTimer } from './DuelQuestionTimer';
import { DuelSaveCardModal } from './DuelSaveCardModal';
import { McqQuestionCard } from './McqQuestionCard';

type SaveCardPrompt = {
  front: string;
  back: string;
};

const resolveSaveCardPayload = (question: DuelBattleQuestion): SaveCardPrompt | null => {
  const front = (question.lemma ?? question.prompt.stem).trim();
  const back = question.prompt.choices[question.prompt.correctIndex]?.trim() ?? '';
  if (!front || !back) return null;
  return { front, back };
};

const canSuggestFlashCard = (mode: string | undefined): boolean =>
  mode === 'ranked' || mode === 'dojo' || mode === 'card_duel';

export const DuelBattleContent = () => {
  const battle = useDuelStore((s) => s.battle);
  const feedback = useDuelStore((s) => s.feedback);
  const result = useDuelStore((s) => s.result);
  const isSubmitting = useDuelStore((s) => s.isSubmitting);
  const setCombat = useDuelStore((s) => s.setCombat);
  const setQuestionIndex = useDuelStore((s) => s.setQuestionIndex);
  const setFeedback = useDuelStore((s) => s.setFeedback);
  const setResult = useDuelStore((s) => s.setResult);
  const setSubmitting = useDuelStore((s) => s.setSubmitting);
  const resetBattle = useDuelStore((s) => s.resetBattle);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [saveCardPrompt, setSaveCardPrompt] = useState<SaveCardPrompt | null>(null);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const questionStartedAt = useRef(Date.now());

  const isRematch = battle?.mode === 'rematch_review';
  const pauseAutoAdvance = saveCardPrompt != null;
  const questionTimeLimit =
    battle && !isRematch && battle.mode !== 'patent_exam'
      ? resolveQuestionTimeLimitSec(battle.patent)
      : null;
  const showCombatBars = battle != null && !isRematch;

  useEffect(() => {
    if (!battle && !result) {
      router.replace(routes.duels as Href);
    }
  }, [battle, result]);

  useEffect(() => {
    setSelectedIndex(null);
    questionStartedAt.current = Date.now();
  }, [battle?.questionIndex]);

  const currentQuestion = battle?.questions[battle.questionIndex] ?? null;

  const finishBattle = useCallback(
    async (status: 'won' | 'lost') => {
      if (!battle) return;

      const finished = await DuelService.finishSession(battle.sessionId, status, battle.combat);
      setResult(finished);
    },
    [battle, setResult],
  );

  const advanceAfterFeedback = useCallback(async () => {
    const snapshot = useDuelStore.getState().battle;
    if (!snapshot) return;

    setFeedback(null);

    if (snapshot.mode === 'rematch_review') {
      const nextIndex = snapshot.questionIndex + 1;
      if (nextIndex >= snapshot.questions.length) {
        await finishBattle('won');
        return;
      }
      setQuestionIndex(nextIndex);
      return;
    }

    if (snapshot.combat.enemyHp <= 0) {
      await finishBattle('won');
      return;
    }

    if (snapshot.combat.playerHp <= 0) {
      await finishBattle('lost');
      return;
    }

    const nextIndex = snapshot.questionIndex + 1;
    if (nextIndex >= snapshot.questions.length) {
      if (snapshot.combat.enemyHp <= 0) {
        await finishBattle('won');
      } else if (snapshot.combat.playerHp <= 0) {
        await finishBattle('lost');
      } else {
        await finishBattle('won');
      }
      return;
    }

    setQuestionIndex(nextIndex);
  }, [finishBattle, setFeedback, setQuestionIndex]);

  useEffect(() => {
    if (!feedback || pauseAutoAdvance) return;

    const timer = setTimeout(() => {
      void advanceAfterFeedback();
    }, DUEL_COMBAT_CONFIG.feedbackMs);

    return () => clearTimeout(timer);
  }, [feedback, advanceAfterFeedback, pauseAutoAdvance]);

  const submitAnswer = useCallback(
    async (choiceIndex: number) => {
      if (!battle || !currentQuestion || isSubmitting || feedback) return;

      setSubmitting(true);
      try {
        const responseMs = Date.now() - questionStartedAt.current;
        const answer = await DuelService.answerQuestion({
          sessionId: battle.sessionId,
          questionId: currentQuestion.id,
          selectedIndex: choiceIndex,
          responseMs,
          combat: battle.combat,
        });

        setCombat(answer.combat);

        if (answer.isCorrect) {
          void haptics.success();
          void AudioDirector.playSFX('xp_tick', { family: 'xp' });
          if (answer.isCritical) {
            void haptics.impact();
          }
        } else {
          void haptics.warning();
          void AudioDirector.playSFX('streak_break_wind', { family: 'streak_break' });
          if (canSuggestFlashCard(battle.mode)) {
            const payload = resolveSaveCardPayload(currentQuestion);
            if (payload) setSaveCardPrompt(payload);
          }
        }

        setFeedback({
          isCorrect: answer.isCorrect,
          hint: answer.hint,
          damageDealt: answer.damageDealt,
          damageTaken: answer.damageTaken,
        });

        if (!isRematch && answer.status === 'won') {
          setTimeout(() => void finishBattle('won'), DUEL_COMBAT_CONFIG.feedbackMs);
        } else if (!isRematch && answer.status === 'lost') {
          setTimeout(() => void finishBattle('lost'), DUEL_COMBAT_CONFIG.feedbackMs);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [
      battle,
      currentQuestion,
      isSubmitting,
      feedback,
      isRematch,
      setSubmitting,
      setCombat,
      setFeedback,
      finishBattle,
    ],
  );

  const handleTimeout = useCallback(() => {
    if (!currentQuestion || selectedIndex !== null || feedback) return;
    const wrongIndex =
      currentQuestion.prompt.choices.findIndex(
        (_, index) => index !== currentQuestion.prompt.correctIndex,
      ) ?? 0;
    void submitAnswer(wrongIndex >= 0 ? wrongIndex : 0);
  }, [currentQuestion, selectedIndex, feedback, submitAnswer]);

  const handleConfirm = useCallback(async () => {
    if (!battle || !currentQuestion || selectedIndex === null || isSubmitting || feedback) {
      return;
    }

    await submitAnswer(selectedIndex);
  }, [battle, currentQuestion, selectedIndex, isSubmitting, feedback, submitAnswer]);

  const handleDismissSaveCard = useCallback(() => {
    setSaveCardPrompt(null);
    void advanceAfterFeedback();
  }, [advanceAfterFeedback]);

  const handleSaveCard = useCallback(async () => {
    if (!saveCardPrompt) return;
    setIsSavingCard(true);
    try {
      await FlashDeckService.createCardFromDuelSuggest({
        front: saveCardPrompt.front,
        back: saveCardPrompt.back,
      });
      await LearningAnalyticsService.recordCardSavedFromDuel();
      setSaveCardPrompt(null);
      Alert.alert('Baralho', DUEL_UI.saveCardSuccess);
      void advanceAfterFeedback();
    } catch (err) {
      Alert.alert(
        'Baralho',
        err instanceof Error ? err.message : 'Não foi possível salvar a carta',
      );
    } finally {
      setIsSavingCard(false);
    }
  }, [advanceAfterFeedback, saveCardPrompt]);

  const handleBack = useCallback(() => {
    resetBattle();
    router.replace(routes.duels as Href);
  }, [resetBattle]);

  const handleRematch = useCallback(async () => {
    const lostSessionId = result?.session.id;
    resetBattle();
    if (!lostSessionId) {
      router.replace(routes.duels as Href);
      return;
    }

    try {
      const started = await DuelService.startSession({
        mode: 'rematch_review',
        sourceSessionId: lostSessionId,
      });
      const combat = DuelCombatService.createInitialState(getPlayerMaxHp(), 1);
      useDuelStore.getState().setBattle({
        sessionId: started.session.id,
        enemyKey: started.session.enemyKey,
        enemyName: started.enemyName,
        enemyEmoji: started.enemyEmoji,
        patent: started.session.patentAtStart,
        mode: started.mode,
        playerMaxHp: getPlayerMaxHp(),
        enemyMaxHp: 1,
        questions: started.questions,
        combat,
        questionIndex: 0,
      });
      router.push(routes.duelsRematchReview as Href);
    } catch {
      router.replace(routes.duels as Href);
    }
  }, [resetBattle, result?.session.id]);

  if (result) {
    const won = result.session.status === 'won';
    const isDojo = result.mode === 'dojo';

    return (
      <LearningOutcomePanel
        variant={won ? 'victory' : 'defeat'}
        title={won ? DUEL_UI.victoryTitle : DUEL_UI.defeatTitle}
        body={won ? DUEL_UI.victoryBody : DUEL_UI.defeatBody}
        emoji={won ? '🏆' : '💀'}>
        {isDojo && won ? (
          <Text className="text-center text-xs text-muted">{DUEL_UI.dojoRewardsNote}</Text>
        ) : null}
        {result.rewards.xp > 0 || result.rewards.coins > 0 ? (
          <View className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
            <Text className="text-center text-base font-black text-gold">
              {result.rewards.isConsolation
                ? DUEL_UI.consolationLine(result.rewards.xp)
                : DUEL_UI.rewardsLine(result.rewards.xp, result.rewards.coins)}
            </Text>
          </View>
        ) : null}
        {!won && !isRematch ? (
          <Button label={DUEL_UI.rematchReview} variant="secondary" onPress={handleRematch} />
        ) : null}
        <Button label={DUEL_UI.backToArena} onPress={handleBack} />
      </LearningOutcomePanel>
    );
  }

  if (!battle || !currentQuestion) {
    return null;
  }

  const comboLabel = DUEL_UI.comboLabel(battle.combat.comboStreak);
  const showCritical = feedback?.isCorrect && battle.combat.comboStreak >= 3;

  return (
    <View className="gap-5">
      {showCombatBars ? (
        <>
          <DuelEnemyBar
            name={battle.enemyName}
            emoji={battle.enemyEmoji}
            currentHp={battle.combat.enemyHp}
            maxHp={battle.enemyMaxHp}
          />
          <DuelPlayerBar currentHp={battle.combat.playerHp} maxHp={battle.playerMaxHp} />
        </>
      ) : (
        <Text className="text-center text-sm font-semibold text-foreground-secondary">
          {DUEL_UI.rematchHint}
        </Text>
      )}

      {comboLabel && showCombatBars ? (
        <Text className="text-center text-xs font-bold uppercase tracking-widest text-gold">
          {comboLabel}
        </Text>
      ) : null}

      {showCritical ? (
        <Text className="text-center text-sm font-black text-gold">{DUEL_UI.criticalHit}</Text>
      ) : null}

      <LearningProgressHeader
        questLabel="Rodada de perguntas"
        current={battle.questionIndex + 1}
        total={battle.questions.length}
      />

      {questionTimeLimit && !feedback ? (
        <DuelQuestionTimer
          seconds={questionTimeLimit}
          active={!isSubmitting && selectedIndex === null}
          onExpire={handleTimeout}
        />
      ) : null}

      {feedback ? (
        <CombatFeedback feedback={feedback} />
      ) : (
        <McqQuestionCard
          prompt={currentQuestion.prompt}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          disabled={isSubmitting}
        />
      )}

      {!feedback ? (
        <Button
          label="Atacar! ⚔️"
          onPress={() => void handleConfirm()}
          disabled={selectedIndex === null}
          loading={isSubmitting}
          loadingLabel="Calculando…"
        />
      ) : null}

      <DuelSaveCardModal
        visible={saveCardPrompt != null}
        front={saveCardPrompt?.front ?? ''}
        back={saveCardPrompt?.back ?? ''}
        isSaving={isSavingCard}
        onSave={() => void handleSaveCard()}
        onDismiss={handleDismissSaveCard}
      />
    </View>
  );
};
