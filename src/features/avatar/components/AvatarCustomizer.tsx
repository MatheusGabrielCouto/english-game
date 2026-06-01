import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { Avatar } from '@/components/ui/Avatar';
import { useAppStore } from '@/features/app/store/app-store';
import { usePlayerStore } from '@/features/player';
import {
  AVATAR_BADGES,
  AVATAR_FRAMES,
  type AvatarBadgeKey,
  type AvatarFrameKey,
} from '@/features/avatar/constants/avatar-customization';
import { cn } from '@/utils';

export const AvatarCustomizer = () => {
  const name = usePlayerStore((state) => state.name);
  const level = usePlayerStore((state) => state.level);
  const avatarFrame = useAppStore((state) => state.avatarFrame);
  const avatarBadge = useAppStore((state) => state.avatarBadge);
  const setAvatarFrame = useAppStore((state) => state.setAvatarFrame);
  const setAvatarBadge = useAppStore((state) => state.setAvatarBadge);

  const frameEntries = Object.entries(AVATAR_FRAMES) as [AvatarFrameKey, (typeof AVATAR_FRAMES)[AvatarFrameKey]][];
  const badgeEntries = Object.entries(AVATAR_BADGES) as [AvatarBadgeKey, (typeof AVATAR_BADGES)[AvatarBadgeKey]][];

  return (
    <Card elevated accent className="border-primary/35">
      <Text className="text-xs font-bold uppercase tracking-widest text-primary">🎭 Avatar</Text>
      <Text className="mt-1 text-sm text-foreground-secondary">
        Personalize seu avatar com molduras e emblemas desbloqueados por nível.
      </Text>

      <View className="my-5 items-center">
        <Avatar
          name={name}
          size="xl"
          frameKey={avatarFrame}
          badgeKey={avatarBadge}
          ring
        />
      </View>

      <Text className="mb-2 text-sm font-semibold text-foreground">Molduras</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {frameEntries.map(([key, frame]) => {
          const unlocked = level >= frame.unlockLevel;
          const selected = avatarFrame === key;

          return (
            <PressableScale
              key={key}
              disabled={!unlocked}
              onPress={() => setAvatarFrame(key)}
              accessibilityRole="button"
              accessibilityLabel={`Moldura ${frame.label}`}
              className={cn(
                'shrink-0 rounded-xl border px-3 py-2',
                selected ? 'border-primary bg-primary/20' : 'border-border bg-surface',
                !unlocked && 'opacity-40',
              )}>
              <Text className="text-xs font-bold text-foreground">{frame.label}</Text>
              <Text className="text-[10px] text-muted">
                {unlocked ? 'Desbloqueada' : `Nv. ${frame.unlockLevel}`}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <Text className="mb-2 text-sm font-semibold text-foreground">Emblemas</Text>
      <View className="flex-row flex-wrap gap-2">
        {badgeEntries.map(([key, badge]) => {
          const unlocked = level >= badge.unlockLevel;
          const selected = (avatarBadge ?? 'none') === key;

          return (
            <PressableScale
              key={key}
              disabled={!unlocked && key !== 'none'}
              onPress={() => setAvatarBadge(key === 'none' ? null : key)}
              accessibilityRole="button"
              accessibilityLabel={`Emblema ${badge.label}`}
              className={cn(
                'shrink-0 rounded-xl border px-3 py-2',
                selected ? 'border-gold bg-gold/15' : 'border-border bg-surface',
                !unlocked && key !== 'none' && 'opacity-40',
              )}>
              <Text className="text-center text-lg">{badge.emoji || '—'}</Text>
              <Text className="text-[10px] font-bold text-foreground">{badge.label}</Text>
            </PressableScale>
          );
        })}
      </View>
    </Card>
  );
};
