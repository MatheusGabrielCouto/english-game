import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { LearningOutcomePanel, LearningProgressHeader } from '@/features/learning/components/ui';
import type { FlashSrsRating } from '@/types/flash-card';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckService } from '../services/flash-deck-service';
import { useFlashDeckStore } from '../store/flash-deck-store';
import {
    loadFlashReviewQueue,
    resolveFlashReviewParams,
    sessionDeckIdForReview,
} from '../utils/flash-deck-review-scope';
import { FlashCardSwipeReview } from './FlashCardSwipeReview';
import { SrsButtonRow } from './SrsButtonRow';

const BLITZ_SECONDS = 120;

export const FlashDeckBlitzContent = () => {
  const params = useLocalSearchParams<{ deckId?: string; scope?: string }>();
  const { scope, deckId } = resolveFlashReviewParams(params);
  const refresh = useFlashDeckStore((s) => s.refresh);
  const refreshDeck = useFlashDeckStore((s) => s.refreshDeck);

  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(BLITZ_SECONDS);
  const [done, setDone] = useState(false);
  const [index, setIndex] = useState(0);
  const [loadingRating, setLoadingRating] = useState<FlashSrsRating | null>(null);
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof FlashDeckService.listDueCards>>>([]);
  const sessionIdRef = useRef<string | null>(null);
  const reviewedRef = useRef(0);

  useEffect(() => {
    void (async () => {
      const due = await loadFlashReviewQueue(scope, deckId);
      const sessionDeckId = sessionDeckIdForReview(scope, deckId, due);
      sessionIdRef.current = await FlashDeckService.startStudySession(sessionDeckId);
      setQueue(due);
      setLoading(false);
    })();
  }, [deckId, scope]);

  useEffect(() => {
    if (loading || done) return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setDone(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, done]);

  const finishBlitz = useCallback(async () => {
    if (sessionIdRef.current) {
      await FlashDeckService.completeStudySession(sessionIdRef.current, reviewedRef.current);
      sessionIdRef.current = null;
    }
    await refresh();
    if (scope === 'deck') {
      await refreshDeck(deckId);
    }
  }, [deckId, refresh, refreshDeck, scope]);

  useEffect(() => {
    if (done) {
      void finishBlitz();
    }
  }, [done, finishBlitz]);

  const handleRating = useCallback(
    async (rating: FlashSrsRating) => {
      const card = queue[index];
      if (!card || done || loadingRating) return;

      setLoadingRating(rating);
      try {
        await FlashDeckService.submitReview(card.id, rating, sessionIdRef.current ?? undefined);
        reviewedRef.current += 1;
        setIndex((value) => value + 1);
      } finally {
        setLoadingRating(null);
      }
    },
    [queue, index, done, loadingRating],
  );

  const current = queue[index] ?? null;

  if (loading) {
    return <ScreenSkeleton variant="session" />;
  }

  if (done) {
    return (
      <LearningOutcomePanel
        variant="complete"
        title="Blitz encerrado!"
        body={FLASH_DECK_UI.blitzDone(reviewedRef.current)}
        emoji="⚡">
        <Button label="Voltar" onPress={() => router.back()} />
      </LearningOutcomePanel>
    );
  }

  if (!current) {
    return (
      <LearningOutcomePanel variant="empty" title="Fim do baralho" body={FLASH_DECK_UI.reviewEmpty}>
        <Button label="Voltar" onPress={() => router.back()} />
      </LearningOutcomePanel>
    );
  }

  return (
    <View className="gap-5">
      <LearningProgressHeader
        questLabel="⚡ Blitz"
        current={reviewedRef.current + 1}
        total={Math.max(queue.length, 1)}
        timerLabel={FLASH_DECK_UI.blitzTimeLeft(secondsLeft)}
      />
      <FlashCardSwipeReview
        cardKey={current.id}
        front={current.front}
        back={current.back}
        exampleSentence={current.exampleSentence}
        cardMeta={current}
        disabled={loadingRating !== null}
        onSwipeAgain={() => void handleRating('again')}
        onSwipeGood={() => void handleRating('good')}
      />
      <SrsButtonRow
        onHard={() => void handleRating('hard')}
        onEasy={() => void handleRating('easy')}
        disabled={loadingRating !== null}
        loadingRating={loadingRating}
      />
    </View>
  );
};
