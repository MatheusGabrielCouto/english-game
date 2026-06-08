import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { buildMotivationNotificationContent } from '../motivation-notification-copy'

const baseSpark = (overrides: Partial<MotivationSparkRecord> = {}): MotivationSparkRecord => ({
  id: 'spark_1',
  title: 'Por que estudo inglês',
  body: null,
  contentKind: 'text',
  images: [],
  audioUri: null,
  audioDurationMs: null,
  audioTranscript: null,
  links: [],
  collectionId: null,
  tags: [],
  importance: 'medium',
  isFavorite: false,
  isPinned: false,
  isArchived: false,
  rotationWeight: 1,
  lastShownAt: null,
  showCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('motivation notification copy', () => {
  it('uses spark title as notification title', () => {
    const content = buildMotivationNotificationContent(
      baseSpark({ title: 'Minha meta de 2026' }),
      'morning',
      '2026-06-08',
    )

    assert.equal(content.title, 'Minha meta de 2026')
  })

  it('wraps body text in quotes for a quote-style notification', () => {
    const content = buildMotivationNotificationContent(
      baseSpark({ body: 'Eu não desisto dos meus sonhos.' }),
      'morning',
      '2026-06-08',
    )

    assert.equal(content.body, '“Eu não desisto dos meus sonhos.”')
  })

  it('uses pinned prefix in tagline', () => {
    const content = buildMotivationNotificationContent(
      baseSpark({ isPinned: true }),
      'morning',
      '2026-06-08',
    )

    assert.match(content.tagline, /^⭐ /)
  })

  it('uses different evening tone for audio sparks', () => {
    const morning = buildMotivationNotificationContent(
      baseSpark({ audioUri: 'file:///audio.m4a' }),
      'morning',
      '2026-06-08',
    )
    const evening = buildMotivationNotificationContent(
      baseSpark({ audioUri: 'file:///audio.m4a' }),
      'evening',
      '2026-06-08',
    )

    assert.match(morning.body, /gravou/)
    assert.match(evening.body, /Sua voz/)
  })

  it('keeps stable tagline for same spark and date', () => {
    const first = buildMotivationNotificationContent(baseSpark(), 'morning', '2026-06-08')
    const second = buildMotivationNotificationContent(baseSpark(), 'morning', '2026-06-08')

    assert.equal(first.tagline, second.tagline)
  })
})
