export const BACKUP_FORMAT_VERSION = 1;

export const BACKUP_APP_ID = 'english-quest';

export const BACKUP_FILE_EXTENSION = '.json';

export const BACKUP_MIME_TYPE = 'application/json';

/** SQLite tables included in every backup snapshot (Fase 18 restore). */
export const BACKUP_TABLE_NAMES = [
  'player',
  'app_settings',
  'daily_missions',
  'weekly_missions',
  'weekly_missions_history',
  'study_days',
  'shield_usage_history',
  'shield_stats',
  'shield_milestones_claimed',
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
  'city_poi_missions',
  'city_analytics',
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
  'player_rpg',
  'epic_mission_progress',
  'active_boosters',
  'study_points',
  'study_points_history',
  'collection_book',
  'wishlist',
  'farm_sessions',
  'focus_settings',
  'focus_blocked_apps',
  'focus_sessions',
  'focus_session_events',
  'focus_analytics',
  'punishment_state',
  'punishment_history',
  'punishment_analytics',
  '__drizzle_migrations',
] as const;

export type BackupTableName = (typeof BACKUP_TABLE_NAMES)[number];

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
    'Todo o progresso atual será apagado e substituído pelos dados deste backup. Esta ação não pode ser desfeita.',
  restoreConfirmAction: 'Restaurar backup',
  restoreCancelAction: 'Cancelar',
} as const;

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
} as const;
