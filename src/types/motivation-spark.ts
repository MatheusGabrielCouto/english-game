export const MotivationContentKind = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  LINK: 'link',
  MIXED: 'mixed',
} as const

export type MotivationContentKindValue =
  (typeof MotivationContentKind)[keyof typeof MotivationContentKind]

export const MotivationImportance = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export type MotivationImportanceValue =
  (typeof MotivationImportance)[keyof typeof MotivationImportance]

export type MotivationLink = {
  url: string
  title: string | null
  description: string | null
}

export type MotivationSparkRecord = {
  id: string
  title: string
  body: string | null
  contentKind: MotivationContentKindValue
  images: string[]
  audioUri: string | null
  audioDurationMs: number | null
  audioTranscript: string | null
  links: MotivationLink[]
  collectionId: string | null
  tags: string[]
  importance: MotivationImportanceValue
  isFavorite: boolean
  isPinned: boolean
  isArchived: boolean
  rotationWeight: number
  lastShownAt: string | null
  showCount: number
  createdAt: string
  updatedAt: string
}

export type MotivationDailyPickRecord = {
  dateKey: string
  sparkId: string
  notifiedAt: string | null
  openedAt: string | null
}

export type MotivationSettingsRecord = {
  enabled: boolean
  dailyNotification: boolean
  eveningNotification: boolean
  preferredHour: number
  preferredMinute: number
  eveningHour: number
  eveningMinute: number
  avoidRepeatDays: number
  showOnHome: boolean
  updatedAt: string
}

export type MotivationCollectionRecord = {
  id: string
  name: string
  emoji: string
  sortOrder: number
  createdAt: string
}

export type MotivationSparkListFilter = {
  search?: string
  favoritesOnly?: boolean
  pinnedOnly?: boolean
  collectionId?: string | null
  includeArchived?: boolean
  archivedOnly?: boolean
}
