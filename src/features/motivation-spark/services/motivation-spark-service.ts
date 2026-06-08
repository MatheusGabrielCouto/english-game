import {
    normalizeMotivationTagsInput,
    validateMotivationBody,
    validateMotivationSparkContent,
    validateMotivationTitle,
} from '@/features/motivation-spark/utils/motivation-form'
import {
    inferContentKind,
    resolveRotationWeight,
} from '@/features/motivation-spark/utils/motivation-mappers'
import { PlayerService } from '@/features/player/services/player-service'
import { GameEvents } from '@/services/game-events'
import {
    buildCreateMotivationSparkRow,
    MotivationSparkRepository,
} from '@/storage/repositories/motivation-spark-repository'
import {
    MotivationImportance,
    type MotivationImportanceValue,
    type MotivationLink,
    type MotivationSparkListFilter,
    type MotivationSparkRecord,
} from '@/types/motivation-spark'

import {
    MOTIVATION_MAX_ACTIVE_SPARKS,
    MOTIVATION_MAX_AUDIO_DURATION_MS,
    MOTIVATION_MAX_IMAGES_PER_SPARK,
} from '../constants/motivation-limits'
import { useMotivationSparksStore } from '../store/motivation-sparks-store'
import {
    deleteMotivationAudioFile,
    persistMotivationRecording,
} from './motivation-audio-storage'
import {
    deleteMotivationImagesForSpark,
    reconcileMotivationImages,
} from './motivation-image-storage'

const createId = () => `spark_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

export type CreateMotivationSparkInput = {
  title: string
  body?: string
  tagsInput?: string
  tags?: string[]
  importance?: MotivationImportanceValue
  isFavorite?: boolean
  isPinned?: boolean
  collectionId?: string | null
  imageUris?: string[]
  audioTempUri?: string | null
  audioDurationMs?: number | null
  links?: MotivationLink[]
}

export type UpdateMotivationSparkInput = Partial<
  Omit<CreateMotivationSparkInput, 'audioTempUri'> & {
    audioTempUri?: string | null
    removeAudio?: boolean
    isArchived?: boolean
  }
>

const syncStore = (sparks: MotivationSparkRecord[]) => {
  useMotivationSparksStore.setState({ sparks, hasHydrated: true })
}

const refreshStore = async (): Promise<MotivationSparkRecord[]> => {
  const sparks = await MotivationSparkRepository.listActive()
  syncStore(sparks)
  return sparks
}

const resolveTags = (input: { tags?: string[]; tagsInput?: string }): string[] => {
  if (input.tags) return input.tags
  if (input.tagsInput) return normalizeMotivationTagsInput(input.tagsInput)
  return []
}

const assertAudioDuration = (durationMs: number | null | undefined): void => {
  if (durationMs == null) return
  if (durationMs > MOTIVATION_MAX_AUDIO_DURATION_MS) {
    throw new Error('O áudio pode ter no máximo 3 minutos.')
  }
}

const persistSparkMedia = async (
  sparkId: string,
  input: {
    imageUris?: string[]
    audioTempUri?: string | null
    existingImages?: string[]
    existingAudioUri?: string | null
    removeAudio?: boolean
  },
): Promise<{ images: string[]; audioUri: string | null }> => {
  const images = await reconcileMotivationImages(
    input.existingImages ?? [],
    input.imageUris ?? input.existingImages ?? [],
    sparkId,
  )

  if (images.length > MOTIVATION_MAX_IMAGES_PER_SPARK) {
    throw new Error(`Máximo de ${MOTIVATION_MAX_IMAGES_PER_SPARK} imagens por faísca.`)
  }

  let audioUri = input.removeAudio ? null : (input.existingAudioUri ?? null)

  if (input.removeAudio && input.existingAudioUri) {
    await deleteMotivationAudioFile(input.existingAudioUri)
  }

  if (input.audioTempUri) {
    if (input.existingAudioUri && input.existingAudioUri !== input.audioTempUri) {
      await deleteMotivationAudioFile(input.existingAudioUri)
    }
    audioUri = await persistMotivationRecording(input.audioTempUri, sparkId)
  }

  return { images, audioUri }
}

export const MotivationSparkService = {
  async hydrate(): Promise<MotivationSparkRecord[]> {
    return refreshStore()
  },

  async list(filter: MotivationSparkListFilter = {}): Promise<MotivationSparkRecord[]> {
    const sparks = await MotivationSparkRepository.list(filter)
    if (!filter.includeArchived && !filter.search && !filter.favoritesOnly && !filter.pinnedOnly) {
      syncStore(sparks)
    }
    return sparks
  },

  async getById(id: string): Promise<MotivationSparkRecord | null> {
    return MotivationSparkRepository.findById(id)
  },

  async create(input: CreateMotivationSparkInput): Promise<MotivationSparkRecord> {
    const titleError = validateMotivationTitle(input.title)
    if (titleError) throw new Error(titleError)

    const body = input.body?.trim() ?? ''
    if (body) {
      const bodyError = validateMotivationBody(body)
      if (bodyError) throw new Error(bodyError)
    }

    const contentError = validateMotivationSparkContent({
      body,
      images: input.imageUris,
      audioUri: input.audioTempUri,
      links: input.links,
    })
    if (contentError) throw new Error(contentError)

    assertAudioDuration(input.audioDurationMs)

    const activeCount = await MotivationSparkRepository.countActive()
    if (activeCount >= MOTIVATION_MAX_ACTIVE_SPARKS) {
      throw new Error(`Limite de ${MOTIVATION_MAX_ACTIVE_SPARKS} faíscas ativas atingido.`)
    }

    const isFirstSpark = activeCount === 0
    const id = createId()
    const now = new Date().toISOString()
    const { images, audioUri } = await persistSparkMedia(id, {
      imageUris: input.imageUris ?? [],
      audioTempUri: input.audioTempUri,
    })

    const links = input.links ?? []
    const contentKind = inferContentKind({
      body: body || null,
      images,
      audioUri,
      links,
    })

    const row = buildCreateMotivationSparkRow({
      id,
      title: input.title.trim(),
      body: body || null,
      contentKind,
      images,
      audioUri,
      audioDurationMs: input.audioDurationMs ?? null,
      audioTranscript: null,
      links,
      collectionId: input.collectionId ?? null,
      tags: resolveTags(input),
      importance: input.importance ?? MotivationImportance.MEDIUM,
      isFavorite: input.isFavorite ?? false,
      isPinned: input.isPinned ?? false,
      createdAt: now,
      updatedAt: now,
    })

    await MotivationSparkRepository.insert(row)
    const created = await MotivationSparkRepository.findById(id)
    if (!created) throw new Error('Não foi possível criar a faísca.')

    await refreshStore()
    if (isFirstSpark) {
      PlayerService.addXP(25)
    }
    GameEvents.emit('MOTIVATION_SPARK_CREATED', { sparkId: created.id })
    return created
  },

  async update(id: string, input: UpdateMotivationSparkInput): Promise<MotivationSparkRecord> {
    const existing = await MotivationSparkRepository.findById(id)
    if (!existing) throw new Error('Faísca não encontrada.')

    if (input.title != null) {
      const titleError = validateMotivationTitle(input.title)
      if (titleError) throw new Error(titleError)
    }

    const nextBody = input.body !== undefined ? input.body.trim() || null : existing.body
    if (nextBody) {
      const bodyError = validateMotivationBody(nextBody)
      if (bodyError) throw new Error(bodyError)
    }

    const nextLinks = input.links ?? existing.links
    const nextImageUris = input.imageUris ?? existing.images
    const nextAudioTempUri =
      input.removeAudio === true
        ? null
        : input.audioTempUri !== undefined
          ? input.audioTempUri
          : existing.audioUri

    const contentError = validateMotivationSparkContent({
      body: nextBody,
      images: nextImageUris,
      audioUri: input.removeAudio ? null : nextAudioTempUri,
      links: nextLinks,
    })
    if (contentError) throw new Error(contentError)

    const nextDurationMs =
      input.audioDurationMs !== undefined ? input.audioDurationMs : existing.audioDurationMs
    assertAudioDuration(nextDurationMs)

    const { images, audioUri } = await persistSparkMedia(id, {
      imageUris: nextImageUris,
      audioTempUri: input.audioTempUri,
      existingImages: existing.images,
      existingAudioUri: existing.audioUri,
      removeAudio: input.removeAudio,
    })

    const nextTitle = input.title?.trim() ?? existing.title
    const nextTags =
      input.tags ?? (input.tagsInput ? resolveTags(input) : existing.tags)
    const nextImportance = input.importance ?? existing.importance
    const nextFavorite = input.isFavorite ?? existing.isFavorite
    const nextPinned = input.isPinned ?? existing.isPinned
    const nextArchived = input.isArchived ?? existing.isArchived
    const nextCollectionId =
      input.collectionId !== undefined ? input.collectionId : existing.collectionId
    const contentKind = inferContentKind({
      body: nextBody,
      images,
      audioUri,
      links: nextLinks,
    })

    await MotivationSparkRepository.update(id, {
      title: nextTitle,
      body: nextBody,
      contentKind,
      images,
      audioUri,
      audioDurationMs: input.removeAudio ? null : nextDurationMs,
      links: nextLinks,
      collectionId: nextCollectionId,
      tags: nextTags,
      importance: nextImportance,
      isFavorite: nextFavorite,
      isPinned: nextPinned,
      isArchived: nextArchived,
      rotationWeight: resolveRotationWeight({
        isPinned: nextPinned,
        isFavorite: nextFavorite,
        importance: nextImportance,
      }),
      updatedAt: new Date().toISOString(),
    })

    const updated = await MotivationSparkRepository.findById(id)
    if (!updated) throw new Error('Não foi possível atualizar a faísca.')

    await refreshStore()
    GameEvents.emit('MOTIVATION_SPARK_UPDATED', { sparkId: id })
    return updated
  },

  async toggleFavorite(id: string): Promise<MotivationSparkRecord> {
    const existing = await MotivationSparkRepository.findById(id)
    if (!existing) throw new Error('Faísca não encontrada.')
    return MotivationSparkService.update(id, { isFavorite: !existing.isFavorite })
  },

  async togglePinned(id: string): Promise<MotivationSparkRecord> {
    const existing = await MotivationSparkRepository.findById(id)
    if (!existing) throw new Error('Faísca não encontrada.')
    return MotivationSparkService.update(id, { isPinned: !existing.isPinned })
  },

  async archive(id: string): Promise<MotivationSparkRecord> {
    return MotivationSparkService.update(id, { isArchived: true })
  },

  async unarchive(id: string): Promise<MotivationSparkRecord> {
    return MotivationSparkService.update(id, { isArchived: false })
  },

  async listArchived(filter: Omit<MotivationSparkListFilter, 'archivedOnly' | 'includeArchived'> = {}) {
    return MotivationSparkRepository.list({ ...filter, archivedOnly: true })
  },

  async countArchived(): Promise<number> {
    return MotivationSparkRepository.countArchived()
  },

  async delete(id: string): Promise<void> {
    const existing = await MotivationSparkRepository.findById(id)
    if (!existing) return

    await deleteMotivationImagesForSpark(id, existing.images)
    await deleteMotivationAudioFile(existing.audioUri)
    await MotivationSparkRepository.delete(id)
    await refreshStore()
    GameEvents.emit('MOTIVATION_SPARK_DELETED', { sparkId: id })
  },
}
