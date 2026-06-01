import { StyleSheet, Text, View } from 'react-native';

import type { LootBoxRarityBadgeStyle } from '../constants/loot-box-rarity-styles';

type LootBoxRarityBadgeProps = {
  label: string;
  badge: LootBoxRarityBadgeStyle;
  emoji?: string;
  size?: 'sm' | 'md';
};

export const LootBoxRarityBadge = ({
  label,
  badge,
  emoji,
  size = 'sm',
}: LootBoxRarityBadgeProps) => (
  <View
    style={[
      styles.base,
      size === 'md' ? styles.md : styles.sm,
      {
        borderColor: badge.borderColor,
        backgroundColor: badge.backgroundColor,
      },
    ]}>
    <Text style={[styles.text, size === 'md' ? styles.textMd : styles.textSm, { color: badge.color }]}>
      {emoji ? `${emoji} ` : ''}
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 8,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  md: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
    lineHeight: 14,
  },
  textMd: {
    fontSize: 10,
    lineHeight: 14,
  },
});
