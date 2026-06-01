import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import type { FlashCardRecord } from '@/types/flash-card';
import { cn } from '@/utils';
import { haptics } from '@/utils/haptics';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashSrsService } from '../services/flash-srs-service';
import { FlashCardStateBadge } from './FlashCardStateBadge';

const FLIP_DURATION_MS = 380;

type FlashCardFaceProps = {
  front: string;
  back: string;
  exampleSentence?: string | null;
  cardMeta?: Pick<FlashCardRecord, 'state' | 'intervalDays' | 'lapseCount' | 'repetitions'>;
  className?: string;
  cardKey?: string;
};

const cardBorderByState = {
  new: '#8b5cf680',
  learning: '#38bdf880',
  review: '#3f3f4680',
  relearning: '#f59e0b80',
  mature: '#eab30880',
} as const;

export const FlashCardFace = ({
  front,
  back,
  exampleSentence,
  cardMeta,
  className,
  cardKey,
}: FlashCardFaceProps) => {
  const visualState = cardMeta ? FlashSrsService.resolveState(cardMeta) : 'review';
  const isLeech = cardMeta ? FlashSrsService.isLeech(cardMeta) : false;
  const borderAccent = isLeech ? '#f59e0b80' : cardBorderByState[visualState];

  const rotationY = useSharedValue(0);
  const isFlipped = useSharedValue(0);

  useEffect(() => {
    rotationY.value = 0;
    isFlipped.value = 0;
  }, [cardKey, isFlipped, rotationY]);

  const flipCard = () => {
    const next = isFlipped.value === 0 ? 1 : 0;
    isFlipped.value = next;
    rotationY.value = withTiming(next * 180, { duration: FLIP_DURATION_MS });
    haptics.light();
  };

  const tap = Gesture.Tap().maxDuration(280).onEnd(() => {
    runOnJS(flipCard)();
  });

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotationY.value}deg` }],
    opacity: rotationY.value < 90 ? 1 : 0,
    zIndex: rotationY.value < 90 ? 1 : 0,
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotationY.value + 180}deg` }],
    opacity: rotationY.value >= 90 ? 1 : 0,
    zIndex: rotationY.value >= 90 ? 1 : 0,
  }));

  return (
    <View className={cn('w-full gap-3', className)}>
      {cardMeta ? <FlashCardStateBadge card={cardMeta} /> : null}

      {isLeech ? (
        <Text className="text-center text-xs leading-5 text-warning">{FLASH_DECK_UI.leechBanner}</Text>
      ) : null}

      <GestureDetector gesture={tap}>
        <View style={styles.stack}>
          <Animated.View
            style={[styles.face, { borderColor: borderAccent }, frontFaceStyle]}
            accessibilityRole="button"
            accessibilityLabel={FLASH_DECK_UI.tapToFlip}>
            <Text className="text-center text-xs font-bold uppercase tracking-widest text-muted">
              Frente
            </Text>
            <Text className="mt-4 text-center text-2xl font-black leading-8 text-foreground">{front}</Text>
            <Text className="mt-6 text-center text-xs text-primary">{FLASH_DECK_UI.tapToFlip}</Text>
          </Animated.View>

          <Animated.View
            style={[styles.face, styles.faceBack, { borderColor: borderAccent }, backFaceStyle]}
            accessibilityRole="button"
            accessibilityLabel={FLASH_DECK_UI.tapToFlipBack}>
            <Text className="text-center text-xs font-bold uppercase tracking-widest text-muted">
              Verso
            </Text>
            <Text className="mt-4 text-center text-2xl font-black leading-8 text-foreground">{back}</Text>
            {exampleSentence ? (
              <Text className="mt-4 text-center text-sm leading-5 text-foreground-secondary">
                {exampleSentence}
              </Text>
            ) : null}
            <Text className="mt-6 text-center text-xs text-primary">{FLASH_DECK_UI.tapToFlipBack}</Text>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
};

export const FlashCardFaceKeyed = ({
  cardKey,
  ...props
}: FlashCardFaceProps & { cardKey: string }) => (
  <FlashCardFace key={cardKey} cardKey={cardKey} {...props} />
);

const styles = StyleSheet.create({
  stack: {
    width: '100%',
    minHeight: 220,
  },
  face: {
    position: 'absolute',
    left: 0,
    right: 0,
    minHeight: 220,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#18181b',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  faceBack: {
    backgroundColor: '#1c1c22',
  },
});
