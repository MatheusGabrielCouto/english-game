import { Text, View } from 'react-native';

import { XPBar } from '@/components';
import { AppIcon } from '@/components/ui/AppIcon';
import { Avatar } from '@/components/ui/Avatar';
import { CoinDisplay, GameCard, LevelBadge, PressableScale, StreakFlame } from '@/components/ui/game';
import { theme } from '@/constants';
import { useAppStore } from '@/features/app/store/app-store';
import { useContractsStore } from '@/features/contracts/store/contracts-store';
import { usePlayerStore } from '@/features/player';

import { PROFILE_UI } from '../constants/profile-ui';

type ProfilePlayerStripProps = {
  onEditName: () => void;
};

export const ProfilePlayerStrip = ({ onEditName }: ProfilePlayerStripProps) => {
  const name = usePlayerStore((state) => state.name);
  const title = usePlayerStore((state) => state.title);
  const level = usePlayerStore((state) => state.level);
  const coins = usePlayerStore((state) => state.coins);
  const currentStreak = usePlayerStore((state) => state.currentStreak);
  const avatarFrame = useAppStore((state) => state.avatarFrame);
  const avatarBadge = useAppStore((state) => state.avatarBadge);
  const activeContract = useContractsStore((state) => state.activeContract);

  return (
    <GameCard variant="hero" glow className="gap-4 p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-primary">
        👤 {PROFILE_UI.playerHeroLabel}
      </Text>

      <View className="flex-row items-start gap-4">
        <View className="relative shrink-0">
          <Avatar name={name} size="xl" frameKey={avatarFrame} badgeKey={avatarBadge} ring />
          <View className="absolute -bottom-1 -right-1 rounded-full border-2 border-background">
            <LevelBadge level={level} size="md" />
          </View>
        </View>

        <View className="min-w-0 flex-1 gap-2">
          <View className="flex-row items-start gap-2">
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-xl font-black leading-6 text-foreground" numberOfLines={2}>
                {name}
              </Text>
              <Text className="text-sm font-bold leading-5 text-gold" numberOfLines={2}>
                {title}
              </Text>
            </View>

            <PressableScale
              onPress={onEditName}
              accessibilityRole="button"
              accessibilityLabel={PROFILE_UI.playerEditLabel}
              className="shrink-0 rounded-xl border border-border bg-surface p-2.5">
              <AppIcon name="create-outline" size={20} color={theme.colors.primary} />
            </PressableScale>
          </View>

          <View className="flex-row items-center gap-2 self-start rounded-xl border border-gold/35 bg-gold/10 px-3 py-1.5">
            <Text className="text-[10px] font-bold uppercase text-muted">{PROFILE_UI.playerLevelLabel}</Text>
            <Text className=" font-black text-gold">{level}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center gap-3">
        <CoinDisplay amount={coins} size="md" />
        <StreakFlame streak={currentStreak} size={18} showLabel />
      </View>

      <View className="gap-1.5">
        <Text className="text-[10px] font-semibold uppercase text-muted">Experiência</Text>
        <XPBar showLevel={false} />
      </View>

      {activeContract ? (
        <View className="flex-row items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5">
          <Text className="">📜</Text>
          <View className="min-w-0 flex-1">
            <Text className="text-xs font-bold uppercase text-warning">Contrato ativo</Text>
            <Text className="mt-0.5 text-sm font-semibold text-foreground" numberOfLines={2}>
              {activeContract.name}
            </Text>
            <Text className="text-xs text-muted">
              {activeContract.progressDays}/{activeContract.targetDays} dias
            </Text>
          </View>
        </View>
      ) : null}
    </GameCard>
  );
};
