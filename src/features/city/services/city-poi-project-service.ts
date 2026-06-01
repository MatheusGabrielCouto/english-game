import { CITY_POIS_BY_KEY } from '@/data/loaders/city';
import { POI_PROJECTS_BY_KEY, POI_PROJECTS_BY_POI } from '@/data/loaders/poi-projects';
import { pickDeterministicSubset } from '@/features/game-design/utils/reward-scaling';
import { getTodayKey } from '@/features/quests/utils/date';
import { getWeekBounds } from '@/features/weekly-quests/utils/week';
import { GameEvents } from '@/services/game-events';
import { CityMapStateRepository } from '@/storage/repositories/city-map-state-repository';
import { CityPoiProjectRepository } from '@/storage/repositories/city-poi-project-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { CityResourceDeliveryCapRepository } from '@/storage/repositories/city-resource-delivery-cap-repository';
import type {
    CityPoiProjectRecord,
    CityPoiProjectViewModel,
    DeliverToProjectResult,
    PoiProjectDefinition,
} from '@/types/city-resource';
import type { ProjectBlueprint } from '@/types/lexicon-brick';

import {
    CITY_RESOURCE_LABELS,
    DAILY_DELIVERY_CAP,
    DELIVERY_POI_KEYS,
} from '../constants/city-resource-config';
import { applyLocalXpToPoi } from '../utils/apply-local-xp';
import { CityMapService } from './city-map-service';
import { CityResourceService } from './city-resource-service';

const buildViewModel = (record: CityPoiProjectRecord): CityPoiProjectViewModel => {
  const meta = CITY_RESOURCE_LABELS[record.resourceType];
  const progressPercent =
    record.targetTotal > 0
      ? Math.min(100, Math.round((record.progress / record.targetTotal) * 100))
      : 0;

  return {
    ...record,
    progressPercent,
    isComplete: record.progress >= record.targetTotal || Boolean(record.completedAt),
    resourceLabel: meta.label,
    resourceEmoji: meta.emoji,
  };
};

const blueprintTargetTotal = (blueprint?: ProjectBlueprint): number | null => {
  if (!blueprint?.slots?.length) return null;
  return blueprint.slots.reduce((sum, slot) => sum + slot.count, 0);
};

const hasBlueprintByProjectKey = (projectKey: string): boolean =>
  Boolean(POI_PROJECTS_BY_KEY[projectKey]?.blueprint?.slots?.length);

const recordFromDefinition = (
  definition: PoiProjectDefinition,
  weekStartDate: string,
): CityPoiProjectRecord => {
  const slotTotal = blueprintTargetTotal(definition.blueprint);

  return {
    id: `${definition.poiKey}:${weekStartDate}:${definition.projectKey}`,
    poiKey: definition.poiKey,
    projectKey: definition.projectKey,
    weekStartDate,
    title: definition.title,
    description: definition.description,
    resourceType: definition.resourceType,
    targetTotal: slotTotal ?? definition.targetTotal,
    deliveryChunk: definition.deliveryChunk,
    progress: 0,
    localXpOnComplete: definition.localXpOnComplete,
    vitalityOnComplete: definition.vitalityOnComplete,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
};

const pickProjectDefinition = (
  poiKey: string,
  localLevel: number,
  weekStartDate: string,
): PoiProjectDefinition | null => {
  const pool = (POI_PROJECTS_BY_POI[poiKey] ?? []).filter((p) => p.minLocalLevel <= localLevel);
  if (pool.length === 0) return null;

  const [picked] = pickDeterministicSubset(pool, 1, `poi-project-${poiKey}-${weekStartDate}`);
  return picked ?? null;
};

export const finalizeCityPoiProject = async (
  record: CityPoiProjectRecord,
  poiName: string,
): Promise<void> => {
  const endedAt = new Date().toISOString();
  const completed: CityPoiProjectRecord = {
    ...record,
    progress: record.targetTotal,
    completedAt: endedAt,
  };

  await CityPoiProjectRepository.upsert(completed);

  await applyLocalXpToPoi(record.poiKey, record.localXpOnComplete);
  await CityMapStateRepository.adjustVitality(record.vitalityOnComplete);

  const poi = await CityPoiRepository.findByKey(record.poiKey);
  if (poi && poi.visualStage < poi.localLevel) {
    await CityPoiRepository.upsert({
      ...poi,
      visualStage: Math.min(poi.localLevel, poi.visualStage + 1),
    });
  }

  GameEvents.emit({
    type: 'POI_PROJECT_COMPLETED',
    poiKey: record.poiKey,
    poiName,
    projectKey: record.projectKey,
    projectTitle: record.title,
    resourceType: record.resourceType,
    targetTotal: record.targetTotal,
  });

  await CityMapService.refresh();
};

export const CityPoiProjectService = {
  supportsDelivery(poiKey: string): boolean {
    return (DELIVERY_POI_KEYS as readonly string[]).includes(poiKey);
  },

  async ensureProjectForPoi(poiKey: string): Promise<CityPoiProjectViewModel | null> {
    if (!CityPoiProjectService.supportsDelivery(poiKey)) return null;

    const poi = await CityPoiRepository.findByKey(poiKey);
    if (!poi?.unlockedAt) return null;

    const { weekStartDate } = getWeekBounds();
    const existing = await CityPoiProjectRepository.findActiveForPoi(poiKey, weekStartDate);

    if (existing) {
      return buildViewModel(existing);
    }

    const definition = pickProjectDefinition(poiKey, poi.localLevel, weekStartDate);
    if (!definition) return null;

    const record = recordFromDefinition(definition, weekStartDate);
    await CityPoiProjectRepository.upsert(record);

    return buildViewModel(record);
  },

  async getProjectForPoi(poiKey: string): Promise<CityPoiProjectViewModel | null> {
    return CityPoiProjectService.ensureProjectForPoi(poiKey);
  },

  async deliverToProject(poiKey: string): Promise<DeliverToProjectResult> {
    const poi = await CityPoiRepository.findByKey(poiKey);
    if (!poi?.unlockedAt) {
      return { ok: false, reason: 'poi_locked' };
    }

    const project = await CityPoiProjectService.ensureProjectForPoi(poiKey);
    if (!project) {
      return { ok: false, reason: 'no_project' };
    }

    if (hasBlueprintByProjectKey(project.projectKey)) {
      return { ok: false, reason: 'memory_wall_project' };
    }

    if (project.isComplete) {
      return { ok: false, reason: 'project_complete' };
    }

    const today = getTodayKey();
    const deliveredToday = await CityResourceDeliveryCapRepository.getDeliveredToday(
      project.resourceType,
      today,
    );
    const capRemaining = DAILY_DELIVERY_CAP[project.resourceType] - deliveredToday;

    if (capRemaining <= 0) {
      return { ok: false, reason: 'daily_cap' };
    }

    const remaining = project.targetTotal - project.progress;
    const balances = await CityResourceService.getBalances();
    const balance = balances[project.resourceType] ?? 0;

    const deliverAmount = Math.min(
      project.deliveryChunk,
      remaining,
      balance,
      capRemaining,
    );

    if (deliverAmount <= 0) {
      return { ok: false, reason: 'insufficient_resources' };
    }

    const spent = await CityResourceService.spend(project.resourceType, deliverAmount);
    if (!spent) {
      return { ok: false, reason: 'insufficient_resources' };
    }

    await CityResourceDeliveryCapRepository.addDelivered(
      project.resourceType,
      today,
      deliverAmount,
    );

    const newProgress = project.progress + deliverAmount;
    const poiDefinition = CITY_POIS_BY_KEY[poiKey];
    const poiName = poiDefinition?.name ?? poiKey;

    const updated: CityPoiProjectRecord = {
      ...project,
      progress: newProgress,
      completedAt: newProgress >= project.targetTotal ? new Date().toISOString() : null,
    };

    await CityPoiProjectRepository.upsert(updated);

    GameEvents.emit({
      type: 'CITY_RESOURCE_DELIVERED',
      poiKey,
      poiName,
      resourceType: project.resourceType,
      amount: deliverAmount,
      projectKey: project.projectKey,
      progress: newProgress,
      targetTotal: project.targetTotal,
    });

    let localXpGranted: number | undefined;

    if (newProgress >= project.targetTotal) {
      await finalizeCityPoiProject(updated, poiName);
      localXpGranted = project.localXpOnComplete;
    }

    return {
      ok: true,
      delivered: deliverAmount,
      progress: newProgress,
      completed: newProgress >= project.targetTotal,
      localXpGranted,
    };
  },
};
