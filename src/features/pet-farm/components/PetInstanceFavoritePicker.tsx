import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { PET_FAVORITE_TAG_ICONS, PetFavoriteTag, type PetFavoriteTagValue } from '@/types/pet-instance';
import type { PetInstance } from '@/types/pet-instance';
import { cn } from '@/utils';

import { PET_FAVORITE_UI } from '../constants/pet-hall-ui';
import { PetHallService } from '../services/pet-hall-service';

const SELECTED: ViewStyle = { backgroundColor: 'rgba(245, 158, 11, 0.18)' };

const TAGS: { key: PetFavoriteTagValue; label: string }[] = [
  { key: PetFavoriteTag.STAR, label: PET_FAVORITE_UI.star },
  { key: PetFavoriteTag.HEART, label: PET_FAVORITE_UI.heart },
  { key: PetFavoriteTag.CROWN, label: PET_FAVORITE_UI.crown },
];

type PetInstanceFavoritePickerProps = {
  instance: PetInstance;
  onChanged: (message: string) => void;
};

export const PetInstanceFavoritePicker = ({
  instance,
  onChanged,
}: PetInstanceFavoritePickerProps) => {
  const handlePress = async (tag: PetFavoriteTagValue) => {
    const result = await PetHallService.setFavoriteTag(instance.id, tag);
    onChanged(result.message);
  };

  return (
    <View className="gap-2 rounded-2xl border border-border bg-surface p-3">
      <Text className="text-xs font-bold text-foreground">{PET_FAVORITE_UI.title}</Text>
      <Text className="text-[10px] text-muted">{PET_FAVORITE_UI.hint}</Text>
      <View className="flex-row gap-2">
        {TAGS.map((tag) => {
          const active = instance.favoriteTag === tag.key;
          return (
            <Pressable
              key={tag.key}
              onPress={() => void handlePress(tag.key)}
              accessibilityRole="button"
              accessibilityLabel={tag.label}
              accessibilityState={{ selected: active }}
              className={cn(
                'flex-1 items-center rounded-xl border border-border py-2.5',
                active && 'border-amber-500/50',
              )}
              style={active ? SELECTED : undefined}>
              <Text className="text-lg">{PET_FAVORITE_TAG_ICONS[tag.key]}</Text>
              <Text className="text-[9px] font-bold text-muted">{tag.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
