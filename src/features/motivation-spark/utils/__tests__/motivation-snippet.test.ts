import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { buildMotivationNotificationSnippet, stripMarkdown, truncateSnippet } from '../motivation-snippet'

const baseSpark = (overrides: Partial<MotivationSparkRecord> = {}): MotivationSparkRecord => ({
  id: 'spark_1',
  title: 'Minha meta',
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

describe('motivation snippet', () => {
  it('strips simple markdown', () => {
    assert.equal(stripMarkdown('**Foco** e _disciplina_'), 'Foco e disciplina')
  })

  it('truncates long snippets', () => {
    const long = 'a'.repeat(150)
    assert.equal(truncateSnippet(long).length, 120)
    assert.match(truncateSnippet(long), /…$/)
  })

  it('prefers body over link and title', () => {
    const snippet = buildMotivationNotificationSnippet(
      baseSpark({
        body: '## Hoje eu continuo',
        links: [{ url: 'https://example.com', title: 'Talk', description: null }],
      }),
    )
    assert.equal(snippet, 'Hoje eu continuo')
  })

  it('falls back to link title', () => {
    const snippet = buildMotivationNotificationSnippet(
      baseSpark({
        links: [{ url: 'https://example.com/talk', title: 'Inspiring talk', description: null }],
      }),
    )
    assert.equal(snippet, 'Inspiring talk')
  })
})
