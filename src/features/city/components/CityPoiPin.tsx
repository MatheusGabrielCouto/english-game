import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import type { CityPoiViewModel } from '@/types/city-map';

import { CITY_MAP_GMAPS } from '../constants/city-map-styles';
import { getPoiVisualStageStyle } from '../constants/poi-visual-stages';

type CityPoiPinProps = {
  poi: CityPoiViewModel;
  left: number;
  top: number;
  hasClaimableMission?: boolean;
  isActiveContractIssuer?: boolean;
  petAtParkToday?: boolean;
  isEventPoi?: boolean;
  eventEmoji?: string | null;
  onPress: () => void;
};

export const CityPoiPin = ({
  poi,
  left,
  top,
  hasClaimableMission,
  isActiveContractIssuer,
  petAtParkToday,
  isEventPoi,
  eventEmoji = null,
  onPress,
}: CityPoiPinProps) => {
  const isLocked = !poi.isUnlocked;
  const isClaimable = Boolean(hasClaimableMission && !isLocked);
  const stageStyle = getPoiVisualStageStyle(poi.visualStage);
  const pulse = useSharedValue(1);
  const claimGlow = useSharedValue(0.35);

  useEffect(() => {
    if (isLocked) {
      pulse.value = 1;
      claimGlow.value = 0;
      return;
    }

    if (isClaimable) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 520, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      claimGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 520, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      return;
    }

    claimGlow.value = 0;

    if (!stageStyle.usePulse) {
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [isClaimable, isLocked, stageStyle.usePulse, pulse, claimGlow]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const claimGlowStyle = useAnimatedStyle(() => ({
    opacity: claimGlow.value,
    transform: [{ scale: 1 + claimGlow.value * 0.18 }],
  }));

  const lockLabel = poi.specialLockReason
    ? 'Em breve'
    : poi.isLockedByLevel
      ? `Nv. ${poi.requiredPlayerLevel}`
      : poi.isLockedByDistrict
        ? 'Distrito fechado'
        : 'Bloqueado';

  const pinColor = isLocked ? CITY_MAP_GMAPS.pinLocked : CITY_MAP_GMAPS.pinColor;
  const eventBadge = eventEmoji ?? (isEventPoi ? '🎉' : null);

  return (
    <Pressable
      onPress={onPress}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={
        isLocked ? `${poi.name}, ${lockLabel}` : `${poi.name}, nível local ${poi.localLevel}`
      }
      accessibilityState={{ disabled: isLocked }}
      style={[styles.pin, { left, top }]}
    >
      <Animated.View style={[styles.markerColumn, pulseStyle]}>
        <View style={styles.markerHeadWrap}>
          {isClaimable ? <Animated.View style={[styles.claimPulseRing, claimGlowStyle]} /> : null}
          {isLocked ? (
            <View style={[styles.markerHead, styles.markerHeadLocked]}>
              <Text style={styles.markerLockIcon}>🔒</Text>
            </View>
          ) : (
            <View style={[styles.markerHead, { backgroundColor: pinColor }]}>
              <Text style={styles.markerEmoji}>{poi.icon}</Text>
            </View>
          )}
          {!isLocked ? (
            <View style={[styles.markerTail, { borderTopColor: pinColor }]} />
          ) : (
            <View
              style={[styles.markerTail, { borderTopColor: CITY_MAP_GMAPS.pinLocked }]}
            />
          )}
          {isClaimable ? <View style={styles.claimBadge} /> : null}
          {eventBadge && !isLocked ? (
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>{eventBadge}</Text>
            </View>
          ) : null}
          {isActiveContractIssuer && !isLocked ? <View style={styles.contractRing} /> : null}
        </View>

        <View style={styles.labelCard}>
          <Text style={[styles.labelText, isLocked && styles.labelTextLocked]} numberOfLines={2}>
            {poi.name}
          </Text>
          {!isLocked ? (
            <Text style={styles.stars}>{'★'.repeat(Math.min(poi.localLevel, 5))}</Text>
          ) : (
            <Text style={styles.lockHint}>{lockLabel}</Text>
          )}
        </View>

        {petAtParkToday && !isLocked ? (
          <Text style={styles.petBadge}>🐾</Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pin: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
    zIndex: 20,
  },
  markerColumn: {
    alignItems: 'center',
  },
  markerHeadWrap: {
    alignItems: 'center',
    marginBottom: 2,
  },
  markerHead: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CITY_MAP_GMAPS.markerLabelShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  markerHeadLocked: {
    backgroundColor: CITY_MAP_GMAPS.pinLocked,
  },
  markerLockIcon: {
    fontSize: 14,
  },
  markerEmoji: {
    fontSize: 16,
  },
  markerTail: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  labelCard: {
    marginTop: 2,
    maxWidth: 76,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: CITY_MAP_GMAPS.markerLabelBg,
    borderWidth: 1,
    borderColor: '#3c4048',
    shadowColor: CITY_MAP_GMAPS.markerLabelShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    color: CITY_MAP_GMAPS.markerLabelText,
    textAlign: 'center',
  },
  labelTextLocked: {
    color: CITY_MAP_GMAPS.roadLabel,
  },
  stars: {
    marginTop: 1,
    fontSize: 7,
    color: '#f9ab00',
    letterSpacing: -1,
  },
  lockHint: {
    marginTop: 1,
    fontSize: 8,
    color: CITY_MAP_GMAPS.roadLabel,
    textAlign: 'center',
  },
  claimPulseRing: {
    position: 'absolute',
    top: -7,
    left: -7,
    right: -7,
    bottom: -7,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#f9ab00',
  },
  claimBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#f9ab00',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  eventBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  eventBadgeText: {
    fontSize: 10,
  },
  contractRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#1a73e8',
  },
  petBadge: {
    position: 'absolute',
    bottom: 28,
    left: -4,
    fontSize: 12,
  },
});
