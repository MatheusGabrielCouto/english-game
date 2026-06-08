# English Quest - Implementation Plan

## Fase 1

Foundation

- Expo Router
- SQLite
- Drizzle ORM
- NativeWind
- Estrutura do projeto
- Navegação

Status: Concluído

---

## Fase 2

Player System

Implementar:

- XP
- Levels
- Coins
- Titles
- Dashboard

Status: Concluído

---

## Fase 3

Daily Quests

Implementar:

- Missões diárias
- Conclusão
- Recompensas
- Integração com XP

Status: Concluído

---

## Fase 4

Weekly Quests

Implementar:

- Missões semanais
- Progresso automático
- Recompensas
- Integração com missões diárias

Status: Em andamento

---

## Fase 5

Streak System

Implementar:

- Current Streak
- Best Streak
- Total Study Days
- Histórico
- Calendário
- Estatísticas

Dependências:

- Player
- Daily Quests
- Weekly Quests

Status: Concluído

---

## Fase 6

Shield System

Implementar:

- Escudos
- Proteção de streak
- Consumo automático

Dependências:

- Streak

Status: Concluído

---

## Fase 7

Pet System

Implementar:

- Evolução
- Humor
- Integração com streak

Dependências:

- Streak
- Shields

Status: Concluído

---

## Fase 8

Inventory System

Implementar:

- Inventário
- Itens
- Pets
- Escudos
- Loot Boxes

Dependências:

- Pet
- Shields

Status: Concluído

---

## Fase 9

Loot Box System

Implementar:

- Raridades
- Recompensas
- Animações

Dependências:

- Inventory

Status: Concluído

---

## Fase 10

Achievements

Implementar:

- Conquistas
- Desbloqueios automáticos
- Categorias (Streak, Missões, XP, Nível, Pet, Loot Boxes)
- Recompensas (moedas, escudos, loot boxes)
- Histórico permanente e analytics
- Tela de conquistas com progresso em tempo real
- Celebração visual ao desbloquear

Dependências:

- Todas as fases anteriores

Status: Concluído

---

## Fase 11

Shop

Implementar:

- Loja de itens com categorias (Escudos, Loot Boxes, Pets, Itens Especiais)
- Compra utilizando moedas
- Validação de saldo
- Histórico de compras
- Analytics econômicos
- Integração com Player e Inventory

Dependências:

- Inventory

Status: Concluído

---

## Fase 12

Titles

Implementar:

- Sistema de títulos com progressão oficial (níveis 1–100)
- Desbloqueio automático por level up
- Histórico permanente de títulos
- Tela dedicada com título atual, próximo objetivo e histórico
- Celebração visual ao ser promovido
- Integração com Player, Perfil e Home
- Analytics de promoções
- Preparação para integração com Achievements

Dependências:

- Player

Status: Concluído

---

## Fase 13

International City

Implementar:

- Sistema de cidade com 7 construções (House → Financial Center)
- Desbloqueio automático por nível
- Skyline visual com progressão
- Tela dedicada com histórico e próximo objetivo
- Celebração ao desbloquear construções
- Integração com Player, Titles, Home e Perfil
- Analytics de construções

Dependências:

- Player
- Titles

Status: Concluído

---

## Fase 14

Contracts

Implementar:

- Sistema de apostas
- Metas
- Recompensas
- Aceitação e progresso automático
- Histórico e analytics
- Integração com Streak e Shields

Dependências:

- Streak

Status: Concluído

---

## Fase 15

Statistics

Implementar:

- Dashboard avançado
- Analytics

Dependências:

- Todas as fases anteriores

Status: Concluído

---

## Fase 16

Notifications

Implementar:

- Notificações locais
- Lembretes inteligentes por categoria
- Horário preferido
- Controle de permissões
- Personalização por categoria
- Histórico e analytics básico

Dependências:

- Streak
- Pet
- Contracts
- Achievements
- City

Status: Concluído

## Fase 17

Backup

Implementar:

- Exportação JSON

Dependências:

- Todas as entidades

---

## Fase 18

Restore

Implementar:

- Importação JSON
- Validação Zod

Dependências:

- Backup

---

## Fase 19

Focus Mode Android

Implementar:

- Accessibility Service
- Apps bloqueados
- Sessões de foco

Dependências:

- Analytics

---

## Fase 20

Punishments

Implementar:

- Penalidades éticas e reversíveis (XP/coin decay temporário)
- Sistema de recuperação por dias de estudo
- Impacto em pet, cidade e contratos
- Modais de aviso, impacto e recuperação
- Analytics de punições

Dependências:

- Focus Mode

Status: Concluído

---

## Fase 21

Polish & Production Readiness

Implementar:

- Onboarding wizard (nome + dificuldade) + tutorial persistente
- Toast global com fila (`ToastHost` + `FeedbackService`)
- ErrorBoundary + logs locais (`AppLogService`)
- Performance: lazy tabs, hydration paralela, memo em listas, menos refresh duplicado
- Empty states padronizados
- Design system: Modal `footerMode`, Toast variants, haptics em `PressableScale`
- Level Up e feedback de eventos ampliados
- EAS build profiles + CI (tsc + unit tests)

Dependências:

- Punishments

Status: Concluído

---

## Fase 22

Learning GPS — Fundação

Implementar:

- Schema: `learning_worlds`, `player_learning_profile`, `skill_levels`
- Onboarding: tempo diário + mundo inicial (Survivor / A1)
- Home: card "Onde estou" + "Estudar hoje" (blocos do dia)
- Hidratação no boot

Dependências:

- Polish (Fase 21)
- `LearningDifficulty` existente

Status: Concluído

---

## Fase 23

Learning GPS — Plano diário

Implementar:

- Mapear `targetMinutes` → blocos por habilidade (15/30/60/90 min)
- Completar bloco → atualiza skill + progresso no mundo
- Integração com Farm activities

Dependências:

- Fase 22

Status: Concluído

---

## Fase 24

Learning GPS — Currículo Survivor (A1 piloto)

Implementar:

- Unidades Mundo 1: vocabulário + gramática
- Checkpoint: meta conversa 2 minutos
- Reuso de word packs e duelos A1

Dependências:

- Fase 23

Status: Concluído

---

## Fase 25

Learning GPS — Mundos 2–6

Implementar:

- Catálogo Explorer → Legend (A2–C2)
- Checkpoints e metas finais por mundo
- Desbloqueio sequencial

Dependências:

- Fase 24

Status: Concluído

---

## Fase 26

Learning GPS — Rotinas cadastradas

Implementar:

- CRUD rotinas diária / semanal / mensal
- Notificações
- Rotinas no plano do dia

Dependências:

- Fase 23

Status: Concluído

---

## Fase 27

Learning GPS — Inteligência e relatórios

Implementar:

- Detecção de fraquezas por skill
- Missões personalizadas (mundo + gaps + rotinas)
- Plano semanal padrão + projeto semanal
- Checkpoint mensal + relatório local

Dependências:

- Fases 24–26

Status: Concluído

---

## Fase 28

Mentor IA — Fundação

Implementar:

- Schema: `mentor_memory`, `mentor_chat_sessions`, `mentor_error_log`
- `AIContextBuilder` (snapshot do jogador a partir do SQLite)
- `LocalLLMRuntime` (interface + mock dev)
- Mentor Dashboard (layout) + card na Home

Dependências:

- Fase 27 (GPS inteligência)

Status: Planejado

---

## Fase 29

Mentor IA — Chat básico

Implementar:

- Modelo local (Qwen 2.5 1.5B Instruct ou equivalente)
- Chat livre com contexto do jogador
- Persistência de sessões
- System prompt Professor Atlas

Dependências:

- Fase 28

Status: Planejado

---

## Fase 30

Mentor IA — Correção de frases

Implementar:

- Fluxo ❌✅💡 com parser estruturado
- Tela de correção dedicada
- `mentor_error_log` + memória de erros frequentes

Dependências:

- Fase 29

Status: Planejado

---

## Fase 31

Mentor IA — Exercícios e flashcards

Implementar:

- Geração de exercícios (JSON)
- Geração de flashcards + export Baralho Vivo
- Preview e sessão inline

Dependências:

- Fase 29

Status: Planejado

---

## Fase 32

Mentor IA — Missões geradas

Implementar:

- `mentor_generated_missions`
- Integração GPS / Play
- Recompensas XP com anti-abuse

Dependências:

- Fases 29–31

Status: Planejado

---

## Fase 33

Mentor IA — Roleplay e entrevistas

Implementar:

- Conversation Practice (roles)
- Simulação de entrevista (Frontend, Backend, etc.)
- Feedback final por competência

Dependências:

- Fase 29

Status: Planejado

---

## Fase 34

Mentor IA — Voz (experimental)

Implementar:

- Speech-to-Text local
- Text-to-Speech
- Feature flag

Dependências:

- Fase 33

Status: Planejado
