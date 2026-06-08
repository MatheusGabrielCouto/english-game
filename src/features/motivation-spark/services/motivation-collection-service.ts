import { MotivationCollectionRepository } from '@/storage/repositories/motivation-collection-repository'
import { MotivationSparkRepository } from '@/storage/repositories/motivation-spark-repository'
import type { MotivationCollectionRecord } from '@/types/motivation-spark'

import { MotivationSparkService } from './motivation-spark-service'

const createId = (): string =>
  `motivation_collection_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

export const MotivationCollectionService = {
  async list(): Promise<MotivationCollectionRecord[]> {
    return MotivationCollectionRepository.list()
  },

  async create(input: { name: string; emoji?: string }): Promise<MotivationCollectionRecord> {
    const name = input.name.trim()
    if (!name) throw new Error('Nome da coleção é obrigatório.')

    const collections = await MotivationCollectionRepository.list()
    const record: MotivationCollectionRecord = {
      id: createId(),
      name,
      emoji: input.emoji?.trim() || '🔥',
      sortOrder: collections.length,
      createdAt: new Date().toISOString(),
    }

    await MotivationCollectionRepository.insert(record)
    return record
  },

  async update(
    id: string,
    patch: Partial<Pick<MotivationCollectionRecord, 'name' | 'emoji' | 'sortOrder'>>,
  ): Promise<void> {
    const existing = await MotivationCollectionRepository.findById(id)
    if (!existing) throw new Error('Coleção não encontrada.')

    if (patch.name != null && !patch.name.trim()) {
      throw new Error('Nome da coleção é obrigatório.')
    }

    await MotivationCollectionRepository.update(id, {
      ...(patch.name != null ? { name: patch.name.trim() } : {}),
      ...(patch.emoji != null ? { emoji: patch.emoji.trim() || '🔥' } : {}),
      ...(patch.sortOrder != null ? { sortOrder: patch.sortOrder } : {}),
    })
  },

  async delete(id: string): Promise<void> {
    const existing = await MotivationCollectionRepository.findById(id)
    if (!existing) return

    await MotivationSparkRepository.clearCollectionId(id)
    await MotivationCollectionRepository.delete(id)
    await MotivationSparkService.hydrate()
  },
}
