import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button, ProgressBar } from '@/components';
import { theme } from '@/constants';
import type { CityPoiProjectViewModel, CityResourceBalances } from '@/types/city-resource';

import { DAILY_DELIVERY_CAP } from '../constants/city-resource-config';
import { CITY_UI } from '../constants/city-ui';
import { CityMapService } from '../services/city-map-service';
import { CityPoiProjectService } from '../services/city-poi-project-service';
import { CityResourceService } from '../services/city-resource-service';
import { MemoryWallService } from '../services/memory-wall-service';
import { CityResourceStrip } from './CityResourceStrip';
import { MemoryWallPanel } from './MemoryWallPanel';

type CityPoiDeliverSectionProps = {
  poiKey: string;
  isUnlocked: boolean;
};

export const CityPoiDeliverSection = ({ poiKey, isUnlocked }: CityPoiDeliverSectionProps) => {
  const [project, setProject] = useState<CityPoiProjectViewModel | null>(null);
  const [balances, setBalances] = useState<CityResourceBalances | null>(null);
  const [loading, setLoading] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supportsDelivery = CityPoiProjectService.supportsDelivery(poiKey);

  const load = useCallback(async () => {
    if (!isUnlocked || !supportsDelivery) return;

    setLoading(true);
    try {
      const [nextProject, nextBalances] = await Promise.all([
        CityPoiProjectService.getProjectForPoi(poiKey),
        CityResourceService.getBalances(),
      ]);
      setProject(nextProject);
      setBalances(nextBalances);
    } finally {
      setLoading(false);
    }
  }, [isUnlocked, supportsDelivery, poiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDeliver = async () => {
    setDelivering(true);
    setMessage(null);
    try {
      const result = await CityPoiProjectService.deliverToProject(poiKey);

      if (!result.ok) {
        const errors: Record<string, string> = {
          no_project: CITY_UI.poiDeliverNoProject,
          project_complete: CITY_UI.poiDeliverComplete,
          insufficient_resources: CITY_UI.poiDeliverInsufficient,
          daily_cap: CITY_UI.poiDeliverDailyCapReached,
          poi_locked: CITY_UI.poiLockedTitle,
        };
        setMessage(errors[result.reason] ?? CITY_UI.poiDeliverFailed);
        return;
      }

      if (result.completed) {
        setMessage(
          CITY_UI.poiDeliverSuccessComplete(result.delivered, result.localXpGranted ?? 0),
        );
      } else {
        setMessage(CITY_UI.poiDeliverSuccess(result.delivered));
      }

      await load();
      await CityMapService.refresh();
    } finally {
      setDelivering(false);
    }
  };

  if (!supportsDelivery) {
    return (
      <Text className="text-sm text-muted">{CITY_UI.poiDeliverNotAvailable}</Text>
    );
  }

  if (!isUnlocked) return null;

  const isMemoryWall =
    project !== null && MemoryWallService.hasMemoryWall(project.projectKey);

  const resourceBalance = project ? balances?.[project.resourceType] ?? 0 : 0;
  const canDeliver =
    project &&
    !isMemoryWall &&
    !project.isComplete &&
    resourceBalance >= 1 &&
    project.progress < project.targetTotal;

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-foreground">{CITY_UI.poiDeliverTitle}</Text>
      <Text className="text-xs text-foreground-secondary">{CITY_UI.poiDeliverHint}</Text>

      <CityResourceStrip balances={balances} />

      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && project ? (
        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
          <View className="flex-row items-start gap-2">
            <Text className="text-2xl">{project.resourceEmoji}</Text>
            <View className="min-w-0 flex-1">
              <Text className="text-base font-bold text-foreground">{project.title}</Text>
              <Text className="mt-1 text-sm leading-5 text-foreground-secondary">
                {project.description}
              </Text>
            </View>
          </View>

          {!isMemoryWall ? (
            <View className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2">
              <Text className="text-xs font-bold uppercase text-primary">
                {CITY_UI.poiDeliverRequestLabel}
              </Text>
              <Text className="mt-1 text-sm font-semibold text-foreground">
                {CITY_UI.poiDeliverRequest(
                  project.resourceEmoji,
                  project.resourceLabel,
                  project.targetTotal,
                )}
              </Text>
            </View>
          ) : null}

          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-muted">{CITY_UI.poiDeliverProgress}</Text>
              <Text className="text-xs font-bold text-primary">
                {project.progress} / {project.targetTotal}
              </Text>
            </View>
            <ProgressBar
              value={project.progress}
              max={project.targetTotal}
              variant="xp"
              height="md"
            />
            <Text className="text-[10px] text-muted">
              {CITY_UI.poiDeliverProgressPercent(project.progressPercent)}
            </Text>
          </View>

          {!isMemoryWall ? (
            <View className="flex-row flex-wrap gap-3">
              <Text className="text-xs text-foreground-secondary">
                {CITY_UI.poiDeliverYouHave(resourceBalance, project.resourceEmoji)}
              </Text>
              <Text className="text-xs text-muted">
                {CITY_UI.poiDeliverChunk(project.deliveryChunk)}
              </Text>
              <Text className="text-xs text-muted">
                {CITY_UI.poiDeliverDailyCapHint(DAILY_DELIVERY_CAP[project.resourceType])}
              </Text>
            </View>
          ) : null}

          {isMemoryWall ? (
            <MemoryWallPanel poiKey={poiKey} deliveryChunk={project.deliveryChunk} />
          ) : null}

          {!isMemoryWall && project.isComplete ? (
            <Text className="text-center text-sm font-medium text-success">
              {CITY_UI.poiDeliverComplete}
            </Text>
          ) : null}

          {!isMemoryWall && !project.isComplete ? (
            <Button
              label={CITY_UI.poiDeliverButton(project.deliveryChunk)}
              variant="primary"
              disabled={!canDeliver || delivering}
              onPress={() => void handleDeliver()}
              accessibilityLabel={CITY_UI.poiDeliverButton(project.deliveryChunk)}
            />
          ) : null}

          {message ? (
            <Text
              className={`text-center text-sm ${message.includes('✓') || message.includes('concluí') ? 'text-success' : 'text-foreground-secondary'}`}
            >
              {message}
            </Text>
          ) : null}
        </View>
      ) : null}

      {!loading && !project ? (
        <Text className="text-sm text-muted">{CITY_UI.poiDeliverNoProject}</Text>
      ) : null}
    </View>
  );
};
