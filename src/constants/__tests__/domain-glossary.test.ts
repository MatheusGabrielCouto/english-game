import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DOMAIN_GLOSSARY,
  DOMAIN_GLOSSARY_BANNERS,
} from '../domain-glossary'

describe('domain glossary (P-25)', () => {
  it('defines three distinct user-facing domains', () => {
    const labels = [
      DOMAIN_GLOSSARY.petCompanion.shortLabel,
      DOMAIN_GLOSSARY.petFarm.shortLabel,
      DOMAIN_GLOSSARY.studyFarm.shortLabel,
    ]
    assert.equal(new Set(labels).size, 3)
  })

  it('pet farm and study farm titles differ', () => {
    assert.notEqual(DOMAIN_GLOSSARY.petFarm.title, DOMAIN_GLOSSARY.studyFarm.title)
    assert.match(DOMAIN_GLOSSARY.petFarm.title, /Fazenda de Pets/)
    assert.match(DOMAIN_GLOSSARY.studyFarm.title, /Farm de Estudo/)
  })

  it('banners exist for each surface', () => {
    assert.ok(DOMAIN_GLOSSARY_BANNERS.petCompanion.body)
    assert.ok(DOMAIN_GLOSSARY_BANNERS.petFarm.body)
    assert.ok(DOMAIN_GLOSSARY_BANNERS.studyFarm.body)
  })
})
