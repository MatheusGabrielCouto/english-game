import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import {
  PET_FARM_ISLAND_VIEW_H,
  PET_FARM_ISLAND_VIEW_W,
} from '../constants/pet-farm-island-layout';

const VIEW_W = PET_FARM_ISLAND_VIEW_W;
const VIEW_H = PET_FARM_ISLAND_VIEW_H;

const GRASS_PATH = `
  M 180 148
  C 258 142, 318 178, 332 232
  C 346 286, 328 358, 278 398
  C 228 438, 122 440, 78 402
  C 34 364, 24 288, 44 228
  C 64 168, 122 152, 180 148
  Z
`;

const SAND_PATH = `
  M 180 132
  C 262 126, 328 158, 342 218
  C 356 278, 338 358, 288 408
  C 238 458, 112 460, 62 418
  C 12 376, 6 288, 30 218
  C 54 148, 118 134, 180 132
  Z
`;

type PetFarmIslandBackdropProps = {
  height?: number;
};

const WaveBand = ({ top, opacity }: { top: number; opacity: number }) => {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        withTiming(-8, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }],
    opacity,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { top, height: 56 }, style]}>
      <Svg width="100%" height={56} viewBox={`0 0 ${VIEW_W} 56`} preserveAspectRatio="none">
        <Ellipse cx={100} cy={30} rx={130} ry={16} fill="rgba(255,255,255,0.18)" />
        <Ellipse cx={270} cy={24} rx={110} ry={14} fill="rgba(255,255,255,0.12)" />
      </Svg>
    </Animated.View>
  );
};

export const PetFarmIslandBackdrop = ({ height = VIEW_H }: PetFarmIslandBackdropProps) => (
  <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height }]}>
    <Svg
      width="100%"
      height={height}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#7ec8f0" />
          <Stop offset="45%" stopColor="#4a9fd4" />
          <Stop offset="100%" stopColor="#2d6a9f" />
        </LinearGradient>
        <LinearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#3aabb8" stopOpacity="0.95" />
          <Stop offset="55%" stopColor="#1a6f8f" />
          <Stop offset="100%" stopColor="#0f4d6b" />
        </LinearGradient>
        <LinearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#f0d78c" />
          <Stop offset="100%" stopColor="#c9a84a" />
        </LinearGradient>
        <LinearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#6ecf6a" />
          <Stop offset="55%" stopColor="#45a84a" />
          <Stop offset="100%" stopColor="#2d7a38" />
        </LinearGradient>
        <LinearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#5bb85a" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#2f6e3a" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#skyGrad)" />

      <Circle cx={56} cy={58} r={30} fill="#fff8e7" opacity={0.95} />
      <Circle cx={56} cy={58} r={36} fill="#fff4c2" opacity={0.35} />

      <G opacity={0.85}>
        <Ellipse cx={78} cy={48} rx={40} ry={15} fill="#ffffff" opacity={0.55} />
        <Ellipse cx={125} cy={42} rx={32} ry={12} fill="#ffffff" opacity={0.45} />
        <Ellipse cx={290} cy={52} rx={46} ry={16} fill="#ffffff" opacity={0.4} />
        <Ellipse cx={328} cy={60} rx={28} ry={11} fill="#ffffff" opacity={0.35} />
      </G>

      <Rect x={0} y={148} width={VIEW_W} height={VIEW_H - 148} fill="url(#oceanGrad)" />

      <Ellipse cx={180} cy={580} rx={210} ry={42} fill="#166080" opacity={0.45} />

      <Path d={SAND_PATH} fill="url(#sandGrad)" />
      <Path d={GRASS_PATH} fill="url(#grassGrad)" />

      <Ellipse cx={108} cy={318} rx={58} ry={26} fill="url(#hillGrad)" />
      <Ellipse cx={258} cy={338} rx={64} ry={28} fill="url(#hillGrad)" />
      <Ellipse cx={192} cy={278} rx={48} ry={20} fill="url(#hillGrad)" opacity={0.65} />

      <Path
        d="M 42 408 Q 180 432 318 408"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={3}
        fill="none"
      />
      <Path
        d="M 28 452 Q 180 478 332 452"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={2.5}
        fill="none"
      />

      <G>
        <Path d="M 38 378 L 44 322 L 50 378 Z" fill="#2d6a3e" />
        <Ellipse cx={44} cy={316} rx={24} ry={18} fill="#3d9a47" />
        <Path d="M 318 358 L 324 298 L 330 358 Z" fill="#2d6a3e" />
        <Ellipse cx={324} cy={292} rx={22} ry={17} fill="#3d9a47" />
      </G>

      <Circle cx={68} cy={498} r={5} fill="#ffffff" opacity={0.25} />
      <Circle cx={298} cy={512} r={4} fill="#ffffff" opacity={0.2} />
      <Circle cx={205} cy={522} r={3} fill="#ffffff" opacity={0.18} />
    </Svg>

    <WaveBand top={height * 0.48} opacity={0.7} />
    <WaveBand top={height * 0.58} opacity={0.45} />
  </View>
);
