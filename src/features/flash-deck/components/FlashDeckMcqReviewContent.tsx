import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components';
import { theme } from '@/constants';
import { McqQuestionCard } from '@/features/duels/components/McqQuestionCard';
import { McqQuestionService } from '@/features/learning';
import {
    LearningOutcomePanel,
    LearningProgressHeader,
} from '@/features/learning/components/ui';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';
import { useFlashDeckStore } from '../store/flash-deck-store';

const PATENT = 'tourist' as const;

export const FlashDeckMcqReviewContent = () => {
  const { deckId: deckIdParam } = useLocalSearchParams<{ deckId?: string }>();
  const deckId = deckIdParam?.trim() || DEFAULT_FLASH_DECK_ID;
  const refreshDeck = useFlashDeckStore((s) => s.refreshDeck);

  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof FlashDeckService.listDueCards>>>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const due = await FlashDeckService.listDueCards(deckId);
      const session = await FlashDeckService.startStudySession(deckId);
      setQueue(due);
      setSessionId(session);
      setLoading(false);
    })();
  }, [deckId]);

  const current = queue[index] ?? null;
  const mcq = current
    ? McqQuestionService.buildMcq({
        type: 'mcq_meaning',
        lemma: current.lemma ?? current.front,
        patent: PATENT,
        translation: current.back,
      })
    : null;

  const handleConfirm = useCallback(async () => {
    if (!current || !mcq || selectedIndex === null || submitting) return;

    setSubmitting(true);
    try {
      const isCorrect = McqQuestionService.validateAnswer(mcq.prompt, selectedIndex);
      const rating = isCorrect ? 'good' : 'again';
      await FlashDeckService.submitReview(current.id, rating, sessionId ?? undefined);
      setSelectedIndex(null);
      setIndex((value) => value + 1);
    } finally {
      setSubmitting(false);
    }
  }, [current, mcq, selectedIndex, submitting, sessionId]);

  useEffect(() => {
    if (!loading && index >= queue.length && sessionId) {
      void FlashDeckService.completeStudySession(sessionId, index).then(() => refreshDeck(deckId));
    }
  }, [loading, index, queue.length, sessionId, deckId, refreshDeck]);

  if (loading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (queue.length === 0) {
    return (
      <LearningOutcomePanel variant="empty" title="Sem cartas" body={FLASH_DECK_UI.reviewEmpty}>
        <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
      </LearningOutcomePanel>
    );
  }

  if (!current || !mcq || index >= queue.length) {
    return (
      <LearningOutcomePanel
        variant="complete"
        title="Quiz concluído!"
        body={FLASH_DECK_UI.reviewDoneBody}>
        <Button label="Voltar" onPress={() => router.back()} />
      </LearningOutcomePanel>
    );
  }

  return (
    <View className="gap-5">
      <LearningProgressHeader
        questLabel={FLASH_DECK_UI.mcqReview}
        current={index + 1}
        total={queue.length}
      />
      <McqQuestionCard
        prompt={mcq.prompt}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        disabled={submitting}
      />
      <Button
        label="Confirmar golpe ✓"
        onPress={() => void handleConfirm()}
        disabled={selectedIndex === null}
        loading={submitting}
        loadingLabel="Registrando…"
      />
    </View>
  );
};
