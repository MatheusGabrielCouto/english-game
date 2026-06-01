# English Quest — Sistema de áudio

Documento de design de áudio integrado aos mecanismos do jogo. Objetivo: transformar a experiência em um **RPG vivo** (imersão, retenção diária, feedback emocional e sensação de progresso) — não um app de estudo com sons genéricos.

> **Contexto técnico:** offline-first, React Native / Expo SDK 56, barramento `GameEvents` (`src/services/game-events.ts`), haptics em `src/utils/haptics.ts`, celebrações em `src/components/celebration/`. Ver também [`FEATURES.md`](./FEATURES.md), [`GAMIFICATION_SYSTEMS.md`](./GAMIFICATION_SYSTEMS.md), [`LIVING_CITY.md`](./LIVING_CITY.md).

---

## Índice

1. [Pilares e identidade sonora](#1-pilares-e-identidade-sonora)
2. [Arquitetura de camadas](#2-arquitetura-de-camadas)
3. [Prioridade, ducking e foco](#3-prioridade-ducking-e-foco)
4. [Anti-ennui (variação)](#4-anti-ennui-variação)
5. [Micro-UI (game juice)](#5-micro-ui-game-juice)
6. [Aprendizado e progresso](#6-aprendizado-e-progresso)
7. [Missões e quests](#7-missões-e-quests)
8. [Pet companion](#8-pet-companion)
9. [Cidade evolutiva](#9-cidade-evolutiva)
10. [Economia, inventário e loot](#10-economia-inventário-e-loot)
11. [Carreira, metagame e prestígio](#11-carreira-metagame-e-prestígio)
12. [Contratos e streak](#12-contratos-e-streak)
13. [Focus Mode](#13-focus-mode)
14. [Batalhas linguísticas](#14-batalhas-linguísticas)
15. [Música adaptativa](#15-música-adaptativa)
16. [Mapa GameEvents → áudio](#16-mapeamento-gameevents--áudio)
17. [Psicologia e retenção](#17-psicologia-e-retenção)
18. [Implementação Expo / React Native](#18-implementação-expo--react-native)
19. [Roadmap de produção](#19-roadmap-de-produção)
20. [Storyboard — um dia do jogador](#20-storyboard--um-dia-do-jogador)

---

## 1. Pilares e identidade sonora

| Pilar                  | Significado sonoro                                    | Evitar                                   |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------- |
| **Progresso tangível** | Cada ganho tem assinatura auditiva curta e cumulativa | Um único “ding” para tudo                |
| **Vínculo com o pet**  | Companion reage (não fala — emociona)                 | Pet mudo ou idêntico em todos os estados |
| **Cidade viva**        | Ambiente muda com vitality, distrito e eventos        | Loop de 30s repetido sem evolução        |
| **Ritual diário**      | Streak e dia registrado têm cerimônia sonora          | Recompensa sem peso emocional            |
| **Respeito ao foco**   | Estudo profundo = menos ruído, mais subliminar        | Música competindo com atenção cognitiva  |

**Identidade tonal:** _Cozy RPG mobile_ — quente, pads orquestrais/leves, percussão macia (madeira, feltro). Aventura urbana internacional, **não** sala de aula.

**North star:** o jogador sente que **cuida de um mundo**, não que “completou uma lição”.

---

## 2. Arquitetura de camadas

```
┌─────────────────────────────────────────────────────────┐
│  CAMADA 5 — CINEMATIC (raríssima, full duck)            │
│  Level up, prestígio, evolução pet, prédio desbloqueado │
├─────────────────────────────────────────────────────────┤
│  CAMADA 4 — MUSIC (stems adaptativos, loop longo)        │
│  Hub / City / Focus / Battle / Tension (care debt)      │
├─────────────────────────────────────────────────────────┤
│  CAMADA 3 — AMBIENT (loops por contexto + filtros)      │
│  Cidade por vitality, POI, evento sazonal, rotina pet   │
├─────────────────────────────────────────────────────────┤
│  CAMADA 2 — GAMEPLAY SFX (eventos de progressão)        │
│  XP, moedas, missão, streak, loot, lexicon brick…       │
├─────────────────────────────────────────────────────────┤
│  CAMADA 1 — UI MICRO (≤300ms, seco)                    │
│  Tap, tab, modal, erro leve, toggle                     │
└─────────────────────────────────────────────────────────┘
```

### Integração com o código

```text
GameEvents.emit(event)  →  AudioDirector.onGameEvent(event)
PressableScale onPress  →  AudioDirector.playUI('tap_select')
Settings (perfil)       →  volumes: master / music / sfx / ambient / pet
```

- **Um** `AudioDirector` (singleton) gerencia instâncias `expo-audio`.
- **Haptics** permanecem; áudio **complementa** (evitar duplicar vibração em micro-UI).
- Regra: no máximo **uma** camada 4–5 dominante por vez; camadas 1–2 empilham com limite (ver §3).

---

## 3. Prioridade, ducking e foco

| Prioridade | Tipo                                          | Comportamento ao entrar                             |
| ---------- | --------------------------------------------- | --------------------------------------------------- |
| **P0**     | Cinematic (level up, prestígio, evolução pet) | Ambient mute; music −18 dB ou pause; fila SFX limpa |
| **P1**     | Battle linguística (fase crítica)             | Stem `tension`; ambient −12 dB                      |
| **P2**     | Recompensa forte (loot lendário, achievement) | Music duck −6 dB ~1.2 s                             |
| **P3**     | Gameplay SFX (XP, moeda, missão)              | Até 3 simultâneos; cooldown 80 ms por família       |
| **P4**     | Pet reativo                                   | Não interrompe P2+; pode cortar outro P4            |
| **P5**     | UI micro                                      | Cortado por P2+                                     |
| **P6**     | Ambient bed                                   | Sempre abaixo da music (−12 a −18 dB relativo)      |

**Ducking musical:** attack ~80 ms, release ~400 ms (sidechain suave, não corte seco).

**Focus Mode:** estado `AUDIO_STATE_FOCUS` — pad minimal, micro-UI opcional, sting apenas no fim da sessão.

**Notificações OS:** debounce por `eventKey + timestamp` para não duplicar som in-app.

---

## 4. Anti-ennui (variação)

| Técnica               | Uso                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Pools por família** | 4–6 variações (`coin_pickup`, `xp_tick`, `ui_tap`) — round-robin sem repetir a última |
| **Pitch scatter**     | ±3–7 cents aleatórios em micro-SFX                                                    |
| **Velocity layers**   | `XP_GAINED`: `amount` define tick vs chime vs surge                                   |
| **Cooldown por ID**   | Mesmo asset máx. 1× / 400 ms                                                          |
| **Silêncio premiado** | A cada 8–12 acertos em battle, pausa ~200 ms antes do fanfarra                        |
| **Escalada diária**   | 1ª daily = normal; todas completas = sting único `mission_daily_all`                  |
| **Ambient evolution** | Crossfade de **stems** (tráfego, pássaros, mercado), não troca brusca de loop         |

**Regra:** variação nas camadas 1–2; **identidade estável** nos marcos (level up reconhecível em &lt;0,5 s).

---

## 5. Micro-UI (game juice)

**Camada 1** · Volume baixo (−24 LUFS perceived vs music) · Duração 40–180 ms.

| ID                | Momento               | Emoção / comportamento | Integração no app                        |
| ----------------- | --------------------- | ---------------------- | ---------------------------------------- |
| `ui_tap_soft`     | Press em botões/cards | Confirmação            | `PressableScale` (+ `haptics.selection`) |
| `ui_tab_switch`   | Troca de tab          | Orientação             | `AppTabBar`                              |
| `ui_modal_open`   | Abrir modal/sheet     | Peso da decisão        | Modais, onboarding, loot                 |
| `ui_modal_close`  | Fechar modal          | Fechamento             | Idem                                     |
| `ui_toggle`       | Switch, filtros       | Controle               | Perfil, settings                         |
| `ui_error_soft`   | Sem moeda, validação  | Correção sem vergonha  | Shop, contratos                          |
| `ui_success_chip` | Claim menor, checkbox | Micro-vitória          | Weekly claim                             |

---

## 6. Aprendizado e progresso

**Camada 2** · Reforça competência e ritual diário.

| ID                  | Momento                    | Emoção              | `GameEvents` / sistema         | Retenção                  |
| ------------------- | -------------------------- | ------------------- | ------------------------------ | ------------------------- |
| `study_correct`     | Acerto em exercício/battle | Fluxo, competência  | Battle / quests (futuro)       | Reforço imediato          |
| `study_almost`      | Erro perto / typo          | Encorajamento       | Battle                         | Menos rage quit           |
| `study_wrong`       | Erro claro                 | Aprender, não punir | Battle                         | Curto, sem buzzer escolar |
| `xp_tick`           | XP pequeno                 | Barra enchendo      | `XP_GAINED` (baixo `amount`)   | Progresso contínuo        |
| `xp_chime`          | XP médio                   | Satisfação          | `XP_GAINED`                    | —                         |
| `xp_surge`          | XP alto                    | Pico                | `XP_GAINED`                    | —                         |
| `coin_pickup`       | Moedas                     | Recompensa tangível | Missões, shop, focus           | Economia sentida          |
| `study_day_stamp`   | Dia registrado             | **Ritual diário**   | `STUDY_DAY_RECORDED`           | Hábito D1/D7              |
| `streak_flame`      | Streak sobe / milestone    | Orgulho             | Streak / home                  | Âncora diária             |
| `shield_clink`      | Escudo ganho/usado         | Segurança           | `SHIELD_EARNED`, `SHIELD_USED` | Ansiedade pós-falha ↓     |
| `streak_break_wind` | Streak quebrado            | Perda contida       | `STREAK_BROKEN`                | Permite retorno           |

**Thresholds sugeridos (`XP_GAINED`):**

- `amount < 20` → `xp_tick`
- `20 ≤ amount < 100` → `xp_chime`
- `amount ≥ 100` → `xp_surge` (debounce 1×/sessão)

---

## 7. Missões e quests

| ID                  | Momento                | Emoção              | `GameEvents` / sistema                               | Retenção          |
| ------------------- | ---------------------- | ------------------- | ---------------------------------------------------- | ----------------- |
| `mission_progress`  | Incremento parcial POI | “Quase lá”          | `CityPoiMissionService` bump                         | Sessão mais longa |
| `mission_complete`  | Missão concluída       | Fechamento de loop  | `DAILY_MISSION_COMPLETED`, `LOCAL_MISSION_COMPLETED` | Loop diário       |
| `mission_daily_all` | Todas dailies do dia   | Celebração média    | Derivar do missions store                            | Meta diária clara |
| `weekly_claim`      | Resgate semanal        | Recompensa W1/W4    | `WEEKLY_MISSION_CLAIMED`                             | Retenção semanal  |
| `epic_chapter`      | Marco épico            | Narrativa           | Epic quests                                          | Longo prazo       |
| `chain_step`        | Passo de cadeia POI    | Saga local          | `POI_CHAIN_STEP_CLAIMED`                             | Exploração        |
| `chain_complete`    | Cadeia completa        | Conquista de bairro | `POI_CHAIN_COMPLETED`                                | —                 |

**Contexto cidade:** missão com `eventKey` ativo → overlay ambient festivo (+ stem brilho).

---

## 8. Pet companion

**Camada 2–4** · Linguagem emocional não verbal.

| ID                  | Momento                            | Emoção            | `GameEvents` / sistema           | Retenção                 |
| ------------------- | ---------------------------------- | ----------------- | -------------------------------- | ------------------------ |
| `pet_idle_hum`      | Tela pet / hub (25–40 s aleatório) | Presença          | `usePet`, fase rotina            | Attachment               |
| `pet_happy`         | Humor positivo, pós-interação      | Alegria           | `PET_INTERACTION`                | Cuidado                  |
| `pet_sleepy`        | Noite / baixa energia              | Calma             | Routine phase                    | Pacto de Ritmo           |
| `pet_worried`       | Care debt, vitais baixos           | Convite a voltar  | Care debt (ver gamification doc) | Reparação                |
| `pet_eat`           | Alimentar                          | Satisfação        | Pet screen                       | Respeitar cooldown 5 min |
| `pet_play`          | Brincar                            | Vínculo           | Pet screen                       | Idem                     |
| `pet_evolve`        | Evolução de estágio                | **Marco de vida** | `PET_STAGE_EVOLVED`              | Memorable moment         |
| `pet_memory_unlock` | Nova memória                       | Nostalgia         | `PET_MEMORY_CREATED`             | Identidade longa         |
| `pet_affinity_up`   | Threshold afinidade                | Vínculo           | Affinity tiers                   | —                        |
| `pet_named`         | Nomear pet                         | Personalização    | `PET_NAMED`                      | —                        |

**Regras:**

- Pet **não compete** com battle/focus (idle raro ou mudo).
- 3–5 idle por humor; seed do dia para consistência.

---

## 9. Cidade evolutiva

**Camada 3–5** · Ambiente como espelho do progresso.

| ID                     | Momento             | Emoção                | `GameEvents` / sistema           | Retenção              |
| ---------------------- | ------------------- | --------------------- | -------------------------------- | --------------------- |
| `city_ambient_base`    | Mapa cidade         | Lar em expansão       | `CityMapService`, vitality       | Mundo persistente     |
| `city_vitality_low`    | Vitalidade baixa    | Decadência leve       | `vitalityBand`                   | Urgência suave        |
| `city_vitality_high`   | Vitalidade alta     | Prosperidade          | Idem                             | Recompensa espacial   |
| `poi_enter`            | Visitar POI         | Descoberta            | `POI_VISITED`                    | Exploração            |
| `district_unlock`      | Novo distrito       | Expansão              | `DISTRICT_UNLOCKED`              | Meta longo prazo      |
| `building_unlock`      | Novo prédio skyline | Construção            | `CITY_BUILDING_UNLOCKED`         | Pico emocional        |
| `poi_level_up`         | Nível local POI     | Bairro cresce         | `POI_LEVEL_UP`                   | —                     |
| `resource_delivery`    | Entrega de recurso  | Logística OK          | `CITY_RESOURCE_DELIVERED`        | Aprendizado invisível |
| `project_complete`     | Obra POI            | Obra-prima            | `POI_PROJECT_COMPLETED`          | —                     |
| `memory_wall_complete` | Mural completo      | Legado lexical        | `MEMORY_WALL_COMPLETED`          | —                     |
| `lexicon_brick_place`  | Tijolo colocado     | Tangibilidade         | `LEXICON_BRICK_PLACED`           | —                     |
| `lexicon_brick_crack`  | Tijolo rachado      | Urgência              | `LEXICON_BRICK_CRACKED`          | Retorno para reparar  |
| `lexicon_repair`       | Reparo              | Alívio                | `LEXICON_BRICK_REPAIRED`         | —                     |
| `city_event_start`     | Evento sazonal      | Festa / FOMO saudável | `CITY_EVENT_STARTED`             | Sazonal               |
| `city_event_milestone` | Marco do evento     | Progresso coletivo    | `CITY_EVENT_MILESTONE`           | —                     |
| `npc_trust_up`         | Confiança NPC ↑     | Relacionamento        | `POI_NPC_TRUST_CHANGED` (delta+) | Contratos             |

**Stems ambient sugeridos:** tráfego, vento, pássaros, café distante, murmúrio (sem palavras inteligíveis). Desbloqueios de prédio adicionam camadas (campainha, mercado, trem leve).

---

## 10. Economia, inventário e loot

| ID                       | Momento           | Emoção           | `GameEvents` / sistema            | Retenção             |
| ------------------------ | ----------------- | ---------------- | --------------------------------- | -------------------- |
| `shop_purchase`          | Compra na loja    | Transação justa  | `SHOP_PURCHASE_COMPLETED`         | —                    |
| `inventory_add`          | Item especial     | Coleção          | `InventoryService.addSpecialItem` | —                    |
| `loot_received`          | Caixa ganha       | Antecipação      | `LOOT_BOX_RECEIVED`               | —                    |
| `loot_shake`             | Overlay abertura  | Tensão lúdica    | `LootBoxOpeningOverlay`           | Já tem haptic medium |
| `loot_reveal_common`     | Revelação comum   | OK               | `LOOT_BOX_OPENED`                 | Escala por raridade  |
| `loot_reveal_uncommon`   | …                 | …                | …                                 | …                    |
| `loot_reveal_rare`       | …                 | …                | …                                 | …                    |
| `loot_reveal_epic`       | …                 | …                | …                                 | …                    |
| `loot_reveal_legendary`  | …                 | …                | …                                 | Variable reward      |
| `loot_reveal_mythic`     | …                 | …                | …                                 | …                    |
| `loot_reveal_ancient`    | …                 | …                | …                                 | —                    |
| `consumable_use`         | Booster ativado   | Poder temporário | Consumable flow                   | —                    |
| `collectible_discovered` | Colecionável novo | Descoberta       | `COLLECTIBLE_DISCOVERED`          | Collection book      |

**Loot por raridade:** mesma frase melódica de 3 notas; orquestração cresce (common = madeira → ancient = pad + choir).

---

## 11. Carreira, metagame e prestígio

| ID                    | Momento              | Emoção                | `GameEvents`             | Retenção         |
| --------------------- | -------------------- | --------------------- | ------------------------ | ---------------- |
| `level_up`            | Subida de nível      | **Pico**              | `PLAYER_LEVEL_UP`        | Endgame loop     |
| `achievement_unlock`  | Conquista            | Orgulho               | `ACHIEVEMENT_UNLOCKED`   | Coleção          |
| `title_unlock`        | Título               | Status                | `TITLE_UNLOCKED`         | Identidade       |
| `career_promotion`    | Promoção             | Fantasia profissional | `CAREER_PROMOTION`       | Adulto           |
| `dream_milestone`     | Sonho de carreira    | Aspiração             | `DREAM_MILESTONE`        | —                |
| `season_tier`         | Tier temporada       | Passe mensal          | `SEASON_TIER_REACHED`    | Retenção M1      |
| `season_reward_claim` | Resgate passe        | Recompensa            | `SEASON_REWARD_CLAIMED`  | —                |
| `legacy_milestone`    | Legado               | História pessoal      | `LEGACY_MILESTONE`       | Anual            |
| `prestige_available`  | Prestígio disponível | Convite épico         | `PRESTIGE_AVAILABLE`     | Endgame          |
| `prestige_ascend`     | Ascensão             | Reset glorioso        | `PRESTIGE_ASCENDED`      | Whales engajados |
| `study_points_earn`   | SP ganhos            | Progresso farm        | `STUDY_POINTS_EARNED`    | Farm infinito    |
| `farm_activity`       | Atividade farm       | Grind positivo        | `FARM_ACTIVITY_RECORDED` | —                |

---

## 12. Contratos e streak

| ID                  | Momento         | Emoção               | `GameEvents`         | Retenção       |
| ------------------- | --------------- | -------------------- | -------------------- | -------------- |
| `contract_sign`     | Início contrato | Compromisso          | `CONTRACT_STARTED`   | Accountability |
| `contract_day_tick` | Dia cumprido    | Consistência         | Progresso contrato   | —              |
| `contract_win`      | Contrato OK     | Alívio + orgulho     | `CONTRACT_COMPLETED` | —              |
| `contract_fail`     | Falha           | Perda sem humilhação | `CONTRACT_FAILED`    | Retry          |

---

## 13. Focus Mode

| ID                  | Momento             | Emoção               | `GameEvents`                 | Retenção               |
| ------------------- | ------------------- | -------------------- | ---------------------------- | ---------------------- |
| `focus_enter`       | Início sessão       | Túnel                | `FOCUS_SESSION_STARTED`      | Sessões longas         |
| `focus_ambient`     | Loop sessão         | Concentração         | Estado `FOCUS_DEEP`          | Sem vocal              |
| `focus_complete`    | Sessão OK           | Recompensa calma     | `FOCUS_SESSION_COMPLETED`    | Fecha loop             |
| `focus_abandon`     | Abandono            | Neutro, não punitivo | `FOCUS_SESSION_ABANDONED`    | —                      |
| `focus_distraction` | Distração (Android) | Lembrete leve        | `FOCUS_DISTRACTION_RECORDED` | Opcional, baixo volume |

---

## 14. Batalhas linguísticas

Design para implementação futura; eventos sugeridos: `BATTLE_ROUND_START`, `BATTLE_CORRECT`, `BATTLE_COMBO`, `BATTLE_WRONG`, `BATTLE_WIN`, `BATTLE_LOSS`.

| Fase           | ID                    | Emoção      |
| -------------- | --------------------- | ----------- |
| Approach       | `battle_intro_sting`  | Antecipação |
| Round          | `battle_pulse`        | Ritmo       |
| Combo 3+       | `battle_combo`        | Flow        |
| Erro           | `battle_shield_break` | Tensão leve |
| HP/tempo baixo | music stem `tension`  | Urgência    |
| Vitória        | `battle_win`          | Triunfo     |
| Derrota        | `battle_loss_soft`    | Resiliência |

**Adaptativo:** combo sobe tom até +3 semitons; pausa antes do win aumenta impacto.

---

## 15. Música adaptativa

### Estados (`AudioMusicState`)

| Estado            | Contexto                          | Características                |
| ----------------- | --------------------------------- | ------------------------------ |
| `HUB_CALM`        | Home, perfil (streak OK)          | Pad leve, tempo moderado       |
| `HUB_CELEBRATION` | Todas dailies completas (15–30 s) | + strings, depois decay        |
| `CITY_EXPLORE`    | `/city` mapa                      | Moderato, percussão leve       |
| `CITY_EVENT`      | `CITY_EVENT_STARTED` ativo        | Overlay festivo                |
| `QUEST_ACTIVE`    | Tab missões com pendentes         | Leve urgência                  |
| `FOCUS_DEEP`      | Focus Mode                        | Minimal, sem bateria           |
| `BATTLE`          | Batalha linguística               | Stems base + tension + victory |
| `CARE_DEBT`       | Alta dívida de atenção            | Filtro LP, menos harmônicos    |
| `NIGHT_MODE`      | Rotina pet noite (opcional)       | Piano suave                    |

### Stems por faixa

Cada música: loop **2–3 min** + stems:

- `drums` (off em focus)
- `melody` (off em tension-only)
- `strings` (on em celebration)
- `perc_high` (on em battle)

**Transições:** crossfade ~1,2 s; hard cut apenas em P0 cinematic.

### Gatilhos exemplo

| Condição                 | Novo estado                          |
| ------------------------ | ------------------------------------ |
| Entrou `/city`           | `CITY_EXPLORE`                       |
| `CITY_EVENT_STARTED`     | `CITY_EVENT`                         |
| Focus ativo              | `FOCUS_DEEP`                         |
| Todas dailies completas  | `HUB_CELEBRATION` → decay `HUB_CALM` |
| Care debt &gt; threshold | `CARE_DEBT`                          |
| `PRESTIGE_ASCENDED`      | pause music → cinematic → restore    |

---

## 16. Mapeamento GameEvents → áudio

Referência rápida para `AudioDirector.onGameEvent`. Prioridade entre parênteses.

| Evento                          | SFX / music sugeridos                                  |
| ------------------------------- | ------------------------------------------------------ |
| `DAILY_MISSION_COMPLETED`       | `mission_complete` (P3); verificar `mission_daily_all` |
| `XP_GAINED`                     | `xp_tick` / `xp_chime` / `xp_surge` (P3)               |
| `PLAYER_LEVEL_UP`               | `level_up` + `HUB_CELEBRATION` breve (P0)              |
| `STUDY_DAY_RECORDED`            | `study_day_stamp` (P2)                                 |
| `WORDS_LEARNED`                 | `xp_tick` leve (P3)                                    |
| `LEXICON_BRICK_PLACED`          | `lexicon_brick_place` (P3)                             |
| `LEXICON_BRICK_CRACKED`         | `lexicon_brick_crack` (P3)                             |
| `LEXICON_BRICK_REPAIRED`        | `lexicon_repair` (P3)                                  |
| `MEMORY_WALL_COMPLETED`         | `memory_wall_complete` (P2)                            |
| `SPEAKING_SESSION_COMPLETED`    | `study_correct` ×N (P3)                                |
| `SHIELD_USED` / `SHIELD_EARNED` | `shield_clink` (P3)                                    |
| `WEEKLY_MISSION_CLAIMED`        | `weekly_claim` (P2)                                    |
| `PET_STAGE_EVOLVED`             | `pet_evolve` (P0)                                      |
| `PET_INTERACTION`               | `pet_happy` / `pet_play` (P4)                          |
| `PET_MEMORY_CREATED`            | `pet_memory_unlock` (P2)                               |
| `LOOT_BOX_RECEIVED`             | `loot_received` (P3)                                   |
| `LOOT_BOX_OPENED`               | `loot_reveal_*` por raridade (P2)                      |
| `ACHIEVEMENT_UNLOCKED`          | `achievement_unlock` (P2)                              |
| `SHOP_PURCHASE_COMPLETED`       | `shop_purchase` (P3)                                   |
| `TITLE_UNLOCKED`                | `title_unlock` (P2)                                    |
| `CITY_BUILDING_UNLOCKED`        | `building_unlock` (P0)                                 |
| `POI_VISITED`                   | `poi_enter` (P5)                                       |
| `DISTRICT_UNLOCKED`             | `district_unlock` (P2)                                 |
| `LOCAL_MISSION_COMPLETED`       | `mission_complete` (P3)                                |
| `POI_LEVEL_UP`                  | `poi_level_up` (P3)                                    |
| `CITY_RESOURCE_DELIVERED`       | `resource_delivery` (P3)                               |
| `POI_PROJECT_COMPLETED`         | `project_complete` (P2)                                |
| `CITY_EVENT_STARTED`            | `city_event_start` + `CITY_EVENT` (P2)                 |
| `CITY_EVENT_ENDED`              | crossfade → `CITY_EXPLORE`                             |
| `POI_CHAIN_COMPLETED`           | `chain_complete` (P2)                                  |
| `STREAK_BROKEN`                 | `streak_break_wind` + `CARE_DEBT` (P2)                 |
| `CONTRACT_STARTED`              | `contract_sign` (P3)                                   |
| `CONTRACT_COMPLETED`            | `contract_win` (P2)                                    |
| `CONTRACT_FAILED`               | `contract_fail` (P3)                                   |
| `CAREER_PROMOTION`              | `career_promotion` (P2)                                |
| `SEASON_TIER_REACHED`           | `season_tier` (P2)                                     |
| `PRESTIGE_ASCENDED`             | `prestige_ascend` (P0)                                 |
| `FOCUS_SESSION_STARTED`         | `focus_enter` + `FOCUS_DEEP`                           |
| `FOCUS_SESSION_COMPLETED`       | `focus_complete` (P2)                                  |
| `COLLECTIBLE_DISCOVERED`        | `collectible_discovered` (P2)                          |
| `PUNISHMENT_APPLIED`            | `ui_error_soft` ou sting baixo (P3) — sem humilhação   |
| `PUNISHMENT_RECOVERED`          | `study_correct` + `pet_happy` (P3)                     |

Eventos sem linha dedicada podem herdar família próxima (ex.: `CITY_EVENT_MISSION_COMPLETED` → `mission_complete`).

---

## 17. Psicologia e retenção

| Mecanismo            | Áudio que ativa                         |
| -------------------- | --------------------------------------- |
| Variable reward      | Loot por raridade, reveal animado       |
| Endowed progress     | `xp_tick`, `lexicon_brick_place`        |
| Loss aversion suave  | `streak_break_wind`, `contract_fail`    |
| Sunk cost social     | `pet_worried`, `npc_trust_up`           |
| Goal gradient        | `mission_progress`, entregas de recurso |
| Identity             | `pet_memory_unlock`, `legacy_milestone` |
| Environment coupling | Ambient por `vitalityBand`              |

---

## 18. Implementação Expo / React Native

### Stack

| Peça        | Escolha                   | Motivo                                      |
| ----------- | ------------------------- | ------------------------------------------- |
| Playback    | `expo-audio`              | Oficial Expo SDK 56, preload, volume, loop  |
| Formato SFX | `.wav` curtos ou `.m4a`   | &lt;100 ms: wav; loops: m4a comprimido      |
| Bus         | `AudioDirector` singleton | Evita explosão de instâncias                |
| Integração  | `GameEvents.subscribe`    | Mesmo padrão de `PetService`, `CityService` |

### Estrutura de assets

```text
assets/audio/
  ui/              # ~20 arquivos
  gameplay/        # ~50 arquivos
  pet/             # ~25 arquivos
  city/ambient/    # loops + stems
  music/           # estados × stems
  cinematic/       # ~10 one-shots
```

### API conceitual

```typescript
// src/services/audio-director.ts (futuro)

type AudioSettings = {
  master: number;
  music: number;
  sfx: number;
  ambient: number;
  pet: number;
  studySilentMode: boolean;
};

AudioDirector.init(settings);
AudioDirector.subscribe(GameEvents);
AudioDirector.setMusicState("CITY_EXPLORE");
AudioDirector.playUI("tap_select");
AudioDirector.playSFX("coin_pickup", { variant: "b", pitchScatter: true });
AudioDirector.preloadForRoute("/city");
```

### Performance mobile

- Preload por **rota atual** (hub vs city vs loot)
- SFX &lt; 200 KB; ambient loop &lt; 2 MB comprimido
- Máx. **2** loops simultâneos (music + ambient)
- Respeitar silent switch iOS (categoria configurável)
- `shouldDuckAndroid: true` na faixa de música

### Settings (perfil)

Sliders: Música · SFX · Ambiente · Pet · Master  
Toggle: **Modo estudo silencioso** (só micro-UI + haptics)  
Toggle: **Ritmo noturno** (automático por hora ou fase do pet)

### Sincronia com implementação atual

| Já existe                               | Áudio a adicionar                                 |
| --------------------------------------- | ------------------------------------------------- |
| `haptics` em tabs, loot, missions       | `ui_tab_switch`, `loot_shake`, `mission_complete` |
| `LootBoxOpeningOverlay`                 | `loot_shake` → `loot_reveal_*`                    |
| `CelebrationModal` / `CelebrationsHost` | sting cinematic curto                             |
| `GameEvents` (~50 tipos)                | Mapa §16                                          |

### Implementação MVP (código)

| Arquivo                                                    | Função                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| `src/services/audio/audio-director.ts`                     | Singleton `AudioDirector`, playback `expo-audio`        |
| `src/services/audio/audio-event-map.ts`                    | `GameEvents` → SFX (XP, missão, streak, loot, level up) |
| `src/services/audio/audio-catalog.ts`                      | Registry de assets                                      |
| `src/services/audio/audio-pools.ts`                        | Anti-repetição (tap, moeda)                             |
| `src/services/audio/audio-store.ts`                        | Settings + AsyncStorage                                 |
| `assets/audio/**`                                          | WAV placeholder (gerados por script)                    |
| `scripts/generate-mvp-audio.ts`                            | `pnpm audio:generate-mvp`                               |
| `src/features/profile/components/AudioSettingsSection.tsx` | Toggle + volume + modo silencioso                       |

Inicialização em `hydrate-stores.ts` após serviços do jogo:

```typescript
await AudioDirector.init(); // subscribe GameEvents + hydrate settings
```

**Dev client:** após `pnpm add expo-audio`, é obrigatório **recompilar** o app nativo (`pnpm android` / `pnpm ios`). O JS usa `require('expo-audio')` com fallback; se o módulo nativo faltar, o app continua funcionando sem áudio (log `audio.native_unavailable`).

Integrações UI: `PressableScale`, `AppTabBar`, `LootBoxOpeningOverlay` (`loot_shake`).

---

## 19. Roadmap de produção

| Fase       | Entrega                                                   | Impacto estimado                     |
| ---------- | --------------------------------------------------------- | ------------------------------------ |
| **MVP** ✅ | UI micro + XP/coin/missão/streak + loot reveal + level up | ~70% do game feel — **implementado** |
| **V1**     | Pet emocional + ambient cidade (vitality) + shop          | Vínculo + mundo                      |
| **V2**     | Music states (hub/city/focus) + anti-ennui pools          | Imersão contínua                     |
| **V3**     | Battle dinâmico + eventos sazonais + care debt mix        | Profundidade                         |

**Contagem inicial realista:** ~80 SFX + 6 músicas com stems + 4 ambientes.

---

## 20. Storyboard — um dia do jogador

1. **Abre app** → `HUB_CALM` fade in; `ui_tab_switch` na home
2. **1ª daily** → `study_correct` + `xp_tick` + `mission_complete`
3. **Dia registrado** → `study_day_stamp` + `streak_flame`
4. **Mapa cidade** → crossfade `CITY_EXPLORE`; `poi_enter`
5. **Lexicon brick** → `lexicon_brick_place` + stem sparkle
6. **Alimenta pet** → `pet_eat`; idle `pet_happy` depois
7. **Loot épica** → duck music; `loot_shake` (overlay); `loot_reveal_epic`; haptic success
8. **Focus 25 min** → `focus_enter` → `FOCUS_DEEP`; fim: `focus_complete`
9. **Streak quebrado** → `streak_break_wind` + `CARE_DEBT`; `pet_worried` uma vez
10. **Retorno dia 3** → `pet_memory_unlock` tone + missão fácil com `mission_complete` reforçado

---

## Documentação relacionada

- [`FEATURES.md`](./FEATURES.md) — funcionalidades e `GameEvents`
- [`GAMIFICATION_SYSTEMS.md`](./GAMIFICATION_SYSTEMS.md) — care debt, pacto de ritmo, cidade
- [`LIVING_CITY.md`](./LIVING_CITY.md) — POIs, lexicon, eventos
- [`REWARDS_CATALOG.md`](./REWARDS_CATALOG.md) — economia e recompensas

---

_Versão do documento: 1.0 · English Quest_
