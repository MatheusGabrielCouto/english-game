import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import {
    LearningOutcomePanel,
    LearningProgressHeader,
} from '@/features/learning/components/ui';
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

export const FlashDeckReviewContent = () => {
  const params = useLocalSearchParams<{ deckId?: string; scope?: string }>();
  const { scope, deckId } = resolveFlashReviewParams(params);

  const refresh = useFlashDeckStore((s) => s.refresh);
  const refreshDeck = useFlashDeckStore((s) => s.refreshDeck);
  const stats = useFlashDeckStore((s) => s.activeDeckStats);

  const [queue, setQueue] = useState<Awaited<ReturnType<typeof FlashDeckService.listDueCards>>>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRating, setLoadingRating] = useState<FlashSrsRating | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const reviewedCountRef = useRef(0);
  const sessionFinishedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    sessionFinishedRef.current = false;
    reviewedCountRef.current = 0;

    void (async () => {
      setLoading(true);
      const cards = await loadFlashReviewQueue(scope, deckId);
      const sessionDeckId = sessionDeckIdForReview(scope, deckId, cards);
      const sessionId = await FlashDeckService.startStudySession(sessionDeckId);
      sessionIdRef.current = sessionId;
      if (mounted) {
        setQueue(cards);
        setIndex(0);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [deckId, scope]);

  const currentCard = queue[index] ?? null;
  const isComplete = !loading && queue.length > 0 && index >= queue.length;
  const isEmpty = !loading && queue.length === 0;
  const reviewCapHit = stats.reviewsRemainingToday === 0 && stats.reviewsToday > 0;

  const progressCurrent = Math.min(index + 1, queue.length);

  const finishSession = useCallback(async () => {
    if (sessionFinishedRef.current) return;
    sessionFinishedRef.current = true;

    if (sessionIdRef.current) {
      await FlashDeckService.completeStudySession(
        sessionIdRef.current,
        reviewedCountRef.current,
      );
      sessionIdRef.current = null;
    }
    await refresh();
    if (scope === 'deck') {
      await refreshDeck(deckId);
    }
  }, [deckId, refresh, refreshDeck, scope]);

  const handleRating = useCallback(
    async (rating: FlashSrsRating) => {
      if (!currentCard || loadingRating) return;

      setLoadingRating(rating);
      try {
        await FlashDeckService.submitReview(
          currentCard.id,
          rating,
          sessionIdRef.current ?? undefined,
        );
        reviewedCountRef.current += 1;
        setIndex((value) => value + 1);
      } finally {
        setLoadingRating(null);
      }
    },
    [currentCard, loadingRating],
  );

  const handleFinish = useCallback(async () => {
    await finishSession();
    router.back();
  }, [finishSession]);

  useEffect(() => {
    if (isComplete) {
      void finishSession();
    }
  }, [isComplete, finishSession]);

  if (loading) {
    return <ScreenSkeleton variant="session" />;
  }

  if (isEmpty) {
    return (
      <LearningOutcomePanel
        variant="empty"
        title="Mesa vazia"
        body={reviewCapHit ? FLASH_DECK_UI.reviewCapReached : FLASH_DECK_UI.reviewEmpty}
        emoji="☕">
        <Button label={FLASH_DECK_UI.backToHub} variant="secondary" onPress={() => void handleFinish()} />
      </LearningOutcomePanel>
    );
  }

  if (isComplete) {
    return (
      <LearningOutcomePanel
        variant="complete"
        title={FLASH_DECK_UI.reviewDone}
        body={FLASH_DECK_UI.reviewDoneBody}>
        <Button label={FLASH_DECK_UI.backToHub} onPress={() => void handleFinish()} />
      </LearningOutcomePanel>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <View className="gap-5">
      <LearningProgressHeader
        questLabel="Missão de revisão"
        current={progressCurrent}
        total={queue.length}
      />

      <FlashCardSwipeReview
        cardKey={currentCard.id}
        front={currentCard.front}
        back={currentCard.back}
        exampleSentence={currentCard.exampleSentence}
        cardMeta={currentCard}
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
