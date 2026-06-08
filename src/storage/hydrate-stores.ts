import { AchievementService } from '@/features/achievements/services/achievement-service';
import { useAppStore } from '@/features/app/store/app-store';
import { CareerService } from '@/features/career/services/career-service';
import { CityEventService } from '@/features/city/services/city-event-service';
import { CityLivingService } from '@/features/city/services/city-living-service';
import { CityMapService } from '@/features/city/services/city-map-service';
import { CityNpcTrustService } from '@/features/city/services/city-npc-trust-service';
import { CityPoiMissionService } from '@/features/city/services/city-poi-mission-service';
import { CityResourceService } from '@/features/city/services/city-resource-service';
import { CityService } from '@/features/city/services/city-service';
import { CityVitalityService } from '@/features/city/services/city-vitality-service';
import { LexiconBrickService } from '@/features/city/services/lexicon-brick-service';
import { CollectionBookService } from '@/features/collection-book/services/collection-book-service';
import { ContractService } from '@/features/contracts/services/contract-service';
import { JournalMissionBridge } from '@/features/english-journal/services/journal-mission-bridge';
import { KnowledgeVaultService } from '@/features/english-journal/services/knowledge-vault-service';
import { EpicQuestService } from '@/features/epic-quests/services/epic-quest-service';
import { FarmService } from '@/features/farm/services/farm-service';
import { FeedbackService } from '@/features/feedback/services/feedback-service';
import { useFlashDeckStore } from '@/features/flash-deck/store/flash-deck-store';
import { FocusModeService } from '@/features/focus-mode/services/focus-mode-service';
import { FocusPetReactionService } from '@/features/focus-mode/services/focus-pet-reactions';
import { BoosterModifierCache } from '@/features/game-design/services/booster-modifier-cache';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { LearningGpsService } from '@/features/learning-gps/services/learning-gps-service';
import { LearningAnalyticsService } from '@/features/learning/services/learning-analytics-service';
import { LearningIntegrationService } from '@/features/learning/services/learning-integration-service';
import { LearningMissionBridge } from '@/features/learning/services/learning-mission-bridge';
import { LemmaCompetenceService } from '@/features/learning/services/lemma-competence-service';
import { useMenuHubStore } from '@/features/menu-hub/store/menu-hub-store';
import { MetagameService } from '@/features/metagame/services/metagame-service';
import { MotivationSparkService } from '@/features/motivation-spark/services/motivation-spark-service';
import { NotificationService } from '@/features/notifications/services/notification-service';
import { PetMemoryService } from '@/features/pet/services/pet-memory-service';
import { PetService } from '@/features/pet/services/pet-service';
import { LevelMilestoneService } from '@/features/player/services/level-milestone-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { PunishmentService } from '@/features/punishments/services/punishment-service';
import { resetDailyMissionsInDatabase } from '@/features/quests/services/reset-daily-missions';
import { useMissionsStore } from '@/features/quests/store/missions-store';
import { getTodayKey } from '@/features/quests/utils/date';
import { ReviewPromptService } from '@/features/review-prompt/services/review-prompt-service';
import { RoutineService } from '@/features/routines/services/routine-service';
import { RpgService } from '@/features/rpg/services/rpg-service';
import { ShopService } from '@/features/shop/services/shop-service';
import { StatisticsService } from '@/features/statistics/services/statistics-service';
import { StreakService } from '@/features/streak/services/streak-service';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { TitleService } from '@/features/titles/services/title-service';
import { StudyService } from '@/features/weekly-quests/services/study-service';
import { WeeklyMissionService } from '@/features/weekly-quests/services/weekly-mission-service';
import { useWeeklyMissionsStore } from '@/features/weekly-quests/store/weekly-missions-store';
import { WishlistService } from '@/features/wishlist/services/wishlist-service';
import { AndroidWidgetService } from '@/widgets/android/android-widget-service';

import { AudioDirector } from '@/services/audio';
import { StartupPerfService } from '@/services/startup-perf-service';

import { initDatabase } from './database/client';
import { migrateFromAsyncStorageIfNeeded } from './migrate-from-async-storage';
import { getOrCreateAppSettings } from './repositories/app-settings-repository';
import {
    getMissionsByDate
} from './repositories/missions-repository';
import {
    getOrCreatePlayer,
    type PlayerRecord,
} from './repositories/player-repository';

const pickPlayerState = (player: PlayerRecord) => ({
  name: player.name,
  level: player.level,
  xp: player.xp,
  coins: player.coins,
  title: player.title,
  createdAt: player.createdAt,
  lastStudyDate: player.lastStudyDate,
  currentStreak: player.currentStreak,
  bestStreak: player.bestStreak,
  totalStudyDays: player.totalStudyDays,
  shields: player.shields,
});

const loadDailyMissions = async () => {
  const today = getTodayKey();
  let missions = await getMissionsByDate(today);

  if (missions.length === 0) {
    const reset = await resetDailyMissionsInDatabase();
    missions = reset.missions;
  }

  useMissionsStore.setState({
    missions,
    missionsDate: today,
    _hasHydrated: true,
  });
};

const initGameEventListeners = (): void => {
  ContractService.initListeners();
  FeedbackService.initListeners();
  CareerService.initListeners();
  LevelMilestoneService.initListeners();
  MetagameService.initListeners();
  FocusPetReactionService.initListeners();
  PunishmentService.initListeners();
  StatisticsService.initListeners();
  EpicQuestService.initListeners();
  RpgService.initListeners();
  WeeklyMissionService.initListeners();
  PetService.initListeners();
  PetMemoryService.initListeners();
  void import('@/features/pet-farm/services/pet-instance-memory-service').then((m) =>
    m.PetInstanceMemoryService.initListeners(),
  );
  InventoryService.initListeners();
  AchievementService.initListeners();
  TitleService.initListeners();
  CityService.initListeners();
  CityMapService.initListeners();
  CityPoiMissionService.initListeners();
  CityResourceService.initListeners();
  LexiconBrickService.initListeners();
  LemmaCompetenceService.initListeners();
  LearningMissionBridge.initListeners();
  JournalMissionBridge.initListeners();
  LearningIntegrationService.initListeners();
  LearningAnalyticsService.initListeners();
  CityVitalityService.initListeners();
  CityLivingService.initListeners();
  CityEventService.initListeners();
  CityNpcTrustService.initListeners();
};

/** Fast path: enough state to render tabs and complete daily missions. */
export const hydrateCriticalStores = async (): Promise<void> => {
  const startedAt = Date.now();

  await initDatabase();
  await migrateFromAsyncStorageIfNeeded();
  initGameEventListeners();

  const player = await getOrCreatePlayer();
  usePlayerStore.setState({
    ...pickPlayerState(player),
    _hasHydrated: true,
  });

  await StreakService.reconcileOnStartup();

  const reconciledPlayer = await getOrCreatePlayer();
  usePlayerStore.setState({
    ...pickPlayerState(reconciledPlayer),
  });

  const settings = await getOrCreateAppSettings();
  useAppStore.setState({
    hasOnboarded: settings.hasOnboarded,
    difficulty: settings.difficulty,
    avatarFrame: settings.avatarFrame,
    avatarBadge: settings.avatarBadge,
    _hasHydrated: true,
  });

  await loadDailyMissions();
  await RoutineService.initialize();

  StudyService.resetSessionCache();
  await WeeklyMissionService.ensureCurrentWeek();

  useWeeklyMissionsStore.setState({
    missions: WeeklyMissionService.getCachedMissions(),
    weekStartDate: WeeklyMissionService.getCachedWeekStart(),
    isLoading: false,
  });

  AndroidWidgetService.init();
  await AndroidWidgetService.ensureSnapshot();
  await AndroidWidgetService.syncNow();

  StartupPerfService.recordCriticalHydrationMs(Date.now() - startedAt);
};

/** Heavy SQLite + service caches — runs after first paint. */
export const hydrateBackgroundServices = async (): Promise<void> => {
  await BoosterModifierCache.refresh();

  const { PetRosterService } = await import('@/features/pet-farm/services/pet-roster-service');
  const { PetFarmBonusCache } = await import('@/features/pet-farm/services/pet-farm-bonus-cache');
  const { PetTraitBonusCache } = await import('@/features/pet-farm/services/pet-trait-bonus-cache');
  const { PetPersonalityCache } = await import('@/features/pet-farm/services/pet-personality-cache');
  await PetRosterService.ensureInitialized();
  await PetFarmBonusCache.refresh();
  await PetTraitBonusCache.refresh();
  await PetPersonalityCache.refresh();

  await Promise.all([
    PetService.initialize(),
    PetMemoryService.seedInitialMemories(),
    InventoryService.initialize(),
    AchievementService.initialize(),
    ShopService.initialize(),
    TitleService.initialize(),
    CityService.initialize(),
    CityMapService.initialize(),
    CityPoiMissionService.initialize(),
    CityResourceService.initialize(),
    LexiconBrickService.initialize(),
    CityVitalityService.initialize(),
    CityLivingService.initialize(),
    CityEventService.initialize(),
    ContractService.initialize(),
    StatisticsService.initialize(),
    EpicQuestService.initialize(),
    RpgService.initialize(),
    CareerService.initialize(),
    MetagameService.initialize(),
    StudyPointsService.initialize(),
    FarmService.initialize(),
    PunishmentService.initialize(),
    CollectionBookService.initialize(),
    WishlistService.initialize(),
    import('@/features/flash-deck/services/flash-deck-seed-service').then(({ FlashDeckSeedService }) =>
      FlashDeckSeedService.initialize(),
    ),
    KnowledgeVaultService.initialize(),
    LearningGpsService.initialize(),
    import('@/features/mentor-ai/services/mentor-model-bootstrap').then(({ MentorModelBootstrap }) =>
      MentorModelBootstrap.initialize(),
    ),
    import('@/features/mentor-ai/services/mentor-retention-service').then(({ MentorRetentionService }) =>
      MentorRetentionService.runIfDue(),
    ),
  ]);

  try {
    await AudioDirector.init();
  } catch (error) {
    console.warn('[audio] initialize skipped:', error);
  }

  try {
    await FocusModeService.initialize();
  } catch (error) {
    console.warn('[focus-mode] initialize skipped:', error);
  }

  try {
    await NotificationService.initialize();
  } catch (error) {
    console.warn('[notifications] initialize skipped:', error);
  }

  try {
    ReviewPromptService.initialize();
  } catch (error) {
    console.warn('[review-prompt] initialize skipped:', error);
  }
};

export const hydrateStoresFromDatabase = async (): Promise<void> => {
  await hydrateCriticalStores();
  await hydrateBackgroundServices();
};

/** Reloads all stores and service caches after a backup restore. */
export const refreshApplicationAfterRestore = async (): Promise<void> => {
  const player = await getOrCreatePlayer();
  usePlayerStore.setState({
    ...pickPlayerState(player),
    _hasHydrated: true,
  });

  await StreakService.reconcileOnStartup();

  const reconciledPlayer = await getOrCreatePlayer();
  usePlayerStore.setState({
    ...pickPlayerState(reconciledPlayer),
  });

  const settings = await getOrCreateAppSettings();
  useAppStore.setState({
    hasOnboarded: settings.hasOnboarded,
    difficulty: settings.difficulty,
    avatarFrame: settings.avatarFrame,
    avatarBadge: settings.avatarBadge,
    _hasHydrated: true,
  });

  await loadDailyMissions();

  StudyService.resetSessionCache();
  await WeeklyMissionService.ensureCurrentWeek();

  useWeeklyMissionsStore.setState({
    missions: WeeklyMissionService.getCachedMissions(),
    weekStartDate: WeeklyMissionService.getCachedWeekStart(),
    isLoading: false,
  });

  await PetService.refresh();
  await InventoryService.refresh();
  await AchievementService.refresh();
  await ShopService.refresh();
  await TitleService.refresh();
  await CityService.refresh();
  await ContractService.refresh();
  await StatisticsService.refresh();
  await EpicQuestService.refresh();
  await RpgService.refresh();
  await CareerService.refresh();
  await MetagameService.refresh();
  await StudyPointsService.refresh();
  await FarmService.refresh();
  await RoutineService.refresh();
  await KnowledgeVaultService.refresh();
  await FocusModeService.refresh();
  await PunishmentService.refresh();
  await CollectionBookService.refresh();
  await WishlistService.refresh();

  await LearningAnalyticsService.refresh();
  void useFlashDeckStore.getState().refresh();
  await useMenuHubStore.getState().hydrate();
  await MotivationSparkService.hydrate();
  await LearningGpsService.refresh();

  try {
    await NotificationService.initialize();
  } catch (error) {
    console.warn('[notifications] re-init skipped:', error);
  }
};
