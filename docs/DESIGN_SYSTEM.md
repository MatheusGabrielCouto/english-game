# Design System — English Quest

Referência única para tokens, componentes e padrões visuais do app.  
**Fontes de verdade no código:** `src/constants/theme.ts`, `src/constants/typography.ts`, `tailwind.config.js`.

---

## Princípios

1. **Tom de voz** — encorajador, jogo de evolução (não corporativo). Ver `docs/MICROCOPY.md`.
2. **Gameplay = GameCard** — telas de jogo, recompensas, missões, cidade, pet.
3. **Utilitário = Card** — configurações, formulários, painéis neutros.
4. **Feedback global** — toasts via `showGameToast()` → `ToastHost`; celebrações via `CelebrationsHost`.
5. **Loading consistente** — `ScreenSkeleton` com variant por domínio.
6. **NativeWind primeiro** — preferir classes Tailwind; `theme` para StyleSheet, ícones e animações.

---

## Cores

### Superfícies e texto

| Token                  | Hex       | Uso                                              |
| ---------------------- | --------- | ------------------------------------------------ |
| `background`           | `#06060b` | Fundo da app                                     |
| `surface`              | `#0f0f18` | Cards, inputs                                    |
| `surface-elevated`     | `#161622` | Tab bar, modais, cards em destaque               |
| `border`               | `#2a2a3d` | Bordas padrão                                    |
| `foreground`           | `#fafafa` | Títulos e corpo principal                        |
| `foreground-secondary` | `#a1a1aa` | Subtítulos, hints                                |
| `muted`                | `#8a8a94` | Labels, metadados (mín. 12px — WCAG AA em cards) |

### Marca e feedback

| Token           | Hex       | Uso                                 |
| --------------- | --------- | ----------------------------------- |
| `primary`       | `#8b5cf6` | CTA, tab ativa, progresso principal |
| `primary-muted` | `#6d28d9` | Pressed state em botões primary     |
| `accent`        | `#38bdf8` | Cidade, links secundários, moedas   |
| `success`       | `#22c55e` | Confirmação, streak ok              |
| `warning`       | `#f59e0b` | Alertas suaves                      |
| `danger`        | `#ef4444` | Erro, punição, ações destrutivas    |

### Game tokens

| Token         | Hex       | Uso                          |
| ------------- | --------- | ---------------------------- |
| `gold`        | `#fbbf24` | Recompensas, loot, prestígio |
| `xp` / `glow` | `#a78bfa` | Barra de XP, glow roxo       |
| `coin`        | `#38bdf8` | Moedas no hero               |
| `streak`      | `#fb923c` | Chama de streak              |

### Raridade (loot, itens)

| Token       | Hex       |
| ----------- | --------- |
| `common`    | `#94a3b8` |
| `rare`      | `#60a5fa` |
| `epic`      | `#c084fc` |
| `legendary` | `#f472b6` |

**Tailwind:** mesmos nomes em kebab-case (`foreground-secondary`, `surface-elevated`).  
**StyleSheet:** `theme.colors.foregroundSecondary` (camelCase em `theme.ts`).

---

## Tipografia

Definida em `src/constants/typography.ts`. Use `typographyClasses` ou classes `game-*` no Tailwind.

| Variante      | Classes NativeWind                                       | Quando usar                              |
| ------------- | -------------------------------------------------------- | ---------------------------------------- |
| `label`       | `text-xs font-bold uppercase tracking-widest text-muted` | Seções, badges, metadados                |
| `title`       | ` font-black text-foreground`                            | Títulos de card                          |
| `body`        | `text-sm leading-relaxed text-foreground-secondary`      | Parágrafos, hints                        |
| `hero`        | `text-2xl font-black text-foreground`                    | Corpo longo, subtítulos grandes          |
| `display`     | `font-display text-game-display`                         | Títulos curtos de tela/card              |
| `displayHero` | `font-display text-game-display-hero`                    | Headers, splash, nome do jogador         |
| `caption`     | `text-[10px] font-semibold text-foreground-secondary`    | Só em espaços compactos (tab bar, pills) |
| `subtitle`    | `text-xs leading-relaxed text-foreground-secondary`      | Subtítulo de seção                       |

### Fonte display RPG

- **Família:** Press Start 2P (`PressStart2P_400Regular`) via `expo-font` + `@expo-google-fonts/press-start-2p`
- **Carregamento:** `useAppFonts()` em `AppProviders` (bloqueia conteúdo até carregar)
- **Componente:** `<GameDisplayText variant="hero|title|label|value" />` para títulos, níveis, moedas e stats
- **Regra:** usar só em textos curtos (títulos, números, badges). Corpo e parágrafos continuam na fonte do sistema.

```tsx
import { typographyClasses } from "@/constants";

<Text className={typographyClasses.title}>Missões de hoje</Text>;
```

Tailwind extend: `font-display`, `text-game-label`, `text-game-display`, `text-game-display-hero`, etc.

---

## Espaçamento e raio

### `theme.spacing` (StyleSheet)

| Token | px  |
| ----- | --- |
| `xs`  | 4   |
| `sm`  | 8   |
| `md`  | 16  |
| `lg`  | 24  |
| `xl`  | 32  |
| `xxl` | 48  |

### Convenções NativeWind (preferidas em telas)

| Contexto                   | Classe                                                          |
| -------------------------- | --------------------------------------------------------------- |
| Padding horizontal da tela | `px-5` (`ScreenContainer`)                                      |
| Gap entre blocos na tela   | `gap-4` (padrão) · `gap-6` (zonas Home, seções grandes)         |
| Padding interno de card    | `p-4` (compacto) · `p-5` (Card/GameCard default) · `p-6` (hero) |
| Bottom safe scroll         | `pb-6` / `pb-8` no conteúdo                                     |

### Raio

| Token          | Valor | Uso                         |
| -------------- | ----- | --------------------------- |
| `rounded-xl`   | 12px  | Chips, inputs               |
| `rounded-2xl`  | 16px  | `Card`                      |
| `rounded-game` | 20px  | `GameCard` (token Tailwind) |
| `rounded-full` | pill  | Badges, avatares            |

---

## Componentes

### Card vs GameCard

|               | `Card`                                        | `GameCard`                                              |
| ------------- | --------------------------------------------- | ------------------------------------------------------- |
| **Arquivo**   | `src/components/ui/Card.tsx`                  | `src/components/ui/game/GameCard.tsx`                   |
| **Raio**      | `rounded-2xl`                                 | `rounded-game`                                          |
| **Variantes** | `elevated`, `accent`                          | `default`, `hero`, `quest`, `reward`, `danger` + `glow` |
| **Quando**    | Perfil settings, formulários, painéis neutros | Home, missões, loja, pet, cidade, vault                 |

Interações em gameplay: envolver conteúdo clicável com `PressableScale` (`src/components/ui/game/PressableScale.tsx`).  
Prop `haptic` (default `tap`); use `confirm` em cards de ação hero e `haptic={false}` quando o `onPress` dispara outro haptic.

**Press glow:** `GameCard` com `glow` dentro de `PressableScale` ganha ripple + borda animada (`GameCardPressGlow`, default `pressGlow={glow}`). Hero usa o glow mais forte (`game-card-press-ui.ts`).

### Botões

`Button` — variantes: `primary` | `secondary` | `ghost` | `danger`; tamanhos: `sm` | `md` | `lg`.  
Haptic automático por variante (`BUTTON_HAPTIC_BY_VARIANT`). CTAs primários da Home e modais: `primary` + `lg` quando for ação hero.

### Empty states

`EmptyState` — variantes: `game` | `vault` | `farm`.  
Vault usa CTA hero grande (`variant="vault"`). Preferir em vez de empty inline por tela.

### Skeleton

`ScreenSkeleton` — variantes: `hero-list`, `home`, `quest`, `pet`, `city`, `shop`, `focus`, `learning`, `map`, `vault`, `session`.  
Shimmer via `SkeletonBlock`. Escolher variant que espelha o layout da tela.

### Modais

Shell compartilhado em `AppModalShell` (`modal-ui.ts`):

| Componente       | Apresentação | Comportamento                                      |
| ---------------- | ------------ | -------------------------------------------------- |
| `Modal`          | `center`     | Spring scale-in, backdrop blur, tap fora fecha     |
| `FormSheetModal` | `sheet`      | Spring slide-up, blur, swipe-down dismiss + handle |

Props úteis: `Modal.chrome={false}` para layouts custom (tutorial); `FormSheetModal.enableDismissGesture`.

### Formulários

| Componente           | Uso                                                               |
| -------------------- | ----------------------------------------------------------------- |
| `FormFieldShell`     | Label + hint + erro inline com shake e `accessibilityDescribedBy` |
| `VaultFormTextField` | Campo de texto do Vault com validação + borda `border-danger`     |

Rotinas usam `RoutineFieldShell` (alias de `FormFieldShell`). Erros usam `accessibilityRole="alert"`, `accessibilityLiveRegion="polite"` e `accessibilityDescribedBy` no input.

### Layout

| Componente        | Uso                                                     |
| ----------------- | ------------------------------------------------------- |
| `ScreenContainer` | Wrapper de tela com safe area; `scrollable` para listas |
| `ScreenHeader`    | Título + emoji + opcional `showBack`                    |
| `AppTabBar`       | 5 tabs — Home, Quests, Vault, Menu, Perfil              |
| `HomeZoneSection` | Agrupamento em 3 zonas na Home                          |

### Feedback

| Canal               | API / componente                                                         |
| ------------------- | ------------------------------------------------------------------------ |
| Toast               | `showGameToast(message, variant)` → `ToastHost`                          |
| Confetti / level up | `CelebrationsHost` + `CelebrationLottie` (tier 1)                        |
| Haptics             | `playHaptic(kind)` / `haptics` em `src/utils/haptics.ts`                 |
| Áudio UI            | `AudioDirector.playUI()` / `playSFX()` — ver `audio-sound-vocabulary.ts` |

**Não** criar toast local em feature — usar `showGameToast`.

### Haptics

Vocabulário semântico em `src/constants/haptic-vocabulary.ts`. **Não** importar `expo-haptics` em features — usar `playHaptic()` ou `haptics`.

| Kind      | Motor Expo             | Quando usar                                          |
| --------- | ---------------------- | ---------------------------------------------------- |
| `tap`     | `selectionAsync`       | `PressableScale` default, pills, chips, flip de card |
| `press`   | `Light` impact         | `Button` secondary, toggles, campos de formulário    |
| `confirm` | `Medium` impact        | `Button` primary, completar missão, abrir loot       |
| `impact`  | `Heavy` impact         | Prestígio, evolução pet, crack de loot box           |
| `success` | Notification `Success` | Recompensas, level up, sessão de foco concluída      |
| `warning` | Notification `Warning` | `Button` danger, punição, skip, falha de contrato    |
| `error`   | Notification `Error`   | Validação, erro de rede                              |
| `tab`     | `selectionAsync`       | Tab bar (`AppTabBar`)                                |

**Componentes com haptic embutido**

| Componente       | Haptic default                         |
| ---------------- | -------------------------------------- |
| `PressableScale` | `tap` (prop `haptic`)                  |
| `Button`         | por variante (`confirm` / `press` / …) |
| `AppTabBar`      | `tab`                                  |

**Eventos de jogo** (`feedback-service.ts`): `success` em desbloqueios; `press` em ganhos menores de XP; `confirm` em compra na loja; `impact` em prestígio.

### Áudio (SFX por domínio)

Vocabulário em `src/constants/audio-sound-vocabulary.ts`. **Não** tocar SFX direto em features para marcos — emitir `GameEvents` e deixar `audio-event-map.ts` resolver.

| Domínio   | Eventos exemplo                                    | SFX típico            |
| --------- | -------------------------------------------------- | --------------------- |
| `mission` | `DAILY_MISSION_COMPLETED`, `ROUTINE_COMPLETED`     | `mission_complete`    |
| `loot`    | `LOOT_BOX_OPENED`, `LOOT_BOX_RECEIVED`             | `loot_reveal_*`       |
| `city`    | `CITY_BUILDING_UNLOCKED`, `LEXICON_BRICK_PLACED`   | `level_up`, `xp_tick` |
| `pet`     | `PET_INTERACTION`, `PET_MEMORY_CREATED`            | `xp_tick`, `xp_chime` |
| `focus`   | `FOCUS_SESSION_STARTED`, `FOCUS_SESSION_COMPLETED` | `study_day_stamp`     |
| `meta`    | `ACHIEVEMENT_UNLOCKED`, `PRESTIGE_ASCENDED`        | `mission_daily_all`   |

**Mute:** `enabled: false` silencia tudo; `studySilentMode` mantém só eventos em `AUDIO_SILENT_MODE_ALLOWLIST` (`priority: 'high'`).

---

## Padrões por domínio

### Home (3 zonas)

1. **Identidade** — `HomePlayerHeader`, `HomeDoNowCard`, streak, missões.
2. **Progresso** — recompensa próxima, progresso diário.
3. **Explorar** — pet, cidade, quick actions (6 + “Mais”).

### Navegação

- Uma entrada por domínio: Vault na tab Knowledge; Loja na Home quick action.
- Rotas: `src/constants/routes.ts` + helpers (`vaultEntryHref`, etc.).

### Tabs internas (padrão visual)

Switcher em pill: `flex-row rounded-2xl border border-border bg-surface p-1`, tab ativa `bg-primary` + texto `text-primary-foreground`.  
Exemplos: `QuestsTabSwitcher`, `ShopTabSwitcher`, `ProfileTabSwitcher`.

---

## Sombras (StyleSheet)

```ts
import { theme } from "@/constants";

// Glow roxo (cards hero, level up)
theme.shadows.glow;

// Glow dourado (recompensas)
theme.shadows.gold;
```

`GameCard` com `glow` aplica sombra por plataforma (iOS shadow / Android border).

---

## Acessibilidade (mínimos)

- Alvo de toque: mínimo 44pt (`min-h-11` / `TOUCH_TARGET_MIN_CLASS`); chips com `ChoiceChip` ou `TOUCH_TARGET_CHIP_CLASS`; tabs com `ScreenTabBar`.
- `accessibilityRole`, `accessibilityLabel` em `Pressable` / `PressableScale`.
- Evitar `text-[10px]` para copy importante; preferir `text-xs` (12px).
- Contraste: `muted` em `#8a8a94` (WCAG AA em `surface` / `surface-elevated`); audit em `a11y-contrast.test.ts`.
- Rich push (conquista/loot): emoji em `subtitle` + canal Android `delight`; ver `rich-notification-content.ts`.
- Changelog pós-update: card `HomeChangelogCard` na Home (1× por versão); catálogo em `changelog-catalog.ts`.
- Review prompt: `StoreReview.requestReview()` após streak 7 ou loot lendário (máx. 3×, cooldown 90d); ver `review-prompt-service.ts`.

---

## Checklist ao criar UI nova

- [ ] Gameplay ou settings? → `GameCard` ou `Card`
- [ ] Tipografia semântica (`typographyClasses` / `game-*`)
- [ ] Gap `gap-4` entre seções
- [ ] Loading com `ScreenSkeleton` variant correto
- [ ] Empty com `EmptyState` quando lista vazia
- [ ] Toast via `showGameToast`, não componente local
- [ ] Haptic via `playHaptic` / `haptics`, não `expo-haptics` direto
- [ ] Token de cor do Tailwind, não hex solto no JSX

---

## Gaps conhecidos (roadmap)

| Item                                                        | Status                                             |
| ----------------------------------------------------------- | -------------------------------------------------- |
| `theme.spacing` espelhado no Tailwind                       | Pendente                                           |
| `foreground-secondary` só no Tailwind vs camelCase no theme | Documentado — usar convenção por contexto          |
| Toasts 100% globais                                         | Shop/contracts já migrados; auditar features novas |
| Comentário Card vs GameCard no código                       | ✅ `Card.tsx` / `GameCard.tsx`                     |

---

## Referências

| Documento                          | Conteúdo                                |
| ---------------------------------- | --------------------------------------- |
| [UX_UI_AUDIT.md](./UX_UI_AUDIT.md) | Roadmap UX, microinterações, checkboxes |
| [FEATURES.md](./FEATURES.md)       | Funcionalidades por módulo              |
| `src/constants/theme.ts`           | Tokens programáticos                    |
| `src/constants/typography.ts`      | Escala tipográfica                      |
| `tailwind.config.js`               | Tokens NativeWind                       |

---

_Atualizar este doc quando novos tokens ou componentes compartilhados forem adicionados (ex.: após M-08 stagger, L-04 shared transitions)._
