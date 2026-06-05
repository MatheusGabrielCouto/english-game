import { integer, primaryKey, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const player = sqliteTable('player', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  level: integer('level').notNull(),
  xp: integer('xp').notNull(),
  coins: integer('coins').notNull(),
  title: text('title').notNull(),
  createdAt: text('created_at').notNull(),
  lastStudyDate: text('last_study_date'),
  currentStreak: integer('current_streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  totalStudyDays: integer('total_study_days').notNull().default(0),
  shields: integer('shields').notNull().default(0),
});

export const studyDays = sqliteTable('study_days', {
  studyDate: text('study_date').primaryKey(),
  recordedAt: text('recorded_at').notNull(),
});

export const shieldUsageHistory = sqliteTable('shield_usage_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usedAt: text('used_at').notNull(),
  missedDate: text('missed_date').notNull(),
  streakProtected: integer('streak_protected').notNull(),
  shieldsRemaining: integer('shields_remaining').notNull(),
});

export const shieldStats = sqliteTable('shield_stats', {
  id: integer('id').primaryKey(),
  totalEarned: integer('total_earned').notNull().default(0),
  totalConsumed: integer('total_consumed').notNull().default(0),
  totalStreaksProtected: integer('total_streaks_protected').notNull().default(0),
  longestProtectedStreak: integer('longest_protected_streak').notNull().default(0),
});

export const shieldMilestonesClaimed = sqliteTable('shield_milestones_claimed', {
  milestoneKey: text('milestone_key').primaryKey(),
  claimedAt: text('claimed_at').notNull(),
});

export const pets = sqliteTable('pets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  instanceId: integer('instance_id'),
  stage: text('stage').notNull(),
  mood: text('mood').notNull(),
  experience: integer('experience').notNull().default(0),
  level: integer('level').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  speciesKey: text('species_key').notNull().default('codeowl'),
  energy: integer('energy').notNull().default(100),
  hunger: integer('hunger').notNull().default(100),
  happiness: integer('happiness').notNull().default(100),
  motivation: integer('motivation').notNull().default(100),
  affinity: integer('affinity').notNull().default(0),
  isIncubating: integer('is_incubating', { mode: 'boolean' }).notNull().default(false),
  hatchAt: text('hatch_at'),
  name: text('name').notNull().default('Buddy'),
  equippedCosmeticsJson: text('equipped_cosmetics_json').notNull().default('{}'),
  lastInteractionAt: text('last_interaction_at'),
  routinePhase: text('routine_phase').notNull().default('morning'),
  currentAnimationKey: text('current_animation_key').notNull().default('idle_respirando_v1'),
});

export const petMemories = sqliteTable('pet_memories', {
  memoryKey: text('memory_key').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  unlockedAt: text('unlocked_at').notNull(),
});

export const petAnalytics = sqliteTable('pet_analytics', {
  id: integer('id').primaryKey(),
  currentLevel: integer('current_level').notNull().default(1),
  currentStage: text('current_stage').notNull(),
  totalEvolutions: integer('total_evolutions').notNull().default(0),
  totalExperienceGained: integer('total_experience_gained').notNull().default(0),
  positiveMoodDays: integer('positive_mood_days').notNull().default(0),
  negativeMoodDays: integer('negative_mood_days').notNull().default(0),
  lastMoodRecordDate: text('last_mood_record_date'),
});

export const petStageRewardsClaimed = sqliteTable('pet_stage_rewards_claimed', {
  stage: text('stage').primaryKey(),
  claimedAt: text('claimed_at').notNull(),
});

export const inventoryLootBoxes = sqliteTable('inventory_loot_boxes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  rarity: text('rarity').notNull(),
  source: text('source').notNull(),
  acquiredAt: text('acquired_at').notNull(),
  opened: integer('opened', { mode: 'boolean' }).notNull().default(false),
});

export const inventorySpecialItems = sqliteTable('inventory_special_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemKey: text('item_key').notNull(),
  quantity: integer('quantity').notNull().default(1),
  source: text('source').notNull(),
  acquiredAt: text('acquired_at').notNull(),
});

export const inventoryAcquisitionHistory = sqliteTable('inventory_acquisition_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  itemKey: text('item_key').notNull(),
  quantity: integer('quantity').notNull(),
  message: text('message').notNull(),
  source: text('source').notNull(),
  acquiredAt: text('acquired_at').notNull(),
});

export const inventoryAnalytics = sqliteTable('inventory_analytics', {
  id: integer('id').primaryKey(),
  totalItemsAcquired: integer('total_items_acquired').notNull().default(0),
  totalShieldsReceived: integer('total_shields_received').notNull().default(0),
  totalLootBoxesReceived: integer('total_loot_boxes_received').notNull().default(0),
  totalSpecialItemsReceived: integer('total_special_items_received').notNull().default(0),
  lastUpdatedAt: text('last_updated_at'),
});

export const lootBoxOpenHistory = sqliteTable('loot_box_open_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lootBoxId: integer('loot_box_id').notNull(),
  boxRarity: text('box_rarity').notNull(),
  rewardType: text('reward_type').notNull(),
  rewardAmount: integer('reward_amount').notNull(),
  rewardLabel: text('reward_label').notNull(),
  rewardRarity: text('reward_rarity'),
  rewardItemKey: text('reward_item_key'),
  openedAt: text('opened_at').notNull(),
});

export const lootBoxAnalytics = sqliteTable('loot_box_analytics', {
  id: integer('id').primaryKey(),
  totalReceived: integer('total_received').notNull().default(0),
  totalOpened: integer('total_opened').notNull().default(0),
  totalCoinsFromBoxes: integer('total_coins_from_boxes').notNull().default(0),
  totalShieldsFromBoxes: integer('total_shields_from_boxes').notNull().default(0),
  biggestCoinReward: integer('biggest_coin_reward').notNull().default(0),
  openedCommon: integer('opened_common').notNull().default(0),
  openedRare: integer('opened_rare').notNull().default(0),
  openedEpic: integer('opened_epic').notNull().default(0),
  openedLegendary: integer('opened_legendary').notNull().default(0),
});

export const achievementUnlocks = sqliteTable('achievement_unlocks', {
  achievementKey: text('achievement_key').primaryKey(),
  unlockedAt: text('unlocked_at').notNull(),
});

export const achievementStats = sqliteTable('achievement_stats', {
  id: integer('id').primaryKey(),
  totalMissionsCompleted: integer('total_missions_completed').notNull().default(0),
  totalXpEarned: integer('total_xp_earned').notNull().default(0),
  totalLootBoxesOpened: integer('total_loot_boxes_opened').notNull().default(0),
  totalDuelWins: integer('total_duel_wins').notNull().default(0),
  totalFlashReviews: integer('total_flash_reviews').notNull().default(0),
  totalRoutinesCompleted: integer('total_routines_completed').notNull().default(0),
  totalJournalEntries: integer('total_journal_entries').notNull().default(0),
  totalJournalVoiceNotes: integer('total_journal_voice_notes').notNull().default(0),
  totalJournalReviews: integer('total_journal_reviews').notNull().default(0),
  totalJournalConnections: integer('total_journal_connections').notNull().default(0),
});

export const userRoutines = sqliteTable('user_routines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  frequency: text('frequency').notNull(),
  reminderTime: text('reminder_time'),
  weekdaysJson: text('weekdays_json').notNull().default('[]'),
  expectedDurationMin: integer('expected_duration_min'),
  customXp: integer('custom_xp'),
  customCoins: integer('custom_coins'),
  templateKey: text('template_key'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const routineCompletions = sqliteTable(
  'routine_completions',
  {
    id: text('id').primaryKey(),
    routineId: text('routine_id').notNull(),
    periodKey: text('period_key').notNull(),
    completedAt: text('completed_at').notNull(),
    xpAwarded: integer('xp_awarded').notNull().default(0),
    coinsAwarded: integer('coins_awarded').notNull().default(0),
    studyPointsAwarded: integer('study_points_awarded').notNull().default(0),
  },
  (table) => ({
    routinePeriodUnique: unique().on(table.routineId, table.periodKey),
  }),
);

export const routineStats = sqliteTable('routine_stats', {
  routineId: text('routine_id').primaryKey(),
  totalCompleted: integer('total_completed').notNull().default(0),
  totalMissed: integer('total_missed').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  lastCompletedPeriod: text('last_completed_period'),
  updatedAt: text('updated_at').notNull(),
});

export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  entryType: text('entry_type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  category: text('category').notNull(),
  importance: text('importance').notNull().default('medium'),
  tagsJson: text('tags_json').notNull().default('[]'),
  audioUri: text('audio_uri'),
  audioDurationMs: integer('audio_duration_ms'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  spaceKey: text('space_key').notNull().default('personal_notes'),
  folderId: text('folder_id'),
  reviewStage: integer('review_stage').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  nextReviewAt: text('next_review_at'),
  lastReviewedAt: text('last_reviewed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const journalFolders = sqliteTable('journal_folders', {
  id: text('id').primaryKey(),
  spaceKey: text('space_key').notNull(),
  parentId: text('parent_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const journalEntryLinks = sqliteTable(
  'journal_entry_links',
  {
    fromEntryId: text('from_entry_id').notNull(),
    toEntryId: text('to_entry_id').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    linkPairPk: unique().on(table.fromEntryId, table.toEntryId),
  }),
);

export const journalCollections = sqliteTable('journal_collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  emoji: text('emoji').notNull().default('📚'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const journalEntryCollections = sqliteTable(
  'journal_entry_collections',
  {
    entryId: text('entry_id').notNull(),
    collectionId: text('collection_id').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    entryCollectionPk: unique().on(table.entryId, table.collectionId),
  }),
);

export const journalStats = sqliteTable('journal_stats', {
  id: integer('id').primaryKey(),
  totalEntries: integer('total_entries').notNull().default(0),
  totalVoiceNotes: integer('total_voice_notes').notNull().default(0),
  totalTextNotes: integer('total_text_notes').notNull().default(0),
  totalReviews: integer('total_reviews').notNull().default(0),
  totalVoiceMs: integer('total_voice_ms').notNull().default(0),
  totalXpFromJournal: integer('total_xp_from_journal').notNull().default(0),
  knowledgeProgress: integer('knowledge_progress').notNull().default(0),
  knowledgePoints: integer('knowledge_points').notNull().default(0),
  knowledgeLevel: integer('knowledge_level').notNull().default(1),
  knowledgeMasteryBps: integer('knowledge_mastery_bps').notNull().default(0),
  totalConnections: integer('total_connections').notNull().default(0),
  totalCollections: integer('total_collections').notNull().default(0),
  libraryTier: integer('library_tier').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const learningAppState = sqliteTable('learning_app_state', {
  stateKey: text('state_key').primaryKey(),
  stateValue: text('state_value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const learningAnalytics = sqliteTable('learning_analytics', {
  id: integer('id').primaryKey(),
  duelWins: integer('duel_wins').notNull().default(0),
  duelLosses: integer('duel_losses').notNull().default(0),
  duelSessions: integer('duel_sessions').notNull().default(0),
  duelFlawlessWins: integer('duel_flawless_wins').notNull().default(0),
  flashReviews: integer('flash_reviews').notNull().default(0),
  flashSessions: integer('flash_sessions').notNull().default(0),
  cardsSavedFromDuel: integer('cards_saved_from_duel').notNull().default(0),
  weeklyBossWins: integer('weekly_boss_wins').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const achievementAnalytics = sqliteTable('achievement_analytics', {
  id: integer('id').primaryKey(),
  totalUnlocked: integer('total_unlocked').notNull().default(0),
  totalCoinsGranted: integer('total_coins_granted').notNull().default(0),
  totalShieldsGranted: integer('total_shields_granted').notNull().default(0),
  totalLootBoxesGranted: integer('total_loot_boxes_granted').notNull().default(0),
  lastUnlockAt: text('last_unlock_at'),
});

export const shopPurchaseHistory = sqliteTable('shop_purchase_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productKey: text('product_key').notNull(),
  productName: text('product_name').notNull(),
  category: text('category').notNull(),
  quantity: integer('quantity').notNull(),
  pricePaid: integer('price_paid').notNull(),
  purchasedAt: text('purchased_at').notNull(),
});

export const shopAnalytics = sqliteTable('shop_analytics', {
  id: integer('id').primaryKey(),
  totalCoinsSpent: integer('total_coins_spent').notNull().default(0),
  totalPurchases: integer('total_purchases').notNull().default(0),
  totalItemsAcquired: integer('total_items_acquired').notNull().default(0),
  shieldsPurchased: integer('shields_purchased').notNull().default(0),
  lootBoxesPurchased: integer('loot_boxes_purchased').notNull().default(0),
  lastPurchaseAt: text('last_purchase_at'),
});

export const shopProductStats = sqliteTable('shop_product_stats', {
  productKey: text('product_key').primaryKey(),
  category: text('category').notNull(),
  purchaseCount: integer('purchase_count').notNull().default(0),
  coinsSpent: integer('coins_spent').notNull().default(0),
});

export const titleUnlocks = sqliteTable('title_unlocks', {
  titleKey: text('title_key').primaryKey(),
  unlockedAt: text('unlocked_at').notNull(),
  levelAtUnlock: integer('level_at_unlock').notNull(),
});

export const titleAnalytics = sqliteTable('title_analytics', {
  id: integer('id').primaryKey(),
  currentTitleKey: text('current_title_key').notNull(),
  totalUnlocked: integer('total_unlocked').notNull().default(0),
  lastPromotionAt: text('last_promotion_at'),
});

export const cityBuildingUnlocks = sqliteTable('city_building_unlocks', {
  buildingKey: text('building_key').primaryKey(),
  unlockedAt: text('unlocked_at').notNull(),
  levelAtUnlock: integer('level_at_unlock').notNull(),
});

export const cityAnalytics = sqliteTable('city_analytics', {
  id: integer('id').primaryKey(),
  currentBuildingKey: text('current_building_key').notNull(),
  totalUnlocked: integer('total_unlocked').notNull().default(0),
  lastUnlockAt: text('last_unlock_at'),
});

export const cityDistricts = sqliteTable('city_districts', {
  districtKey: text('district_key').primaryKey(),
  unlockedAt: text('unlocked_at'),
  unlockReason: text('unlock_reason'),
});

export const cityPois = sqliteTable('city_pois', {
  poiKey: text('poi_key').primaryKey(),
  districtKey: text('district_key').notNull(),
  category: text('category').notNull(),
  localLevel: integer('local_level').notNull().default(1),
  localXp: integer('local_xp').notNull().default(0),
  positionX: real('position_x').notNull(),
  positionY: real('position_y').notNull(),
  unlockedAt: text('unlocked_at'),
  visualStage: integer('visual_stage').notNull().default(1),
  npcTrust: integer('npc_trust').notNull().default(50),
});

export const cityMapState = sqliteTable('city_map_state', {
  id: integer('id').primaryKey(),
  cityName: text('city_name').notNull(),
  cityVitality: integer('city_vitality').notNull().default(100),
  activeRumorKey: text('active_rumor_key'),
  rumorUpdatedAt: text('rumor_updated_at'),
  updatedAt: text('updated_at').notNull(),
});

export const cityPoiVisits = sqliteTable(
  'city_poi_visits',
  {
    poiKey: text('poi_key').notNull(),
    visitDate: text('visit_date').notNull(),
    petVisitBonus: integer('pet_visit_bonus', { mode: 'boolean' }).notNull().default(false),
    visitedAt: text('visited_at').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.poiKey, table.visitDate] }),
  }),
);

export const cityResources = sqliteTable('city_resources', {
  resourceType: text('resource_type').primaryKey(),
  balance: integer('balance').notNull().default(0),
});

export const cityPoiProjects = sqliteTable('city_poi_projects', {
  id: text('id').primaryKey(),
  poiKey: text('poi_key').notNull(),
  projectKey: text('project_key').notNull(),
  weekStartDate: text('week_start_date').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  resourceType: text('resource_type').notNull(),
  targetTotal: integer('target_total').notNull(),
  deliveryChunk: integer('delivery_chunk').notNull(),
  progress: integer('progress').notNull().default(0),
  localXpOnComplete: integer('local_xp_on_complete').notNull(),
  vitalityOnComplete: integer('vitality_on_complete').notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
});

export const lemmaMastery = sqliteTable('lemma_mastery', {
  lemmaId: text('lemma_id').primaryKey(),
  lemma: text('lemma').notNull(),
  translation: text('translation').notNull(),
  recognitionScore: integer('recognition_score').notNull().default(0),
  productionScore: integer('production_score').notNull().default(0),
  lastReviewAt: text('last_review_at').notNull(),
  nextReviewAt: text('next_review_at').notNull(),
  decayStage: integer('decay_stage').notNull().default(0),
  themeTagsJson: text('theme_tags_json').notNull(),
  contextsSeenJson: text('contexts_seen_json').notNull().default('[]'),
});

export const lexiconBricks = sqliteTable('lexicon_bricks', {
  brickId: text('brick_id').primaryKey(),
  lemmaId: text('lemma_id').notNull(),
  lemma: text('lemma').notNull(),
  translation: text('translation').notNull(),
  themeTagsJson: text('theme_tags_json').notNull(),
  source: text('source').notNull(),
  mintedAt: text('minted_at').notNull(),
  lastReviewAt: text('last_review_at').notNull(),
  nextReviewAt: text('next_review_at').notNull(),
  decayStage: integer('decay_stage').notNull().default(0),
  placedPoiKey: text('placed_poi_key'),
  placedProjectKey: text('placed_project_key'),
  placedAt: text('placed_at'),
});

export const cityPoiProjectSlotProgress = sqliteTable(
  'city_poi_project_slot_progress',
  {
    projectId: text('project_id').notNull(),
    slotIndex: integer('slot_index').notNull(),
    themeTag: text('theme_tag').notNull(),
    label: text('label').notNull(),
    targetCount: integer('target_count').notNull(),
    filledCount: integer('filled_count').notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.slotIndex] }),
  }),
);

export const cityResourceDeliveryCaps = sqliteTable(
  'city_resource_delivery_caps',
  {
    resourceType: text('resource_type').notNull(),
    deliveryDate: text('delivery_date').notNull(),
    amount: integer('amount').notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.resourceType, table.deliveryDate] }),
  }),
);

export const cityPoiMissions = sqliteTable('city_poi_missions', {
  id: text('id').primaryKey(),
  poiKey: text('poi_key').notNull(),
  missionDate: text('mission_date').notNull(),
  templateKey: text('template_key').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  missionType: text('mission_type').notNull(),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').notNull().default(0),
  xpReward: integer('xp_reward').notNull(),
  coinReward: integer('coin_reward').notNull(),
  localXpReward: integer('local_xp_reward').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  claimed: integer('claimed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  eventKey: text('event_key'),
  chainKey: text('chain_key'),
  chainStep: integer('chain_step'),
});

export const cityPoiChainProgress = sqliteTable(
  'city_poi_chain_progress',
  {
    poiKey: text('poi_key').notNull(),
    chainKey: text('chain_key').notNull(),
    currentStep: integer('current_step').notNull().default(0),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.poiKey, table.chainKey] }),
  }),
);

export const cityEventState = sqliteTable('city_event_state', {
  eventKey: text('event_key').primaryKey(),
  spiritProgress: integer('spirit_progress').notNull().default(0),
  vocabWordsLearned: integer('vocab_words_learned').notNull().default(0),
  introSeen: integer('intro_seen', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
  startedAt: text('started_at'),
  updatedAt: text('updated_at').notNull(),
});

export const contractRuns = sqliteTable('contract_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contractKey: text('contract_key').notNull(),
  issuerPoiKey: text('issuer_poi_key'),
  status: text('status').notNull(),
  targetDays: integer('target_days').notNull(),
  progressDays: integer('progress_days').notNull(),
  stakeAmount: integer('stake_amount').notNull(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  lastProgressAt: text('last_progress_at'),
});

export const contractAnalytics = sqliteTable('contract_analytics', {
  id: integer('id').primaryKey(),
  totalAccepted: integer('total_accepted').notNull().default(0),
  totalCompleted: integer('total_completed').notNull().default(0),
  totalFailed: integer('total_failed').notNull().default(0),
  totalCoinsStaked: integer('total_coins_staked').notNull().default(0),
  totalCoinsWon: integer('total_coins_won').notNull().default(0),
  totalCoinsLost: integer('total_coins_lost').notNull().default(0),
  totalShieldsGranted: integer('total_shields_granted').notNull().default(0),
  totalLootBoxesGranted: integer('total_loot_boxes_granted').notNull().default(0),
  largestContractCompletedKey: text('largest_contract_completed_key'),
  lastContractAt: text('last_contract_at'),
});

export const playerStatistics = sqliteTable('player_statistics', {
  id: integer('id').primaryKey(),
  totalStudyMinutes: integer('total_study_minutes').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const statisticsMilestones = sqliteTable('statistics_milestones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  milestoneKey: text('milestone_key').notNull(),
  label: text('label').notNull(),
  value: integer('value'),
  metadataJson: text('metadata_json'),
  occurredAt: text('occurred_at').notNull(),
});

export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey(),
  hasOnboarded: integer('has_onboarded', { mode: 'boolean' }).notNull().default(false),
  currentWeekStart: text('current_week_start'),
  difficulty: text('difficulty').notNull().default('balanced'),
  avatarFrame: text('avatar_frame').notNull().default('default'),
  avatarBadge: text('avatar_badge'),
  weeklyLootGrantedWeek: text('weekly_loot_granted_week'),
  lootPityCounter: integer('loot_pity_counter').notNull().default(0),
});

export const notificationSettings = sqliteTable('notification_settings', {
  id: integer('id').primaryKey(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  preferredHour: integer('preferred_hour').notNull().default(19),
  preferredMinute: integer('preferred_minute').notNull().default(0),
  dailyReminder: integer('daily_reminder', { mode: 'boolean' }).notNull().default(true),
  streakReminder: integer('streak_reminder', { mode: 'boolean' }).notNull().default(true),
  shieldWarning: integer('shield_warning', { mode: 'boolean' }).notNull().default(true),
  petReminder: integer('pet_reminder', { mode: 'boolean' }).notNull().default(true),
  contractReminder: integer('contract_reminder', { mode: 'boolean' }).notNull().default(true),
  achievementProgress: integer('achievement_progress', { mode: 'boolean' }).notNull().default(true),
  cityProgress: integer('city_progress', { mode: 'boolean' }).notNull().default(true),
  updatedAt: text('updated_at').notNull(),
});

export const notificationHistory = sqliteTable('notification_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull(),
  identifier: text('identifier').notNull(),
  scheduledFor: text('scheduled_for'),
  deliveredAt: text('delivered_at'),
  openedAt: text('opened_at'),
  createdAt: text('created_at').notNull(),
});

export const careerProgress = sqliteTable('career_progress', {
  id: integer('id').primaryKey(),
  currentRoleKey: text('current_role_key').notNull().default('student'),
  currentCompanyKey: text('current_company_key').notNull().default('startup_local'),
  englishScore: integer('english_score').notNull().default(0),
  completedInterviewsJson: text('completed_interviews_json').notNull().default('[]'),
  unlockedOffersJson: text('unlocked_offers_json').notNull().default('[]'),
  dreamProgressJson: text('dream_progress_json').notNull().default('{}'),
  promotionsCount: integer('promotions_count').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const careerEvents = sqliteTable('career_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventType: text('event_type').notNull(),
  eventKey: text('event_key').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  occurredAt: text('occurred_at').notNull(),
});

export const metagameState = sqliteTable('metagame_state', {
  id: integer('id').primaryKey(),
  prestigeLevel: integer('prestige_level').notNull().default(0),
  seasonKey: text('season_key').notNull(),
  seasonPoints: integer('season_points').notNull().default(0),
  seasonClaimedTiersJson: text('season_claimed_tiers_json').notNull().default('[]'),
  annualProgressJson: text('annual_progress_json').notNull().default('{}'),
  updatedAt: text('updated_at').notNull(),
});

export const legacyMilestones = sqliteTable('legacy_milestones', {
  milestoneKey: text('milestone_key').primaryKey(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  occurredAt: text('occurred_at').notNull(),
  recordedAt: text('recorded_at').notNull(),
});

export const playerRpg = sqliteTable('player_rpg', {
  id: integer('id').primaryKey(),
  intelligence: integer('intelligence').notNull().default(1),
  discipline: integer('discipline').notNull().default(1),
  communication: integer('communication').notNull().default(1),
  confidence: integer('confidence').notNull().default(1),
  fluency: integer('fluency').notNull().default(1),
  unlockedPerksJson: text('unlocked_perks_json').notNull().default('[]'),
  updatedAt: text('updated_at').notNull(),
});

export const epicMissionProgress = sqliteTable('epic_mission_progress', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  missionType: text('mission_type').notNull(),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').notNull().default(0),
  xpReward: integer('xp_reward').notNull(),
  coinReward: integer('coin_reward').notNull(),
  difficulty: text('difficulty').notNull(),
  status: text('status').notNull().default('active'),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
});

export const petCollection = sqliteTable('pet_collection', {
  speciesKey: text('species_key').primaryKey(),
  discoveredAt: text('discovered_at').notNull(),
  timesOwned: integer('times_owned').notNull().default(1),
});

export const petInstances = sqliteTable('pet_instances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  speciesKey: text('species_key').notNull(),
  gender: text('gender').notNull(),
  nickname: text('nickname').notNull(),
  stage: text('stage').notNull(),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  statsJson: text('stats_json').notNull().default('{}'),
  effectivePassiveValue: real('effective_passive_value').notNull().default(0),
  passiveFieldSlot: integer('passive_field_slot'),
  breedingPenSlot: integer('breeding_pen_slot'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  parentMotherId: integer('parent_mother_id'),
  parentFatherId: integer('parent_father_id'),
  generation: integer('generation').notNull().default(1),
  traitKeysJson: text('trait_keys_json').notNull().default('[]'),
  personalityKey: text('personality_key').notNull().default('friendly'),
  breedingCooldownUntil: text('breeding_cooldown_until'),
  favoriteTag: text('favorite_tag').notNull().default('none'),
  hallOfFameSlot: integer('hall_of_fame_slot'),
  totalAdventures: integer('total_adventures').notNull().default(0),
  equippedCosmeticsJson: text('equipped_cosmetics_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const petFarmFields = sqliteTable('pet_farm_fields', {
  fieldKey: text('field_key').primaryKey(),
  level: integer('level').notNull().default(1),
});

export const petFarmMeta = sqliteTable('pet_farm_meta', {
  id: integer('id').primaryKey(),
  farmXp: integer('farm_xp').notNull().default(0),
});

export const petIncubators = sqliteTable('pet_incubators', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  speciesKey: text('species_key').notNull(),
  source: text('source').notNull(),
  hatchAt: text('hatch_at').notNull(),
  parentMotherId: integer('parent_mother_id'),
  parentFatherId: integer('parent_father_id'),
  predictedStatsJson: text('predicted_stats_json'),
  createdAt: text('created_at').notNull(),
});

export const petInstanceMemories = sqliteTable(
  'pet_instance_memories',
  {
    instanceId: integer('instance_id').notNull(),
    memoryKey: text('memory_key').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    unlockedAt: text('unlocked_at').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.instanceId, table.memoryKey] }),
  }),
);

export const petBreedingLog = sqliteTable('pet_breeding_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  motherInstanceId: integer('mother_instance_id').notNull(),
  fatherInstanceId: integer('father_instance_id').notNull(),
  outcomeSpeciesKey: text('outcome_species_key').notNull(),
  rolledStatsJson: text('rolled_stats_json').notNull(),
  parentStatsSnapshotJson: text('parent_stats_snapshot_json').notNull(),
  outcomeWeightsSnapshotJson: text('outcome_weights_snapshot_json').notNull(),
  rolledAt: text('rolled_at').notNull(),
});

export const petAdventures = sqliteTable('pet_adventures', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  instanceId: integer('instance_id').notNull(),
  biomeKey: text('biome_key').notNull(),
  durationKey: text('duration_key').notNull(),
  startedAt: text('started_at').notNull(),
  endsAt: text('ends_at').notNull(),
  createdAt: text('created_at').notNull(),
});

/** Contagem semanal de aventuras 24h concluídas (teto 3/semana). */
export const petAdventure24hLog = sqliteTable('pet_adventure_24h_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimedAt: text('claimed_at').notNull(),
});

export const petAcademySessions = sqliteTable('pet_academy_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  instanceId: integer('instance_id').notNull(),
  trackKey: text('track_key').notNull(),
  startedAt: text('started_at').notNull(),
  endsAt: text('ends_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const petLeagueMeta = sqliteTable('pet_league_meta', {
  id: integer('id').primaryKey(),
  seasonKey: text('season_key').notNull(),
  seasonStartIso: text('season_start_iso').notNull(),
  claimedRewardTiersJson: text('claimed_reward_tiers_json').notNull().default('[]'),
  updatedAt: text('updated_at').notNull(),
});

export const petLeagueEntries = sqliteTable('pet_league_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  instanceId: integer('instance_id').notNull(),
  seasonKey: text('season_key').notNull(),
  division: text('division').notNull(),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  winStreak: integer('win_streak').notNull().default(0),
  peakRating: integer('peak_rating').notNull().default(0),
  battlesToday: integer('battles_today').notNull().default(0),
  battlesDayIso: text('battles_day_iso'),
  lastBattleAt: text('last_battle_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const petCosmeticInventory = sqliteTable(
  'pet_cosmetic_inventory',
  {
    instanceId: integer('instance_id').notNull(),
    cosmeticKey: text('cosmetic_key').notNull(),
    acquiredAt: text('acquired_at').notNull(),
    source: text('source').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.instanceId, table.cosmeticKey] }),
  }),
);

export const activeBoosters = sqliteTable('active_boosters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  boosterKey: text('booster_key').notNull(),
  multiplier: real('multiplier').notNull(),
  expiresAt: text('expires_at').notNull(),
  source: text('source').notNull(),
});

export const studyPoints = sqliteTable('study_points', {
  id: integer('id').primaryKey(),
  balance: integer('balance').notNull().default(0),
  lifetimeEarned: integer('lifetime_earned').notNull().default(0),
  lifetimeSpent: integer('lifetime_spent').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const studyPointsHistory = sqliteTable('study_points_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  source: text('source').notNull(),
  createdAt: text('created_at').notNull(),
});

export const collectionBook = sqliteTable('collection_book', {
  itemKey: text('item_key').primaryKey(),
  category: text('category').notNull(),
  rarity: text('rarity').notNull(),
  discoveredAt: text('discovered_at').notNull(),
});

export const wishlist = sqliteTable('wishlist', {
  itemKey: text('item_key').primaryKey(),
  addedAt: text('added_at').notNull(),
});

export const farmSessions = sqliteTable('farm_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  activityType: text('activity_type').notNull(),
  amount: integer('amount').notNull(),
  studyPointsEarned: integer('study_points_earned').notNull(),
  coinsEarned: integer('coins_earned').notNull(),
  recordedAt: text('recorded_at').notNull(),
});

export const focusSettings = sqliteTable('focus_settings', {
  id: integer('id').primaryKey(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  defaultDurationMinutes: integer('default_duration_minutes').notNull().default(30),
  hardcoreMode: integer('hardcore_mode', { mode: 'boolean' }).notNull().default(false),
  monitoringEnabled: integer('monitoring_enabled', { mode: 'boolean' }).notNull().default(true),
  accessibilityDisclosureAccepted: integer('accessibility_disclosure_accepted', {
    mode: 'boolean',
  })
    .notNull()
    .default(false),
  updatedAt: text('updated_at').notNull(),
});

export const focusBlockedApps = sqliteTable('focus_blocked_apps', {
  packageName: text('package_name').primaryKey(),
  label: text('label').notNull(),
  category: text('category').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
});

export const focusSessions = sqliteTable('focus_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studyType: text('study_type').notNull(),
  plannedDurationSec: integer('planned_duration_sec').notNull(),
  status: text('status').notNull(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  focusedSeconds: integer('focused_seconds').notNull().default(0),
  distractedSeconds: integer('distracted_seconds').notNull().default(0),
  idleSeconds: integer('idle_seconds').notNull().default(0),
  pauseSeconds: integer('pause_seconds').notNull().default(0),
  wordsLearned: integer('words_learned').notNull().default(0),
  xpEarned: integer('xp_earned').notNull().default(0),
  coinsEarned: integer('coins_earned').notNull().default(0),
  spEarned: integer('sp_earned').notNull().default(0),
  bonusMultiplier: real('bonus_multiplier').notNull().default(1),
  lootBoxGranted: integer('loot_box_granted', { mode: 'boolean' }).notNull().default(false),
  lootBoxRarity: text('loot_box_rarity'),
  abandonReason: text('abandon_reason'),
});

export const focusSessionEvents = sqliteTable('focus_session_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').notNull(),
  eventType: text('event_type').notNull(),
  packageName: text('package_name'),
  durationSec: integer('duration_sec'),
  occurredAt: text('occurred_at').notNull(),
  metadataJson: text('metadata_json'),
});

export const focusAnalytics = sqliteTable('focus_analytics', {
  id: integer('id').primaryKey(),
  totalSessions: integer('total_sessions').notNull().default(0),
  completedSessions: integer('completed_sessions').notNull().default(0),
  abandonedSessions: integer('abandoned_sessions').notNull().default(0),
  totalFocusSeconds: integer('total_focus_seconds').notNull().default(0),
  totalDistractionSeconds: integer('total_distraction_seconds').notNull().default(0),
  totalXpEarned: integer('total_xp_earned').notNull().default(0),
  totalCoinsEarned: integer('total_coins_earned').notNull().default(0),
  totalSpEarned: integer('total_sp_earned').notNull().default(0),
  totalLootBoxes: integer('total_loot_boxes').notNull().default(0),
  lastSessionAt: text('last_session_at'),
});

export const punishmentState = sqliteTable('punishment_state', {
  id: integer('id').primaryKey(),
  activePenaltiesJson: text('active_penalties_json').notNull().default('[]'),
  recoveryStreakDays: integer('recovery_streak_days').notNull().default(0),
  lastAppOpenAt: text('last_app_open_at'),
  lastRecoveryAt: text('last_recovery_at'),
  pendingWarningJson: text('pending_warning_json'),
  cityVibrancy: integer('city_vibrancy').notNull().default(100),
  updatedAt: text('updated_at').notNull(),
});

export const punishmentHistory = sqliteTable('punishment_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  triggerType: text('trigger_type').notNull(),
  severity: text('severity').notNull(),
  xpDecayPercent: integer('xp_decay_percent').notNull().default(0),
  coinDecayPercent: integer('coin_decay_percent').notNull().default(0),
  lootLuckReduction: integer('loot_luck_reduction').notNull().default(0),
  contractPenalty: integer('contract_penalty', { mode: 'boolean' }).notNull().default(false),
  petMoodOverride: text('pet_mood_override'),
  cityVibrancy: integer('city_vibrancy').notNull().default(100),
  appliedAt: text('applied_at').notNull(),
  recoveredAt: text('recovered_at'),
  metadataJson: text('metadata_json'),
});

export const punishmentAnalytics = sqliteTable('punishment_analytics', {
  id: integer('id').primaryKey(),
  totalApplied: integer('total_applied').notNull().default(0),
  totalRecovered: integer('total_recovered').notNull().default(0),
  totalWarnings: integer('total_warnings').notNull().default(0),
  streakFailures: integer('streak_failures').notNull().default(0),
  contractFailures: integer('contract_failures').notNull().default(0),
  focusFailures: integer('focus_failures').notNull().default(0),
  inactivityFailures: integer('inactivity_failures').notNull().default(0),
  avgRecoveryDays: real('avg_recovery_days').notNull().default(0),
  lastAppliedAt: text('last_applied_at'),
  lastRecoveredAt: text('last_recovered_at'),
});

export const dailyMissions = sqliteTable(
  'daily_missions',
  {
    id: text('id').notNull(),
    missionsDate: text('missions_date').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    xpReward: integer('xp_reward').notNull(),
    coinReward: integer('coin_reward').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    category: text('category'),
    difficulty: text('difficulty'),
    templateKey: text('template_key'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.missionsDate] }),
  }),
);

export const weeklyMissions = sqliteTable(
  'weekly_missions',
  {
    id: text('id').notNull(),
    weekStartDate: text('week_start_date').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    missionType: text('mission_type').notNull(),
    targetValue: integer('target_value').notNull(),
    currentValue: integer('current_value').notNull().default(0),
    xpReward: integer('xp_reward').notNull(),
    coinReward: integer('coin_reward').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    claimed: integer('claimed', { mode: 'boolean' }).notNull().default(false),
    weekEndDate: text('week_end_date').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.weekStartDate] }),
  }),
);

export const weeklyMissionsHistory = sqliteTable('weekly_missions_history', {
  id: text('id').notNull(),
  weekStartDate: text('week_start_date').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  missionType: text('mission_type').notNull(),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').notNull(),
  xpReward: integer('xp_reward').notNull(),
  coinReward: integer('coin_reward').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull(),
  claimed: integer('claimed', { mode: 'boolean' }).notNull(),
  weekEndDate: text('week_end_date').notNull(),
  createdAt: text('created_at').notNull(),
  archivedAt: text('archived_at').notNull(),
});

export const flashDecks = sqliteTable('flash_decks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  coverEmoji: text('cover_emoji'),
  sortOrder: integer('sort_order').notNull().default(0),
  newPerDay: integer('new_per_day').notNull().default(10),
  reviewCap: integer('review_cap').notNull().default(80),
  createdAt: text('created_at').notNull(),
  archivedAt: text('archived_at'),
});

export const flashCards = sqliteTable('flash_cards', {
  id: text('id').primaryKey(),
  deckId: text('deck_id').notNull(),
  lemma: text('lemma'),
  front: text('front').notNull(),
  back: text('back').notNull(),
  exampleSentence: text('example_sentence'),
  audioUri: text('audio_uri'),
  imageUri: text('image_uri'),
  tagsJson: text('tags_json').notNull().default('[]'),
  source: text('source').notNull(),
  easeFactor: real('ease_factor').notNull().default(2.5),
  intervalDays: integer('interval_days').notNull().default(0),
  repetitions: integer('repetitions').notNull().default(0),
  lapseCount: integer('lapse_count').notNull().default(0),
  dueAt: text('due_at').notNull(),
  state: text('state').notNull(),
  lastReviewedAt: text('last_reviewed_at'),
  createdAt: text('created_at').notNull(),
  suspended: integer('suspended', { mode: 'boolean' }).notNull().default(false),
});

export const flashReviewLog = sqliteTable('flash_review_log', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull(),
  rating: text('rating').notNull(),
  previousInterval: integer('previous_interval'),
  newInterval: integer('new_interval'),
  reviewedAt: text('reviewed_at').notNull(),
  sessionId: text('session_id'),
  durationMs: integer('duration_ms'),
});

export const flashStudySessions = sqliteTable('flash_study_sessions', {
  id: text('id').primaryKey(),
  deckId: text('deck_id'),
  mode: text('mode').notNull(),
  cardsReviewed: integer('cards_reviewed').notNull(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
});

export const duelPlayerProfile = sqliteTable('duel_player_profile', {
  id: integer('id').primaryKey(),
  currentPatent: text('current_patent').notNull(),
  patentXp: integer('patent_xp').notNull().default(0),
  highestPatent: text('highest_patent').notNull(),
  stamina: integer('stamina').notNull().default(5),
  staminaUpdatedAt: text('stamina_updated_at').notNull(),
  focusCharges: integer('focus_charges').notNull().default(1),
  dailyDuelCount: integer('daily_duel_count').notNull().default(0),
  dailyResetDate: text('daily_reset_date').notNull(),
});

export const duelSessions = sqliteTable('duel_sessions', {
  id: text('id').primaryKey(),
  enemyKey: text('enemy_key').notNull(),
  arenaKey: text('arena_key').notNull(),
  patentAtStart: text('patent_at_start').notNull(),
  playerHp: integer('player_hp').notNull(),
  enemyHp: integer('enemy_hp').notNull(),
  comboStreak: integer('combo_streak').notNull().default(0),
  status: text('status').notNull(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
});

export const duelSessionQuestions = sqliteTable('duel_session_questions', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  sortOrder: integer('sort_order').notNull(),
  questionType: text('question_type').notNull(),
  lemma: text('lemma'),
  promptJson: text('prompt_json').notNull(),
  answeredIndex: integer('answered_index'),
  isCorrect: integer('is_correct', { mode: 'boolean' }),
  responseMs: integer('response_ms'),
  damageDealt: integer('damage_dealt'),
});

export const lemmaCompetence = sqliteTable('lemma_competence', {
  lemma: text('lemma').primaryKey(),
  recognitionScore: real('recognition_score').notNull().default(0),
  grammarScore: real('grammar_score').notNull().default(0),
  retentionScore: real('retention_score').notNull().default(0),
  transferScore: real('transfer_score').notNull().default(0),
  weaknessScore: real('weakness_score').notNull().default(0.5),
  timesSeen: integer('times_seen').notNull().default(0),
  timesCorrect: integer('times_correct').notNull().default(0),
  lastSeenAt: text('last_seen_at'),
  lastSource: text('last_source'),
  updatedAt: text('updated_at').notNull(),
});

export const schema = {
  player,
  appSettings,
  dailyMissions,
  weeklyMissions,
  weeklyMissionsHistory,
  studyDays,
  shieldUsageHistory,
  shieldStats,
  shieldMilestonesClaimed,
  pets,
  petAnalytics,
  petStageRewardsClaimed,
  inventoryLootBoxes,
  inventorySpecialItems,
  inventoryAcquisitionHistory,
  inventoryAnalytics,
  lootBoxOpenHistory,
  lootBoxAnalytics,
  achievementUnlocks,
  achievementStats,
  learningAppState,
  learningAnalytics,
  achievementAnalytics,
  shopPurchaseHistory,
  shopAnalytics,
  shopProductStats,
  titleUnlocks,
  titleAnalytics,
  cityBuildingUnlocks,
  cityAnalytics,
  cityDistricts,
  cityPois,
  cityMapState,
  cityPoiVisits,
  cityResources,
  cityPoiProjects,
  cityPoiProjectSlotProgress,
  lemmaMastery,
  lexiconBricks,
  cityResourceDeliveryCaps,
  cityPoiMissions,
  cityPoiChainProgress,
  cityEventState,
  contractRuns,
  contractAnalytics,
  playerStatistics,
  statisticsMilestones,
  notificationSettings,
  notificationHistory,
  careerProgress,
  careerEvents,
  metagameState,
  legacyMilestones,
  playerRpg,
  epicMissionProgress,
  petCollection,
  petInstances,
  petFarmFields,
  petFarmMeta,
  petIncubators,
  petBreedingLog,
  petInstanceMemories,
  petMemories,
  activeBoosters,
  studyPoints,
  studyPointsHistory,
  collectionBook,
  farmSessions,
  userRoutines,
  routineCompletions,
  routineStats,
  journalEntries,
  journalFolders,
  journalEntryLinks,
  journalCollections,
  journalEntryCollections,
  journalStats,
  focusSettings,
  focusBlockedApps,
  focusSessions,
  focusSessionEvents,
  focusAnalytics,
  punishmentState,
  punishmentHistory,
  punishmentAnalytics,
  wishlist,
  flashDecks,
  flashCards,
  flashReviewLog,
  flashStudySessions,
  duelPlayerProfile,
  duelSessions,
  duelSessionQuestions,
  lemmaCompetence,
};
