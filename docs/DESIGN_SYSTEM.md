# Design System — English Quest

Referência única para tokens, componentes e padrões visuais do app.  
**Fontes de verdade no código:** `src/constants/theme.ts`, `src/constants/typography.ts`, `tailwind.config.js`.

---

## Princípios

1. **Gameplay = GameCard** — telas de jogo, recompensas, missões, cidade, pet.
2. **Utilitário = Card** — configurações, formulários, painéis neutros.
3. **Feedback global** — toasts via `showGameToast()` → `ToastHost`; celebrações via `CelebrationsHost`.
4. **Loading consistente** — `ScreenSkeleton` com variant por domínio.
5. **NativeWind primeiro** — preferir classes Tailwind; `theme` para StyleSheet, ícones e animações.

---

## Cores

### Superfícies e texto

| Token                  | Hex       | Uso                                                |
| ---------------------- | --------- | -------------------------------------------------- |
| `background`           | `#06060b` | Fundo da app                                       |
| `surface`              | `#0f0f18` | Cards, inputs                                      |
| `surface-elevated`     | `#161622` | Tab bar, modais, cards em destaque                 |
| `border`               | `#2a2a3d` | Bordas padrão                                      |
| `foreground`           | `#fafafa` | Títulos e corpo principal                          |
| `foreground-secondary` | `#a1a1aa` | Subtítulos, hints                                  |
| `muted`                | `#71717a` | Labels, metadados (mín. 12px — ver acessibilidade) |

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

| Variante   | Classes NativeWind                                       | Quando usar                              |
| ---------- | -------------------------------------------------------- | ---------------------------------------- |
| `label`    | `text-xs font-bold uppercase tracking-widest text-muted` | Seções, badges, metadados                |
| `title`    | `text-base font-black text-foreground`                   | Títulos de card                          |
| `body`     | `text-sm leading-relaxed text-foreground-secondary`      | Parágrafos, hints                        |
| `hero`     | `text-2xl font-black text-foreground`                    | Nome do jogador, valores grandes         |
| `caption`  | `text-[10px] font-semibold text-foreground-secondary`    | Só em espaços compactos (tab bar, pills) |
| `subtitle` | `text-xs leading-relaxed text-foreground-secondary`      | Subtítulo de seção                       |

```tsx
import { typographyClasses } from "@/constants";

<Text className={typographyClasses.title}>Missões de hoje</Text>;
```

Tailwind extend: `text-game-label`, `text-game-body`, `text-game-title`, `text-game-hero`, etc.

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

### Botões

`Button` — variantes: `primary` | `secondary` | `ghost` | `danger`; tamanhos: `sm` | `md` | `lg`.  
Inclui haptic `selection` no press. CTAs primários da Home e modais: `primary` + `lg` quando for ação hero.

### Empty states

`EmptyState` — variantes: `game` | `vault` | `farm`.  
Vault usa CTA hero grande (`variant="vault"`). Preferir em vez de empty inline por tela.

### Skeleton

`ScreenSkeleton` — variantes: `hero-list`, `home`, `quest`, `pet`, `city`, `shop`, `focus`, `learning`, `map`, `vault`, `session`.  
Shimmer via `SkeletonBlock`. Escolher variant que espelha o layout da tela.

### Layout

| Componente        | Uso                                                     |
| ----------------- | ------------------------------------------------------- |
| `ScreenContainer` | Wrapper de tela com safe area; `scrollable` para listas |
| `ScreenHeader`    | Título + emoji + opcional `showBack`                    |
| `AppTabBar`       | 5 tabs — Home, Quests, Vault, Menu, Perfil              |
| `HomeZoneSection` | Agrupamento em 3 zonas na Home                          |

### Feedback

| Canal               | API / componente                                |
| ------------------- | ----------------------------------------------- |
| Toast               | `showGameToast(message, variant)` → `ToastHost` |
| Confetti / level up | `CelebrationsHost` + `useFeedbackStore`         |
| Haptics             | `haptics` em `src/utils/haptics.ts`             |
| Áudio UI            | `AudioDirector.playUI()` / `playSFX()`          |

**Não** criar toast local em feature — usar `showGameToast`.

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

- Alvo de toque: `min-h-11` em quick actions e CTAs críticos.
- `accessibilityRole`, `accessibilityLabel` em `Pressable` / `PressableScale`.
- Evitar `text-[10px]` para copy importante; preferir `text-xs` (12px).
- Contraste: elevar `muted` em labels pequenos quando possível (`#8a8a94` — ver `UX_UI_AUDIT.md` ETAPA 9).

---

## Checklist ao criar UI nova

- [ ] Gameplay ou settings? → `GameCard` ou `Card`
- [ ] Tipografia semântica (`typographyClasses` / `game-*`)
- [ ] Gap `gap-4` entre seções
- [ ] Loading com `ScreenSkeleton` variant correto
- [ ] Empty com `EmptyState` quando lista vazia
- [ ] Toast via `showGameToast`, não componente local
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
