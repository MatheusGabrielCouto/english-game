import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import type { FlashCardRecord } from '@/types/flash-card';
import { cn } from '@/utils';
import { haptics } from '@/utils/haptics';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashSrsService } from '../services/flash-srs-service';
import { FlashCardStateBadge } from './FlashCardStateBadge';

const SWIPE_COMMIT = 110;
const SWIPE_FLY_OUT = 420;
const FLIP_DURATION_MS = 380;

type FlashCardSwipeReviewProps = {
  cardKey: string;
  front: string;
  back: string;
  exampleSentence?: string | null;
  cardMeta?: Pick<FlashCardRecord, 'state' | 'intervalDays' | 'lapseCount' | 'repetitions'>;
  disabled?: boolean;
  onSwipeAgain: () => void;
  onSwipeGood: () => void;
  className?: string;
};

const cardBorderByState = {
  new: '#8b5cf680',
  learning: '#38bdf880',
  review: '#3f3f4680',
  relearning: '#f59e0b80',
  mature: '#eab30880',
} as const;

export const FlashCardSwipeReview = ({
  cardKey,
  front,
  back,
  exampleSentence,
  cardMeta,
  disabled = false,
  onSwipeAgain,
  onSwipeGood,
  className,
}: FlashCardSwipeReviewProps) => {
  const visualState = cardMeta ? FlashSrsService.resolveState(cardMeta) : 'review';
  const isLeech = cardMeta ? FlashSrsService.isLeech(cardMeta) : false;
  const borderAccent = isLeech ? '#f59e0b80' : cardBorderByState[visualState];

  const translateX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const isFlipped = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
    rotationY.value = 0;
    isFlipped.value = 0;
  }, [cardKey, isFlipped, rotationY, translateX]);

  const triggerAgain = () => {
    haptics.warning();
    onSwipeAgain();
  };

  const triggerGood = () => {
    haptics.success();
    onSwipeGood();
  };

  const flipCard = () => {
    const next = isFlipped.value === 0 ? 1 : 0;
    isFlipped.value = next;
    rotationY.value = withTiming(next * 180, { duration: FLIP_DURATION_MS });
    haptics.light();
  };

  const commitSwipe = (direction: 'again' | 'good') => {
    'worklet';
    const target = direction === 'again' ? -SWIPE_FLY_OUT : SWIPE_FLY_OUT;
    translateX.value = withTiming(target, { duration: 220 }, (finished) => {
      if (!finished) return;
      if (direction === 'again') {
        runOnJS(triggerAgain)();
      } else {
        runOnJS(triggerGood)();
      }
      translateX.value = 0;
      rotationY.value = 0;
      isFlipped.value = 0;
    });
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-12, 12])
    .failOffsetY([-28, 28])
    .onUpdate((event) => {
      if (isFlipped.value === 0) return;
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (isFlipped.value === 0) return;

      if (event.translationX <= -SWIPE_COMMIT) {
        commitSwipe('again');
        return;
      }
      if (event.translationX >= SWIPE_COMMIT) {
        commitSwipe('good');
        return;
      }

      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
    });

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(280)
    .onEnd(() => {
      if (Math.abs(translateX.value) > 8) return;
      runOnJS(flipCard)();
    });

  const gesture = Gesture.Simultaneous(pan, tap);

  const stackStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotateZ: `${interpolate(translateX.value, [-180, 0, 180], [-10, 0, 10], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${rotationY.value}deg` },
    ],
    opacity: rotationY.value < 90 ? 1 : 0,
    zIndex: rotationY.value < 90 ? 1 : 0,
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${rotationY.value + 180}deg` },
    ],
    opacity: rotationY.value >= 90 ? 1 : 0,
    zIndex: rotationY.value >= 90 ? 1 : 0,
  }));

  const againHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-130, -50, 0], [1, 0.35, 0], Extrapolation.CLAMP),
  }));

  const goodHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 50, 130], [0, 0.35, 1], Extrapolation.CLAMP),
  }));

  const againBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-140, -60], [0.45, 0], Extrapolation.CLAMP),
  }));

  const goodBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [60, 140], [0, 0.45], Extrapolation.CLAMP),
  }));

  return (
    <View className={cn('w-full gap-3', className)}>
      {cardMeta ? <FlashCardStateBadge card={cardMeta} /> : null}

      {isLeech ? (
        <Text className="text-center text-xs leading-5 text-warning">{FLASH_DECK_UI.leechBanner}</Text>
      ) : null}

      <Text className="text-center text-xs text-foreground-secondary">{FLASH_DECK_UI.swipeHint}</Text>

      <View className="rounded-2xl border border-primary/20 bg-primary/5 p-2">
      <View style={styles.stage}>
        <Animated.View style={[styles.swipeBg, styles.swipeBgAgain, againBgStyle]} />
        <Animated.View style={[styles.swipeBg, styles.swipeBgGood, goodBgStyle]} />

        <Animated.View style={[styles.swipeLabel, styles.labelLeft, againHintStyle]}>
          <Text style={styles.labelAgainText}>{FLASH_DECK_UI.swipeLeftAgain}</Text>
        </Animated.View>
        <Animated.View style={[styles.swipeLabel, styles.labelRight, goodHintStyle]}>
          <Text style={styles.labelGoodText}>{FLASH_DECK_UI.swipeRightGood}</Text>
        </Animated.View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.cardStack, stackStyle]}>
            <Animated.View
              style={[
                styles.cardFace,
                { borderColor: borderAccent },
                frontFaceStyle,
              ]}>
              <CardFaceContent
                sideLabel="Frente"
                mainText={front}
                hint={FLASH_DECK_UI.tapToFlip}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.cardFace,
                styles.cardFaceBack,
                { borderColor: borderAccent },
                backFaceStyle,
              ]}>
              <CardFaceContent
                sideLabel="Verso"
                mainText={back}
                example={exampleSentence}
                hint={FLASH_DECK_UI.swipeAfterFlip}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
      </View>
    </View>
  );
};

type CardFaceContentProps = {
  sideLabel: string;
  mainText: string;
  example?: string | null;
  hint: string;
};

const CardFaceContent = ({ sideLabel, mainText, example, hint }: CardFaceContentProps) => (
  <>
    <Text className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gold">
      {sideLabel}
    </Text>
    <Text className="mt-4 text-center text-2xl font-black leading-8 text-foreground">{mainText}</Text>
    {example ? (
      <Text className="mt-4 text-center text-sm leading-5 text-foreground-secondary">{example}</Text>
    ) : null}
    <Text className="mt-6 text-center text-xs text-primary">{hint}</Text>
  </>
);

const styles = StyleSheet.create({
  stage: {
    minHeight: 240,
    justifyContent: 'center',
  },
  cardStack: {
    width: '100%',
    minHeight: 220,
  },
  cardFace: {
    position: 'absolute',
    left: 0,
    right: 0,
    minHeight: 220,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#1a1a22',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardFaceBack: {
    backgroundColor: '#1e1e28',
  },
  swipeBg: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
  },
  swipeBgAgain: {
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
  },
  swipeBgGood: {
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
  },
  swipeLabel: {
    position: 'absolute',
    top: '42%',
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  labelLeft: {
    left: 8,
  },
  labelRight: {
    right: 8,
  },
  labelAgainText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fca5a5',
  },
  labelGoodText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#86efac',
  },
});
