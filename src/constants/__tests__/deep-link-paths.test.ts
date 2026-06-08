import assert from 'node:assert/strict'
import test from 'node:test'

import {
    buildAppDeepLink,
    buildUniversalLink,
    parseDeepLinkUrl,
    resolveDeepLinkUrlToHref,
} from '../deep-link-paths'

test('buildAppDeepLink uses custom scheme paths', () => {
  assert.equal(buildAppDeepLink('/play'), 'englishquest://play')
  assert.equal(
    buildAppDeepLink('/city', { poiKey: 'library', tab: 'missions' }),
    'englishquest://city?poiKey=library&tab=missions',
  )
})

test('buildUniversalLink uses https host', () => {
  assert.equal(buildUniversalLink('/missions'), 'https://englishquest.app/missions')
})

test('parseDeepLinkUrl supports scheme and universal links', () => {
  assert.deepEqual(parseDeepLinkUrl('englishquest://play'), {
    path: '/play',
    query: {},
  })

  assert.deepEqual(parseDeepLinkUrl('https://englishquest.app/city?poiKey=library&tab=missions'), {
    path: '/city',
    query: { poiKey: 'library', tab: 'missions' },
  })
})

test('resolveDeepLinkUrlToHref maps play and vault entry', () => {
  assert.equal(resolveDeepLinkUrlToHref('englishquest://play'), '/(tabs)/play')
  assert.equal(
    resolveDeepLinkUrlToHref('https://englishquest.app/vault/entry/abc-123'),
    '/english-journal/entry/abc-123',
  )
})

test('resolveDeepLinkUrlToHref maps motivation hub and spark detail', () => {
  assert.equal(resolveDeepLinkUrlToHref('englishquest://motivation'), '/motivation')
  assert.equal(
    resolveDeepLinkUrlToHref('englishquest://motivation/spark_123'),
    '/motivation/spark_123',
  )
})
