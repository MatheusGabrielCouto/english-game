import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components';
import { routes, theme } from '@/constants';
import { isDuelsEnabled } from '@/constants/feature-flags';
import {
    LearningHeroPanel,
    LearningModeTile,
    LearningSectionHeader,
} from '@/features/learning/components/ui';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { useFlashDeckStore } from '../store/flash-deck-store';
import { flashDeckRoutes } from '../utils/flash-deck-routes';
import { FlashDeckFormModal } from './FlashDeckFormModal';
import { FlashDeckListTile } from './FlashDeckListTile';

export const FlashDeckHubContent = () => {
  const decks = useFlashDeckStore((s) => s.decks);
  const totalDueCount = useFlashDeckStore((s) => s.totalDueCount);
  const starterDeck = decks.find((deck) => deck.id === DEFAULT_FLASH_DECK_ID);
  const starterTotal = starterDeck?.totalCards ?? 0;
  const isLoading = useFlashDeckStore((s) => s.isLoading);
  const refresh = useFlashDeckStore((s) => s.refresh);

  const [deckModalVisible, setDeckModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh().then(() => {
        void import('../services/flash-notification-service').then(({ FlashNotificationService }) =>
          FlashNotificationService.rescheduleDueReminder(),
        );
      });
    }, [refresh]),
  );

  const handleOpenDeck = useCallback((deckId: string) => {
    router.push(flashDeckRoutes.deck(deckId));
  }, []);

  const handleStartReview = useCallback(() => {
    router.push(flashDeckRoutes.review(DEFAULT_FLASH_DECK_ID));
  }, []);

  if (isLoading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View className="gap-5">
      <LearningHeroPanel
        variant="deck"
        eyebrow="Baralho Vivo"
        emoji={FLASH_DECK_UI.emoji}
        headline={FLASH_DECK_UI.dueCount(totalDueCount)}
        subtitle={
          starterTotal > 0
            ? `${starterTotal} palavras no baralho essencial · ${totalDueCount === 0 ? FLASH_DECK_UI.hubEmptyDue : FLASH_DECK_UI.dueHint}`
            : totalDueCount === 0
              ? FLASH_DECK_UI.hubEmptyDue
              : FLASH_DECK_UI.dueHint
        }>
        {totalDueCount > 0 ? (
          <Button label={FLASH_DECK_UI.startReview} onPress={handleStartReview} />
        ) : null}
        {isDuelsEnabled() && totalDueCount > 0 ? (
          <Button
            label={FLASH_DECK_UI.cardDuelCta}
            variant="secondary"
            onPress={() => router.push(routes.duels as Href)}
          />
        ) : null}
      </LearningHeroPanel>

      <LearningSectionHeader
        emoji="🎮"
        title="Modos de treino"
        hint="Escolha como revisar hoje"
      />
      <View className="gap-2">
        <LearningModeTile
          emoji="🎯"
          title={FLASH_DECK_UI.mcqReview}
          description={FLASH_DECK_UI.mcqReviewHint}
          variant="review"
          onPress={() => router.push(flashDeckRoutes.mcqReview(DEFAULT_FLASH_DECK_ID))}
          accessibilityLabel={FLASH_DECK_UI.mcqReview}
        />
        <LearningModeTile
          emoji="⚡"
          title={FLASH_DECK_UI.blitzReview}
          description={FLASH_DECK_UI.blitzReviewHint}
          variant="deck"
          onPress={() => router.push(flashDeckRoutes.blitz(DEFAULT_FLASH_DECK_ID))}
          accessibilityLabel={FLASH_DECK_UI.blitzReview}
        />
        <LearningModeTile
          emoji="📥"
          title={FLASH_DECK_UI.importCsv}
          description="Traga palavras de um arquivo"
          variant="neutral"
          onPress={() => router.push(flashDeckRoutes.importCsv(DEFAULT_FLASH_DECK_ID))}
          accessibilityLabel={FLASH_DECK_UI.importCsv}
        />
      </View>

      <LearningSectionHeader
        emoji="📚"
        title={FLASH_DECK_UI.decksTitle}
        hint={FLASH_DECK_UI.decksHint}
      />
      <View className="gap-2">
        {decks.map((deck) => (
          <FlashDeckListTile key={deck.id} deck={deck} onPress={() => handleOpenDeck(deck.id)} />
        ))}
      </View>

      <Button label={FLASH_DECK_UI.newDeck} variant="secondary" onPress={() => setDeckModalVisible(true)} />

      <FlashDeckFormModal
        visible={deckModalVisible}
        onClose={() => setDeckModalVisible(false)}
        onSaved={() => void refresh()}
      />
    </View>
  );
};
