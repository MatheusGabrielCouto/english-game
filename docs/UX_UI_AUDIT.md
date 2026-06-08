# English Quest — Auditoria UX/UI, Game Feel e Usabilidade

> **Objetivo:** melhorar tudo que já existe — sem adicionar novas funcionalidades.  
> **Base:** auditoria do código em `src/` (março/2026).  
> **Status:** fase estrutural concluída (Home, navegação, Vault, feedback, deep links). Próximo foco: **polish profissional** e consistência sensorial.

---

## Sumário executivo

O English Quest tem **fundação sólida de game feel** (áudio, haptics, celebrações, `PressableScale`, paleta RPG escura) e **cobertura funcional impressionante**. O risco principal não é falta de features — é **sobrecarga cognitiva**: a Home funciona como dashboard administrativo, o Menu virou catálogo extenso, e muitas telas repetem padrões explicativos (`HowItWorksCard`) que competem com a ação principal.

**Diagnóstico:** o app parece **70% jogo RPG + 30% app de produtividade** — e em telas como Home, Shop e Statistics, o balanço inverte.

**Prioridade #1 (concluída):** reduzir sobrecarga — Home em 3 zonas, tab Jogar, Vault unificado, objetivos ativos.

**Prioridade #2 (em curso):** elevar percepção de produto premium — animações consistentes, tipografia RPG, microcopy, acessibilidade e detalhes de App Store.

**Prioridade #3 (atual):** **fluidez em runtime** — scroll suave, menos jank ao trocar abas, refresh de dados sem travar a UI. Fundação já existe (P-31, P-34); gargalos restantes são **refresh storms**, **listas aninhadas** e **re-renders em cascata**. Ver **ETAPA 17**.

### Mapa de severidade

| Problema                                         | Impacto                              | Prioridade | Status        |
| ------------------------------------------------ | ------------------------------------ | ---------- | ------------- |
| ~~Home com 12 seções + 10 quick actions~~        | Sobrecarga na abertura               | ~~P0~~     | ✅ S-01–S-03  |
| ~~Loja só no Menu~~                              | Fricção econômica                    | ~~P0~~     | ✅ QW-01      |
| ~~Vault duplicado~~                              | Confusão de back-stack               | ~~P1~~     | ✅ M-02       |
| ~~Tutorial só texto~~                            | Onboarding fraco                     | ~~P1~~     | ✅ M-01       |
| ~~Skeletons estáticos~~                          | Performance percebida média          | ~~P1~~     | ✅ QW-02      |
| ~~3 sistemas de empty state~~                    | Inconsistência visual                | ~~P2~~     | ✅ S-06       |
| Pet vs Pet Farm vs Farm                          | Confusão conceitual                  | P2         | Aberto        |
| Microinterações fora do core                     | App “funcional” mas não “premium”    | P1         | **Novo foco** |
| Acessibilidade (contraste, touch, reduce motion) | Exclusão + rejeição em review        | P1         | Aberto        |
| Branding disperso (ícones, copy, tom de voz)     | Falta identidade de produto          | P2         | Aberto        |
| ~~Listas pesadas sem virtualização~~             | Scroll engasga                       | ~~P1~~     | ✅ P-31       |
| ~~TTI Home lento pós-hidratação~~                | Abertura “pesada”                    | ~~P1~~     | ✅ P-34       |
| ~~FlashList dentro de ScrollView~~               | Virtualização ineficaz               | ~~P1~~     | ✅ P-37       |
| ~~Refresh SQLite em todo focus / keystroke~~     | Jank ao voltar à Home/Vault          | ~~P1~~     | ✅ P-39       |
| ~~Home monta ~15 cards + 8 refreshes por focus~~ | Tab Início custosa                   | ~~P1~~     | ✅ P-38       |
| Animações infinitas com tab congelada            | CPU/GPU em background                | P2         | Aberto        |
| City map renderiza grid inteiro                  | Scroll mapa pesado em devices médios | P2         | Aberto        |

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
| **Fricção**     | Usuário precisa _interpretar_ o que fazer — não é dito em 3 segundos                                                   |
| **Remover**     | `HomeEventsCard` quando vazio; possivelmente `HomeDailyProgressCard` (redundante com quests preview)                   |
| **Simplificar** | 3 zonas: **Agora** · **Progresso** · **Explorar** (grid 6 itens, não 10)                                               |

## Perfil

**Arquivos:** `src/features/profile/components/ProfileScreenContent.tsx`

| Dimensão        | Avaliação                                                       |
| --------------- | --------------------------------------------------------------- |
| **Bom**         | Hero de identidade; avatar + título + XP; settings colapsáveis  |
| **Ruim**        | `ProfileExploreGrid` existe mas **não é renderizado**           |
| **Faltando**    | Atalhos para Loja, Estatísticas, Prestígio; resumo em 4 números |
| **Simplificar** | 2 abas: **Identidade** e **Configurações** ✅ (M-03)            |

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
| **Simplificar** | Feed de insight + métricas em Detalhes (colapsado) ✅ (P-24) |

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

| Sistema    | Estado atual                                     | Melhoria                                 | Arquivos                                |
| ---------- | ------------------------------------------------ | ---------------------------------------- | --------------------------------------- |
| XP         | Barra animada + SFX                              | Expandir `RewardBurstOverlay` em missões | `src/features/feedback/`                |
| Level Up   | Modal + confetti                                 | Screen shake + fanfare                   | `LevelUpModal.tsx`                      |
| Loot Boxes | ~~Overlay shake~~ shake + tap to crack ✅ (M-05) | Fase "tap to crack" antes do reveal      | `LootBoxOpeningOverlay.tsx`             |
| Missões    | Haptic no complete                               | Checkmark morph + coin shower            | `MissionCard.tsx`                       |
| Cidade     | Skyline estático                                 | Animação de construção no unlock         | `CitySkyline.tsx`                       |
| Pet        | Pulse no hero                                    | Mood change = expression + hearts        | `PetHeroDisplay.tsx`                    |
| Conquistas | Modal separado                                   | Toast dourado + badge fly-in             | `CelebrationsHost.tsx`                  |
| Prestígio  | Modal ascension                                  | Transição épica full-screen              | `PrestigeAscensionCelebrationModal.tsx` |

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

| Técnica             | Status                                                |
| ------------------- | ----------------------------------------------------- |
| Skeleton loading    | ✅ ~25 telas — estático, sem shimmer                  |
| Progressive loading | ⚠️ Home gate + per-card skeleton                      |
| Empty states        | ✅ `EmptyState` unificado (`game` · `vault` · `farm`) |
| Micro feedback      | ✅ Forte em rewards                                   |
| Instant feedback    | ⚠️ Toasts sem animação                                |

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
| Tipografia  | ✅ Escala em `typography.ts` + `theme.typography`                       |
| Cards       | `Card` vs `GameCard` — dois sistemas                                    |
| Toasts      | Global + shop local + contracts local                                   |

## Regras propostas

```
TIPOGRAFIA
  label  → text-xs font-bold uppercase tracking-widest text-muted
  title  →  font-black text-foreground
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

| Critério      | Melhoria                                  | Tarefa                                             |
| ------------- | ----------------------------------------- | -------------------------------------------------- |
| Contraste     | ~~`muted` #71717a falha em `text-xs`~~ ✅ | `#8a8a94` + audit em `a11y-contrast.test.ts`       |
| Fontes        | Muitos `text-xs`                          | Mínimo 12px; toggle "texto grande" no perfil       |
| Toque         | ~~Quick actions < 44pt~~ ✅               | `touch-target-ui.ts`, `ScreenTabBar`, `ChoiceChip` |
| Screen reader | Labels parciais                           | Auditar `PressableScale`                           |
| Animações     | Typewriter pet                            | `reduceMotion` + setting no perfil                 |
| Daltonismo    | Raridade só cor                           | Emoji + label sempre                               |

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

| Desejo              | Gap                                           | Melhoria                     |
| ------------------- | --------------------------------------------- | ---------------------------- |
| Voltar amanhã       | ~~Push streak~~ streak risk 20h ✅ (M-07)     | Notification 20h sem estudar |
| Continuar estudando | Home não guia                                 | "Faça agora" + due badge     |
| Colecionar          | Escondido                                     | Badge "novo" na Home         |
| Completar objetivos | ~~Fragmentado~~ `HomeActiveObjectivesCard` ✅ | Widget Android streak+missão |

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

| Redundância                                      | Ação                                    |
| ------------------------------------------------ | --------------------------------------- |
| ~~Tab Knowledge + `/english-journal`~~ (M-02)    | Unificar entrada                        |
| `/pet-farm/map`                                  | Remover rota                            |
| `ProfileExploreGrid`                             | Montar ou deletar ✅                    |
| `GameFeedbackHost`                               | Deletar se não usado                    |
| 3 empty states                                   | Unificar ✅                             |
| 3 toast systems                                  | `ToastHost` único                       |
| ~~HowItWorksCard ×8~~                            | Hide após 1ª visita (`AsyncStorage`) ✅ |
| Statistics + Vault Dashboard + Learning Insights | Definir escopo único                    |

---

# ETAPA 15 — Roadmap de implementação

## Quick Wins — 1 dia

- **QW-01** Adicionar Loja em `home-quick-actions.ts`
- **QW-02** Shimmer em `SkeletonBlock.tsx`
- **QW-03** Animação enter/exit em `Toast.tsx` → **P-03**
- **QW-04** Unificar toasts shop → `useFeedbackStore`
- **QW-05** Unificar toasts contracts → `useFeedbackStore`
- **QW-06** Remover rota órfã `pet-farm/map` + `routes.petFarmMap`
- ~~**QW-07** Hook `useHowItWorksSeen(key)` + esconder HowItWorks cards~~ ✅ → **P-27**
- **QW-08** `min-h-11 min-w-11` em `HomeQuickActionsCard` → **P-16**
- **QW-09** Vault empty state com CTA grande
- **QW-10** Esconder `HomeEventsCard` quando sem evento ativo

## Melhorias pequenas — 1 semana

- **S-01** Home 3 zonas — reordenar `HomeScreenContent.tsx`
- **S-02** Novo `HomeDoNowCard` (1 missão + CTA)
- **S-03** Quick actions 10 → 6 + "Mais" → Menu
- **S-04** Quests tabs: Hoje / Semana / Épico (via tab Jogar)
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
- **M-06** Design system doc — `docs/DESIGN_SYSTEM.md`
- **M-07** Push notification streak risk
- **M-08** Skeleton stagger cascade → **P-06**
- **M-09** Statistics → insights acionáveis (menos seções)
- **M-10** Inventário accordion + badge loot

## Grandes melhorias — 1 mês

- **L-01** Tab "Jogar" (missões + rotinas unificadas)
- **L-02** Pet Farm onboarding na ilha
- **L-03** Widget "objetivos ativos" na Home
- ~~**L-04** Shared element transitions (hero cards)~~ ✅ (P-28)
- **L-05** Perfil acessível via tap no avatar da Home
- **L-06** Busca global no Vault

## Premium — entregue

- Font display RPG (`expo-font`) — `GameDisplayText`, Press Start 2P
- Lottie celebrações tier 1 — confetti, level up, missão, conquista
- Universal links + notification deep links — `docs/DEEP_LINKS.md`
- Widget Android (streak + missão) — `QuestProgressWidget`
- Splash → Home transition com marca — logo handoff + crossfade (`AnimatedSplash`, `SplashGate`)
- Lottie celebrações tier 2 — prestígio, evolução pet, loot épico/lendário
- RewardBurst em todas as conclusões — missão, rotina, vault, foco (`reward-burst-ui.ts`)
- Mission complete morph — checkmark + coin float + haptic success (`MissionIconMorph`, `MissionCoinFloat`)
- Shimmer stagger em listas longas — Vault, inventário, conquistas (`StaggeredSkeletonWrapper`)
- Empty states ilustrados — SVG por domínio (`GameEmptyIllustration`, `VaultEmptyIllustration`, `FarmEmptyIllustration`)
- Offline banner + `NetworkErrorState` com retry (`NetworkStatusHost`, NetInfo)
- Haptic vocabulary — `playHaptic`, `PressableScale.haptic`, `Button` por variante
- Sound pass por domínio — `audio-sound-vocabulary.ts`, 47 `GameEvents` → SFX, mute respeitado
- Card press ripple glow — `GameCardPressGlow` + `PressableScale` context (`game-card-press-ui.ts`)
- Modais padronizados — `AppModalShell` (spring, blur, swipe dismiss), `Modal` + `FormSheetModal`
- Form validation shake + inline error a11y — `FormFieldShell`, rotinas, vault, perfil, journal

## Premium — futuro (polish profissional)

Ver **ETAPA 16** para o backlog completo. Resumo:

- Widget iOS (streak + missão) — `expo-widgets`
- iOS Live Activities (streak em risco + sessão de foco)
- Lottie celebrações tier 2 (prestígio, evolução pet, loot épico/lendário)
- iOS Focus Mode nativo (módulo `expo-focus-mode` já existe)
- Temas sazonais no mapa da cidade
- Deploy AASA + `assetlinks.json` em produção (`englishquest.app`)
- App icon + store assets refresh (guideline de marca)

---

# ETAPA 16 — Polish profissional (futuro)

> Objetivo: passar de **“app completo”** para **“produto que parece lançado por um estúdio”**.  
> Sem novas features — só refinamento, consistência e detalhes que usuários e reviewers percebem.

## Tier A — Impacto imediato na percepção

| ID   | Melhoria                                                                                           | Por que importa                       | Referência                                |
| ---- | -------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------- |
| P-01 | ~~**Expandir `GameDisplayText`** para headers de Missões, Loja, Cidade e modais de recompensa~~ ✅ | Tipografia única = identidade forte   | `GameDisplayText.tsx`, `ScreenHeader.tsx` |
| P-02 | ~~**Lottie tier 2** — prestígio, evolução pet, loot épico/legendário~~ ✅                          | Momentos-chave precisam de “wow”      | `CelebrationLottie`, `PetEvolutionModal`  |
| P-03 | ~~**Toast enter/exit** com spring + variantes (success shake leve, error pulse)~~ ✅               | Feedback global ainda “cru”           | `Toast.tsx`, `ToastHost.tsx`              |
| P-04 | ~~**RewardBurst** em todas as conclusões (missão, rotina, revisão vault, foco)~~ ✅                | Loop de recompensa é o coração do app | `RewardBurstOverlay.tsx`                  |
| P-05 | ~~**Mission complete morph** — checkmark + coin float + haptic success~~ ✅                        | Duolingo-level satisfaction           | `MissionCard.tsx`                         |
| P-06 | ~~**Shimmer stagger** em listas longas (Vault, inventário, conquistas)~~ ✅                        | Loading premium, não “bloco cinza”    | `ScreenSkeleton.tsx`                      |
| P-07 | ~~**Empty states ilustrados** — SVG/Lottie leve por domínio (`game` · `vault` · `farm`)~~ ✅       | Emoji-only parece protótipo           | `EmptyState.tsx`                          |
| P-08 | ~~**Offline banner** + estados de erro com CTA “Tentar de novo”~~ ✅                               | App maduro tolera falhas de rede      | `NetworkStatusHost`                       |

## Tier B — Consistência e confiança

| ID   | Melhoria                                                                                    | Por que importa                                      | Referência                              |
| ---- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| P-09 | ~~**Haptic vocabulary** — documentar e aplicar em todo `PressableScale` / CTA primário~~ ✅ | Toque tátil = qualidade mobile                       | `haptic-vocabulary.ts`, `haptics.ts`    |
| P-10 | ~~**Sound pass** — SFX por domínio (missão, loot, cidade, pet); mute respeitado~~ ✅        | Áudio já existe; falta cobertura uniforme            | `audio-event-map.ts`, `AUDIO_SYSTEM.md` |
| P-11 | ~~**Card press ripple glow** em `GameCard` hero~~ ✅                                        | Affordance de toque em cards de jogo                 | `GameCardPressGlow.tsx`                 |
| P-12 | ~~**Modais padronizados** — spring único, backdrop blur, dismiss gesture~~ ✅               | 8+ modais com comportamentos diferentes              | `AppModalShell.tsx`                     |
| P-13 | ~~**Form validation shake** + inline error acessível~~ ✅                                   | Formulários (vault, perfil, rotinas) parecem nativos | `FormFieldShell`, `VaultFormTextField`  |
| P-14 | ~~**Contraste a11y** — elevar `muted` (#71717a → #8a8a94); audit WCAG em cards~~ ✅         | Risco em review App Store / Play                     | `a11y-contrast.ts`, `contrast-ratio.ts` |
| P-15 | **Toggle “texto grande”** + `reduceMotion` global no perfil                                 | Inclusão = profissionalismo                          | `ProfileScreen`, `AppProviders`         |
| P-16 | ~~**Touch targets 44pt** — audit global (`min-h-11`)~~ ✅                                   | Falhas em chips, pills, tab bar secundária           | `ScreenTabBar`, `ChoiceChip`            |

## Tier C — Plataforma e distribuição

| ID   | Melhoria                                                                       | Por que importa                       | Referência                                  |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------- |
| P-17 | **Widget iOS** — streak + próxima missão (paridade Android)                    | Presença na home screen iOS           | `expo-widgets`, `widget-snapshot.ts`        |
| P-18 | **Live Activity iOS** — streak em risco + timer de foco                        | Diferencial visível no Dynamic Island | `expo-widgets`                              |
| P-19 | ~~**Rich push** — imagem/emoji grande em conquista e loot~~ ✅                 | CTR de notificações                   | `rich-notification-content.ts`              |
| P-20 | **Universal links em produção** — hospedar AASA + assetlinks                   | Links de marketing e email funcionam  | `docs/DEEP_LINKS.md`                        |
| P-21 | ~~**In-app changelog** — “Novidades” após update (1 card na Home, 1x)~~ ✅     | Usuário sente produto vivo            | `HomeChangelogCard`, `changelog-catalog.ts` |
| P-22 | ~~**Review prompt** nos momentos de delight (7-day streak, loot lendário)~~ ✅ | ASO e social proof                    | `review-prompt-service.ts`                  |

## Tier D — Arquitetura de experiência

| ID   | Melhoria                                                                           | Por que importa                          | Referência                           |
| ---- | ---------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------ |
| P-23 | **Command palette** — busca global ⌘K (rotas + vault + menu)                       | Power users + sensação “super app”       | estender `VaultGlobalSearch`         |
| P-24 | ~~**Statistics → feed de insights** — 1 insight acionável/dia, não BI~~ ✅         | Reduz vibe dashboard                     | `StatisticsInsightsFeed`             |
| P-25 | ~~**Pet / Farm naming** — glossário único na UI (“Fazenda de Pets” vs “Farm”)~~ ✅ | Confusão ainda gera suporte              | `domain-glossary.ts`, banners        |
| P-26 | **City POI default tab** — abrir na aba com ação pendente                          | Menos taps no modal POI                  | `CityScreen.tsx`                     |
| P-27 | ~~**Progressive HowItWorks** — esconder após 1ª visita em todas as telas~~ ✅      | Reduz ruído em usuários recorrentes      | `useHowItWorksSeen` + vault/shields  |
| P-28 | ~~**Shared transitions** — expandir pares hero (cidade, pet farm, perfil)~~ ✅     | Continuidade visual entre telas          | `shared-transitions.ts`              |
| P-29 | **Seasonal city theme** — paleta/skyline por temporada/meteoro                     | Reengajamento sem feature nova           | `CitySkyline.tsx`, `city-event`      |
| P-30 | **Tablet / large phone** — breakpoints em Home e City map                          | iPad e Pro Max não devem parecer stretch | `HomeZoneSection`, `CityMapViewport` |

# ETAPA 17 — Performance & fluidez (runtime)

> Revisão do código em **jun/2026**, após P-31 (FlashList) e P-34 (TTI budget).  
> Objetivo: app **fluido no dia a dia**, não só rápido na abertura.

## Diagnóstico

| Parece fluido?                                                          | Ainda engasga?                                                                   |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Splash → Home < 1.5s; skeletons; lazy/frozen tabs; `AppImage` com cache | Vault com muitas notas; voltar à Home; digitar na busca do Vault; mapa da Cidade |

O app **não precisa de mais ferramentas de performance** — precisa **parar de anular** o que já foi feito (FlashList com `scrollEnabled={false}` dentro de `ScrollView`, refresh completo a cada focus).

### O que já está bem ✅

| Área          | Implementação                                                                     |
| ------------- | --------------------------------------------------------------------------------- |
| Virtualização | `VirtualizedList` → FlashList acima de 20 itens (`virtualized-list-ui.ts`)        |
| Startup       | Hidratação crítica vs background; `StartupPerfService`; splash alinhado ao budget |
| Navegação     | `lazy: true` + `freezeOnBlur: true` em tabs e root stack                          |
| Imagens       | `AppImage` (expo-image, blurhash, cache) — zero `Image` legado em `src/`          |
| Celebrações   | Lottie só em overlays; `CelebrationsHost` retorna `null` quando idle              |
| Stores        | Zustand com selectors (não `useStore()` inteiro)                                  |
| Statistics    | Seções colapsáveis desmontam filhos quando fechadas                               |

---

## Gargalos por superfície

### 1. Listas — anti-padrão `nestedInScrollView`

**Problema:** `VirtualizedList` com `nestedInScrollView` + `scrollEnabled={false}` monta **todas as linhas**; FlashList não recicla células.

**Arquivos afetados:**

| Tela                 | Arquivo                           | Nota                                     |
| -------------------- | --------------------------------- | ---------------------------------------- |
| Vault biblioteca     | `EnglishJournalScreenContent.tsx` | `nestedInScrollView` quando >20 entradas |
| Vault busca global   | `VaultGlobalSearchContent.tsx`    | Lista dentro de scroll pai               |
| Flash Deck hub       | `FlashDeckHubContent.tsx`         | Idem                                     |
| Inventário histórico | `InventoryHistoryList.tsx`        | Idem                                     |

**Referência boa:** Menu Hub usa FlashList como **scroll raiz** (`MenuHubScreen` com `scrollable={false}`).

**Impacto:** alto em usuários com vault grande (cards com galeria, áudio, tradução).

---

### 2. Refresh storms — SQLite na thread de interação

#### Home — `use-home-focus-refresh.ts`

Cada vez que a tab **Início** ganha foco, dispara **8 refreshes** em paralelo:

- Vault (`english-journal-store.refresh`)
- Rotinas, Pet, Farm, Cidade, Eventos, Metagame, Contratos, Inventário

Usuário que alterna Home ↔ Jogar ↔ Menu sente micro-travadas repetidas.

#### Vault — `EnglishJournalScreenContent.tsx`

`useFocusEffect` depende de **`search`** → **refresh completo do vault a cada tecla** enquanto a tela está focada (além do debounce da busca global).

#### Vault service — `knowledge-vault-service.ts`

`refreshStore` roda **9 queries** em `Promise.all`, incluindo **`listActive` duas vezes** (entradas filtradas + mapTree com lista completa).

#### Outros

| Trigger                         | Arquivo                                           |
| ------------------------------- | ------------------------------------------------- |
| Mapa do vault no focus          | `knowledge/map.tsx`                               |
| Coleções no focus               | `VaultCollectionsScreenContent.tsx`               |
| ~~Statistics ao abrir~~ ✅ P-42 | `statistics-refresh-policy.ts` — cache do hydrate |
| Flash Deck hub no focus         | `FlashDeckHubContent.tsx`                         |

---

### 3. Re-renders em cascata

| Problema                                                                                   | Onde                                                             |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| ~~`english-journal-store` monolítico~~ ✅ P-45 — slices `entries` / `meta` / `collections` | `vault-*-store.ts`                                               |
| Hooks com 8–14 selectors sem `useShallow`                                                  | `use-city-map.ts`, `use-home-dashboard.ts`, `use-home-events.ts` |
| `JournalEntryCard` pesado (galeria, voz, tradução) sem `memo`                              | `JournalEntryCard.tsx`                                           |
| `MissionCard` memo, mas cada card lê `completingMissionId` do store                        | `MissionCard.tsx`                                                |

---

### 4. Animações e mapa

| Problema                                                                             | Arquivo                                          | Nota                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------ | --------------------------------- |
| ~~Loops infinitos Reanimated na Home com tab `freezeOnBlur` (não desmonta)~~ ✅ P-41 | `HomePetCompanionCard.tsx`, `HomeStreakCard.tsx` | Pausados no blur + reduce motion  |
| ~~Cidade: grid 7×6 + ruas + todos os POIs sem culling~~ ✅ P-44                      | `city-map-viewport-culling.ts`                   | Só blocos/pins visíveis no scroll |
| Scroll aninhado no mapa                                                              | `CityScreen.tsx` + `ScreenContainer scrollable`  | Conflito de gestos + layout       |

---

### 5. Home — montagem inicial

`HomeScreenContent` monta **~15 cards** de uma vez (cada um com hooks Zustand próprios). Dados críticos já hidratam cedo (`use-home-screen-ready`), mas cards secundários (pet, cidade, eventos) disparam fetches/animções no primeiro paint.

---

## Tier F — Roadmap de fluidez

| ID   | Melhoria                                                                                                              | Por que importa                     | Esforço | Referência                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------- | -------------------------------------------------------------------- |
| P-37 | ~~**FlashList como scroll raiz** — Vault, Flash Deck hub, inventário histórico; header via `ListHeaderComponent`~~ ✅ | Virtualização real com header rico  | M       | `vault-library-list-rows`, `scrollable={false}`                      |
| P-38 | ~~**Throttle de focus refresh** — TTL ~30s ou stale-check por domínio na Home~~ ✅                                    | Elimina storm ao alternar abas      | S       | `home-focus-refresh-runner.ts`                                       |
| P-39 | ~~**Vault refresh inteligente** — tirar `search` do `useFocusEffect`; dedupe `listActive` no `refreshStore`~~ ✅      | Busca e focus deixam de bloquear UI | S       | `vault-library-filter-ui.ts`, `refreshStore`                         |
| P-40 | ~~**`useShallow` + `memo` em list rows** — `JournalEntryCard`, rows do menu/flash~~ ✅                                | Menos re-render em listas longas    | S       | `journal-entry-card-memo`, `useShallow` hooks                        |
| P-41 | ~~**Pausar animações Home no blur** — `useIsFocused` + reduce motion para pet bounce e streak glow~~ ✅               | CPU/GPU quando tab não está visível | S       | `use-home-infinite-animations-active`, cards Home                    |
| P-42 | ~~**Statistics cache** — dashboard do background hydrate; refresh só ao expandir Detalhes ou pull~~ ✅                | Abrir Insights sem 12 queries       | M       | `statistics-refresh-policy`, `use-statistics`                        |
| P-43 | ~~**Coalescer `GameEvents`** — fila microtask + `scheduleCoalescedAfterBatch` para refresh pesado~~ ✅                | Menos jank após missão/loot/cidade  | M       | `game-events.ts`, statistics/metagame/epic/career                    |
| P-44 | ~~**City map viewport** — render só pins/blocos visíveis no scroll (padding + zoom)~~ ✅                              | Mapa fluido em Pro Max / tablets    | L       | `city-map-viewport-culling`, `CityMapViewport`                       |
| P-45 | ~~**Split vault store** — `entries` / `meta` / `collections`~~ ✅                                                     | Subscriber granular                 | L       | `vault-entries-store`, `vault-meta-store`, `vault-collections-store` |

**Legenda esforço:** S = 1–2 dias · M = 3–5 dias · L = 1–2 semanas

---

## Ordem sugerida — fluidez (próximas 2–3 semanas)

```
Sprint A (quick wins):  P-39 → P-38 → P-41 → P-40
Sprint B (listas):      P-37 (Vault primeiro — maior ROI)
Sprint C (médio):       P-42 → P-43
Backlog:                P-44 → P-45
```

### Critérios de “fluido”

- Vault com **100+ notas**: scroll 60fps em device médio (iPhone 12 / Pixel 6)
- Alternar Home ↔ Jogar **10×** sem frame drop perceptível
- Busca no Vault: **sem** refresh SQLite completo por keystroke
- `perf.home_tti` dentro do budget **e** `perf.hydration_critical_slow` ausente em device real
- Reduce motion: animações infinitas da Home **pausadas** quando desabilitadas (P-41 + a11y)

---

## Tier E — Qualidade de engenharia percebida

| ID   | Melhoria                                                                       | Por que importa                             | Referência                          |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------------------- |
| P-31 | ~~**Lista virtualizada** — Vault, inventário, flash deck, menu hub~~ ✅        | Scroll pesado = app “barato”                | `VirtualizedList` + FlashList       |
| P-32 | ~~**expo-image** em todos os heroes e loot~~ ✅                                | Cache + blurhash = carregamento suave       | `AppImage`, `LootBoxArtwork`        |
| P-33 | ~~**Error boundaries por feature** — mensagem amigável, não tela branca~~ ✅   | Crash isolado não derruba o app             | `FeatureErrorBoundary`, layouts     |
| P-34 | ~~**Performance budget** — TTI Home < 1.5s pós-hidratação~~ ✅                 | Métrica de produto, não só dev              | `StartupPerfService`, splash budget |
| P-35 | **i18n prep** — extrair strings de `HOME_UI`, `QUESTS_UI`, notificações        | Mercado global = profissional               | `constants/*-ui.ts`                 |
| P-36 | ~~**Tom de voz único** — guia de microcopy (encorajador, não corporativo)~~ ✅ | Vault e Statistics alinhados ao tom de jogo | `docs/MICROCOPY.md`, `vault-ui.ts`  |

## Roadmap sugerido — polish (6–8 semanas)

```
Semana 1–2 (Tier A):  P-03 → P-04 → P-05 → P-06
Semana 3–4 (Tier B):  P-09 → P-11 → P-14 → P-15
Semana 5   (Tier C):  P-17 → P-20 → P-22
Semana 6–8 (Tier D):  P-23 → P-25 → P-28 → P-29
Contínuo (Tier E):    P-31 → P-34 → P-36 ✅
Tier F (P-37–P-45):  ✅ concluído
```

### Critérios de “pronto para loja”

- Novo usuário entende o que fazer em **≤ 3 segundos** na Home (teste moderado, 5 pessoas)
- **Zero** toast/modal/empty state com padrão diferente do `DESIGN_SYSTEM.md`
- **100%** das notificações abrem a tela correta (deep link testado)
- **Reduce motion** e texto grande funcionam sem quebrar layout
- Screenshots da loja contam história: streak → missão → recompensa → pet

---

# Top 10 — Matriz de priorização (pós-estrutura)

| Rank | Problema                              | Solução                     | ID roadmap             | ROI        |
| ---- | ------------------------------------- | --------------------------- | ---------------------- | ---------- |
| 1    | ~~Feedback de recompensa irregular~~  | RewardBurst + mission morph | P-04 ✅, P-05 ✅       | ⭐⭐⭐⭐⭐ |
| 2    | ~~Tipografia genérica em telas core~~ | Expandir `GameDisplayText`  | P-01 ✅                | ⭐⭐⭐⭐⭐ |
| 3    | ~~Celebrações “ok” mas não épicas~~   | Lottie tier 2               | P-02 ✅                | ⭐⭐⭐⭐   |
| 4    | Toasts sem animação                   | Spring enter/exit           | P-03                   | ⭐⭐⭐⭐   |
| 5    | Acessibilidade incompleta             | Contraste + texto grande    | P-14, P-15             | ⭐⭐⭐⭐   |
| 6    | Pet/Farm naming confuso               | Glossário + banners         | P-25                   | ⭐⭐⭐⭐   |
| 7    | iOS sem widget/Live Activity          | Paridade Android            | P-17, P-18             | ⭐⭐⭐     |
| 8    | ~~Vault/Stats tom “produtividade”~~   | Microcopy + insights feed   | P-24 ✅, P-36 ✅       | ⭐⭐⭐     |
| 9    | ~~Loading lists pesadas~~             | Virtualização + stagger     | P-06 ✅, P-31 ✅       | ⭐⭐⭐     |
| 10   | **Fluidez runtime (scroll/focus)**    | P-37–P-41 quick wins        | P-37 ✅, P-38 ✅, P-39 | ⭐⭐⭐⭐   |
| —    | Marca dispersa na loja                | Icon, splash, screenshots   | Premium                | ⭐⭐⭐     |

---

# Ordem sugerida — próxima sprint (polish)

```
Semana 1: P-39 (vault refresh) → P-38 (home focus TTL) → P-41 (pause anims)
Semana 2: P-37 (FlashList raiz no Vault) → P-40 (memo + useShallow)
Semana 3: P-42 (stats cache) → P-03 (toast) → P-14 (contraste)
Backlog:  P-44 (city viewport) · P-45 (split store) · P-17 (widget iOS)
```

### Roadmap histórico — concluído ✅

Quick Wins, Small, Medium e Large (expandir)

**Quick Wins:** QW-01 Loja na Home · QW-02 shimmer · QW-10 events vazio · (+ parciais QW-03–09)

**Small:** S-01 Home 3 zonas · S-02 `HomeDoNowCard` · S-03 quick actions 6+Mais · S-04/S-05 tabs Quests/Shop · S-06 `EmptyState` · S-11 menu unlock

**Medium:** M-01 coach marks · M-02 Vault tab · M-04 city unlock anim · M-05 loot tap-to-crack · M-06 `DESIGN_SYSTEM.md` · M-07 streak risk push · M-09 statistics · M-10 inventário accordion

**Large:** L-01 tab Jogar · L-02 Pet Farm onboarding · L-03 objetivos ativos · L-04 shared transitions · L-05 perfil via avatar · L-06 busca global Vault

**Premium:** font RPG · Lottie tier 1 · universal links · widget Android

---

# Referências no repositório

| Área           | Caminho                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| Home           | `src/features/home/`                                                      |
| Skeleton       | `src/components/ui/skeleton/`                                             |
| Theme          | `src/constants/theme.ts`, `tailwind.config.js`                            |
| Design System  | `docs/DESIGN_SYSTEM.md`                                                   |
| Deep links     | `docs/DEEP_LINKS.md`, `deep-link-service.ts`                              |
| Widget Android | `src/widgets/android/`                                                    |
| Feedback       | `src/features/feedback/`, `ToastHost.tsx`                                 |
| Celebrações    | `CelebrationsHost`, `CelebrationLottie`\*                                 |
| Menu           | `src/features/menu-hub/`                                                  |
| Tutorial       | `src/features/tutorial/`                                                  |
| Navegação      | `src/app/`, `src/constants/routes.ts`                                     |
| Game UI        | `src/components/ui/game/`, `GameDisplayText`                              |
| Performance    | `VirtualizedList.tsx`, `performance-budget.ts`, `startup-perf-service.ts` |
| Vault perf     | `knowledge-vault-service.ts`, `EnglishJournalScreenContent.tsx`           |
| Home perf      | `use-home-focus-refresh.ts`, `HomeScreenContent.tsx`                      |

---

_Documento gerado a partir da auditoria UX/UI do English Quest. Fase estrutural, Tier E e **ETAPA 17 (Fluidez runtime, Tier F P-37–P-45)** concluídos._
