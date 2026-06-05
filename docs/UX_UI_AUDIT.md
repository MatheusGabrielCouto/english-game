# English Quest — Auditoria UX/UI, Game Feel e Usabilidade

> **Objetivo:** melhorar tudo que já existe — sem adicionar novas funcionalidades.  
> **Base:** auditoria do código em `src/` (março/2026).  
> **Status:** pronto para implementação incremental.

---

## Sumário executivo

O English Quest tem **fundação sólida de game feel** (áudio, haptics, celebrações, `PressableScale`, paleta RPG escura) e **cobertura funcional impressionante**. O risco principal não é falta de features — é **sobrecarga cognitiva**: a Home funciona como dashboard administrativo, o Menu virou catálogo extenso, e muitas telas repetem padrões explicativos (`HowItWorksCard`) que competem com a ação principal.

**Diagnóstico:** o app parece **70% jogo RPG + 30% app de produtividade** — e em telas como Home, Shop e Statistics, o balanço inverte.

**Prioridade #1:** reduzir, não adicionar. Consolidar navegação, hierarquia da Home e feedback de recompensa.

### Mapa de severidade


| Problema                                                     | Impacto                            | Prioridade |
| ------------------------------------------------------------ | ---------------------------------- | ---------- |
| Home com 12 seções + 10 quick actions                        | Sobrecarga, abandono na abertura   | P0         |
| Loja só no Menu (não na Home)                                | Fricção econômica, descoberta ruim | P0         |
| ~~Vault duplicado~~ (M-02: tab Knowledge + stack só detalhe) | Confusão de back-stack             | P1         |
| ~~Tutorial só texto, sem spotlight~~ (M-01 coach marks)      | Onboarding fraco                   | P1         |
| Skeletons estáticos (sem shimmer)                            | Performance percebida média        | P1         |
| 3 sistemas de empty state                                    | Inconsistência visual              | P2         |
| Pet vs Pet Farm vs Farm                                      | Confusão conceitual                | P2         |
| `ProfileExploreGrid` não montado                             | Código morto + descoberta perdida  | P2         |


---

## Como usar este documento

1. Implementar na ordem do **Roadmap** (Quick Wins primeiro).
2. Marcar `[x]` conforme concluir cada item.
3. Cada item referencia arquivos/pastas do repo quando possível.
4. Não adicionar features novas — só refinar o que existe.

---

# ETAPA 1 — Auditoria de telas

## Home

**Arquivos:** `src/features/home/components/HomeScreenContent.tsx`, cards em `src/features/home/components/`


| Dimensão        | Avaliação                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Bom**         | Hero do jogador forte; streak com glow; `HomeNextRewardCard` orienta meta; skeleton por card; quick actions com badges |
| **Ruim**        | 12 blocos verticais — scroll longo; ~30 métricas visíveis; quick actions (10) competem com cards abaixo                |
| **Faltando**    | Uma única CTA hero do dia; colapso de cards secundários; Loja ausente das quick actions                                |
| **Fricção**     | Usuário precisa *interpretar* o que fazer — não é dito em 3 segundos                                                   |
| **Remover**     | `HomeEventsCard` quando vazio; possivelmente `HomeDailyProgressCard` (redundante com quests preview)                   |
| **Simplificar** | 3 zonas: **Agora** · **Progresso** · **Explorar** (grid 6 itens, não 10)                                               |


## Perfil

**Arquivos:** `src/features/profile/components/ProfileScreenContent.tsx`


| Dimensão        | Avaliação                                                       |
| --------------- | --------------------------------------------------------------- |
| **Bom**         | Hero de identidade; avatar + título + XP; settings colapsáveis  |
| **Ruim**        | `ProfileExploreGrid` existe mas **não é renderizado**           |
| **Faltando**    | Atalhos para Loja, Estatísticas, Prestígio; resumo em 4 números |
| **Simplificar** | 2 abas: **Identidade** e **Configurações** ✅ (M-03)             |


## Missões

**Arquivos:** `src/features/quests/components/QuestsScreenContent.tsx`


| Dimensão        | Avaliação                                                      |
| --------------- | -------------------------------------------------------------- |
| **Bom**         | Hierarquia diárias → semanais → épicas; summary hero; skeleton |
| **Ruim**        | 4 camadas + banner rotinas + streak                            |
| **Simplificar** | Tabs internas: **Hoje** · **Semana** · **Épico**               |


## Cidade

**Arquivos:** `src/features/city/components/CityScreen.tsx`, `CityMapTabContent.tsx`, `CityScreenContent.tsx`


| Dimensão        | Avaliação                                                                       |
| --------------- | ------------------------------------------------------------------------------- |
| **Bom**         | Mapa interativo; progressive disclosure de distritos; deep link `?poiKey=&tab=` |
| **Ruim**        | Mapa vs Resumo sem guia; modal POI com 4 abas                                   |
| **Simplificar** | Mapa como default; POIs claimable pulsando                                      |


## Pet

**Arquivos:** `src/features/pet/components/PetScreenContent.tsx`


| Dimensão        | Avaliação                                               |
| --------------- | ------------------------------------------------------- |
| **Bom**         | Hero + diálogo + 8 interações; modo incubação; skeleton |
| **Simplificar** | 4 ações primárias + sheet "mais"; banner Pet Farm       |


## Fazenda (Pet Farm + Study Farm)

**Arquivos:** `src/features/pet-farm/`, `src/features/farm/`


| Dimensão    | Avaliação                                                |
| ----------- | -------------------------------------------------------- |
| **Bom**     | Island map com badges; profundidade de coleção           |
| **Ruim**    | 17 rotas, ~142 arquivos; nomes Farm / Pet Farm / Fazenda |
| **Remover** | Rota órfã `/pet-farm/map` (duplicata do index)           |


## Inventário

**Arquivos:** `src/features/inventory/components/InventoryScreenContent.tsx`

| **Simplificar** | Accordion por categoria; badge "X para abrir" no hero |

## Loja

**Arquivos:** `src/features/shop/components/ShopScreenContent.tsx`

| **Ruim** | Só acessível pelo Menu — não está em `home-quick-actions.ts` |
| **Simplificar** | Tabs: **Moedas** · **Ofertas** · **Study Points** |

## Contratos

**Arquivos:** `src/features/contracts/components/ContractsScreenContent.tsx`

| **Simplificar** | Card ativo fixo no topo; esconder `ContractsHowItWorksCard` após 1ª visita |

## Conquistas

**Arquivos:** `src/features/achievements/components/AchievementsScreenContent.tsx`

| **Simplificar** | Filtro "quase lá" (90%+); chips por categoria |

## Estatísticas

**Arquivos:** `src/features/statistics/components/StatisticsScreenContent.tsx`

| **Ruim** | Espelha todo o jogo — sensação de BI/dashboard |
| **Simplificar** | Default: hero + 1 insight + máx. 2 seções abertas ✅ (M-09) |

## Knowledge Vault

**Arquivos:** `src/features/english-journal/`, `src/app/(tabs)/knowledge/`, `src/app/english-journal/entry|space`

| ~~Ruim~~ | ~~Dupla entrada~~ → tab Knowledge unificada ✅ (M-02) |
| **Simplificar** | Tab Knowledge = entrada principal; stack só para entry/space detail |

## Audio Notes / Mind Map

| **Faltando** | FAB gravar no Vault; preview mini-mapa no hero; empty state guiado |

## Avatar / Prestígio

| **Simplificar** | Tap avatar na Home → editor; teaser prestígio no hero após nível 20 |

---

# ETAPA 2 — Navegação

## Diagnóstico


| Pergunta                | Resposta                                              |
| ----------------------- | ----------------------------------------------------- |
| Telas demais?           | Sim — ~40 rotas stack + pet-farm + vault + flash-deck |
| Cliques desnecessários? | Sim — Loja (2 taps), Pet Farm sem Home (2+)           |
| Menus escondidos?       | Sim — Shop, Career, Prestige só no Menu               |
| Caminhos longos?        | Sim — Pet lineage 4–5 taps                            |
| Difícil descobrir?      | Sim — `ProfileExploreGrid` morto; Focus iOS invisível |


## Arquitetura proposta

```
TAB BAR (5 → considerar 4 no futuro)
🏠 Home  │  🎯 Jogar  │  📓 Vault  │  ☰ Mais  │  👤 Perfil

Home     = Command Center (3 zonas)
Jogar    = Missões + Rotinas + Flash/Duels quick start (futuro)
Vault    = Knowledge tab unificada
Mais     = Menu hub simplificado + favoritos
```

### Princípios

1. **Regra dos 2 taps** — ação diária em ≤2 taps
2. **Uma entrada por domínio** — Vault na tab; Loja na Home
3. **Progressive unlock** — itens do Menu por nível
4. **Favoritos** — já existe (max 5 em `menu-hub-catalog.ts`), promover na Home

### Referências de código

- Tabs: `src/components/layout/AppTabBar.tsx`
- Rotas: `src/constants/routes.ts`
- Home actions: `src/features/home/constants/home-quick-actions.ts`
- Menu: `src/features/menu-hub/constants/menu-hub-catalog.ts`
- Explore morto: `src/features/profile/components/ProfileExploreGrid.tsx`

---

# ETAPA 3 — Home ideal

## Problema atual

12 cards no scroll. Em 3 segundos o usuário vê muita informação, mas não uma instrução clara.

## Wireframe alvo

```
┌──────────────────────────────────────┐
│ [Avatar] Nome · Nv.12    🔥7  🪙340  │  Zona 1: Identidade
│ ████████░░ XP → Nv.13 (2 missões)    │
├──────────────────────────────────────┤
│ ⚡ FAÇA AGORA                        │  Zona 2: Ação (hero)
│ 🎯 Complete "30 min de inglês"       │
│    +50 XP · +20 🪙    [Fazer →]      │
│ 🔥 Streak: 7 dias · escudo ativo     │
├──────────────────────────────────────┤
│ 🐾 Rex com fome    [Alimentar]       │  Zona 3: Mundo vivo
│ 🏙️ Próximo: Biblioteca (Nv.13)       │
│ 🎁 Loot box em 2 missões             │
├──────────────────────────────────────┤
│ [Missões][Vault][Cidade][Pet][Loja]  │  5 quick actions
│ [Baralho][Mais...]                   │
└──────────────────────────────────────┘
```

### Regra dos 3 segundos

- **Seg 1:** quem sou + streak
- **Seg 2:** o que fazer agora (1 CTA)
- **Seg 3:** recompensa próxima + atalhos

### Cards a remover/rebaixar da Home

- `HomeDailyProgressCard` → redundante com quests preview
- `HomeEventsCard` quando vazio
- `HomeKnowledgeVaultCard` → Vault tem tab dedicada
- Reduzir quick actions de 10 → 6 (+ "Mais")

### Novo componente sugerido

- `HomeDoNowCard.tsx` — 1 missão pendente + CTA primário
- Refatorar ordem em `HomeScreenContent.tsx`

---

# ETAPA 4 — Game Feel

## Diagnóstico


| Parece jogo?                  | Parece produtividade?                         |
| ----------------------------- | --------------------------------------------- |
| Pet, Loot, Duels, Celebrações | Home dashboard, Statistics, Vault Notion-like |


## Melhorias por sistema


| Sistema    | Estado atual                                    | Melhoria                                 | Arquivos                                |
| ---------- | ----------------------------------------------- | ---------------------------------------- | --------------------------------------- |
| XP         | Barra animada + SFX                             | Expandir `RewardBurstOverlay` em missões | `src/features/feedback/`                |
| Level Up   | Modal + confetti                                | Screen shake + fanfare                   | `LevelUpModal.tsx`                      |
| Loot Boxes | ~~Overlay shake~~ shake + tap to crack ✅ (M-05) | Fase "tap to crack" antes do reveal      | `LootBoxOpeningOverlay.tsx`             |
| Missões    | Haptic no complete                              | Checkmark morph + coin shower            | `MissionCard.tsx`                       |
| Cidade     | Skyline estático                                | Animação de construção no unlock         | `CitySkyline.tsx`                       |
| Pet        | Pulse no hero                                   | Mood change = expression + hearts        | `PetHeroDisplay.tsx`                    |
| Conquistas | Modal separado                                  | Toast dourado + badge fly-in             | `CelebrationsHost.tsx`                  |
| Prestígio  | Modal ascension                                 | Transição épica full-screen              | `PrestigeAscensionCelebrationModal.tsx` |


## Camada sensorial


| Canal      | Cobertura               | Gap                                      |
| ---------- | ----------------------- | ---------------------------------------- |
| Animações  | Reanimated ~25 arquivos | Fora de `PressableScale` é inconsistente |
| Partículas | Confetti, evolution     | Falta em missão comum, loot comum        |
| Haptics    | `src/utils/haptics.ts`  | Cards sem haptic                         |
| Sons       | `src/services/audio/`   | UI genérica só tap + tab                 |
| Toasts     | `ToastHost`             | Sem animação enter/exit                  |


---

# ETAPA 5 — Performance percebida

## Estado atual


| Técnica             | Status                                               |
| ------------------- | ---------------------------------------------------- |
| Skeleton loading    | ✅ ~25 telas — estático, sem shimmer                  |
| Progressive loading | ⚠️ Home gate + per-card skeleton                     |
| Empty states        | ✅ `EmptyState` unificado (`game` · `vault` · `farm`) |
| Micro feedback      | ✅ Forte em rewards                                   |
| Instant feedback    | ⚠️ Toasts sem animação                               |


## Tarefas

### Skeleton

- Shimmer em `src/components/ui/skeleton/SkeletonBlock.tsx` (`withRepeat` opacity)
- Stagger entrance nos cards do `ScreenSkeleton.tsx` (delay 50ms)

### Progressive loading

- Home: hero imediato (cache) → "Faça agora" → cards lazy
- Vault: hub nav imediato → lista skeleton → stats por último
- City map: chips + skeleton → POIs fade in

### Empty states unificados

- Unificar em `EmptyState` com variants: `game` | `vault` | `farm`
- Sempre 1 CTA primário; emoji **ou** ícone, nunca ambos

### Transições

- Toast slide down + spring (`src/components/ui/Toast.tsx`)
- Padronizar modais em `FormSheetModal` / `Modal`

---

# ETAPA 6 — Consistência visual (Design System)

## Problemas de tokens


| Token       | Problema                                                                |
| ----------- | ----------------------------------------------------------------------- |
| Cores       | `foreground-secondary` só no Tailwind; `common` rarity só em `theme.ts` |
| Espaçamento | `theme.spacing` não espelhado — `gap-3/4/5/6` ad hoc                    |
| Tipografia  | ✅ Escala em `typography.ts` + `theme.typography`                        |
| Cards       | `Card` vs `GameCard` — dois sistemas                                    |
| Toasts      | Global + shop local + contracts local                                   |


## Regras propostas

```
TIPOGRAFIA
  label  → text-xs font-bold uppercase tracking-widest text-muted
  title  → text-base font-black text-foreground
  body   → text-sm text-foreground-secondary leading-relaxed
  hero   → text-2xl font-black text-foreground

ESPAÇAMENTO
  screen padding → px-4
  section gap    → gap-4 (padrão) · gap-6 (seções grandes)
  card padding   → p-4 (padrão) · p-6 (hero)

COMPONENTES
  gameplay     → GameCard + PressableScale
  settings     → Card
  feedback     → ToastHost global único
  loading      → ScreenSkeleton variants
```

### Tarefas

- Espelhar tokens em `tailwind.config.js` ↔ `src/constants/theme.ts`
- Criar `src/constants/typography.ts` (ou seção no theme)
- Documentar Card vs GameCard em comentário no `Card.tsx`
- Migrar toasts shop/contracts para `useFeedbackStore`

**Arquivos:** `src/constants/theme.ts`, `tailwind.config.js`, `src/components/ui/`

---

# ETAPA 7 — 100 microinterações

> Implementar gradualmente; priorizar itens marcados com ⚡ no roadmap.

### Navegação (1–10)

1. Tab switch haptic + som ✅ manter
2. Tab icon scale bounce no ativo
3. Back button parallax
4. Menu search fade stagger
5. Menu pin estrela + haptic success
6. Pull-to-refresh spinner temático
7. Screen enter slide up 8px + fade
8. Scroll overscroll glow streak
9. Long press card preview
10. Keyboard dismiss fade backdrop

### Home (11–20)

1. Hero XP bar pulse no segmento restante
2. Streak partículas em marcos 7/30/100
3. Quick action badge bounce
4. ⚡ "Faça agora" shimmer border urgente
5. Pet mood icon bounce
6. Next reward progress ring
7. Coin flip ao ganhar
8. Level badge rotate 360° no level up
9. Card press ripple glow
10. Empty pet ovo shake

### Missões (21–30)

1. Mission check morph
2. ⚡ XP float expandir RewardBurst
3. Coin float do card
4. Streak increment flame grow
5. All done confetti mini
6. Weekly claim card flip
7. Epic progress milestone pulse
8. Mission swipe complete (opcional)
9. Pending badge countdown
10. Skip shake + haptic warning

### Pet (31–40)

1. Alimentar comida voa + SFX
2. Carinho corações float
3. Brincar bounce sequence
4. Treinar sweat + XP burst
5. Mood expression crossfade
6. Energy low slump + tint
7. Dialogue typewriter (com toggle acessibilidade)
8. Incubation egg crack progress
9. Collection discover pokédex flash
10. Farm link banner pulse

### Cidade (41–50)

1. POI pin bounce
2. Visit checkmark fade in
3. Building unlock construct 1.5s ✅ (M-04)
4. Skyline glow claimable
5. District chip slide highlight
6. Resource count up
7. Contract scroll to issuer
8. Delivery package fly
9. Event banner shimmer
10. Rumor typewriter fade in

### Economia (51–60)

1. Shop purchase coin count down
2. Daily offer timer pulse <60min
3. Stock "novo" badge bounce
4. SP spend raio drain
5. Loot shake → crack → reveal ✅ (M-05 tap to crack)
  56–60. Loot por raridade (pop → fullscreen legendary)

### Vault (61–70)

1. Note create card flip
2. Voice record waveform REC
3. Transcription checkmark fade
4. SRS card flip
5. Favorite star spin
6. Pin drop animation
7. Search highlight match
8. Mind map node spring expand
9. Edge draw animation
10. Space filter chip morph

### Learning (71–80)

71–80. Flash swipe, blitz timer, MCQ, duel HP, patent stamp (ver `flash-deck/`, `duels/`)

### Meta (81–90)

81–90. Achievement, title, prestige, season, career, collection, farm harvest, breeding

### Feedback global (91–100)

1. ⚡ Toast enter slide + spring
2. Toast exit fade up
3. Error toast shake
4. Success toast checkmark draw
5. Button loading → checkmark morph
6. Form validation field shake
  97–100. Modal spring, offline banner, reconnect toast

---

# ETAPA 8 — Hierarquia visual

## Home (ideal)

1. CTA "Faça agora" (glow primary)
2. Streak + XP bar
3. Pet mood compacto
4. Próxima recompensa
5. Quick actions
6. Resto colapsado

## Missões

1. Daily summary %
2. Pendentes (cards grandes)
3. Concluídas (opacas)
4. Semanais (claim badge)
5. Épicas

## Cidade

1. Mapa + POIs claimable
2. Event banner
3. Resources
4. Resumo/timeline

## Pet

1. Hero display
2. Melhor ação sugerida
3. Vitals
4. Interações
5. Coleção

## Perfil

1. Avatar + nome + título
2. Level + XP
3. Customização
4. Settings colapsado

---

# ETAPA 9 — Acessibilidade


| Critério      | Melhoria                           | Tarefa                                       |
| ------------- | ---------------------------------- | -------------------------------------------- |
| Contraste     | `muted` #71717a falha em `text-xs` | Elevar para #8a8a94                          |
| Fontes        | Muitos `text-xs`                   | Mínimo 12px; toggle "texto grande" no perfil |
| Toque         | Quick actions < 44pt               | `min-h-11 min-w-11` global                   |
| Screen reader | Labels parciais                    | Auditar `PressableScale`                     |
| Animações     | Typewriter pet                     | `reduceMotion` + setting no perfil           |
| Daltonismo    | Raridade só cor                    | Emoji + label sempre                         |


---

# ETAPA 10 — Onboarding

## Estado atual

- Wizard nome + dificuldade: `src/features/onboarding/`
- Tutorial 5 steps texto: `src/features/tutorial/constants/game-tutorial-steps.ts`
- Spotlight D0 com coach marks ✅

## Proposta

### Tutorial inicial (D0)

- Step 1: highlight missão na Home
- Step 2: navigate `/pet` com spotlight
- Step 3: moedas no hero
- Step 4: highlight tab Menu

### Tutorial contextual


| Dia | Trigger       | Conteúdo                   |
| --- | ------------- | -------------------------- |
| D1  | 1ª missão     | "Streak começou!"          |
| D2  | Nv.3          | "Conheça a Cidade"         |
| D3  | 1ª nota vault | "Conhecimento cresce"      |
| D5  | Nv.8          | "Loja desbloqueada" → Home |
| D7  | 1ª loot box   | "Abra sua recompensa!"     |


### Menu unlock por nível


| Nível | Desbloqueia           |
| ----- | --------------------- |
| 1     | Missões, Pet, Vault   |
| 5     | Cidade, Inventário    |
| 10    | Loja, Loot Boxes      |
| 15    | Contratos, Flash Deck |
| 20    | Duels, Estatísticas   |
| 30    | Pet Farm              |
| 50    | Prestígio, Metagame   |


**Arquivo:** `src/features/menu-hub/constants/menu-hub-catalog.ts` — adicionar `requiredLevel?`

---

# ETAPA 11 — Retenção


| Desejo              | Gap                                      | Melhoria                     |
| ------------------- | ---------------------------------------- | ---------------------------- |
| Voltar amanhã       | ~~Push streak~~ streak risk 20h ✅ (M-07) | Notification 20h sem estudar |
| Continuar estudando | Home não guia                            | "Faça agora" + due badge     |
| Colecionar          | Escondido                                | Badge "novo" na Home         |
| Completar objetivos | Fragmentado                              | Widget "objetivos ativos"    |


### Loop ideal

```
Abrir → 1 missão (2min) → recompensa (XP+moeda+haptic)
      → progresso (streak+next reward)
      → pet (opcional)
      → sair com streak + push agendado
```

---

# ETAPA 12 — Economia de atenção


| Onde se perde                           | Solução                                  |
| --------------------------------------- | ---------------------------------------- |
| Home 12 cards                           | 3 zonas + colapsar                       |
| Menu 24+ itens                          | Categorias colapsadas + unlock por nível |
| Shop 3 mercados                         | Tabs internas                            |
| ~~Statistics 5 seções~~ 3 seções (M-09) | Máx. 2 abertas                           |
| Vault 5 sub-abas                        | Onboarding progressivo                   |
| City POI 4 abas                         | Default na aba com ação pendente         |



| Onde desiste | Solução                          |
| ------------ | -------------------------------- |
| 1ª abertura  | Tutorial spotlight + Home mínima |
| Loja         | Quick action Home                |
| Vault vazio  | Empty state CTA grande           |
| Pet Farm     | "Comece no Incubador"            |


---

# ETAPA 13 — Benchmark


| Produto      | Adaptar                     |
| ------------ | --------------------------- |
| Duolingo     | 1 CTA/dia; streak como hero |
| Todoist      | Tab "Hoje" só pendentes     |
| Pokémon GO   | POIs pulsando no mapa       |
| Clash Royale | Timer em loot/chest         |
| Habitica     | Rotinas dentro de missões   |
| Hay Day      | Tutorial na ilha Pet Farm   |
| Notion       | Search global no Vault      |
| Headspace    | Onboarding 1 ação emocional |


---

# ETAPA 14 — Limpeza


| Redundância                                      | Ação                                 |
| ------------------------------------------------ | ------------------------------------ |
| ~~Tab Knowledge + `/english-journal`~~ (M-02)    | Unificar entrada                     |
| `/pet-farm/map`                                  | Remover rota                         |
| `ProfileExploreGrid`                             | Montar ou deletar ✅                  |
| `GameFeedbackHost`                               | Deletar se não usado                 |
| 3 empty states                                   | Unificar ✅                           |
| 3 toast systems                                  | `ToastHost` único                    |
| HowItWorksCard ×8                                | Hide após 1ª visita (`AsyncStorage`) |
| Statistics + Vault Dashboard + Learning Insights | Definir escopo único                 |


---

# ETAPA 15 — Roadmap de implementação

## Quick Wins — 1 dia

- **QW-01** Adicionar Loja em `home-quick-actions.ts`
- **QW-02** Shimmer em `SkeletonBlock.tsx`
- **QW-03** Animação enter/exit em `Toast.tsx`
- **QW-04** Unificar toasts shop → `useFeedbackStore`
- **QW-05** Unificar toasts contracts → `useFeedbackStore`
- **QW-06** Remover rota órfã `pet-farm/map` + `routes.petFarmMap`
- **QW-07** Hook `useHowItWorksSeen(key)` + esconder HowItWorks cards
- **QW-08** `min-h-11 min-w-11` em `HomeQuickActionsCard`
- **QW-09** Vault empty state com CTA grande (já parcial — revisar copy)
- **QW-10** Esconder `HomeEventsCard` quando sem evento ativo

## Melhorias pequenas — 1 semana

- **S-01** Home 3 zonas — reordenar `HomeScreenContent.tsx`
- **S-02** Novo `HomeDoNowCard` (1 missão + CTA)
- **S-03** Quick actions 10 → 6 + "Mais" → Menu
- **S-04** Quests tabs: Hoje / Semana / Épico
- **S-05** Shop tabs: Moedas / Ofertas / SP
- **S-06** Unificar `EmptyState` variants
- **S-07** City POI pin pulse quando claimable
- **S-08** Pet highlight "melhor ação agora"
- **S-09** Typography scale em `theme.ts`
- **S-10** Montar ou remover `ProfileExploreGrid`
- **S-11** Menu `requiredLevel` + itens locked

## Melhorias médias — 2 semanas

- **M-01** Tutorial spotlight (coach marks overlay)
- **M-02** Unificar Vault entry (tab principal)
- **M-03** Perfil 2 abas (Identidade / Config)
- **M-04** City building unlock animation
- **M-05** Loot "tap to crack" antes do overlay
- **M-06** Design system doc inline ou `docs/DESIGN_SYSTEM.md`
- **M-07** Push notification streak risk
- **M-08** Skeleton stagger cascade
- **M-09** Statistics → insights acionáveis (menos seções)
- **M-10** Inventário accordion + badge loot

## Grandes melhorias — 1 mês

- **L-01** Tab "Jogar" (missões + rotinas unificadas)
- **L-02** Pet Farm onboarding na ilha
- **L-03** Widget "objetivos ativos" na Home
- **L-04** Shared element transitions (hero cards)
- **L-05** Perfil acessível via tap no avatar da Home (sem tab?)
- **L-06** Busca global no Vault

## Premium — futuro

- Font display RPG (`expo-font`)
- Lottie celebrações tier 1
- Universal links + notification deep links
- iOS Focus Mode nativo
- Widget iOS/Android (streak + missão)
- Temas sazonais no mapa da cidade

---

# Top 10 — Matriz de priorização


| Rank | Problema                        | Solução              | ID roadmap   | ROI   |
| ---- | ------------------------------- | -------------------- | ------------ | ----- |
| 1    | Home sobrecarregada             | 3 zonas + Faça agora | S-01, S-02   | ⭐⭐⭐⭐⭐ |
| 2    | Loja escondida                  | Quick action Home    | QW-01        | ⭐⭐⭐⭐⭐ |
| 3    | Onboarding texto                | Coach marks          | M-01         | ⭐⭐⭐⭐  |
| 4    | Menu 24+ itens                  | Unlock por nível     | S-11         | ⭐⭐⭐⭐  |
| 5    | Skeleton estático               | Shimmer              | QW-02        | ⭐⭐⭐⭐  |
| 6    | ~~Vault duplicado~~ (M-02)      | Unificar entry       | M-02         | ⭐⭐⭐   |
| 7    | Pet/Farm confusão               | Naming + banner      | S-08         | ⭐⭐⭐   |
| 8    | Toasts locais                   | Global host          | QW-04, QW-05 | ⭐⭐⭐   |
| 9    | HowItWorks repetido             | Hide após visita     | QW-07        | ⭐⭐⭐   |
| 10   | ~~Statistics dashboard~~ (M-09) | Insights acionáveis  | M-09         | ⭐⭐⭐   |


---

# Ordem sugerida para começar hoje

```
Dia 1:  QW-01 → QW-02 → QW-03 → QW-10
Dia 2:  QW-04 → QW-05 → QW-07 → QW-08
Dia 3:  S-01 → S-02 (Home 3 zonas + Faça agora)
Dia 4:  S-03 → S-04
Dia 5:  S-05 → S-06
Semana 2: M-01, M-02, S-11
```

---

# Referências no repositório


| Área          | Caminho                                        |
| ------------- | ---------------------------------------------- |
| Home          | `src/features/home/`                           |
| Skeleton      | `src/components/ui/skeleton/`                  |
| Theme         | `src/constants/theme.ts`, `tailwind.config.js` |
| Design System | `docs/DESIGN_SYSTEM.md`                        |
| Feedback      | `src/features/feedback/`, `ToastHost.tsx`      |
| Menu          | `src/features/menu-hub/`                       |
| Tutorial      | `src/features/tutorial/`                       |
| Navegação     | `src/app/`, `src/constants/routes.ts`          |
| Game UI       | `src/components/ui/game/`                      |


---

*Documento gerado a partir da auditoria UX/UI do English Quest. Atualizar checkboxes conforme a implementação avança.*