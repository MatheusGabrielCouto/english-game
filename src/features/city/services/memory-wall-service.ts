import { CITY_POIS_BY_KEY } from '@/data/loaders/city';
import { POI_PROJECTS_BY_KEY } from '@/data/loaders/poi-projects';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents } from '@/services/game-events';
import { CityPoiProjectRepository } from '@/storage/repositories/city-poi-project-repository';
import { CityPoiProjectSlotRepository } from '@/storage/repositories/city-poi-project-slot-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { CityResourceDeliveryCapRepository } from '@/storage/repositories/city-resource-delivery-cap-repository';
import { LexiconBrickRepository } from '@/storage/repositories/lexicon-brick-repository';
import { CityResourceType } from '@/types/city-resource';
import type {
    LexiconBrickRecord,
    MemoryWallState,
    PlaceBricksResult,
    ProjectBlueprint,
    ProjectSlotProgress,
} from '@/types/lexicon-brick';

import { DAILY_DELIVERY_CAP } from '../constants/city-resource-config';
import {
    BRICK_DECAY_CRACKED_STAGE,
    PLACE_CHUNK_DEFAULT,
} from '../constants/memory-wall-config';
import { CityMapService } from './city-map-service';
import { CityPoiProjectService, finalizeCityPoiProject } from './city-poi-project-service';
import { LexiconBrickService } from './lexicon-brick-service';

const sumSlotProgress = (slots: ProjectSlotProgress[]): number =>
  slots.reduce((sum, slot) => sum + slot.filledCount, 0);

const sumSlotTargets = (slots: ProjectSlotProgress[]): number =>
  slots.reduce((sum, slot) => sum + slot.targetCount, 0);

const brickFitsSlot = (brick: LexiconBrickRecord, themeTag: string): boolean => {
  if (brick.decayStage >= BRICK_DECAY_CRACKED_STAGE) return false;
  return LexiconBrickService.brickMatchesTheme(brick, themeTag);
};

export const MemoryWallService = {
  getBlueprint(projectKey: string): ProjectBlueprint | null {
    const definition = POI_PROJECTS_BY_KEY[projectKey];
    return definition?.blueprint ?? null;
  },

  hasMemoryWall(projectKey: string): boolean {
    return MemoryWallService.getBlueprint(projectKey) !== null;
  },

  async isLemmaSetUnlocked(lemmaSetKey: string): Promise<boolean> {
    return CityPoiProjectRepository.hasCompletedProjectKey(lemmaSetKey);
  },

  async ensureSlotsForProject(
    projectId: string,
    projectKey: string,
  ): Promise<ProjectSlotProgress[]> {
    const existing = await CityPoiProjectSlotRepository.listForProject(projectId);
    if (existing.length > 0) return existing;

    const blueprint = MemoryWallService.getBlueprint(projectKey);
    if (!blueprint) return [];

    const slots: ProjectSlotProgress[] = blueprint.slots.map((slot, index) => ({
      projectId,
      slotIndex: index,
      themeTag: slot.themeTag,
      label: slot.label,
      targetCount: slot.count,
      filledCount: 0,
    }));

    await CityPoiProjectSlotRepository.upsertMany(slots);
    return slots;
  },

  async getState(poiKey: string): Promise<MemoryWallState | null> {
    const project = await CityPoiProjectService.getProjectForPoi(poiKey);
    if (!project || !MemoryWallService.hasMemoryWall(project.projectKey)) {
      return null;
    }

    const slots = await MemoryWallService.ensureSlotsForProject(
      project.id,
      project.projectKey,
    );
    const progress = sumSlotProgress(slots);
    const targetTotal = sumSlotTargets(slots);
    const progressPercent =
      targetTotal > 0 ? Math.min(100, Math.round((progress / targetTotal) * 100)) : 0;

    const inventory = await LexiconBrickService.getInventorySummary();
    const crackedBricks = await LexiconBrickRepository.listCrackedByProject(
      poiKey,
      project.projectKey,
    );

    return {
      projectId: project.id,
      poiKey,
      projectKey: project.projectKey,
      title: project.title,
      isComplete: project.isComplete,
      slots: slots.map((slot) => ({
        ...slot,
        remaining: Math.max(0, slot.targetCount - slot.filledCount),
      })),
      progress,
      targetTotal,
      progressPercent,
      inventory,
      crackedBricks,
    };
  },

  async syncProjectProgress(projectId: string): Promise<number> {
    const slots = await CityPoiProjectSlotRepository.listForProject(projectId);
    return sumSlotProgress(slots);
  },

  async placeBricks(poiKey: string, maxCount?: number): Promise<PlaceBricksResult> {
    const poi = await CityPoiRepository.findByKey(poiKey);
    if (!poi?.unlockedAt) {
      return { ok: false, reason: 'poi_locked' };
    }

    const project = await CityPoiProjectService.getProjectForPoi(poiKey);
    if (!project) {
      return { ok: false, reason: 'no_project' };
    }

    if (!MemoryWallService.hasMemoryWall(project.projectKey)) {
      return { ok: false, reason: 'not_memory_wall' };
    }

    if (project.isComplete) {
      return { ok: false, reason: 'project_complete' };
    }

    const today = getTodayKey();
    const deliveredToday = await CityResourceDeliveryCapRepository.getDeliveredToday(
      CityResourceType.LEXICON_BRICK,
      today,
    );
    const capRemaining = DAILY_DELIVERY_CAP.lexicon_brick - deliveredToday;
    if (capRemaining <= 0) {
      return { ok: false, reason: 'daily_cap' };
    }

    const limit = Math.min(
      maxCount ?? project.deliveryChunk ?? PLACE_CHUNK_DEFAULT,
      capRemaining,
    );

    const slots = await MemoryWallService.ensureSlotsForProject(
      project.id,
      project.projectKey,
    );
    const unplaced = await LexiconBrickRepository.listUnplaced();
    const placeable = unplaced.filter((b) => b.decayStage < BRICK_DECAY_CRACKED_STAGE);

    let placed = 0;
    const usedBrickIds = new Set<string>();
    let slotRows = [...slots];

    while (placed < limit) {
      const openSlot = slotRows.find((s) => s.filledCount < s.targetCount);
      if (!openSlot) break;

      const brick = placeable.find(
        (b) => !usedBrickIds.has(b.brickId) && brickFitsSlot(b, openSlot.themeTag),
      );
      if (!brick) break;

      const now = new Date().toISOString();
      await LexiconBrickRepository.upsert({
        ...brick,
        placedPoiKey: poiKey,
        placedProjectKey: project.projectKey,
        placedAt: now,
      });

      usedBrickIds.add(brick.brickId);
      await CityPoiProjectSlotRepository.incrementFilled(
        project.id,
        openSlot.slotIndex,
        1,
      );

      slotRows = await CityPoiProjectSlotRepository.listForProject(project.id);

      const poiDefinition = CITY_POIS_BY_KEY[poiKey];
      GameEvents.emit({
        type: 'LEXICON_BRICK_PLACED',
        poiKey,
        poiName: poiDefinition?.name ?? poiKey,
        projectKey: project.projectKey,
        brickId: brick.brickId,
        lemmaId: brick.lemmaId,
        lemma: brick.lemma,
        themeTag: openSlot.themeTag,
        weight: 1,
      });

      placed += 1;
    }

    if (placed === 0) {
      return { ok: false, reason: 'no_matching_bricks' };
    }

    await CityResourceDeliveryCapRepository.addDelivered(
      CityResourceType.LEXICON_BRICK,
      today,
      placed,
    );

    const newProgress = await MemoryWallService.syncProjectProgress(project.id);
    const updatedSlots = await CityPoiProjectSlotRepository.listForProject(project.id);
    const targetTotal = sumSlotTargets(updatedSlots);
    const completed = newProgress >= targetTotal;

    const record = await CityPoiProjectRepository.findActiveForPoi(
      poiKey,
      project.weekStartDate,
    );

    if (record) {
      const updatedRecord = {
        ...record,
        progress: newProgress,
        targetTotal,
        completedAt: completed ? new Date().toISOString() : null,
      };
      await CityPoiProjectRepository.upsert(updatedRecord);

      if (completed) {
        const poiName = CITY_POIS_BY_KEY[poiKey]?.name ?? poiKey;
        await finalizeCityPoiProject(updatedRecord, poiName);
        GameEvents.emit({
          type: 'MEMORY_WALL_COMPLETED',
          poiKey,
          poiName,
          projectKey: project.projectKey,
          projectTitle: project.title,
          targetTotal,
        });
        await CityMapService.refresh();
      }
    }

    return {
      ok: true,
      placed,
      progress: newProgress,
      completed,
      localXpGranted: completed ? project.localXpOnComplete : undefined,
    };
  },
};
