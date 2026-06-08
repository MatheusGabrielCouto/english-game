# Chama Interior — Cofre de Motivação Pessoal

Especificação do sistema de **anotações motivacionais multimídia** do English Quest: um espaço privado para guardar textos, imagens, links e áudios que te impulsionam — com presença diária no app e em notificações.

> **Relacionados:** [FEATURES.md § Notificações](./FEATURES.md#notificações), [DEEP_LINKS.md](./DEEP_LINKS.md), `src/features/english-journal/` (padrão de mídia local), `src/features/notifications/`

---

## Índice

1. [Visão e fantasia](#visão-e-fantasia)
2. [Problema e objetivo](#problema-e-objetivo)
3. [Escopo funcional](#escopo-funcional)
4. [Estado no app hoje vs visão alvo](#estado-no-app-hoje-vs-visão-alvo)
5. [Personas e histórias de usuário](#personas-e-histórias-de-usuário)
6. [Conceitos do domínio](#conceitos-do-domínio)
7. [Tipos de conteúdo](#tipos-de-conteúdo)
8. [Modelo de dados](#modelo-de-dados)
9. [Armazenamento de mídia](#armazenamento-de-mídia)
10. [Algoritmo de seleção diária](#algoritmo-de-seleção-diária)
11. [Notificações](#notificações)
12. [Experiência no app (UX)](#experiência-no-app-ux)
13. [Navegação e deep links](#navegação-e-deep-links)
14. [Integração com sistemas existentes](#integração-com-sistemas-existentes)
15. [Backup e restauração](#backup-e-restoração)
16. [Privacidade e permissões](#privacidade-e-permissões)
17. [Gamificação (opcional)](#gamificação-opcional)
18. [Arquitetura de código](#arquitetura-de-código)
19. [Fases de implementação](#fases-de-implementação)
20. [Critérios de aceite](#critérios-de-aceite)
21. [Métricas de sucesso](#métricas-de-sucesso)
22. [Riscos e mitigações](#riscos-e-mitigações)
23. [Decisões em aberto](#decisões-em-aberto)

---

## Visão e fantasia

**Fantasia do usuário:** “Tenho um cofre só meu com tudo que me lembra *por que* estudo inglês — frases, fotos, áudios da minha voz, links que me inspiram. Todo dia o app me mostra uma dessas chamas antes de eu desistir.”

**Promessa de produto:**


| Para você (usuário)                        | Para o produto                                |
| ------------------------------------------ | --------------------------------------------- |
| Motivação personalizada, não genérica      | Diferencial emocional além da gamificação     |
| Tudo offline, só seu                       | Sem backend, sem vazamento de conteúdo íntimo |
| Lembrete diário que *você* escreveu/gravou | Notificação com significado real              |
| Multimídia rica no mesmo lugar             | Reuso dos padrões do Knowledge Vault          |


**Princípio central:** o conteúdo é **seu**, não curado pelo app. O English Quest só **entrega** e **relembrar** — nunca substitui sua voz por copy de marketing.

---

## Problema e objetivo

### Problema

Apps de estudo gamificados motivam via streaks, pets e recompensas — mas falham nos dias em que a motivação *intrínseca* some. Mensagens fixas de notificação perdem impacto com o tempo.

### Objetivo

Criar um **Cofre de Motivação** onde o usuário:

1. **Cria** sparks (faíscas) com texto, imagem, link e/ou áudio
2. **Organiza** por categorias, tags e favoritos
3. **Recebe** 1+ lembretes diários com trecho/mídia do spark escolhido
4. **Abre** no app para ver/ouvir/ler o conteúdo completo
5. **Mantém** tudo armazenado localmente, incluído no backup

### Não-objetivos (v1)

- Compartilhamento social ou feed público
- Sincronização em nuvem multi-dispositivo
- IA gerando motivação automaticamente
- Edição colaborativa
- Vídeo embutido (apenas link externo na v1)

---

## Escopo funcional

### Must have (MVP)


| #   | Funcionalidade                                                    |
| --- | ----------------------------------------------------------------- |
| M1  | CRUD de sparks (criar, editar, arquivar, excluir)                 |
| M2  | Corpo em texto markdown simples (negrito, lista, citação)         |
| M3  | Anexar até 5 imagens por spark (galeria ou câmera)                |
| M4  | Anexar 1 áudio por spark (gravação in-app ou importar arquivo)    |
| M5  | Campo de link URL com preview básico (título + abrir no browser)  |
| M6  | Lista e detalhe no app com player de áudio e galeria de imagens   |
| M7  | 1 notificação diária no horário preferido do usuário              |
| M8  | Card “Chama de hoje” na Home                                      |
| M9  | Toggle nas configurações de notificação (`motivationSpark`)       |
| M10 | Deep link `englishquest://motivation/:id` ao tocar na notificação |
| M11 | Inclusão no backup/restore JSON existente                         |


### Should have (v1.1)


| #   | Funcionalidade                                                |
| --- | ------------------------------------------------------------- |
| S1  | Coleções / pastas (ex.: “Carreira”, “Família”, “Inglês”)      |
| S2  | Favoritos e pin — sparks pinados entram mais vezes na rotação |
| S3  | Segunda notificação opcional (ex.: fim do dia “última chama”) |
| S4  | Widget Android com frase/imagem do spark do dia               |
| S5  | Rich notification com imagem em destaque (Android)            |
| S6  | Histórico “já vi hoje” + streak de dias abrindo a chama       |
| S7  | Busca full-text em título e corpo                             |


### Could have (v2+)


| #   | Funcionalidade                                        |
| --- | ----------------------------------------------------- |
| C1  | Vídeo via link (YouTube/Vimeo) com thumbnail          |
| C2  | Agendamento manual (“mostrar este spark na segunda”)  |
| C3  | Modo slideshow na Home (carrossel de imagens)         |
| C4  | Integração leve com pet (“seu pet guarda a chama”)    |
| C5  | Exportar spark como imagem compartilhável             |
| C6  | Lembrete por localização (ex.: ao chegar no trabalho) |


---

## Estado no app hoje vs visão alvo


| Capacidade           | Hoje                                          | Com Chama Interior                                     |
| -------------------- | --------------------------------------------- | ------------------------------------------------------ |
| Notas multimídia     | English Knowledge Vault (foco em aprendizado) | Cofre dedicado à **motivação pessoal**                 |
| Notificações diárias | Mensagens fixas por categoria                 | Conteúdo **do usuário** rotacionado                    |
| Áudio local          | `journal-audio-storage`, `expo-audio`         | Reuso do mesmo stack                                   |
| Imagens locais       | `journal-image-storage`, `expo-image-picker`  | Reuso + diretório `motivation-images/`                 |
| Home                 | Missões, streak, pet                          | Card “Chama de hoje”                                   |
| Backup               | Tabelas journal no vault backup               | Novas tabelas + arquivos em ZIP sidecar (ver § Backup) |


O Vault de inglês **não** deve absorver essa feature: motivação e aprendizado têm ritmos e copy diferentes. Compartilham **infra**, não **produto**.

---

## Personas e histórias de usuário

### Histórias principais

1. **Como** estudante de inglês, **quero** salvar uma foto do meu sonho (visto em Londres) **para** lembrar por que abro o app todo dia.
2. **Como** usuário, **quero** gravar um áudio falando comigo mesmo **para** ouvir na notificação e no player do app.
3. **Como** usuário, **quero** colar um link de um talk inspirador **para** abrir com um toque quando estiver desmotivado.
4. **Como** usuário, **quero** receber uma notificação às 7h com uma frase minha **para** começar o dia com intenção.
5. **Como** usuário, **quero** marcar sparks como favoritos **para** aparecerem mais nas rotações.
6. **Como** usuário, **quero** que meus sparks entrem no backup **para** não perder ao trocar de celular.

### Fluxos críticos

```
[Criar spark] → preencher título + corpo → anexar mídia → salvar
                    ↓
            indexar para rotação
                    ↓
[Agendador diário] → escolhe spark → monta notificação → agenda
                    ↓
[Usuário toca notificação] → deep link → tela de detalhe → play áudio / ver imagens
```

---

## Conceitos do domínio


| Termo              | Definição                                                          |
| ------------------ | ------------------------------------------------------------------ |
| **Spark** (faísca) | Unidade de conteúdo motivacional — 1 registro no banco             |
| **Chama do dia**   | Spark selecionado para a data corrente (`YYYY-MM-DD`)              |
| **Rotação**        | Algoritmo que escolhe qual spark vira chama sem repetir em excesso |
| **Coleção**        | Agrupamento opcional (v1.1)                                        |
| **Arquivo**        | Spark com `isArchived = true`, fora da rotação                     |
| **Pin**            | Spark com prioridade alta na rotação                               |
| **Snippet**        | Trecho curto (≤120 chars) usado no corpo da notificação            |


**Slug interno da feature:** `motivation-spark`  
**Rota base:** `/motivation`  
**Prefixo de notificação:** `eq-motivation-`

---

## Tipos de conteúdo

Cada spark tem um `**contentKind`** primário para UI e notificação, mas pode combinar mídias:


| Kind    | Campos                                               | Exibição                  | Notificação                             |
| ------- | ---------------------------------------------------- | ------------------------- | --------------------------------------- |
| `text`  | `title`, `body`                                      | Markdown renderizado      | `title` + snippet do `body`             |
| `image` | `imagesJson[]`, `caption` opcional                   | Galeria full-screen       | Rich image (Android) + título           |
| `audio` | `audioUri`, `audioDurationMs`, `transcript` opcional | Player + waveform simples | “Ouça sua mensagem” + título            |
| `link`  | `linkUrl`, `linkTitle`, `linkDescription`            | Card com botão “Abrir”    | Título + domínio do link                |
| `mixed` | Combinação                                           | Layout em seções          | Prioriza: imagem > áudio > texto > link |


### Limites sugeridos (v1)


| Recurso              | Limite                     |
| -------------------- | -------------------------- |
| Imagens por spark    | 5 (igual journal)          |
| Tamanho por imagem   | 8 MB após compressão       |
| Áudios por spark     | 1                          |
| Duração máxima áudio | 3 minutos                  |
| Título               | 120 caracteres             |
| Corpo (body)         | 4.000 caracteres           |
| Sparks ativos        | 200 (soft warning aos 150) |
| Links por spark      | 3                          |


---

## Modelo de dados

### Tabela `motivation_sparks`

```sql
-- Conceitual; implementar via Drizzle em schema.ts + migration
CREATE TABLE motivation_sparks (
  id              TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  body              TEXT,                    -- markdown/plain
  content_kind      TEXT NOT NULL,           -- text | image | audio | link | mixed
  images_json       TEXT NOT NULL DEFAULT '[]',
  audio_uri         TEXT,
  audio_duration_ms INTEGER,
  audio_transcript  TEXT,
  links_json        TEXT NOT NULL DEFAULT '[]',  -- [{ url, title?, description? }]
  collection_id     TEXT,                    -- FK opcional v1.1
  tags_json         TEXT NOT NULL DEFAULT '[]',
  importance        TEXT NOT NULL DEFAULT 'medium',  -- low | medium | high
  is_favorite       INTEGER NOT NULL DEFAULT 0,
  is_pinned         INTEGER NOT NULL DEFAULT 0,
  is_archived       INTEGER NOT NULL DEFAULT 0,
  rotation_weight   INTEGER NOT NULL DEFAULT 1,      -- derivado de pin/favorite
  last_shown_at     TEXT,                    -- ISO
  show_count        INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
```

### Tabela `motivation_daily_picks`

Registra qual spark foi “chama do dia” — idempotência e analytics.

```sql
CREATE TABLE motivation_daily_picks (
  date_key    TEXT NOT NULL,   -- YYYY-MM-DD (timezone local)
  spark_id    TEXT NOT NULL,
  notified_at TEXT,
  opened_at   TEXT,
  PRIMARY KEY (date_key, spark_id)
);
```

### Tabela `motivation_collections` (v1.1)

```sql
CREATE TABLE motivation_collections (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '🔥',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
```

### Tabela `motivation_settings` (singleton)

```sql
CREATE TABLE motivation_settings (
  id                      INTEGER PRIMARY KEY DEFAULT 1,
  enabled                 INTEGER NOT NULL DEFAULT 1,
  daily_notification      INTEGER NOT NULL DEFAULT 1,
  evening_notification    INTEGER NOT NULL DEFAULT 0,
  preferred_hour          INTEGER NOT NULL DEFAULT 7,
  preferred_minute        INTEGER NOT NULL DEFAULT 0,
  evening_hour            INTEGER NOT NULL DEFAULT 20,
  evening_minute          INTEGER NOT NULL DEFAULT 0,
  avoid_repeat_days       INTEGER NOT NULL DEFAULT 7,
  show_on_home            INTEGER NOT NULL DEFAULT 1,
  updated_at              TEXT NOT NULL
);
```

### Extensão em `notification_settings`

Adicionar coluna:

```ts
motivationSpark: integer("motivation_spark", { mode: "boolean" })
  .notNull()
  .default(true);
```

Alinhado ao padrão existente (`journalReview`, `routineReminder`, etc.).

### Tipos TypeScript (`src/types/motivation-spark.ts`)

```ts
export const MotivationContentKind = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  LINK: "link",
  MIXED: "mixed",
} as const;

export type MotivationSpark = {
  id: string;
  title: string;
  body: string | null;
  contentKind: MotivationContentKindValue;
  images: string[];
  audioUri: string | null;
  audioDurationMs: number | null;
  audioTranscript: string | null;
  links: MotivationLink[];
  // ... demais campos
};
```

---

## Armazenamento de mídia

Reutilizar o padrão do English Journal com diretórios separados:


| Tipo    | Diretório                                            | Serviço                       |
| ------- | ---------------------------------------------------- | ----------------------------- |
| Imagens | `{documentDirectory}/motivation-images/{sparkId}/`   | `motivation-image-storage.ts` |
| Áudio   | `{documentDirectory}/motivation-audio/{sparkId}.m4a` | `motivation-audio-storage.ts` |


### Pipeline de imagem

1. `expo-image-picker` → URI temporária
2. `persistMotivationImage()` → copia para documentDirectory
3. Comprimir se > 8 MB (`expo-image-manipulator` — avaliar dependência)
4. Salvar paths relativos estáveis em `images_json`

### Pipeline de áudio

1. Gravação: `expo-audio` (mesmo fluxo de `JournalVoiceRecorder`)
2. Importação: `expo-document-picker` (`audio/*`)
3. `persistMotivationAudio()` → move para path final
4. Opcional v1.1: transcrição via `expo-speech-recognition` (já no app)

### Links

- Armazenar apenas URL + metadados manuais ou fetch leve no save
- **Não** fazer prefetch pesado offline
- Abrir com `expo-web-browser` (padrão do app)

### Limpeza

Ao excluir spark: apagar diretório de imagens + arquivo de áudio (espelhar `reconcileJournalImages`).

---

## Algoritmo de seleção diária

Objetivo: variedade + respeito a favoritos/pins + não repetir o mesmo spark em `avoid_repeat_days`.

### Pseudocódigo

```
function pickDailySpark(dateKey, sparks, settings, history):
  candidates = sparks where !isArchived

  if candidates is empty:
    return null

  recentIds = history.sparkIds from last settings.avoidRepeatDays days

  pool = candidates.filter(s => s.id not in recentIds)
  if pool is empty:
    pool = candidates  // fallback: todos elegíveis

  for each spark in pool:
    weight = spark.rotationWeight
    if spark.isPinned: weight += 3
    if spark.isFavorite: weight += 2
    if spark.importance == 'high': weight += 1
    if spark.lastShownAt is null: weight += 2  // nunca exibido
    if daysSince(spark.lastShownAt) > 30: weight += 1

  // Seed determinístico por data → mesma chama o dia inteiro em todos os devices
  seed = hash(dateKey)
  return weightedRandom(pool, weights, seed)
```

### Snippet para notificação

```
function buildNotificationSnippet(spark):
  if spark.body: return truncate(stripMarkdown(spark.body), 120)
  if spark.audioTranscript: return truncate(spark.audioTranscript, 120)
  if spark.links[0]: return spark.links[0].title ?? spark.links[0].url
  if spark.images.length: return spark.title
  return spark.title
```

### Idempotência

- Ao agendar: `INSERT OR REPLACE` em `motivation_daily_picks` para `date_key`
- Reagendar no mesmo dia mantém o **mesmo** spark (não troca ao reabrir o app)

---

## Notificações

### Integração com infra existente

Seguir o padrão de `JournalNotificationService`:

1. `MotivationNotificationService.rescheduleAll()`
2. Registrar em `FeatureNotificationSyncService.FEATURE_PREFIXES`:
  - `${NOTIFICATION_IDENTIFIER_PREFIX}-motivation-`
3. Chamar em `rescheduleAll()` junto com journal, routines, etc.
4. Emitir evento `MOTIVATION_SPARK_CREATED | UPDATED | DELETED` → `FEATURE_RESCHEDULE_EVENTS` no `notification-service.ts`

### Identifiers


| Tipo              | Pattern                           | Exemplo                            |
| ----------------- | --------------------------------- | ---------------------------------- |
| Diária            | `eq-motivation-daily-{dateKey}`   | `eq-motivation-daily-2026-06-08`   |
| Vespertina (v1.1) | `eq-motivation-evening-{dateKey}` | `eq-motivation-evening-2026-06-08` |


### Payload

```ts
{
  category: NotificationCategory.MOTIVATION_SPARK,
  title: '🔥 Sua chama de hoje',
  body: snippet,
  priority: 5,
  richVisual: spark.images[0] ? { imageUri: spark.images[0] } : undefined,
  data: {
    url: `englishquest://motivation/${spark.id}`,
    sparkId: spark.id,
  },
}
```

### Regras de agendamento


| Regra                                | Comportamento                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| Notificações globais desligadas      | Cancelar prefixo `eq-motivation-`                                                    |
| `settings.motivationSpark === false` | Idem                                                                                 |
| Sem sparks ativos                    | Não agendar; Home mostra empty state convidando a criar                              |
| Horário                              | `motivation_settings.preferred_hour/minute` ou fallback para `notification_settings` |
| Já estudou hoje                      | **Manter** motivação (diferente de lembretes de estudo) — não cancelar               |


### Categoria nova

Adicionar em `NotificationCategory`:

```ts
MOTIVATION_SPARK: 'motivation_spark',
```

Copy pool em `messages.ts` (fallback se spark sem corpo):

```ts
[NotificationCategory.MOTIVATION_SPARK]: [
  'Sua chama de hoje está esperando.',
  'Um lembrete do porquê você começou.',
  'Abra sua motivação de hoje.',
],
```

---

## Experiência no app (UX)

### Mapa de telas

```
/motivation                    → Hub (lista + chama do dia)
/motivation/create             → Formulário novo spark
/motivation/[id]               → Detalhe (ler/ouvir/ver)
/motivation/[id]/edit          → Edição
/motivation/collections        → Coleções (v1.1)
/motivation/settings           → Horários e preferências da feature
```

### Hub (`MotivationHubScreenContent`)

```
┌─────────────────────────────────────┐
│  🔥 Chama Interior                  │
├─────────────────────────────────────┤
│  ┌─ Chama de hoje ───────────────┐  │
│  │ [imagem thumb] ou ícone 🔥     │  │
│  │ Título do spark                │  │
│  │ Snippet...          [Abrir →]  │  │
│  └────────────────────────────────┘  │
│  [+ Nova faísca]                     │
├─────────────────────────────────────┤
│  Filtros: Todos | Favoritos | Áudio │
│  ┌ Spark card ──────────────────┐   │
│  │ título · tags · tipo mídia    │   │
│  └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Detalhe (`MotivationSparkDetailContent`)

Seções empilhadas (scroll):

1. **Hero** — imagem principal ou gradiente com emoji
2. **Título + tags**
3. **Corpo** — markdown renderizado (`Text` com estilos simples; sem WebView na v1)
4. **Galeria** — reutilizar padrão `JournalEntryImageGallery`
5. **Player** — reutilizar `JournalVoicePlayer` / `expo-audio`
6. **Links** — cards tocáveis → `WebBrowser.openBrowserAsync`
7. **Ações** — Editar, Favoritar, Arquivar, Excluir

### Formulário (`MotivationSparkFormModal`)

- `react-hook-form` + `zod` (padrão do app)
- Seções colapsáveis: Texto | Imagens | Áudio | Links
- Preview ao vivo da “notificação”
- Validação: pelo menos **título** + **um** conteúdo (body, imagem, áudio ou link)

### Home — `HomeMotivationSparkCard`

- Posição sugerida: abaixo de `HomeDoNowCard`, acima do streak
- Estados:
  - **Com chama:** preview + CTA “Ver chama”
  - **Sem sparks:** CTA “Crie sua primeira faísca”
  - **Desligado:** ocultar card

### Empty states (copy sugerido)


| Contexto            | Título               | Subtítulo                                   |
| ------------------- | -------------------- | ------------------------------------------- |
| Lista vazia         | Nenhuma faísca ainda | Guarde o que te move — foto, áudio ou frase |
| Sem permissão notif | Ative os lembretes   | Para receber sua chama todo dia             |
| Spark só com áudio  | Sua voz importa      | Toque para ouvir                            |


### Acessibilidade

- Player com `accessibilityLabel` descritivo
- Imagens com `alt` derivado do título
- Botões ≥ 44pt (padrão `touch-target` do app)
- Notificação não depende só de cor/emoji

---

## Navegação e deep links

### Rotas (`src/constants/routes.ts`)

```ts
motivation: {
  hub: '/motivation',
  spark: (id: string) => `/motivation/${id}`,
  create: '/motivation/create',
  settings: '/motivation/settings',
}
```

### Deep links ([DEEP_LINKS.md](./DEEP_LINKS.md))


| Path              | Destino          |
| ----------------- | ---------------- |
| `/motivation`     | Hub              |
| `/motivation/:id` | Detalhe do spark |


Registrar em `use-deep-linking.ts` e documentar em DEEP_LINKS.

### Entrada no app


| Local                        | Ação                                 |
| ---------------------------- | ------------------------------------ |
| Home card                    | `router.push(routes.motivation.hub)` |
| Menu Hub / Profile Explore   | Item “Chama Interior” 🔥             |
| Notificação                  | Deep link direto ao detalhe          |
| Quick action (opcional v1.1) | `HOME_QUICK_ACTIONS`                 |


---

## Integração com sistemas existentes

### GameEvents

```ts
MOTIVATION_SPARK_CREATED;
MOTIVATION_SPARK_UPDATED;
MOTIVATION_SPARK_DELETED;
MOTIVATION_SPARK_OPENED; // usuário abriu chama do dia
MOTIVATION_DAILY_PICKED;
```

Consumidores potenciais:

- `notification-service` → reschedule
- `statistics` (v1.1) → contagem de sparks / dias abertos
- `achievements` (opcional) → “7 dias ouvindo sua chama”

### Estatísticas (v1.1)

Novos contadores em `player_stats` ou tabela dedicada:

- `total_motivation_sparks`
- `motivation_open_streak`
- `total_motivation_opens`

### English Journal — o que reutilizar vs não misturar


| Reutilizar                                | Não misturar              |
| ----------------------------------------- | ------------------------- |
| `journal-image-storage` como **template** | Tabela `journal_entries`  |
| `JournalVoicePlayer` componentizado       | SRS / review do vault     |
| Padrão de form modal                      | Categorias de aprendizado |
| `expo-audio` playback                     | XP de journal             |


---

## Backup e restauração

### Tabelas SQL

Incluir em `BACKUP_TABLE_NAMES` / `backup-tables.ts`:

- `motivation_sparks`
- `motivation_daily_picks`
- `motivation_settings`
- `motivation_collections` (quando existir)

### Arquivos binários

O backup JSON atual é **somente tabelas**. Para imagens/áudios:

**Opção A (recomendada v1):** paths no JSON apontam para `documentDirectory`; no restore, usuário precisa restaurar no **mesmo aparelho** ou aceitar perda de mídia — documentar limitação.

**Opção B (v1.1):** export ZIP com `backup.json` + pasta `motivation-media/` — maior esforço, melhor UX de migração.

### Validação

Estender `backup-validation-service` com schema Zod para sparks.

---

## Privacidade e permissões


| Permissão      | Uso               | Já no app?                 |
| -------------- | ----------------- | -------------------------- |
| Fotos / Câmera | Anexar imagens    | Sim (`expo-image-picker`)  |
| Microfone      | Gravar áudio      | Sim (`expo-audio`)         |
| Notificações   | Lembretes diários | Sim (`expo-notifications`) |


**Copy de permissão** (adicionar em `app.json` plugins):

> “O English Quest precisa acessar suas fotos e microfone para guardar imagens e áudios na sua Chama Interior — conteúdo privado, só no seu aparelho.”

**Privacidade:**

- Zero telemetria do conteúdo dos sparks
- Sem upload para servidor
- Exclusão permanente apaga arquivos do filesystem

---

## Gamificação (opcional)

Manter **leve** — motivação íntima não deve virar grind.


| Ideia                              | Implementar?           |
| ---------------------------------- | ---------------------- |
| XP ao criar primeiro spark         | Sim, one-time (+25 XP) |
| Conquista “7 dias abrindo a chama” | v1.1                   |
| Pet reagindo ao áudio do usuário   | v2                     |
| Loot / moedas por sparks           | **Não**                |


---

## Arquitetura de código

### Estrutura de pastas

```
src/features/motivation-spark/
├── catalogs/
│   └── motivation-empty-states.ts
├── components/
│   ├── MotivationHubScreenContent.tsx
│   ├── MotivationSparkCard.tsx
│   ├── MotivationSparkDetailContent.tsx
│   ├── MotivationSparkFormModal.tsx
│   ├── MotivationDailyHeroCard.tsx
│   ├── MotivationLinkCard.tsx
│   ├── MotivationAudioSection.tsx
│   └── HomeMotivationSparkCard.tsx
├── constants/
│   ├── motivation-ui.ts
│   └── motivation-limits.ts
├── hooks/
│   ├── use-motivation-sparks.ts
│   └── use-daily-motivation-spark.ts
├── services/
│   ├── motivation-spark-service.ts
│   ├── motivation-daily-pick-service.ts
│   ├── motivation-notification-service.ts
│   ├── motivation-image-storage.ts
│   └── motivation-audio-storage.ts
├── store/
│   └── motivation-sparks-store.ts
├── utils/
│   ├── motivation-snippet.ts
│   ├── motivation-rotation.ts
│   └── motivation-mappers.ts
└── index.ts

src/app/motivation/
├── _layout.tsx
├── index.tsx
├── create.tsx
├── settings.tsx
└── [id]/
    ├── index.tsx
    └── edit.tsx

src/storage/repositories/
├── motivation-spark-repository.ts
├── motivation-daily-pick-repository.ts
└── motivation-settings-repository.ts
```

### Camadas

```
UI (components)
  → hooks / store (Zustand hydrate)
    → services (regras de negócio)
      → repositories (Drizzle/SQLite)
        → filesystem (mídia)
```

### Dependências novas


| Pacote                   | Necessário?                               |
| ------------------------ | ----------------------------------------- |
| `expo-document-picker`   | Já instalado — importar áudio             |
| `expo-image-manipulator` | Opcional — compressão                     |
| Markdown renderer        | Avaliar lib leve ou parser mínimo próprio |


---

## Fases de implementação

### Fase 0 — Fundação (2–3 dias)

- [x] Migration: tabelas `motivation_sparks`, `motivation_daily_picks`, `motivation_settings`
- [x] Coluna `motivation_spark` em `notification_settings`
- [x] Types + repository + mappers
- [x] `MotivationSparkService` CRUD básico (só texto)
- [x] Rotas vazias com layout

### Fase 1 — MVP multimídia (4–5 dias)

- [x] Image storage + picker UI
- [x] Audio storage + recorder UI (copiar padrão journal)
- [x] Links JSON + `WebBrowser`
- [x] Tela hub (lista) + detalhe + form
- [x] Testes unitários: `motivation-rotation.ts`, `motivation-snippet.ts`

### Fase 2 — Notificações + Home (2–3 dias)

- [x] `MotivationDailyPickService`
- [x] `MotivationNotificationService` + sync
- [x] `NotificationCategory.MOTIVATION_SPARK`
- [x] `HomeMotivationSparkCard`
- [x] Deep links + listener de abertura (`opened_at`)
- [x] Testes: scheduling idempotente

### Fase 3 — Polish e integração (2 dias)

- [ ] Entrada no Menu Hub / Profile
- [ ] Tela de settings da feature
- [ ] Backup tables
- [ ] Empty states + microcopy ([MICROCOPY.md](./MICROCOPY.md))
- [ ] Documentar em FEATURES.md e DEEP_LINKS.md

### Fase 4 — v1.1 (backlog)

- [ ] Coleções, busca, segunda notificação
- [ ] Rich notifications com imagem
- [ ] Widget Android
- [ ] Conquistas leves
- [ ] Backup ZIP com mídia

---

## Critérios de aceite

### MVP

1. Usuário cria spark com texto + imagem + áudio + link no mesmo registro
2. Sparks persistem após fechar e reabrir o app
3. Às 7h (ou horário configurado) chega notificação com título e snippet do spark do dia
4. Toque na notificação abre o detalhe correto
5. Home mostra card com o mesmo spark do dia
6. Desligar `motivationSpark` nas configs cancela notificações da feature
7. Excluir spark remove arquivos de mídia do disco
8. Backup JSON inclui tabelas de motivation

### Qualidade

- Sem regressão no agendamento de journal/routines
- Lista com 100+ sparks scrolla fluida (`FlashList`)
- Player de áudio funciona em background breve (padrão expo-audio)
- Android + iOS testados em dispositivo físico

---

## Métricas de sucesso


| Métrica                           | Meta (30 dias pós-launch) |
| --------------------------------- | ------------------------- |
| % usuários com ≥1 spark           | > 40% dos ativos          |
| Taxa de abertura da notificação   | > 25%                     |
| Média de sparks por usuário ativo | ≥ 3                       |
| Dias consecutivos abrindo chama   | mediana ≥ 2               |
| Crash-free ao anexar mídia        | > 99.5%                   |


*Medir via eventos locais agregados em estatísticas — sem enviar conteúdo.*

---

## Riscos e mitigações


| Risco                             | Impacto | Mitigação                                        |
| --------------------------------- | ------- | ------------------------------------------------ |
| Notificação sem imagem no iOS     | Médio   | Texto forte + abrir app para mídia               |
| Backup sem mídia confunde usuário | Alto    | Aviso explícito no export; ZIP na v1.1           |
| Muitos sparks degradam rotação    | Baixo   | `avoid_repeat_days` + pesos                      |
| Áudio grande ocupa disco          | Médio   | Limite 3 min + compressão                        |
| Confusão com English Vault        | Médio   | Naming “Chama Interior”, ícone 🔥, copy distinta |
| Reagendamento excessivo de notifs | Médio   | Idempotência por `date_key`                      |


---

## Decisões em aberto


| #   | Pergunta                              | Opções                                            | Recomendação                        |
| --- | ------------------------------------- | ------------------------------------------------- | ----------------------------------- |
| D1  | Nome final na UI                      | Chama Interior / Cofre de Motivação / Spark Board | **Chama Interior**                  |
| D2  | Markdown completo ou subset?          | Subset v1 (bold, italic, list, quote)             | Subset                              |
| D3  | Transcrição automática de áudio?      | Sim v1 / v1.1                                     | **v1.1**                            |
| D4  | Tab dedicada ou só hub via menu?      | Tab vs entrada no Knowledge                       | **Menu + Home card** (sem nova tab) |
| D5  | Cancelar motivação se `studiedToday`? | Sim / Não                                         | **Não** — motivação é independente  |
| D6  | Idioma do conteúdo                    | Livre (PT/EN)                                     | Livre — feature pessoal             |


---

## Próximo passo imediato

1. Validar nome **Chama Interior** e escopo MVP com você
2. Implementar **Fase 0** (schema + repository + rotas)
3. Prototipar form com uma imagem + um áudio para validar UX antes das notificações

---

*Documento criado em 2026-06-08. Atualizar este arquivo conforme decisões forem fechadas.*