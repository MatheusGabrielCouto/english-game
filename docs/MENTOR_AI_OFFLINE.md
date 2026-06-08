# English Quest — Sistema de Mentor IA Offline

Especificação do **Mentor IA**: professor particular de inglês integrado ao jogo — não um chatbot genérico, mas um personagem que conhece a jornada do jogador e orienta estudo, correção, prática e evolução **100% offline**.

> **Relacionados:** [`ENGLISH_LEARNING_ROADMAP.md`](./ENGLISH_LEARNING_ROADMAP.md), [`FEATURES.md`](./FEATURES.md), [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) (Fase 28+), [`BATTLE_AND_FLASHCARD_SYSTEMS.md`](./BATTLE_AND_FLASHCARD_SYSTEMS.md), [`INVISIBLE_LEARNING_SYSTEMS.md`](./INVISIBLE_LEARNING_SYSTEMS.md), [`PET_SYSTEM.md`](./PET_SYSTEM.md), `src/features/learning-gps/`

---

## Índice

1. [Visão geral](#visão-geral)
2. [Conceito e personagem](#conceito-e-personagem)
3. [Objetivos por habilidade](#objetivos-por-habilidade)
4. [Filosofia pedagógica](#filosofia-pedagógica)
5. [Modos do Mentor](#modos-do-mentor)
6. [Arquitetura técnica](#arquitetura-técnica)
7. [AIContextBuilder](#aicontextbuilder)
8. [Fontes de dados (SQLite)](#fontes-de-dados-sqlite)
9. [Modelo local (LLM)](#modelo-local-llm)
10. [Funcionalidades](#funcionalidades)
11. [Sistema de recomendações](#sistema-de-recomendações)
12. [Missões geradas por IA](#missões-geradas-por-ia)
13. [Integração com XP e recompensas](#integração-com-xp-e-recompensas)
14. [Sistema de memória](#sistema-de-memória)
15. [Mentor Dashboard](#mentor-dashboard)
16. [Integração com sistemas existentes](#integração-com-sistemas-existentes)
17. [Schema proposto](#schema-proposto)
18. [Eventos (`GameEvents`)](#eventos-gameevents)
19. [UX e rotas](#ux-e-rotas)
20. [Privacidade e limites offline](#privacidade-e-limites-offline)
21. [Voz (fase futura)](#voz-fase-futura)
22. [Status atual (jun/2026)](#status-atual-jun2026)
23. [Backlog de melhorias](#backlog-de-melhorias)
24. [Ideias de novas features](#ideias-de-novas-features)
25. [Roadmap de implementação](#roadmap-de-implementação)
26. [Critérios de aceite por fase](#critérios-de-aceite-por-fase)
27. [Objetivo final](#objetivo-final)

---

## Visão geral

O Mentor IA acompanha **toda a jornada** do jogador no English Quest. Ele consome o mesmo SQLite que alimenta o GPS de Aprendizado, o Farm, os Duelos, as rotinas e a carreira — e transforma esses dados em orientação personalizada.

O Mentor deve conhecer:

| Dimensão     | Exemplos                                  |
| ------------ | ----------------------------------------- |
| Progresso    | Mundo CEFR, unidade ativa, % do mundo     |
| Dificuldades | Skills abaixo da média, erros recorrentes |
| Metas        | Carreira, contratos, checkpoint mensal    |
| Histórico    | Sessões de estudo, duelos, revisões SRS   |
| Estatísticas | Streak, XP, taxa de vitória em duelos     |
| Missões      | Diárias/semanais do jogo e do GPS         |
| Rotina       | Compromissos fixos (aula, podcast, TOEFL) |

**Princípio:** o Mentor **ensina**, não apenas responde. Toda interação deve gerar aprendizado mensurável quando possível (skill, XP, flashcard, missão).

---

## Conceito e personagem

| Campo                      | Valor                                                                  |
| -------------------------- | ---------------------------------------------------------------------- |
| Nome interno (código)      | `MentorAI` / `mentor-ai`                                               |
| Nomes visuais (candidatos) | **Professor Atlas** · Mentor Global · Captain Fluency · English Master |
| Papel no jogo              | NPC professor — aparece na Home, no GPS e em tela dedicada             |
| Tom padrão                 | Paciente, motivador, direto, focado em progresso                       |

**Decisão recomendada (MVP):** **Professor Atlas** — evoca guia/mapa (alinha ao GPS de aprendizado) sem conflitar com o pet companheiro.

---

## Objetivos por habilidade

### Gramática

- Explicar tempos verbais e regras
- Corrigir erros com explicação estruturada
- Gerar exercícios por tema (Past Simple, Present Perfect, etc.)

### Vocabulário

- Explicar palavras e collocations
- Gerar exemplos em contexto
- Criar listas personalizadas (tema + CEFR do mundo atual)
- Exportar para Baralho Vivo (Fase 3+)

### Reading

- Explicar trechos de texto
- Traduzir com notas pedagógicas (não só tradução literal)
- Resumir artigos do Journal ou Farm

### Listening

- Explicar expressões de transcrições
- Sugerir shadowing e listening técnico alinhado ao mundo (ex.: Developer)

### Speaking

- Simular conversas (turista, coworker, entrevistador)
- Roleplay de reuniões e entrevistas
- Feedback estruturado sobre respostas escritas (proxy até Fase 7 — voz)

### Writing

- Corrigir frases e parágrafos
- Explicar cada erro (gramática, ordem, registro)
- Propor versão melhorada com diff visual

---

## Filosofia pedagógica

1. **Contexto antes da resposta** — o Mentor sempre sabe o nível CEFR e a skill mais fraca antes de responder.
2. **Correção em camadas** — ❌ erro → ✅ correção → 💡 explicação em 1–3 linhas.
3. **Ação seguinte** — toda resposta termina com sugestão concreta (“Pratique 3 frases no Farm”, “Revise o deck X”).
4. **Sem dependência de nuvem** — modelo local; contexto montado no dispositivo.
5. **Gamificação opcional** — XP/moedas por sessões válidas, não por cada mensagem (anti-farming).

---

## Modos do Mentor

| Modo                   | Foco                     | Exemplo                                                                              |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| **Professor** (padrão) | Ensino estruturado       | “Present Perfect liga passado ao presente. Veja: I **have lived** here for 5 years.” |
| **Coach**              | Consistência e motivação | “85 dias de streak. Uma sessão de 10 min mantém o ritmo.”                            |
| **Avaliador**          | Testes e diagnóstico     | Mini-prova por skill → score estimado + plano de 7 dias                              |

O modo pode ser escolhido pelo usuário ou sugerido automaticamente (ex.: streak em risco → Coach; checkpoint mensal → Avaliador).

---

## Arquitetura técnica

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  MentorDashboard · MentorChat · CorrectionSheet · Roleplay   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   MentorAIService                            │
│  chat · correct · generateExercise · generateFlashcards      │
│  recommend · createMission · awardSession                    │
└──────────┬───────────────────────────────┬────────────────┘
           │                               │
┌──────────▼──────────┐       ┌──────────▼──────────────────┐
│  AIContextBuilder     │       │  MentorMemoryService        │
│  (snapshot do jogador)│       │  goals · prefs · error log  │
└──────────┬────────────┘       └──────────┬──────────────────┘
           │                               │
┌──────────▼──────────────────────────────▼──────────────────┐
│              Repositories (SQLite / Drizzle)                  │
│  learning-gps · skills · routines · quests · duel · flash     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              LocalLLMRuntime (nativo / WASM)                   │
│  Qwen 2.5 1.5B Instruct (recomendado)                         │
└───────────────────────────────────────────────────────────────┘
```

### Módulos propostos (`src/features/mentor-ai/`)

| Módulo                                      | Responsabilidade                |
| ------------------------------------------- | ------------------------------- |
| `services/ai-context-builder.ts`            | Monta JSON de contexto          |
| `services/mentor-ai-service.ts`             | Orquestra prompts e respostas   |
| `services/mentor-history-service.ts`        | Histórico, memória, CRUD local  |
| `services/mentor-settings-service.ts`       | Stats, retry do modelo, limpeza |
| `services/mentor-recommendation-service.ts` | Gaps + plano de ação            |
| `services/local-llm-runtime.ts`             | Bridge para modelo on-device    |
| `prompts/`                                  | System prompts por modo e skill |
| `components/`                               | Chat, Dashboard, Correction UI  |
| `store/mentor-ai-store.ts`                  | Sessão de chat, loading, erros  |

---

## AIContextBuilder

Serviço central que monta o payload enviado ao modelo a cada requisição.

### Contrato TypeScript (proposto)

```typescript
type MentorAIContext = {
  generatedAt: string;
  player: {
    level: number;
    streak: number;
    coins: number;
    studyPoints: number;
  };
  skills: {
    vocabulary: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
    grammar: number;
    weakest: LearningSkillKeyValue;
    strongest: LearningSkillKeyValue;
  };
  learningGps: {
    currentWorld: string;
    worldCefr: string;
    worldProgress: number;
    activeUnitTitle: string | null;
    curriculumCompleted: number;
    curriculumTotal: number;
    prioritySkills: string[];
    weeklyFocus: string | null;
  };
  activity: {
    duelWinRate: number;
    flashReviewsToday: number;
    farmMinutesToday: number;
    routinesDueToday: number;
    routinesCompletedToday: number;
  };
  career: {
    englishScore: number | null;
    activeContract: string | null;
  };
  memory: {
    goals: string[];
    preferences: string[];
    frequentErrors: string[];
    recentTopics: string[];
  };
  mode: "professor" | "coach" | "evaluator";
  locale: "pt-BR"; // explicações em português; exemplos em inglês
};
```

### Exemplo JSON (ilustrativo)

```json
{
  "player": { "level": 42, "streak": 85 },
  "skills": {
    "vocabulary": 78,
    "reading": 74,
    "listening": 41,
    "speaking": 33,
    "writing": 52,
    "grammar": 61,
    "weakest": "speaking",
    "strongest": "vocabulary"
  },
  "learningGps": {
    "currentWorld": "developer",
    "worldCefr": "B2",
    "activeUnitTitle": "Reading: documentação"
  },
  "career": {
    "activeContract": "Frontend Interview"
  }
}
```

### Regras do builder

1. **Nunca** enviar PII além do necessário (sem e-mail, sem nome real obrigatório).
2. Truncar histórico de chat às últimas N mensagens (ex.: 12).
3. Injetar `frequentErrors` e `recentTopics` da memória local.
4. Reutilizar `LearningIntelligenceService` / `detectSkillWeaknesses` — não duplicar lógica do GPS.

---

## Fontes de dados (SQLite)

| Tabela / serviço                              | Dados para o contexto     |
| --------------------------------------------- | ------------------------- |
| `player_learning_profile` + `learning_worlds` | Mundo CEFR, progresso     |
| `skill_levels`                                | 6 skills 0–100            |
| `learning_unit_progress`                      | Unidade ativa, checkpoint |
| `learning_daily_plans`                        | Blocos do dia             |
| `learning_monthly_reports`                    | Metas e fraquezas do mês  |
| `user_routines` + completions                 | Rotinas e consistência    |
| `duel_player_profile` + sessions              | Win rate, patentes        |
| `flash_*`                                     | Revisões, cartas salvas   |
| `player` (XP store)                           | Level, streak, coins      |
| `contracts`                                   | Contrato ativo            |
| `career` / `englishScore`                     | Meta profissional         |
| `mentor_memory` (novo)                        | Objetivos, prefs, erros   |
| `mentor_chat_sessions` (novo)                 | Histórico de conversas    |

---

## Modelo local (LLM)

### Recomendado

| Modelo                     | Tamanho | Notas                                             |
| -------------------------- | ------- | ------------------------------------------------- |
| **Qwen 2.5 1.5B Instruct** | ~1.5B   | Melhor equilíbrio qualidade/performance em mobile |

### Alternativas

| Modelo     | Tamanho | Notas                                |
| ---------- | ------- | ------------------------------------ |
| Gemma 3 1B | ~1B     | Mais leve; bom para correção simples |
| Phi-3 Mini | ~3.8B   | Melhor raciocínio; mais pesado       |
| SmolLM2    | ~1.7B   | Rápido; vocabulário limitado         |

### Requisitos técnicos

- Quantização **Q4_K_M** ou equivalente para iOS/Android mid-range
- Inferência via módulo nativo (Expo native module) ou `llama.cpp` / MLX (iOS)
- Timeout por resposta: 30–60s; streaming opcional na UI
- Fallback: templates offline quando modelo não carregado (“Baixe o pacote do Mentor nas configurações”)

### System prompt (esqueleto)

```
You are Professor Atlas, the English Quest mentor.
- Explain in Brazilian Portuguese; examples in English.
- Player CEFR: {worldCefr}. Weakest skill: {weakest}.
- Always teach: correction + short explanation + one practice tip.
- Never invent player stats; use only the JSON context provided.
```

---

## Funcionalidades

### 1. Chat livre

Perguntas abertas em inglês ou português.

| Entrada do usuário       | Comportamento esperado                          |
| ------------------------ | ----------------------------------------------- |
| Explain Present Perfect  | Explicação + 2 exemplos + mini quiz             |
| What does although mean? | Definição + collocations + frase do mundo atual |
| Correct this sentence: … | Fluxo de correção (Fase 2)                      |

### 2. Correção de frases

**Entrada:**

```
I have 30 years old
```

**Saída (formato fixo):**

```
❌ I have 30 years old
✅ I am 30 years old
💡 In English we use "to be" for age, not "have".
```

Parser de resposta: regex + blocos estruturados para UI rica (diff, copiar correção).

### 3. Geração de exercícios

Pedido: `Create exercises about Past Simple`

Saída estruturada (JSON):

```json
{
  "topic": "past_simple",
  "questions": [
    {
      "prompt": "She ___ (go) to the store yesterday.",
      "options": ["go", "went", "gone", "going"],
      "correctIndex": 1,
      "explanation": "Past Simple of 'go' is irregular: went."
    }
  ]
}
```

Integração futura: importar para Duelos ou sessão rápida no Mentor.

### 4. Geração de flashcards

Pedido: `Create 20 flashcards about travel`

```json
{
  "cards": [
    {
      "front": "boarding pass",
      "back": "cartão de embarque",
      "example": "Don't forget your boarding pass at security."
    }
  ]
}
```

Ação na UI: **Salvar no Baralho** (deck novo ou existente).

### 5. Simulação de conversação

Modo **Conversation Practice** — roles:

| Papel       | Cenário               |
| ----------- | --------------------- |
| Interviewer | Entrevista de emprego |
| Tourist     | Pedir informações     |
| Coworker    | Daily standup         |
| Client      | Requisito de produto  |
| Teacher     | Aula de gramática     |

Turnos alternados; Mentor avalia última resposta do usuário antes do próximo turno.

### 6. Simulação de entrevista

Tracks alinhadas à carreira:

- Frontend · Backend · Mobile · DevOps · Fullstack

Perguntas progressivas; feedback por competência (clareza, vocabulário técnico, gramática).

---

## Sistema de recomendações

Analisa skills e atividade recente (mesma regra 70% do GPS).

**Exemplo de entrada:**

```json
{ "vocabulary": 80, "reading": 75, "listening": 40, "speaking": 30 }
```

**Saída do Mentor:**

> Seu Speaking e Listening estão muito abaixo das outras habilidades.

**Plano sugerido:**

1. 2 exercícios de speaking (roleplay 5 min)
2. 1 sessão de shadowing (Farm listening)
3. 1 listening técnico (podcast dev)

Exibir no **Mentor Dashboard** e como card opcional na Home / GPS (aba Insights).

---

## Missões geradas por IA

Missões **de estudo** (distintas de missões de XP genéricas). Persistidas em `mentor_generated_missions`.

| Tipo       | Exemplo                                     |
| ---------- | ------------------------------------------- |
| Speaking   | Use Present Perfect 5 vezes hoje            |
| Vocabulary | Aprenda 15 palavras sobre APIs              |
| Writing    | Escreva um texto de 100 palavras no Journal |
| Grammar    | Complete 3 duelos de Past Simple            |
| Listening  | 10 min de listening técnico                 |

### Ciclo

1. Mentor propõe missão (contexto + memória)
2. Usuário aceita → aparece no GPS / Play
3. Conclusão validada por evidência (Farm, duelo, journal) ou auto-relato + quiz
4. Recompensa: XP, coins, study points (tabela abaixo)

---

## Integração com XP e recompensas

| Ação                                 | Recompensa sugerida | Anti-abuse  |
| ------------------------------------ | ------------------- | ----------- |
| Sessão de chat ≥ 5 min úteis         | +10 XP              | 1x/dia      |
| Correção aplicada (usuário confirma) | +5 XP               | máx. 10/dia |
| Exercício gerado completado          | +15 XP              | por sessão  |
| Roleplay concluído (≥ 6 turnos)      | +25 XP              | 1x/dia      |
| Flashcards salvos (≥ 5)              | +10 XP              | 1x/dia      |

Emitir `MENTOR_SESSION_COMPLETED` via `GameEvents` para integração com pet, conquistas e cidade.

---

## Sistema de memória

Persistência local em `mentor_memory` (chave-valor tipado) + `mentor_error_log`.

### Objetivos (goals)

- Conseguir vaga internacional
- Melhorar speaking para reuniões
- Passar em entrevista frontend

Captura (alvo): onboarding do Mentor + extração automática de frases do chat (“quero trabalhar no exterior”).

**Implementado hoje:** edição manual em `/mentor/history` (aba Memória). Temas do chat são salvos automaticamente após cada resposta (`topic_*`).

### Preferências (preferences)

- Frontend, React, mobile, cloud, etc.
- Tom do Mentor (mais formal / mais casual)

### Histórico

| Tipo                   | Uso                             |
| ---------------------- | ------------------------------- |
| Erros frequentes       | Priorizar correção e exercícios |
| Temas estudados        | Evitar repetição; spaced recall |
| Entrevistas realizadas | Progressão de dificuldade       |

**Janela:** manter últimos 90 dias; agregar erros por categoria gramatical.

---

## Mentor Dashboard

Nova tela: `/mentor` ou `/mentor/dashboard`

### Seções

| Seção                | Conteúdo                                                     |
| -------------------- | ------------------------------------------------------------ |
| Resumo               | Avatar Professor Atlas + saudação contextual                 |
| Skills               | Skill mais forte / mais fraca (visual)                       |
| Próxima recomendação | 1 card acionável                                             |
| Meta da semana       | Alinhada ao GPS semanal                                      |
| Meta do mês          | Do `learning_monthly_reports`                                |
| Último feedback      | Trecho da última correção ou sessão                          |
| Atalhos              | Chat · Corrigir · Exercícios · Roleplay · Histórico · Config |

### Entrada na Home

Card compacto (estilo GPS Home) → Dashboard ou Chat direto.

---

## Integração com sistemas existentes

| Sistema                  | Integração                                                |
| ------------------------ | --------------------------------------------------------- |
| **Learning GPS**         | Contexto, fraquezas, unidade ativa, missões sugeridas     |
| **Farm**                 | Evidência de vocabulary/reading/listening/speaking        |
| **Duelos**               | Grammar drills; import de exercícios gerados              |
| **Baralho Vivo**         | Import de flashcards gerados                              |
| **English Journal**      | Writing missions; análise de entradas                     |
| **Rotinas**              | Coach mode; lembretes alinhados                           |
| **Contratos / Carreira** | Entrevistas e vocabulário técnico                         |
| **Pet**                  | Celebra sessão do Mentor (não duplicar diálogo IA do pet) |
| **Chama Interior**       | Motivação emocional separada; Mentor foca pedagogia       |
| **Conquistas**           | “10 sessões com o Atlas”, “Primeira entrevista simulada”  |

**Separação clara:** Pet = companheiro emocional offline (diálogos catalogados). **Mentor = professor IA (LLM local).**

---

## Schema proposto

### `mentor_memory`

| Coluna       | Tipo    | Descrição                    |
| ------------ | ------- | ---------------------------- |
| `key`        | text PK | `goal_1`, `pref_stack`, etc. |
| `value_json` | text    | Payload                      |
| `updated_at` | text    | ISO                          |

### `mentor_chat_sessions`

| Coluna          | Tipo    | Descrição                     |
| --------------- | ------- | ----------------------------- |
| `id`            | text PK |                               |
| `mode`          | text    | professor / coach / evaluator |
| `title`         | text    | Resumo automático             |
| `messages_json` | text    | Array de mensagens            |
| `created_at`    | text    |                               |
| `updated_at`    | text    |                               |

### `mentor_generated_missions`

| Coluna          | Tipo    | Descrição                                |
| --------------- | ------- | ---------------------------------------- |
| `id`            | text PK |                                          |
| `skill_key`     | text    |                                          |
| `title`         | text    |                                          |
| `description`   | text    |                                          |
| `status`        | text    | pending / active / completed / dismissed |
| `evidence_type` | text    | farm / duel / journal / manual           |
| `xp_reward`     | integer |                                          |
| `created_at`    | text    |                                          |
| `completed_at`  | text    | null                                     |

### `mentor_error_log`

| Coluna        | Tipo    | Descrição                       |
| ------------- | ------- | ------------------------------- |
| `id`          | text PK |                                 |
| `category`    | text    | grammar_tense, vocabulary, etc. |
| `original`    | text    |                                 |
| `corrected`   | text    |                                 |
| `occurred_at` | text    |                                 |

Migration sugerida: `0047_mentor_ai_foundation.sql` (Fase 28).

---

## Eventos (`GameEvents`)

| Evento                      | Quando                     |
| --------------------------- | -------------------------- |
| `MENTOR_CHAT_STARTED`       | Nova sessão                |
| `MENTOR_CORRECTION_APPLIED` | Usuário aceita correção    |
| `MENTOR_EXERCISE_COMPLETED` | Quiz gerado finalizado     |
| `MENTOR_ROLEPLAY_COMPLETED` | Simulação encerrada        |
| `MENTOR_MISSION_ACCEPTED`   | Missão IA aceita           |
| `MENTOR_MISSION_COMPLETED`  | Evidência validada         |
| `MENTOR_SESSION_COMPLETED`  | Sessão válida (recompensa) |

---

## UX e rotas

| Rota               | Tela                                          | Status |
| ------------------ | --------------------------------------------- | ------ |
| `/mentor`          | Mentor Dashboard                              | ✅     |
| `/mentor/chat`     | Chat livre                                    | ✅     |
| `/mentor/correct`  | Correção de frase                             | ✅     |
| `/mentor/exercise` | Exercícios MCQ + flashcards                   | ✅     |
| `/mentor/roleplay` | Conversação / entrevista                      | ✅     |
| `/mentor/history`  | Histórico e memória (conversas, erros, prefs) | ✅     |
| `/mentor/settings` | Modelo, motor, privacidade, retry             | ✅     |

Deep links: ver [`DEEP_LINKS.md`](./DEEP_LINKS.md) (adicionar `mentor`, `mentor/chat`).

### Princípios UX

1. **Uma ação principal por tela** — Dashboard → Chat ou Correção
2. **Respostas estruturadas** — não parede de texto; blocos ❌✅💡
3. **Loading honesto** — “Atlas está pensando…” + cancelar
4. **Offline-first** — badge “100% no seu dispositivo”
5. **Acessibilidade** — mensagens com `accessibilityLabel`; contraste nos diffs

---

## Privacidade e limites offline

- Nenhum dado de chat enviado a servidor no MVP
- Modelo e pesos baixados sob demanda (Wi‑Fi); armazenados em sandbox do app
- Usuário pode apagar histórico e memória em **Configurações** ou gerenciar item a item em **Histórico e memória**
- Crianças / conteúdo: system prompt bloqueia temas fora de educação e roleplay profissional

---

## Voz (fase futura)

Fluxo alvo (Fase 7):

```
Usuário fala
    ↓
Speech-to-Text local (Whisper tiny / platform STT)
    ↓
LLM processa + contexto
    ↓
Resposta texto + TTS local
    ↓
Feedback de pronúncia (futuro: phoneme score)
```

Dependências: módulo nativo de áudio, permissão microfone, modo foco.

---

## Status atual (jun/2026)

Resumo do que já está no app vs. o que ainda é especificação.

### Entregue ✅

| Área              | O que funciona                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------- |
| **Fundação**      | Schema `mentor_*`, `AIContextBuilder`, `LocalLLMRuntime` (nativo + motor pedagógico fallback) |
| **Dashboard**     | Hero com nível/streak/GPS, skills extremas, recomendação, metas GPS, atalhos                  |
| **Chat**          | Sessões persistentes, streaming, sugestões, nova conversa, contexto do jogador                |
| **Correção**      | Fluxo ❌✅💡, parser estruturado, `mentor_error_log`, compartilhar resultado                  |
| **Exercícios**    | MCQ gerado por tema, sessão inline, feedback pós-quiz (onde errou + o que melhorar)           |
| **Flashcards**    | Preview, estudo flip, export para Baralho Vivo                                                |
| **Roleplay**      | 5 papéis de conversação + 5 trilhas de entrevista, feedback por competência                   |
| **Histórico**     | `/mentor/history` — conversas, correções, memória (objetivos, prefs, temas)                   |
| **Configurações** | Status do motor Qwen, retry de carga, stats locais, limpeza de dados                          |
| **Modelo**        | Qwen 2.5 1.5B Instruct Q4 embutido no APK release (~1 GB) via `llama.rn`                      |

### Parcial ⚠️

| Área            | Lacuna                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| **LLM nativo**  | Em alguns dispositivos o `initLlama` falha (`failed to load model`) — app cai no motor pedagógico |
| **Memória**     | Objetivos/preferências só por entrada manual; sem onboarding nem extração automática do chat      |
| **Modos**       | Apenas modo **Professor** na prática; Coach e Avaliador existem no tipo, sem UI                   |
| **Roleplay**    | Sessões não aparecem no histórico; sem progressão de dificuldade entre simulações                 |
| **Recompensas** | Eventos emitidos, mas integração fraca com conquistas, pet e cidade                               |
| **Missões IA**  | Tabela e fluxo ainda não implementados (Fase 32)                                                  |

### Não iniciado 🔲

- `mentor_generated_missions` + aceitar/dispensar no GPS/Play
- Voz (STT/TTS) — Fase 34
- Import de exercícios gerados para Duelos
- Análise de entradas do English Journal
- iOS com LLM nativo (hoje foco Android APK release)

---

## Backlog de melhorias

Melhorias no **Mentor já existente** — ordenadas por impacto vs. esforço.

### P0 — Estabilidade e confiança

| #   | Melhoria                                           | Por quê                                                                                                              |
| --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | **Diagnosticar e corrigir `failed to load model`** | Sem LLM nativo o Atlas perde qualidade; verificar OOM, `n_ctx`, tamanho do GGUF após cópia do APK, logs no bootstrap |
| 2   | **Indicador claro LLM vs. pedagógico**             | Usuário precisa saber quando está no fallback; badge persistente no chat/correção/roleplay                           |
| 3   | **Retry inteligente**                              | Segunda tentativa com `n_ctx` menor ou modelo lazy-load após splash                                                  |
| 4   | **Validar integridade do GGUF**                    | Checksum ou tamanho esperado antes de `initLlama`; mensagem acionável na UI                                          |

### P1 — Pedagogia e personalização

| #   | Melhoria                                     | Por quê                                                                                                     |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 5   | **Extração automática de objetivos no chat** | Regex/LLM leve: “quero trabalhar no exterior” → `goal_*` sem formulário manual                              |
| 6   | **Exercícios a partir de erros frequentes**  | Botão “Praticar meus erros” na aba Correções → gera quiz focado nas categorias do `mentor_error_log`        |
| 7   | **Recomendação usa memória**                 | Dashboard já lê goals/prefs no contexto; surface explícita: “Atlas lembra que você quer vaga internacional” |
| 8   | **Feedback pós-roleplay no dashboard**       | `lastFeedback` hoje prioriza correção/chat; incluir resumo da última simulação                              |
| 9   | **Spaced recall de temas**                   | `topic_*` com data → sugerir revisão de temas não vistos há 7+ dias                                         |
| 10  | **Limpeza automática 90 dias**               | Job local para podar `mentor_error_log` e sessões antigas (configurável)                                    |

### P2 — UX e fluxo

| #   | Melhoria                           | Por quê                                                                                             |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| 11  | **Onboarding do Atlas (3 passos)** | Metas + preferências + tom na primeira visita; alimenta memória de cara                             |
| 12  | **Histórico de roleplay**          | Persistir sessões de simulação como `mentor_chat_sessions` com `mode: evaluator` ou tabela dedicada |
| 13  | **Busca no histórico**             | Filtrar conversas e correções por texto/tema                                                        |
| 14  | **Deep links**                     | `mentor/chat`, `mentor/correct`, `mentor/exercise?topic=Past+Simple`                                |
| 15  | **Atalho “Corrigir” no chat**      | Detectar frase em inglês na mensagem → abrir correção pré-preenchida                                |
| 16  | **Continuar de onde parou**        | Card no dashboard: “Última conversa: Present Perfect”                                               |
| 17  | **Modo Coach na UI**               | Tom motivacional, foco em streak/rotinas; ativável no dashboard ou quando streak &lt; 3 dias        |
| 18  | **Modo Avaliador na UI**           | Mini-diagnóstico por skill (5 perguntas) → score + plano 7 dias                                     |

### P3 — Integração com o jogo

| #   | Melhoria                      | Por quê                                                                   |
| --- | ----------------------------- | ------------------------------------------------------------------------- |
| 19  | **Conquistas do Atlas**       | “10 sessões”, “Primeira entrevista”, “50 correções” — eventos já existem  |
| 20  | **Pet celebra sessão**        | `MENTOR_SESSION_COMPLETED` → reação do pet / loot leve                    |
| 21  | **Cidade viva**               | NPC ou mural reage a marcos do Mentor (ex.: primeira entrevista simulada) |
| 22  | **GPS Insights card**         | Recomendação do Atlas espelhada em `/learning-insights`                   |
| 23  | **Contrato ativo → roleplay** | Abrir entrevista já filtrada pela trilha do contrato (Frontend, etc.)     |
| 24  | **Unidade GPS ativa → chat**  | Botão “Perguntar ao Atlas sobre esta unidade” na tela do mundo            |

### P4 — Qualidade técnica

| #   | Melhoria                           | Por quê                                                                             |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| 25  | **`MentorMemoryService` dedicado** | Hoje lógica espalhada em history/chat/context; centralizar goals, prefs, erros, TTL |
| 26  | **Testes E2E do parser**           | Ampliar dataset de correção/exercício/roleplay feedback (≥ 50 casos)                |
| 27  | **Métricas locais anônimas**       | Tempo de inferência, taxa de fallback, erros de carga — só SQLite, para debug       |
| 28  | **Modelo alternativo leve**        | Gemma 1B ou Q4 menor para devices 4 GB RAM — escolha nas configurações              |
| 29  | **Streaming mais fluido**          | Buffer de tokens, cancelamento mais rápido, skeleton por bloco ❌✅💡               |

---

## Ideias de novas features

Features **novas** (além de polir o existente) — agrupadas por tema.

### Missões e plano de estudo (Fase 32+)

| Ideia                         | Descrição                                                             | Integração                              |
| ----------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| **Missão do dia do Atlas**    | 1–3 missões geradas por gaps de skill + memória                       | GPS / Play, `mentor_generated_missions` |
| **Plano semanal co-criado**   | Usuário aceita plano de 7 dias (speaking ×3, listening ×2…)           | `learning_daily_plans`                  |
| **Evidência automática**      | Missão “3 duelos de gramática” valida via `GameEvents`                | Duelos, Farm, Journal                   |
| **Missão escrita no Journal** | “Escreva 100 palavras sobre sua semana” → análise do Atlas na entrada | English Journal                         |

### Prática imersiva

| Ideia                    | Descrição                                                                       | Integração          |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------- |
| **Shadowing guiado**     | Atlas sugere frase do Farm/podcast; usuário repete (texto primeiro, voz depois) | Farm transcripts    |
| **Debate estruturado**   | Papel fixo “devil’s advocate” — argumentar contra uma tese em inglês            | Roleplay engine     |
| **Entrevista em níveis** | Junior → mid → senior na mesma trilha; desbloqueio por score                    | Carreira, contratos |
| **Simulação de standup** | 3 perguntas rápidas (yesterday / today / blockers) com timer                    | Rotinas, Coach mode |
| **Pair programming EN**  | Cenário: explicar bug em inglês para coworker virtual                           | Mundo Developer     |

### Conteúdo gerado e exportação

| Ideia                       | Descrição                                                           | Integração                |
| --------------------------- | ------------------------------------------------------------------- | ------------------------- |
| **Import quiz para Duelos** | Exercício MCQ gerado vira duelo custom offline                      | `duel-questions` pipeline |
| **Deck “Erros meus”**       | Flashcards automáticos a partir de `mentor_error_log`               | Baralho Vivo              |
| **Cheat sheet PDF/share**   | Resumo de um tema (Present Perfect) exportável                      | Share sheet               |
| **Análise de Journal**      | Colar ou selecionar entrada → feedback de writing + CEFR estimado   | Vault                     |
| **Tradução pedagógica**     | Modo “explique este parágrafo” com notas de registro e collocations | Reading skill             |

### Diagnóstico e progresso

| Ideia                              | Descrição                                                     | Integração         |
| ---------------------------------- | ------------------------------------------------------------- | ------------------ |
| **Relatório semanal do Atlas**     | 1 página: erros, temas, tempo de prática, próximo foco        | Notificação local  |
| **Gráfico de erros por categoria** | Evolução grammar_tense vs. vocabulary no histórico            | Statistics         |
| **Speaking proxy score**           | Score de roleplay agregado ao longo do tempo (skill speaking) | `skill_levels`     |
| **Checkpoint mensal com Atlas**    | Modo Avaliador alinhado ao `learning_monthly_reports`         | GPS mensal         |
| **Comparar versões**               | Usuário reescreve mesma frase após 30 dias — diff de evolução | Memória + correção |

### Voz e multimodal (Fase 34+)

| Ideia                    | Descrição                                                | Integração                |
| ------------------------ | -------------------------------------------------------- | ------------------------- |
| **Falar com o Atlas**    | STT local → chat; TTS para resposta                      | `llama.rn` + Whisper tiny |
| **Pronúncia básica**     | Comparar transcript esperado vs. falado (palavras-chave) | Speaking                  |
| **Modo mãos livres**     | Praticar no trânsito: pergunta/resposta só áudio         | Modo foco                 |
| **Ditado para correção** | Falar frase errada → fluxo ❌✅💡                        | Correção                  |

### Social e motivação (sem nuvem)

| Ideia                 | Descrição                                               | Integração                    |
| --------------------- | ------------------------------------------------------- | ----------------------------- |
| **Carta do Atlas**    | Mensagem motivacional semanal baseada em streak e metas | Chama Interior (tom distinto) |
| **Mural de vitórias** | Timeline local: “Primeira entrevista”, “100 correções”  | Memory Wall / Cidade          |
| **Desafio do Atlas**  | Desafio semanal opcional com badge cosmético            | Conquistas, títulos           |

### Priorização sugerida (próximos 3 ciclos)

```
Ciclo A (confiança):  P0 itens 1–4 + onboarding (P2 #11)
Ciclo B (pedagogia):  Fase 32 missões + erros → exercícios (P1 #6) + Coach mode (P2 #17)
Ciclo C (imersão):    Roleplay no histórico + contrato→entrevista + Journal writing
```

---

## Roadmap de implementação

Alinhado ao [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

| Fase   | Escopo      | Entregável principal                                                | Status       |
| ------ | ----------- | ------------------------------------------------------------------- | ------------ |
| **28** | Fundação    | Schema, `AIContextBuilder`, bridge LLM stub, Dashboard              | ✅ Concluído |
| **29** | Chat básico | Chat livre + contexto do jogador + histórico local                  | ✅ Concluído |
| **30** | Correção    | Parser ❌✅💡 + tela de correção + `mentor_error_log`               | ✅ Concluído |
| **31** | Geração     | Exercícios JSON + flashcards + salvar no Baralho + feedback quiz    | ✅ Concluído |
| **32** | Missões IA  | `mentor_generated_missions` + integração GPS/Play                   | 🔲 Planejado |
| **33** | Roleplay    | Conversação + entrevistas por track                                 | ✅ Concluído |
| **34** | Voz         | STT + TTS local (opcional / flag)                                   | 🔲 Planejado |
| **35** | Memória+    | Onboarding, extração automática, TTL 90 dias, `MentorMemoryService` | 💡 Backlog   |
| **36** | Integração  | Conquistas, pet, cidade, deep links, Duelos import                  | 💡 Backlog   |

### Detalhamento por fase

#### Fase 28 — Fundação

- Migration `mentor_*` tables
- `AIContextBuilder.build()` integrado ao GPS
- `LocalLLMRuntime` interface + mock para dev
- Mentor Dashboard (layout estático)
- Card na Home

#### Fase 29 — Chat básico

- Modelo Qwen 1.5B empacotado ou download
- `MentorChatScreen` com streaming
- System prompt Professor + injeção de contexto
- Persistência `mentor_chat_sessions`

#### Fase 30 — Correção

- Template de correção no prompt
- `CorrectionResult` type + UI diff
- Alimentar `mentor_error_log` e memória

#### Fase 31 — Exercícios e flashcards

- JSON schema validation (Zod)
- Preview + “Fazer exercício” inline
- Export para `flash_cards`

#### Fase 32 — Missões IA

- Geração 1–3 missões/dia baseadas em gaps
- Aceitar/dispensar
- Validação por `GameEvents` do Farm/Duelos

#### Fase 33 — Roleplay

- Cenários catalogados + prompts por papel
- Modo entrevista (5–10 perguntas)
- Feedback final estruturado

#### Fase 34 — Voz

- STT/TTS experimental
- Feature flag `mentorVoiceEnabled`

---

## Critérios de aceite por fase

### Fase 29 (MVP chat)

- [x] Usuário abre chat e recebe resposta offline em &lt; 60s (device médio, com fallback pedagógico)
- [x] Resposta menciona mundo CEFR e skill mais fraca quando relevante
- [x] Histórico persiste após fechar app (`/mentor/history`)
- [x] Sem requisição de rede para inferência
- [ ] LLM nativo estável em 100% dos devices alvo (ver backlog P0)

### Fase 30

- [x] Correção exibe ❌✅💡 em 100% dos casos de teste (dataset interno ≥ 20 frases)
- [x] Erro salvo em `mentor_error_log`

### Fase 31

- [x] Exercícios MCQ com preview e sessão inline
- [x] Flashcards com export Baralho Vivo
- [x] Feedback pós-quiz (onde errou + o que melhorar)

### Fase 33

- [x] Roleplay conversação (5 papéis) e entrevista (5 trilhas)
- [x] Feedback por competência ao encerrar (≥ 6 turnos)

### Fase 32

- [ ] Missão gerada aparece no GPS ou Play após aceite
- [ ] Conclusão concede XP uma vez por missão

---

## Objetivo final

O Mentor IA — **Professor Atlas** — torna-se o **professor particular** do jogador.

Ele não é apenas um chat: acompanha evolução, adapta plano de estudo, propõe missões, corrige erros, simula entrevistas e acelera o caminho até a fluência — dentro da fantasia RPG do English Quest, **sem depender de internet**.

O GPS diz **o que estudar**. O Mentor explica **por quê**, corrige **como** e pratica **com você**.

---

_Última atualização: junho/2026 — status pós Fases 28–31 e 33; backlog de melhorias e ideias de novas features_
