# Dados do jogo (JSON)

Conteúdo editável em massa: missões, itens e (futuro) outros catálogos. Os arquivos são importados no bundle do app — após editar, reinicie o Metro (`pnpm start`).

## Arquivos

| Arquivo                                | Conteúdo                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| `missions.json`                        | `daily`, `weekly`, `epic` — todas as missões do sistema  |
| `items.json`                           | `items` + `legacyAliases` (IDs antigos da loja)          |
| `city.json`                            | `districts` + `pois` — mapa (v2 inclui internacional)    |
| `poi-missions.json`                    | Templates de missões por POI                             |
| `contracts.json`                       | Contratos base com `issuerPoiKey` (Cidade Viva Fase 3)   |
| `poi-projects.json`                    | Obras semanais por POI (Biblioteca, Prefeitura — Fase 4) |
| `poi-event-missions.json`              | Missões de evento (Natal — Fase 6)                       |
| `poi-chains.json`                      | Arcos narrativos em sequência por POI (Fase 7)           |
| `vocab-packs/christmas.json`           | Palavras temáticas do evento                             |
| `flash-deck-seeds/english-1000.json`   | 1000 palavras essenciais do baralho padrão (gerado)      |
| `flash-deck-seeds/interview-tech.json` | Entrevistas internacionais em tech (~130 cartas, gerado) |

### Baralho padrão (1000 palavras)

O app cria o caderno `deck_default` com **1000 cartas** na primeira inicialização (vocabulário A1→B2 + palavras gramaticais de alta frequência). Para regenerar o JSON:

```bash
pnpm generate:english-1000
```

As cartas entram com liberação gradual (~10 novas por dia na fila de revisão).

### Baralho entrevistas (tech)

Caderno `deck_interview_tech` (💼): frases e vocabulário para entrevistas em inglês (abertura, STAR, remoto, salário, perguntas ao entrevistador) — sem jargão de linguagem de programação.

```bash
pnpm generate:interview-tech
```

Fonte editável: `scripts/data/interview-tech-seed.ts`. Liberação ~12 cartas novas por dia.

## Adicionar missões diárias

Em `missions.json`, array `daily`. Cada entrada:

```json
{
  "id": "vocabulary-11",
  "category": "vocabulary",
  "title": "Título da missão",
  "description": "Descrição para o jogador.",
  "difficulty": "easy",
  "baseXp": 40,
  "baseCoins": 20
}
```

Categorias: `vocabulary`, `reading`, `listening`, `speaking`, `writing`, `grammar`, `revision`, `career`, `interview`, `programming`.

Dificuldade: `easy`, `medium`, `hard`, `expert`.

## Adicionar itens

Em `items.json`, array `items`:

```json
{
  "key": "meu_item",
  "name": "Nome PT",
  "description": "Efeito descrito.",
  "category": "consumable",
  "icon": "☕",
  "rarity": "common",
  "effectType": "xp_boost",
  "effectValue": 25,
  "usable": true
}
```

Opcional: `durationMinutes`, `shopPrice`, `secondaryValue`.

## Código

- Loaders: `src/data/loaders/`
- Re-export nos catálogos antigos: `src/features/game-design/catalogs/*-catalog.ts` (imports existentes continuam funcionando)

## Formatar JSON

```bash
pnpm run sync:data
```

## Contratos por local

Em `contracts.json`, cada contrato inclui `issuerPoiKey`, `districtKey`, `minPlayerLevel`, `minLocalLevel` e `baseLocalXpReward`. Opcional: `eventKey` (ex. `christmas_2026`) para contratos sazonais. Contratos estendidos (`extended_contract_*`) recebem emissor rotativo no loader.

## Evento da cidade (Fase 6)

- Catálogo de janelas: `src/features/city/catalogs/city-events-catalog.ts`
- POI temporário: `winter_market` em `city.json` com `"eventOnly": true`
- Em dev, `DEV_FORCE_CITY_EVENT_KEY` em `city-event-config.ts` ativa o Natal fora de dezembro

## Obras por POI (entregas)

Em `poi-projects.json`, cada projeto define `poiKey`, `resourceType` (`lexicon_brick` ou `consistency_wood`), `targetTotal`, `deliveryChunk` e recompensas ao concluir. Design alvo (tijolo por palavra, plantas temáticas, decay): [`docs/MEMORY_WALL_LEXICON_BRICK.md`](../docs/MEMORY_WALL_LEXICON_BRICK.md).

## Próximos arquivos (sugestão)

- `collectibles.json`
- `farm.json`
- `city-events.json` (Cidade Viva)
