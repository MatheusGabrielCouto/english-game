import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg'

import { theme } from '@/constants'

const SIZE = 132

export const FarmEmptyIllustration = () => (
  <Svg width={SIZE} height={SIZE} viewBox="0 0 132 132" accessibilityLabel="">
    <Defs>
      <LinearGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={theme.colors.accent} stopOpacity="0.18" />
        <Stop offset="1" stopColor={theme.colors.success} stopOpacity="0.08" />
      </LinearGradient>
      <LinearGradient id="farmGrass" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#2d5a3d" />
        <Stop offset="1" stopColor="#1a3328" />
      </LinearGradient>
    </Defs>

    <Circle cx="66" cy="66" r="54" fill="url(#farmSky)" />

    <Ellipse cx="66" cy="92" rx="46" ry="18" fill="#0d1f18" opacity="0.45" />

    <Path
      d="M24 78 C40 58, 92 58, 108 78 C108 96, 92 108, 66 108 C40 108, 24 96, 24 78 Z"
      fill="url(#farmGrass)"
      stroke={theme.colors.success}
      strokeWidth="2"
      opacity="0.95"
    />

    <Ellipse cx="66" cy="72" rx="22" ry="26" fill="#f5e6c8" stroke={theme.colors.gold} strokeWidth="2" />
    <Circle cx="66" cy="78" r="8" fill={theme.colors.warning} opacity="0.85" />

    <Circle cx="48" cy="64" r="5" fill={theme.colors.legendary} opacity="0.8" />
    <Circle cx="84" cy="64" r="5" fill={theme.colors.legendary} opacity="0.8" />
    <Ellipse cx="66" cy="58" rx="10" ry="8" fill={theme.colors.legendary} opacity="0.35" />

    <Path
      d="M58 98 C62 94 70 94 74 98 C70 102 62 102 58 98 Z"
      fill={theme.colors.foreground}
      opacity="0.85"
    />
    <Circle cx="60" cy="96" r="2.5" fill={theme.colors.surface} />
    <Circle cx="66" cy="94" r="2.5" fill={theme.colors.surface} />
    <Circle cx="72" cy="96" r="2.5" fill={theme.colors.surface} />
  </Svg>
)
