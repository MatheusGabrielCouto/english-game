export const BACKUP_FORMAT_VERSION = 2

export const BACKUP_APP_ID = 'english-quest'

export const BACKUP_FILE_EXTENSION = '.json'

export const BACKUP_MIME_TYPE = 'application/json'

/** Diário / Knowledge Vault — não entra no backup (dados locais separados). */
export const BACKUP_VAULT_TABLE_NAMES = [
  'journal_entries',
  'journal_folders',
  'journal_entry_links',
  'journal_collections',
  'journal_entry_collections',
  'journal_stats',
] as const

/** SQLite tables included in every backup snapshot. */
export const BACKUP_TABLE_NAMES = [
  'player',
  'app_settings',
  'player_rpg',
  'study_days',
  'shield_usage_history',
  'shield_stats',
  'shield_milestones_claimed',
  'daily_missions',
  'weekly_missions',
  'weekly_missions_history',
  'epic_mission_progress',
  'pets',
  'pet_memories',
  'pet_analytics',
  'pet_stage_rewards_claimed',
  'pet_collection',
  'inventory_loot_boxes',
  'inventory_special_items',
  'inventory_acquisition_history',
  'inventory_analytics',
  'loot_box_open_history',
  'loot_box_analytics',
  'achievement_unlocks',
  'achievement_stats',
  'achievement_analytics',
  'shop_purchase_history',
  'shop_analytics',
  'shop_product_stats',
  'title_unlocks',
  'title_analytics',
  'city_building_unlocks',
  'city_districts',
  'city_pois',
  'city_map_state',
  'city_poi_visits',
  'city_resources',
  'city_poi_projects',
  'city_poi_project_slot_progress',
  'city_resource_delivery_caps',
  'city_poi_missions',
  'city_poi_chain_progress',
  'city_event_state',
  'city_analytics',
  'lemma_mastery',
  'lexicon_bricks',
  'contract_runs',
  'contract_analytics',
  'player_statistics',
  'statistics_milestones',
  'notification_settings',
  'notification_history',
  'career_progress',
  'career_events',
  'metagame_state',
  'legacy_milestones',
  'active_boosters',
  'study_points',
  'study_points_history',
  'collection_book',
  'wishlist',
  'farm_sessions',
  'user_routines',
  'routine_completions',
  'routine_stats',
  'learning_app_state',
  'learning_analytics',
  'flash_decks',
  'flash_cards',
  'flash_review_log',
  'flash_study_sessions',
  'duel_player_profile',
  'duel_sessions',
  'duel_session_questions',
  'lemma_competence',
  'learning_worlds',
  'player_learning_profile',
  'skill_levels',
  'learning_daily_plans',
  'learning_unit_progress',
  'learning_monthly_reports',
  'mentor_memory',
  'mentor_chat_sessions',
  'mentor_error_log',
  'focus_settings',
  'focus_blocked_apps',
  'focus_sessions',
  'focus_session_events',
  'focus_analytics',
  'motivation_sparks',
  'motivation_collections',
  'motivation_daily_picks',
  'motivation_settings',
  'punishment_state',
  'punishment_history',
  'punishment_analytics',
  '__drizzle_migrations',
] as const

export type BackupTableName = (typeof BACKUP_TABLE_NAMES)[number]

export const BACKUP_EXPORT_SUMMARY =
  'Jogador, pet, missões, rotinas, cidade, flash decks, duelos, inventário, foco, Chama Interior e favoritos do menu — sem áudios nem Knowledge Vault.'

export const BACKUP_MESSAGES = {
  exportSuccess: 'Backup exportado. Escolha onde salvar o arquivo.',
  exportUnavailable: 'Compartilhamento não disponível neste dispositivo.',
  exportFailed: 'Não foi possível exportar o backup. Tente novamente.',
  emptyPlayer: 'Nenhum progresso encontrado para exportar.',
  importInvalidFile: 'Arquivo inválido. Selecione um backup JSON do English Quest.',
  importFutureVersion:
    'Este backup foi criado em uma versão mais recente do app. Atualize o English Quest para restaurá-lo.',
  importUnsupportedVersion: 'Versão de backup não suportada.',
  importChecksumFailed: 'Backup corrompido ou alterado. A integridade dos dados não confere.',
  importMissingPlayer: 'Backup sem dados de jogador. Restauração bloqueada.',
  importIncompatibleApp:
    'Este backup pertence a outro aplicativo ou versão incompatível.',
  importPickCanceled: 'Nenhum arquivo selecionado.',
  importReadFailed: 'Não foi possível ler o arquivo selecionado.',
  restoreSuccess: 'Progresso restaurado com sucesso. Seu jogo foi atualizado.',
  restoreFailed: 'Falha ao restaurar o backup. Seus dados atuais foram preservados.',
  restoreConfirmTitle: 'Substituir progresso local?',
  restoreConfirmMessage:
    'Todo o progresso atual será apagado e substituído pelos dados deste backup. O Knowledge Vault local não será restaurado. Esta ação não pode ser desfeita.',
  restoreConfirmAction: 'Restaurar backup',
  restoreCancelAction: 'Cancelar',
} as const

/** Logical domains required in every valid backup (maps to SQLite tables). */
export const BACKUP_REQUIRED_DOMAINS = {
  player: ['player'] as const,
  statistics: ['player_statistics'] as const,
  inventory: [
    'inventory_loot_boxes',
    'inventory_special_items',
    'inventory_analytics',
  ] as const,
  quests: ['daily_missions', 'weekly_missions', 'epic_mission_progress'] as const,
} as const
