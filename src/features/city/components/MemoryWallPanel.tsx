import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, ProgressBar } from '@/components';
import { ListItemSkeleton } from '@/components/ui/skeleton';
import type { LexiconBrickRecord, MemoryWallState } from '@/types/lexicon-brick';

import { CITY_UI } from '../constants/city-ui';
import { memoryWallThemeLabel } from '../constants/memory-wall-theme-labels';
import { CityMapService } from '../services/city-map-service';
import { MemoryWallService } from '../services/memory-wall-service';
import { MemoryWallRepairModal } from './MemoryWallRepairModal';

type MemoryWallPanelProps = {
  poiKey: string;
  deliveryChunk: number;
};

export const MemoryWallPanel = ({ poiKey, deliveryChunk }: MemoryWallPanelProps) => {
  const [state, setState] = useState<MemoryWallState | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [repairBrick, setRepairBrick] = useState<LexiconBrickRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await MemoryWallService.getState(poiKey);
      setState(next);
    } finally {
      setLoading(false);
    }
  }, [poiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePlace = async () => {
    setPlacing(true);
    setMessage(null);
    try {
      const result = await MemoryWallService.placeBricks(poiKey, deliveryChunk);
      if (!result.ok) {
        const errors: Record<string, string> = {
          no_matching_bricks: CITY_UI.memoryWallNoBricks,
          daily_cap: CITY_UI.memoryWallDailyCap,
          project_complete: CITY_UI.poiDeliverComplete,
          poi_locked: CITY_UI.poiLockedTitle,
        };
        setMessage(errors[result.reason] ?? CITY_UI.poiDeliverFailed);
        return;
      }

      if (result.completed) {
        setMessage(
          CITY_UI.memoryWallPlaceComplete(result.localXpGranted ?? 0),
        );
      } else {
        setMessage(CITY_UI.memoryWallPlaceSuccess(result.placed));
      }

      await load();
      await CityMapService.refresh();
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View className="gap-3 py-2">
        <ListItemSkeleton />
        <ListItemSkeleton />
      </View>
    );
  }

  if (!state) return null;

  const firstNeed = state.slots.find((s) => s.remaining > 0);
  const canPlace =
    !state.isComplete &&
    state.inventory.unplacedTotal > 0 &&
    state.inventory.crackedTotal < state.inventory.unplacedTotal;

  return (
    <View className="gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <Text className="text-sm font-bold uppercase text-primary">{CITY_UI.memoryWallTitle}</Text>
      <Text className="text-xs leading-5 text-foreground-secondary">{CITY_UI.memoryWallHint}</Text>

      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-muted">{CITY_UI.poiDeliverProgress}</Text>
          <Text className="text-xs font-bold text-primary">
            {state.progress} / {state.targetTotal}
          </Text>
        </View>
        <ProgressBar value={state.progress} max={state.targetTotal} variant="xp" height="md" />
        <Text className="text-[10px] text-muted">
          {CITY_UI.poiDeliverProgressPercent(state.progressPercent)}
        </Text>
      </View>

      <View className="gap-2">
        {state.slots.map((slot) => {
          const filledBlocks = Math.min(
            5,
            Math.ceil((slot.filledCount / Math.max(1, slot.targetCount)) * 5),
          );
          const blocks = '■'.repeat(filledBlocks) + '□'.repeat(5 - filledBlocks);
          return (
            <View
              key={`${slot.projectId}-${slot.slotIndex}`}
              className="flex-row items-center justify-between gap-2"
            >
              <Text className="font-mono text-xs text-foreground">{blocks}</Text>
              <Text className="flex-1 text-right text-xs text-foreground-secondary">
                {CITY_UI.memoryWallSlotRow(
                  slot.filledCount,
                  slot.targetCount,
                  `${memoryWallThemeLabel(slot.themeTag)} · ${slot.label}`,
                )}
              </Text>
            </View>
          );
        })}
      </View>

      {firstNeed ? (
        <Text className="text-xs text-foreground-secondary">
          {CITY_UI.memoryWallSlotNeed(
            firstNeed.remaining,
            memoryWallThemeLabel(firstNeed.themeTag),
          )}
        </Text>
      ) : null}

      <Text className="text-xs text-muted">
        {CITY_UI.memoryWallInventory(
          state.inventory.unplacedTotal - state.inventory.crackedTotal,
          state.inventory.crackedTotal,
        )}
      </Text>

      {state.isComplete ? (
        <Text className="text-center text-sm font-medium text-success">
          {CITY_UI.poiDeliverComplete}
        </Text>
      ) : (
        <View className="gap-2">
          <Button
            label={CITY_UI.memoryWallPlaceButton(deliveryChunk)}
            variant="primary"
            disabled={!canPlace || placing}
            onPress={() => void handlePlace()}
            accessibilityLabel={CITY_UI.memoryWallPlaceButton(deliveryChunk)}
          />
          {state.crackedBricks.length > 0 ? (
            <Button
              label={CITY_UI.memoryWallRepairButton(state.crackedBricks.length)}
              variant="secondary"
              onPress={() => setRepairBrick(state.crackedBricks[0] ?? null)}
              accessibilityLabel={CITY_UI.memoryWallRepairButton(state.crackedBricks.length)}
            />
          ) : null}
        </View>
      )}

      {message ? (
        <Text
          className={`text-center text-sm ${message.includes('abriu') || message.includes('XP') ? 'text-success' : 'text-foreground-secondary'}`}
        >
          {message}
        </Text>
      ) : null}

      <MemoryWallRepairModal
        visible={repairBrick !== null}
        brick={repairBrick}
        onClose={() => setRepairBrick(null)}
        onRepaired={() => void load()}
      />
    </View>
  );
};
