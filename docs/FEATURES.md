# English Quest — Documentação de Funcionalidades

Referência completa de todas as funcionalidades do aplicativo: o que cada uma faz e como funciona internamente.

> **App:** English Quest · **Plataforma:** React Native / Expo SDK 56 · **Armazenamento:** SQLite (offline-first)

---

## Índice

1. [Visão geral](#visão-geral)
2. [Navegação](#navegação)
3. [Jogador (Player)](#jogador-player)
4. [Home (Hub central)](#home-hub-central)
5. [Missões diárias](#missões-diárias)
6. [Missões semanais](#missões-semanais)
7. [Missões épicas](#missões-épicas)
8. [Streak (Sequência)](#streak-sequência)
9. [Escudos (Shields)](#escudos-shields)
10. [Pet (Companheiro)](#pet-companheiro)
11. [Inventário](#inventário)
12. [Loot Boxes](#loot-boxes)
13. [Catálogo de Loot Boxes](#catálogo-de-loot-boxes)
14. [Loja (Shop)](#loja-shop)
15. [Conquistas (Achievements)](#conquistas-achievements)
16. [Títulos (Titles)](#títulos-titles)
17. [Cidade Internacional (City)](#cidade-internacional-city)
18. [Contratos (Contracts)](#contratos-contracts)
19. [Estatísticas (Statistics)](#estatísticas-statistics)
20. [Notificações](#notificações)
21. [Perfil e Avatar](#perfil-e-avatar)
22. [Atributos RPG](#atributos-rpg)
23. [Carreira Internacional (Career)](#carreira-internacional-career)
24. [Metagame (Temporada e Legado)](#metagame-temporada-e-legado)
25. [Prestígio (Prestige)](#prestígio-prestige)
26. [Farm (Study Points)](#farm-study-points)
27. [Study Points (Economia secundária)](#study-points-economia-secundária)
28. [Collection Book (Livro de Coleção)](#collection-book-livro-de-coleção)
29. [Wishlist (Lista de desejos)](#wishlist-lista-de-desejos)
30. [Modificadores de recompensa](#modificadores-de-recompensa)
31. [Milestones de nível](#milestones-de-nível)
32. [Celebrações visuais](#celebrações-visuais)
33. [Eventos do jogo (Game Events)](#eventos-do-jogo-game-events)
34. [Dificuldade de aprendizado](#dificuldade-de-aprendizado)
35. [Baralho Vivo (Flash Deck)](#baralho-vivo-flash-deck)
36. [Duelos de Inglês](#duelos-de-inglês)
37. [Chama Interior](#chama-interior)
38. [GPS de Aprendizado](#gps-de-aprendizado)
39. [Documentação relacionada](#documentação-relacionada)

---

## Visão geral

English Quest é um app gamificado para **consistência no estudo de inglês**. O jogador progride completando missões, mantendo streaks, evoluindo um pet e desbloqueando conteúdo de carreira internacional.

### Princípios técnicos

| Princípio                  | Implementação                          |
| -------------------------- | -------------------------------------- |
| Fonte da verdade           | SQLite via Drizzle ORM                 |
| Estado de UI               | Zustand (espelha o banco após hydrate) |
| Offline                    | Sem backend; tudo local                |
| Comunicação entre sistemas | `GameEvents` (pub/sub interno)         |
| Package manager            | pnpm                                   |

### Loop principal do jogo

```
Estudar → Completar missão diária → Ganhar XP/Moedas + pontos de temporada
       → Registrar dia de estudo → Streak sobe → Pet recupera vitais
       → Progresso em missões semanais/épicas/contratos
       → Pet evolui (cuidar: alimentar, brincar, vitais)
       → Loot / itens consumíveis / resgate do passe mensal em Metagame
```

---

## Navegação

### Tabs principais (`src/app/(tabs)/`)

| Tab     | Rota         | Função                                  |
| ------- | ------------ | --------------------------------------- |
| Início  | `/`          | Hub com progresso, missões, pet, cidade |
| Missões | `/quests`    | Dailies, weeklies e épicas              |
| Itens   | `/inventory` | Inventário, escudos, loot boxes         |
| Loja    | `/shop`      | Compras com moedas                      |
| Perfil  | `/profile`   | Streak, escudos, avatar, configurações  |

### Telas secundárias (`src/app/`)

| Rota                | Funcionalidade                 |
| ------------------- | ------------------------------ |
| `/pet`              | Companheiro virtual            |
| `/loot-boxes`       | Abrir loot boxes               |
| `/loot-box-catalog` | Catálogo transparente de drops |
| `/achievements`     | Conquistas                     |
| `/titles`           | Títulos de carreira            |
| `/city`             | Cidade internacional           |
| `/contracts`        | Contratos de compromisso       |
| `/statistics`       | Dashboard analítico            |
| `/career`           | Jornada de carreira            |
| `/metagame`         | Temporada, coleções, core loop |
| `/farm`             | Farm de Study Points           |
| `/collection-book`  | Livro de colecionáveis         |
| `/prestige`         | Roadmap de prestígio           |

---

## Jogador (Player)

**O que é:** Entidade central do progresso — nome, nível, XP, moedas, título, streak e escudos.

**Como funciona:**

- Dados persistidos na tabela `player` (SQLite).
- **XP:** Fórmula `100 + (nível - 1) × 85` para subir de nível.
- **Moedas:** Ganhas em missões, level-up, contratos, loot boxes e conquistas.
- **Level-up:** Processa múltiplos níveis encadeados; emite `PLAYER_LEVEL_UP`.
- **Pet sync:** 15% do XP do jogador também vai para o pet.
- **Título ativo:** Atualizado automaticamente pelo `TitleService` conforme o nível.

**Arquivos:** `src/features/player/`

**Eventos emitidos:** `XP_GAINED`, `PLAYER_LEVEL_UP`

---

## Home (Hub central)

**O que é:** Tela inicial que consolida o estado do jogador e atalhos para sistemas importantes.

**Como funciona:**

- Exibe avatar, nome, título, nível, barra de XP, moedas e streak.
- **ActiveBonusesCard:** Mostra bônus ativos (relíquias, prestígio, contratos).
- **DailyMissionsPreview:** Resumo das missões do dia.
- **ActiveContractPreview:** Contrato em andamento (se houver).
- **PetPreviewCard:** Atalho para `/pet` com nome, humor e afinidade.
- **CityPreviewCard:** Progresso da cidade internacional.

**Arquivos:** `src/features/home/components/HomeHeroHub.tsx`

---

## Missões diárias

**O que é:** Conjunto de tarefas geradas automaticamente todo dia para incentivar estudo.

**Como funciona:**

1. **Geração:** Ao iniciar o dia (ou na primeira abertura), `resetDailyMissionsInDatabase()` seleciona missões via `selectDailyMissions()` com base na data e na dificuldade configurada.
2. **Conclusão:** O jogador marca a missão como completa na tab Missões.
3. **Recompensas:** XP e moedas creditados imediatamente via `usePlayerStore`.
4. **Efeitos colaterais:**
   - Registra dia de estudo (`StudyService.recordStudyDay()` → streak).
   - Emite `DAILY_MISSION_COMPLETED` → atualiza weeklies, pet, achievements, RPG.
5. **Reset:** Automático à meia-noite (chave de data `YYYY-MM-DD`).

**Exemplos de missões:** Aprender palavras, completar sessão de speaking, revisar vocabulário.

**Arquivos:** `src/features/quests/`

---

## Missões semanais

**O que é:** Objetivos de médio prazo que resetam toda semana (segunda a domingo).

**Como funciona:**

1. **Geração semanal:** `WeeklyMissionService.ensureCurrentWeek()` cria missões se a semana mudou.
2. **Progresso automático:** Escuta `GameEvents`:
   - `DAILY_MISSION_COMPLETED` → progresso em "dailies completadas"
   - `XP_GAINED`, `STUDY_DAY_RECORDED`, `WORDS_LEARNED`, etc.
3. **Claim:** Jogador resgata manualmente quando a meta é atingida.
4. **Recompensas:** XP, moedas e, no **primeiro claim da semana**, loot box garantida.
5. **Pet XP:** +50 XP ao resgatar.

**Arquivos:** `src/features/weekly-quests/`

---

## Missões épicas

**O que é:** Missões de longo prazo com metas maiores (ex.: acumular XP total, completar N dailies).

**Como funciona:**

1. Até 5 missões épicas são sorteadas deterministicamente na primeira inicialização.
2. Progresso atualizado via `GameEvents` (XP, dailies, etc.).
3. Recompensas escaladas pela dificuldade de aprendizado.
4. Exibidas na tab Missões, abaixo das dailies e weeklies.

**Arquivos:** `src/features/epic-quests/`

---

## Streak (Sequência)

**O que é:** Contador de dias consecutivos de estudo.

**Como funciona:**

1. **Registro:** Ao completar a primeira missão do dia, `StreakService.recordStudyDay()` é chamado.
2. **Cálculo:**
   - Se estudou ontem → streak +1
   - Se pulou dias (sem escudo) → streak reinicia em 1
   - Se já registrou hoje → não duplica
3. **Métricas:** `currentStreak`, `bestStreak`, `totalStudyDays`.
4. **Histórico:** Tabela `study_days` com cada data registrada.
5. **Startup:** `reconcileOnStartup()` verifica dias perdidos e aplica escudos se disponíveis.

**Impacto:** Humor do pet, conquistas, contratos, carreira e metagame.

**Arquivos:** `src/features/streak/`

---

## Escudos (Shields)

**O que é:** Item consumível que protege a streak quando o jogador falha em estudar.

**Como funciona:**

1. **Proteção automática:** No startup ou ao registrar estudo, `ShieldService.processStreakProtection()` detecta dias perdidos.
2. **Consumo:** 1 escudo por dia perdido; streak é mantida.
3. **Obtenção:** Loja, conquistas, contratos, loot boxes, milestones de streak.
4. **Milestones:** Streaks longas (7, 14, 30 dias…) concedem escudos extras.
5. **Histórico:** Registro de uso em `shield_usage_history`.

**Arquivos:** `src/features/shields/`

---

## Pet (Companheiro)

**O que é:** Companheiro virtual emocional que evolui com o jogador.

**Como funciona:**

### Progressão

- **XP do pet:** Dailies (+10), weeklies (+50), contratos (+100), 15% do XP do jogador.
- **Evolução por nível:** Egg → Baby (5) → Teen (10) → Adult (20) → Legendary (50).
- **Recompensas de evolução:** Moedas ao atingir cada estágio.

### Humor

- Base: streak do jogador (via `resolveMoodFromStreak`).
- **Vitals baixos** podem rebaixar o humor exibido (feliz → normal; crítico → triste), mesmo com streak alta.
- Punições do sistema podem forçar humor negativo.

### Vitais e rotina (gameplay ativo)

Campos persistidos em `pets`: `energy`, `hunger` (UI: **Alimentação**), `happiness`, `motivation` (0–100; 100 = ideal).

**Decaimento (`applyVitalDecay`):**

- Calculado a partir de `updatedAt` e `lastInteractionAt` (até 24 passos por sync).
- Fora do sono: energia, alimentação, felicidade e motivação caem ao longo do tempo.
- Fase **dormindo** (22h–6h): energia **recupera**; demais vitais ainda decaem, com penalidade extra se energia/alimentação estiverem baixas.
- Sincronizado em `PetService.syncRoutineAndVitals()` (hydrate, refresh da tela `/pet`).

**Recuperação por estudo (sem interação manual):**
| Evento | Bônus típicos |
|--------|----------------|
| `STUDY_DAY_RECORDED` | +12 alimentação, +8 energia, +6 motivação, +5 felicidade |
| `FOCUS_SESSION_COMPLETED` | +6 / +10 / +8 / +4 |
| `DAILY_MISSION_COMPLETED` | +4 / +5 / +4 / +3 |

**Rotina:** Manhã / tarde / noite / dormindo conforme horário local (`getRoutinePhase`).

**104 animações** catalogadas (idle, happy, sad, excited).

### Interações (tela `/pet`)

Cooldown global: **1 interação a cada 5 minutos** (`lastInteractionAt`). Vitais podem bloquear ações antes do cooldown.

| Interação                   | Efeito                                                  | Requisitos                       |
| --------------------------- | ------------------------------------------------------- | -------------------------------- |
| Carinho                     | +afinidade, +felicidade                                 | Alimentação e energia mínimas    |
| Alimentar                   | Restaura alimentação/energia (catálogo de 50 alimentos) | Bloqueado se alimentação ≥ 94%   |
| Brincar                     | Brinquedo: gasta energia, +felicidade                   | Alimentação ≥ 28%, energia ≥ 22% |
| Conversar                   | Diálogo em inglês (offline)                             | Vitais mínimos leves             |
| Treinar                     | +5 pet XP, +motivação                                   | Alimentação ≥ 35%, energia ≥ 38% |
| Presente / Foto / Acessório | Afinidade e cosméticos                                  | Vitais mínimos leves             |

- **Afinidade reduzida** quando a média dos vitais está baixa (`PetVitalsService.getAffinityMultiplier`).
- UI: painel de status com alertas; grid marca ações indisponíveis.

**Arquivos de vitais:** `pet-vitals-service.ts`, `constants/vitals.ts`, `utils/routine.ts`

### Afinidade (0–1000)

Tiers: Conhecido → Amigo → Melhor Amigo → Parceiro → Alma Gêmea. Desbloqueia diálogos e animações.

### Memórias e coleção

- **Álbum:** Marcos como primeiro dia, streak 7, evolução, contrato, nível 50.
- **Petédex:** 29 espécies (Code Owl, Deploy Dragon, etc.) com passivos únicos.

**Arquivos:** `src/features/pet/` · Doc detalhada: [`PET_SYSTEM.md`](./PET_SYSTEM.md)

---

## Inventário

**O que é:** Armazena todos os itens do jogador.

**Como funciona:**

- **Escudos:** Quantidade sincronizada com `player.shields`.
- **Loot boxes:** Por raridade, com flag `opened`.
- **Itens especiais:** Boosters, tickets, chaves, consumíveis e relíquias (por `itemKey`; empilham por chave).
- **Pet snapshot:** Estado atual do pet exibido no inventário.
- **Histórico:** Toda aquisição registrada em `inventory_acquisition_history`.
- **Analytics:** Totais de itens, escudos e loot boxes recebidos.

### Itens consumíveis e boosters

Catálogo em `GAME_ITEM_CATALOG` (`item-catalog.ts`). Uso na tela **Inventário → Itens Especiais** (toque → confirmar).

| Tipo               | Exemplos                                                    | Efeito ao usar                                                 |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Instantâneo        | Café Expresso, Soro de XP, Bolsa de Moedas                  | XP ou moedas na hora                                           |
| Booster temporário | Tônico de XP (+10% / 1h), Elixir em dobro, Amuleto da Sorte | Registro em `active_boosters`; soma em `RewardModifierService` |
| Ticket             | Bilhete de Loot                                             | Concede loot box Comum                                         |
| Chave              | Prata / Ouro / Lendária                                     | Loot box Rara / Épica / Lendária                               |
| Kit                | Kit de Escudo                                               | +1 ou +2 escudos                                               |
| Pacote             | Convite FAANG, Medalha World Class                          | XP + moedas                                                    |

- Boosters ativos aparecem no inventário com tempo restante.
- Chaves legadas de loot (`booster_study`, `golden_ticket`, etc.) mapeiam para itens canônicos via `resolveGameItem`.

**Serviços:** `consumable-item-service.ts`, `booster-modifier-cache.ts`, `active-booster-repository.ts`

**Arquivos:** `src/features/inventory/`, `src/features/game-design/catalogs/item-catalog.ts`

---

## Loot Boxes

**O que é:** Caixas de recompensa aleatória com raridades crescentes.

**Como funciona:**

1. **Obtenção:** Missões, conquistas, shop, contratos, prestígio, weeklies.
2. **Abertura:** Jogador escolhe caixa na tela `/loot-boxes`.
3. **Recompensas possíveis:** Moedas, escudos, Study Points, **itens especiais** (pools por raridade), colecionáveis, outra loot box.
4. **Pools de itens especiais:** Cada raridade de caixa tem lista própria de consumíveis/boosters/tickets (`loot-box-special-pools.ts`) — ex.: Comum → Café/Soro; Épica → elixires e chave prata; Mítica → pacotes FAANG e ovo de pet.
5. **Pity timer:** Após 30 aberturas sem drop de alto valor, garante recompensa melhor.
6. **Upgrade chain:** Study Points podem elevar raridade da próxima caixa (Common → Uncommon → … → Ancient).
7. **Loot luck:** Bônus de relíquias, pets e boosters ativos aumentam chance de drops raros.

**Raridades:** Common, Uncommon, Rare, Epic, Legendary, Mythic, Ancient.

**Arquivos:** `src/features/loot-boxes/`

---

## Catálogo de Loot Boxes

**O que é:** Tela transparente que mostra chances e conteúdo de cada raridade.

**Como funciona:**

- Hub em `/loot-box-catalog` lista todas as raridades.
- Detalhe por raridade em `/loot-box-catalog/[rarity]`.
- Exibe taxas de drop, colecionáveis possíveis e integração com wishlist.

**Arquivos:** `src/features/loot-boxes/components/LootBoxCatalogHub.tsx`

---

## Loja (Shop)

**O que é:** Marketplace para gastar moedas em itens úteis.

**Como funciona:**

1. Catálogo de produtos com categorias: Escudos, Loot Boxes, Pets, Itens Especiais.
2. **Compra:** Valida saldo → deduz moedas → entrega item via `InventoryService` ou `ShieldService`.
3. **Histórico:** Registro em `shop_purchase_history`.
4. **Analytics:** Total gasto, produto mais comprado, categoria top.

**Arquivos:** `src/features/shop/`

---

## Conquistas (Achievements)

**O que é:** 72+ metas de longo prazo com recompensas permanentes.

**Como funciona:**

1. **Categorias:** Streak, Missões, XP, Nível, Pet, Loot Boxes, Cidade, Contratos, etc.
2. **Detecção:** `AchievementService` escuta `GameEvents` e compara métricas com thresholds.
3. **Desbloqueio automático:** Ao atingir meta, concede recompensa (moedas, escudos, loot box, pet XP).
4. **Celebração:** Modal/confetti via fila de celebrações.
5. **Progresso:** Exibido em tempo real na tela `/achievements`.

**Arquivos:** `src/features/achievements/`

---

## Títulos (Titles)

**O que é:** 42 títulos de carreira desbloqueados por nível (ex.: Local Developer → World Class Engineer).

**Como funciona:**

1. **Desbloqueio:** Automático ao atingir nível requerido.
2. **Título ativo:** O mais alto desbloqueado é aplicado ao jogador e exibido na Home/Perfil.
3. **Histórico:** Registro permanente em `title_unlocks`.
4. **Celebração:** Animação ao ser promovido.

**Arquivos:** `src/features/titles/`

---

## Cidade Internacional (City)

**O que é:** **Cidade Viva** (Fase 1) — mapa com POIs clicáveis + aba **Resumo** com skyline legado por nível.

> **Fase 7 (polimento AAA):** chains narrativas, trust NPC, visual stage nos pins, calendário anual (Halloween/verão/Ano Novo). Ver [`LIVING_CITY.md`](./LIVING_CITY.md).

**Como funciona (implementado hoje):**

1. **Mapa (`/city` → aba Mapa):** grade 7×6 em `src/data/city.json`; desbloqueio por nível e distrito.
2. **Missões por POI (Fase 2):** geração diária (`poi-missions.json`), progresso via `GameEvents`, resgate com XP/moedas/XP local; badge laranja no pin quando há recompensa.
3. **Contratos por POI (Fase 3):** ofertas na aba **Contratos** do modal; emissor gravado em `contract_runs`; pin do emissor ativo com destaque; `/contracts` lista índice com atalho «Ir ao local».
4. **Recursos Lexicon (Fase 4):** `city_resources`; palavras do farm → tijolos; obras semanais na **Biblioteca** e **Prefeitura** (aba Entregar + barra de obra).
5. **Cidade viva (Fase 5):** vitalidade 0–100 com rumores; bônus/penalidade em recompensas; pet no **Parque**; **Museu da Temporada** após 1º tier do season; **Distrito Internacional** (embaixada nv.20, aeroporto nv.30).
6. **Evento Natal (Fase 6):** `CityEventScheduler` (1–26/dez ou `DEV_FORCE_CITY_EVENT_KEY` em dev); banner + overlay no mapa; POI **Mercado de Inverno**; aba **Natal** no modal; missões/contratos `christmas_2026`; farm de vocabulário alimenta espírito natalino (0–100).
7. **Detalhe do POI:** abas Visão / Missões / Contratos / Entregar (+ Natal quando evento ativo).
8. **Resumo:** skyline + timeline de marcos (sistema anterior).
9. **Construções:** Desbloqueadas por nível na aba Resumo; custo em moedas/SP nos marcos intermediários.
10. **Integração:** Percentual da cidade alimenta sonhos na Carreira.

**Arquivos:** `src/features/city/`, `CityMapService`, `CityVitalityService`, `CityLivingService`, `CityResourceService`, `src/data/city.json`

**Dados editáveis (JSON):** [`src/data/`](../src/data/README.md) — `city.json`, `poi-missions.json`, `poi-projects.json`, `contracts.json`, `missions.json`, `items.json`.

---

## Contratos (Contracts)

**O que é:** Desafios de compromisso com aposta em moedas e recompensas maiores.

**Como funciona:**

1. **Emissor:** Cada contrato tem `issuerPoiKey` (catálogo em `src/data/contracts.json`); aceite no POI ou via `/contracts` → «Ir ao local».
2. **Aceitar:** Paga stake em moedas; `issuer_poi_key` gravado na run.
3. **Elegibilidade:** `minPlayerLevel` + `minLocalLevel` do POI emissor; até 3 ofertas por local.
4. **Progresso:** Cada dia de estudo registrado avança 1 dia no contrato.
5. **Sucesso:** Recompensas globais + `baseLocalXpReward` no POI emissor.
6. **Falha:** Streak quebrada sem escudo → aposta perdida.
7. **Limite:** 1 contrato ativo; mapa destaca o pin do emissor.

**Arquivos:** `src/features/contracts/`, `src/data/loaders/contracts.ts`

---

## Estatísticas (Statistics)

**O que é:** Dashboard analítico consolidando todos os sistemas.

**Como funciona:**

- Agrega dados de: player, streak, missões, pet, loot boxes, conquistas, contratos, cidade, escudos.
- **Milestones de estatísticas:** Marcos registrados por categoria (primeiro level 10, 100 dailies, etc.).
- **Minutos de estudo:** Estimativa baseada em dias registrados.
- Atualiza via `GameEvents` e na inicialização.

**Arquivos:** `src/features/statistics/`

---

## Notificações

**O que é:** Lembretes locais inteligentes para retenção.

**Como funciona:**

1. **Permissões:** Solicita permissão do SO (iOS/Android).
2. **Categorias:** Streak em risco, pet triste, contrato ativo, conquista próxima, etc.
3. **Agendamento:** `selectNotificationsForDay()` escolhe até N notificações respeitando horário preferido.
4. **Controle:** Jogador ativa/desativa categorias no Perfil.
5. **Histórico:** Registro de envios e aberturas.

**Arquivos:** `src/features/notifications/`

---

## Perfil e Avatar

**O que é:** Identidade visual e hub de configurações.

**Como funciona:**

- **ProfileHeroCard:** Nome editável, nível, título, moedas.
- **ProfileExploreGrid:** Atalhos para todas as telas secundárias.
- **AvatarCustomizer:** Molduras e badges desbloqueáveis (prestígio, conquistas).
- **StreakSection:** Calendário e estatísticas de consistência.
- **ShieldSection:** Escudos disponíveis e histórico de uso.
- **DifficultySelector:** Casual / Balanced / Hardcore — afeta recompensas e seleção de missões.

**Arquivos:** `src/features/profile/`, `src/features/avatar/`

---

## Atributos RPG

**O que é:** Sistema de atributos que cresce com o tipo de missão completada.

**Como funciona:**

| Categoria de missão | Atributo      |
| ------------------- | ------------- |
| Vocabulário         | Discipline    |
| Speaking            | Communication |
| Grammar             | Confidence    |
| Listening           | Fluency       |

- Cada daily completada incrementa +1 no atributo correspondente.
- **Perks:** Desbloqueados ao atingir thresholds (ex.: Discipline 10 → perk especial).

**Arquivos:** `src/features/rpg/`

---

## Carreira Internacional (Career)

**O que é:** Narrativa de progressão profissional rumo a vagas internacionais.

**Como funciona:**

1. **Roles:** Student → Junior → Mid → Senior → Tech Lead… (por nível).
2. **Companies:** Startup local → Remote company → FAANG…
3. **Interviews:** Desbloqueadas por nível e English Score; completar concede XP/moedas.
4. **Job Offers:** Requer nível, conquistas e score mínimo.
5. **Dreams:** Metas de longo prazo (streak 100, cidade 100%, nível 100…).
6. **Eventos:** Timeline de promoções, entrevistas e ofertas.

**Arquivos:** `src/features/career/`

---

## Metagame (Temporada e Legado)

**O que é:** Camada de progressão infinita além do nível 100.

**Como funciona:**

### Temporada (Passe mensal — implementado)

**Chave da temporada:** `YYYY-MM` (ex.: `2026-05`). Reset automático no dia 1: pontos e resgates zerados (`season_claimed_tiers_json`).

**Season Points** — ganhos automáticos via `GameEvents`:

| Ação                     | Pontos |
| ------------------------ | ------ |
| Missão diária concluída  | +10    |
| Missão semanal resgatada | +50    |
| Dia de estudo registrado | +15    |
| Sessão de foco completa  | +12    |
| Contrato concluído       | +25    |
| Conquista desbloqueada   | +30    |

**Tiers (pontos cumulativos no mês):**

| Tier | Pontos | Recompensa (resgate manual)                     |
| ---- | ------ | ----------------------------------------------- |
| 1    | 50     | 50 moedas                                       |
| 2    | 150    | Loot box rara                                   |
| 3    | 300    | 100 moedas + 1 escudo                           |
| 4    | 500    | Título **Estudante Sazonal** (`season_scholar`) |
| 5    | 800    | Combo do Estudante + loot box épica             |

**Fluxo:**

1. Pontos sobem ao jogar; tier atual = maior tier cujo `pointsRequired` foi atingido.
2. Tiers desbloqueados ficam **resgatáveis** na timeline em `/metagame` (botão por tier).
3. `SeasonPassService.claimTier()` aplica recompensas e persiste tier em `season_claimed_tiers_json`.
4. Badge no Perfil → Explorar → Metagame: `N resgatar` quando há tiers pendentes.
5. Evento `SEASON_TIER_REACHED` ao subir de tier; `SEASON_REWARD_CLAIMED` ao resgatar.

**Arquivos:** `season-pass-service.ts`, `season-pass-catalog.ts`, `metagame-service.ts`

### Coleções

- Visão agregada: Pets, Relíquias, Títulos, Achievements, Itens.
- Percentual de descoberta por categoria.

### Core Loop

- Snapshot diário/semanal/mensal do engajamento.
- Métricas de retenção (D1 ready, streak, missões).

### Legado

- Milestones permanentes além do prestígio.
- Registro em `legacy_milestones`.

**Arquivos:** `src/features/metagame/`

---

## Prestígio (Prestige)

**O que é:** 5 tiers de prestígio (I–V) para jogadores de alto nível.

**Como funciona:**

| Tier                     | Nível req. | Bônus permanentes        |
| ------------------------ | ---------- | ------------------------ |
| I — Veteran Learner      | 50         | +2% XP/Moedas            |
| II — Global Professional | 100        | +4% XP/Moedas, +1% raros |
| III — Elite Engineer     | 200        | +6%, slot contrato       |
| IV — World Class         | 350        | +8%, slot pet            |
| V — Legendary Master     | 500        | +10%, bônus máximos      |

- Cada tier concede: título exclusivo, moldura, loot box, relíquia, moedas.
- Roadmap visual em `/prestige`.
- Bônus aplicados via `RewardModifierService`.

**Arquivos:** `src/features/prestige/`

---

## Farm (Study Points)

**O que é:** Atividade passiva/ativa que gera Study Points e moedas extras.

**Como funciona:**

1. **Atividades:** Vocabulário (`WORDS_LEARNED`), Speaking (`SPEAKING_SESSION_COMPLETED`).
2. **Recompensas:** SP e moedas por unidade de atividade.
3. **Multiplicador:** Bônus se dailies do dia estão completas.
4. **Caps diários:** Limite de SP soft cap e 200 moedas/dia via farm.
5. **Histórico:** Sessões recentes exibidas em `/farm`.

**Arquivos:** `src/features/farm/`

---

## Study Points (Economia secundária)

**O que é:** Moeda premium obtida via farm e loot boxes.

**Como funciona:**

- **Earn:** Farm, loot boxes, algumas recompensas de missão.
- **Spend:** Upgrade de loot box (elevar raridade antes de abrir), construção de edifícios.
- **Upgrade chain:** Common → Uncommon → Rare → Epic → Legendary → Mythic → Ancient.
- Saldo e histórico em `study_points` + `study_points_history`.

**Arquivos:** `src/features/study-points/`

---

## Collection Book (Livro de Coleção)

**O que é:** Registro de 286+ colecionáveis descobertos.

**Como funciona:**

1. **Categorias:** Relíquias, Artefatos, Míticos, Cosméticos, Pets Exclusivos, Ultra Raros.
2. **Descoberta:** Ao obter item via loot box, registra em `collection_book`.
3. **Progresso:** Percentual por categoria e geral.
4. **Wishlist integrada:** Marcar itens desejados do catálogo.

**Arquivos:** `src/features/collection-book/`

---

## Wishlist (Lista de desejos)

**O que é:** Lista de até N colecionáveis que o jogador deseja obter.

**Como funciona:**

- Adicionar/remover itens do catálogo de colecionáveis.
- Seed inicial com 4 itens legendários sugeridos.
- Exibida na Collection Book e no catálogo de loot.

**Arquivos:** `src/features/wishlist/`

---

## Modificadores de recompensa

**O que é:** Serviço central que calcula bônus/penalidades em XP, moedas e drops.

**Como funciona:**

`RewardModifierService.getModifiersSync()` agrega:

- Relíquias / colecionáveis descobertos (cap global de bônus %)
- Tiers de prestígio
- Passivos de pet (espécie)
- **Boosters ativos** (`active_boosters` + `BoosterModifierCache`): consumíveis usados do inventário (+XP%, +moedas%, +loot luck%, +contratos%)
- Perks RPG e dificuldade
- Multiplicadores de contrato

Usado por: PlayerService, LootBoxService, ContractService, FarmService.

**Arquivos:** `src/features/game-design/services/reward-modifier-service.ts`

---

## Milestones de nível

**O que é:** Recompensas automáticas a cada 5 níveis do jogador.

**Como funciona:**

- Escuta `PLAYER_LEVEL_UP`.
- Nos níveis 5, 10, 15… concede moedas, loot box ou itens especiais.
- Exibido via celebração e registrado no histórico.

**Arquivos:** `src/features/player/services/level-milestone-service.ts`

---

## Celebrações visuais

**O que é:** Feedback visual para momentos importantes.

**Como funciona:**

- **CelebrationsHost:** Componente global nas tabs.
- Filas de celebração para: conquistas, títulos, edifícios, level-up, loot box raro.
- Confetti, haptics e toasts integrados.

**Arquivos:** `src/components/celebration/`

---

## Eventos do jogo (Game Events)

**O que é:** Barramento interno pub/sub que conecta todos os sistemas.

**Eventos principais:**

| Evento                    | Disparado por    | Consumido por                                                         |
| ------------------------- | ---------------- | --------------------------------------------------------------------- |
| `DAILY_MISSION_COMPLETED` | Missions store   | Weekly, Pet (XP + vitais), Achievements, RPG, Farm, Metagame (+10 SP) |
| `STUDY_DAY_RECORDED`      | Streak service   | Pet (vitais), Weekly, Contracts, Metagame (+15 SP)                    |
| `FOCUS_SESSION_COMPLETED` | Focus mode       | Pet (vitais), Metagame (+12 SP)                                       |
| `XP_GAINED`               | Player service   | Weekly, Pet, Achievements                                             |
| `PLAYER_LEVEL_UP`         | Player service   | Titles, City, Career, Milestones                                      |
| `CONTRACT_COMPLETED`      | Contract service | Pet, Achievements, Memories, Metagame (+25 SP)                        |
| `ACHIEVEMENT_UNLOCKED`    | Achievements     | Metagame (+30 SP)                                                     |
| `WEEKLY_MISSION_CLAIMED`  | Weekly missions  | Pet, Metagame (+50 SP)                                                |
| `LOOT_BOX_OPENED`         | Loot box service | Achievements, Collection Book                                         |
| `PET_STAGE_EVOLVED`       | Pet service      | Achievements, Memories, Metagame (legado)                             |
| `PET_INTERACTION`         | Pet interaction  | Memories                                                              |
| `SEASON_TIER_REACHED`     | Metagame         | UI / feedback                                                         |
| `SEASON_REWARD_CLAIMED`   | Season pass      | Toast, inventário/player                                              |

**Arquivo:** `src/services/game-events.ts`

---

## Dificuldade de aprendizado

**O que é:** Configuração que altera a economia e seleção de missões.

**Opções:**

| Modo     | Efeito                             |
| -------- | ---------------------------------- |
| Casual   | Menos missões, recompensas menores |
| Balanced | Padrão                             |
| Hardcore | Mais missões, recompensas maiores  |

Afeta: quantidade de dailies/weeklies/epics, scaling de XP/moedas.

**Arquivos:** `src/features/game-design/constants/difficulty.ts`

---

## Baralho Vivo (Flash Deck)

**Rotas:** `/flash-deck`, revisão, deck/cartão, import CSV, MCQ, Blitz.

| Recurso      | Descrição                                                     |
| ------------ | ------------------------------------------------------------- |
| SRS SM-2     | 4 botões + swipe; estados new/learning/mature/leech           |
| Multi-deck   | Cadernos com tags, busca, caps diários                        |
| Modos M8     | Revisão MCQ, Blitz 2 min, import CSV (`expo-document-picker`) |
| Leech helper | Suspender ou recomeçar cartas com 8+ lapsos                   |
| Notificações | Lembrete local quando há cartas due (se notificações ativas)  |
| Integração   | Duelo de cartas (5 due), sugestão pós-erro no duelo           |

**Serviços:** `FlashDeckService`, `FlashSrsService`, `FlashNotificationService`.

**Flag:** `featureFlags.flashDeckEnabled` (release: `true`).

---

## Duelos de Inglês

**Rotas:** `/duels`, battle, prova de patente, rematch.

| Recurso      | Descrição                                    |
| ------------ | -------------------------------------------- |
| Combate      | HP, combo, MCQ 4 alternativas, stamina 5/dia |
| Patentes     | Prova 15 perguntas (80%) para subir de liga  |
| Boss semanal | 1×/semana, bônus de moedas                   |
| Timer B1+    | 15s por pergunta (Estagiário+)               |
| Conteúdo     | Pacotes JSON A1–B2 + ledger de lemmas        |
| Economia     | Cap diário de moedas em duelos ranqueados    |

**Serviços:** `DuelService`, `DuelProfileService`, `LemmaCompetenceService`, `McqQuestionService`.

**Métricas:** Perfil → Explorar → Métricas (`/learning-insights`) — tabela `learning_analytics` + `AppLogService`.

**Flag:** `featureFlags.duelsEnabled` (release: `true`).

Ver também: [`BATTLE_AND_FLASHCARD_SYSTEMS.md`](./BATTLE_AND_FLASHCARD_SYSTEMS.md).

---

## Chama Interior

**Rotas:** `/motivation`, `/motivation/create`, `/motivation/collections`, `/motivation/[id]`, `/motivation/settings`.

| Recurso            | Descrição                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Faíscas multimídia | Texto, até 5 imagens, 1 áudio, até 3 links por spark                                                  |
| Coleções           | Pastas temáticas; filtro e picker no formulário                                                       |
| Busca e filtros    | Full-text em título/corpo; favoritas e fixadas no hub                                                 |
| Rotação diária     | Algoritmo com peso, pin e janela `avoidRepeatDays`                                                    |
| Home               | Card “Chama de hoje” (`showOnHome` nas configs da feature)                                            |
| Notificações       | Lembrete diário + opcional “última chama”; rich com imagem; deep link `englishquest://motivation/:id` |
| Toggle global      | `motivationSpark` em Perfil → Notificações                                                            |
| Backup             | Tabelas motivation no JSON do jogo; export ZIP com mídia nas configurações da feature                 |
| Conquistas         | Primeira faísca; 7 dias abrindo a chama                                                               |

**Serviços:** `MotivationSparkService`, `MotivationCollectionService`, `MotivationDailyPickService`, `MotivationNotificationService`, `MotivationMediaExportService`.

**Armazenamento de mídia:** `motivation-images/`, `motivation-audio/` em `documentDirectory`.

Ver especificação completa: [`CHAMA_INTERIOR_MOTIVATION_VAULT.md`](./CHAMA_INTERIOR_MOTIVATION_VAULT.md).

---

## GPS de Aprendizado

Sistema guiado de estudo de inglês — mundos CEFR (Survivor A1 → Legend C2), skills 0–100, plano diário/semanal, rotinas, SRS e checkpoint mensal. Responde “o que estudar agora” na Home.

**Fase 22:** card na Home, tela `/learning-gps`, mundos CEFR, skills 0–100, plano diário por dificuldade.

**Fase 23:** blocos com progresso diário, conclusão via Farm ou manual, skill + progresso do mundo.

**Fase 24:** currículo Survivor A1 — 13 unidades, checkpoint 2 min, integração Farm + Duelos.

**Fase 25:** mundos Explorer → Legend (A2–C2) — catálogo completo por mundo, checkpoints com metas finais, avanço automático ao completar checkpoint, badge de mundo concluído.

**Fase 26:** rotinas no plano do dia — seção no GPS e Home, conclusão credita blocos/skills, modelos podcast e simulado TOEFL mensal, bridge `ROUTINE_COMPLETED`.

**Fase 27:** inteligência — detecção de fraquezas (regra 70%), missões personalizadas, plano semanal + projeto, checkpoint mensal em `learning_monthly_reports`, blocos prioritários no plano do dia.

**GPS completo (Fases 22–27).** Ver [`ENGLISH_LEARNING_ROADMAP.md`](./ENGLISH_LEARNING_ROADMAP.md).

---

## Mentor IA Offline (Professor Atlas)

Professor particular de inglês **100% on-device** — chat, correção, exercícios, flashcards, roleplay, entrevistas e missões personalizadas. Consome SQLite (GPS, skills, rotinas, duelos) via `AIContextBuilder`.

**Roadmap:** Fases 28–34. Ver [`MENTOR_AI_OFFLINE.md`](./MENTOR_AI_OFFLINE.md).

| Fase | Escopo                                        |
| ---- | --------------------------------------------- |
| 28   | Fundação — schema, context builder, dashboard |
| 29   | Chat livre + modelo local                     |
| 30   | Correção ❌✅💡                               |
| 31   | Exercícios + flashcards                       |
| 32   | Missões geradas por IA                        |
| 33   | Roleplay + entrevistas                        |
| 34   | Voz (STT/TTS)                                 |

---

## Documentação relacionada

| Documento                                                                    | Conteúdo                                                         |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`PRD.md`](./PRD.md)                                                         | Requisitos de produto                                            |
| [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)                         | Roadmap de fases                                                 |
| [`ENGLISH_LEARNING_ROADMAP.md`](./ENGLISH_LEARNING_ROADMAP.md)               | GPS de aprendizado — mundos, skills, plano diário                |
| [`MENTOR_AI_OFFLINE.md`](./MENTOR_AI_OFFLINE.md)                             | Mentor IA offline — Professor Atlas, LLM local, fases 28–34      |
| [`PET_SYSTEM.md`](./PET_SYSTEM.md)                                           | Sistema de pet expandido                                         |
| [`BALANCE_AUDIT.md`](./BALANCE_AUDIT.md)                                     | Auditoria de economia                                            |
| [`REWARDS_CATALOG.md`](./REWARDS_CATALOG.md)                                 | Catálogo completo de recompensas                                 |
| [`GAMIFICATION_SYSTEMS.md`](./GAMIFICATION_SYSTEMS.md)                       | Ideias avançadas de sistemas (retenção, pet)                     |
| [`AUDIO_SYSTEM.md`](./AUDIO_SYSTEM.md)                                       | Sistema de áudio integrado (SFX, ambient, música, GameEvents)    |
| [`LIVING_CITY.md`](./LIVING_CITY.md)                                         | Cidade Viva — mapa, POIs, eventos sazonais, vocabulário temático |
| [`BATTLE_AND_FLASHCARD_SYSTEMS.md`](./BATTLE_AND_FLASHCARD_SYSTEMS.md)       | Baralho Vivo + Duelos (roadmap M0–M8)                            |
| [`CHAMA_INTERIOR_MOTIVATION_VAULT.md`](./CHAMA_INTERIOR_MOTIVATION_VAULT.md) | Cofre de motivação pessoal multimídia                            |

---

## Funcionalidades planejadas (não implementadas)

| Feature                                              | Fase                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Cidade Viva (mapa + POIs)                            | Ver `LIVING_CITY.md` — fases 1–6 (Natal MVP em dev: `DEV_FORCE_CITY_EVENT_KEY`) |
| Calendário de eventos (Natal…)                       | `LIVING_CITY.md` fase 6                                                         |
| Backup/Restore JSON                                  | Fase 17–18                                                                      |
| Focus Mode (Android)                                 | Implementado (módulo nativo)                                                    |
| Punishments (perda XP/coins)                         | Implementado                                                                    |
| Baralho Vivo + Duelos                                | M0–M8 — ver `BATTLE_AND_FLASHCARD_SYSTEMS.md`                                   |
| GPS — blocos completáveis, rotinas, relatório mensal | Fase 23–27 — ver `ENGLISH_LEARNING_ROADMAP.md`                                  |
| Mentor IA offline (Professor Atlas)                  | Fases 28–34 — ver `MENTOR_AI_OFFLINE.md`                                        |
| IA conversacional no pet (LLM)                       | Substituída pelo Mentor IA; pet mantém diálogos catalogados offline             |

---

_Última atualização: maio/2026 — English Quest (pet vitais, itens consumíveis, passe de temporada)_
