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
