import { Image, Text, View } from 'react-native';

import {
  AVATAR_BADGES,
  AVATAR_FRAMES,
  type AvatarBadgeKey,
  type AvatarFrameKey,
} from '@/features/avatar/constants/avatar-customization';
import { cn } from '@/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  name: string;
  imageUri?: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
  frameKey?: AvatarFrameKey | string;
  badgeKey?: AvatarBadgeKey | string | null;
};

const sizeStyles: Record<AvatarSize, { container: string; text: string; ring: string; badge: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-xs', ring: 'p-0.5', badge: 'text-[8px] -bottom-0.5 -right-0.5' },
  md: { container: 'h-12 w-12', text: 'text-sm', ring: 'p-0.5', badge: 'text-[10px] -bottom-0.5 -right-0.5' },
  lg: { container: 'h-16 w-16', text: 'text-lg', ring: 'p-1', badge: 'text-xs -bottom-1 -right-1' },
  xl: { container: 'h-24 w-24', text: 'text-2xl', ring: 'p-1.5', badge: 'text-sm -bottom-1 -right-1' },
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const Avatar = ({
  name,
  imageUri,
  size = 'md',
  className,
  ring = false,
  frameKey = 'default',
  badgeKey = null,
}: AvatarProps) => {
  const { container, text, ring: ringPad, badge: badgePos } = sizeStyles[size];
  const frame = AVATAR_FRAMES[(frameKey as AvatarFrameKey) in AVATAR_FRAMES ? (frameKey as AvatarFrameKey) : 'default'];
  const badge =
    badgeKey && badgeKey in AVATAR_BADGES
      ? AVATAR_BADGES[badgeKey as AvatarBadgeKey]
      : null;

  const avatar = imageUri ? (
    <Image
      accessibilityLabel={`Avatar de ${name}`}
      source={{ uri: imageUri }}
      className={cn('rounded-full bg-surface-elevated', container)}
    />
  ) : (
    <View
      accessibilityLabel={`Avatar de ${name}`}
      className={cn('items-center justify-center rounded-full bg-primary', container)}>
      <Text className={cn('font-bold text-foreground', text)}>{getInitials(name)}</Text>
    </View>
  );

  const framed = (
    <View
      className={cn('rounded-full', ring || frameKey !== 'default' ? ringPad : '')}
      style={{
        backgroundColor: `${frame.borderColor}55`,
        shadowColor: frame.glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: ring || frameKey !== 'default' ? 0.5 : 0,
        shadowRadius: 12,
        elevation: ring ? 4 : 0,
      }}>
      <View
        className="rounded-full"
        style={{ borderWidth: 2, borderColor: frame.borderColor }}>
        {avatar}
      </View>
    </View>
  );

  return (
    <View className={cn('relative', className)}>
      {framed}
      {badge && badge.emoji ? (
        <View
          className={cn(
            'absolute items-center justify-center rounded-full border border-border bg-surface-elevated px-1',
            badgePos,
          )}>
          <Text>{badge.emoji}</Text>
        </View>
      ) : null}
    </View>
  );
};
