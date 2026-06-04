# Balance Audit — English Quest

> Implementação das recomendações da auditoria de economia (Tarefa 15).

## Status: implementado

### Prioridade alta

| Item                                 | Implementação                                                  |
| ------------------------------------ | -------------------------------------------------------------- |
| `RewardModifierService`              | `src/features/game-design/services/reward-modifier-service.ts` |
| Bônus de relíquias (cap +25%)        | `src/features/game-design/utils/relic-bonus.ts`                |
| City coin/SP sinks                   | `getBuildingConstructionCost()` + dedução em `city-service.ts` |
| Milestone a cada 5 níveis            | `level-milestone-service.ts`                                   |
| Bônus SP pós-dailies (+35%)          | `FARM_POST_MISSION_MULTIPLIER = 1.35`                          |
| Taxas farm SP ~2–3×                  | `farm-catalog.ts` `studyPointsPerUnit`                         |
| Cap farm SP 800/dia · moedas 350/dia | `DAILY_FARM_SOFT_CAP`, `DAILY_FARM_COIN_CAP`                   |

### Prioridade média

| Item                                        | Implementação                                           |
| ------------------------------------------- | ------------------------------------------------------- |
| Curva XP suavizada                          | `100 + (L-1) × 85` em `player/utils/xp.ts`              |
| Loot box semanal garantida                  | Primeiro claim da semana em `weekly-mission-service.ts` |
| `lootBoxBonusChance` + contract multipliers | Wired em `RewardModifierService` + contracts            |
| Pet XP = 15% player XP                      | `PlayerService.addXP` → `PetService.addExperience`      |
| Upgrade chain via SP                        | `StudyPointsService.upgradeLootBox()`                   |
| Buildings L35–L80                           | `balance-buildings.ts`                                  |

### Prioridade baixa

| Item                  | Implementação                                               |
| --------------------- | ----------------------------------------------------------- |
| Pity timer (30 opens) | `loot_pity_counter` em app_settings + `loot-box-service.ts` |
| HUD bônus ativos      | `ActiveBonusesCard` na Home                                 |
| Pet CONTRACT XP       | `CONTRACT_COMPLETED` → pet XP                               |

### Duelos & Baralho (M8)

| Constante            | Valor      | Arquivo                      |
| -------------------- | ---------- | ---------------------------- |
| Stamina máx.         | 5          | `duel-progression-config.ts` |
| Regen stamina        | +1 / 4h    | `duel-stamina.ts`            |
| HP jogador           | 100        | `duel-combat-config.ts`      |
| Timer pergunta (B1+) | 15s        | `duel-balance-config.ts`     |
| Cap moedas duelo/dia | 120 base   | `duel-balance-config.ts`     |
| Boss semanal bônus   | +35 moedas | `duel-balance-config.ts`     |
| Revisão cap/deck     | 80/dia     | `flash_decks.review_cap`     |
| Blitz                | 120s       | `FlashDeckBlitzContent`      |

Pacotes JSON: `a1-core`, `a1-travel`, `a2-routine`, `b1-work`, `b2-abstract` (+ gerador `pnpm generate:duel-packs`).

### Pendente (futuro)

- Season pass mensal
- Soft prestige reset cosmético
- Pet energy/hunger gameplay (campos existem, sem lógica)
- Echo do Pet como inimigo dinâmico (inimigo catalogado; pool ledger M8+)

## Constantes centrais

Arquivo: `src/features/game-design/constants/balance.ts`

## Migration

- `0021_balance_meta.sql` — `weekly_loot_granted_week`, `loot_pity_counter`

## Regenerar catálogo de recompensas

```bash
pnpm exec tsx scripts/generate-rewards-catalog-doc.ts
```
