# English Quest - Product Requirements Document

## Visão Geral

English Quest é um aplicativo mobile gamificado para aprendizado de inglês.

O objetivo principal não é apenas ensinar inglês.

O objetivo é criar um sistema de retenção que incentive o usuário a estudar diariamente através de mecânicas de jogo.

O aplicativo deve funcionar completamente offline.

Não haverá backend.

Todos os dados do jogo serão armazenados localmente utilizando SQLite.

---

# Objetivo Principal

Ajudar usuários a desenvolver consistência diária no estudo de inglês.

---

# Público-Alvo

- Estudantes de inglês
- Desenvolvedores buscando vagas internacionais
- Profissionais que desejam trabalhar remotamente
- Pessoas que possuem dificuldade em manter hábitos de estudo

---

# Stack

- Expo SDK
- TypeScript
- Expo Router
- Expo SQLite
- Drizzle ORM
- Zustand
- NativeWind
- React Hook Form
- Zod
- Expo Notifications
- Expo FileSystem
- Expo Sharing
- Expo Document Picker
- Expo Haptics

---

# Fonte da Verdade

SQLite é a única fonte de verdade.

Zustand deve ser utilizado apenas para estado de interface.

---

# Sistema de Progressão

O jogador possui:

- XP
- Level
- Coins
- Titles
- Streak

XP é obtido através de:

- Missões diárias
- Missões semanais
- Contratos
- Eventos futuros

Fórmula:

requiredXP = level \* 100

---

# Títulos

Level 1:
Local Developer

Level 5:
Junior Remote Developer

Level 10:
Mid Remote Developer

Level 20:
Senior Remote Developer

Level 30:
International Developer

Level 50:
Global Engineer

Level 75:
Tech Lead

Level 100:
World Class Engineer

---

# Missões

## Diárias

Geradas automaticamente.

Exemplos:

- Aprender 5 palavras
- Ler por 5 minutos
- Listening por 3 minutos
- Speaking por 2 minutos

## Semanais

Exemplos:

- Estudar 5 dias
- Completar 20 missões
- Ganhar 1000 XP

---

# Streak

Representa dias consecutivos de estudo.

Estudar pelo menos uma vez no dia mantém a streak.

Perder um dia quebra a streak.

Escudos serão adicionados posteriormente.

---

# Escudos

Protegem a streak.

Podem ser obtidos através de:

- Loja
- Loot Boxes
- Conquistas

---

# Pet Virtual

Estágios:

- Egg
- Baby
- Teen
- Adult
- Legendary

Humor:

- Very Sad
- Sad
- Normal
- Happy
- Very Happy

O humor depende da streak.

---

# Cidade Internacional

Representa a jornada rumo à carreira internacional.

Construções:

- House
- Office
- Startup
- Company
- Airport
- Skyscraper
- Financial Center

---

# Inventário

Armazena:

- Escudos
- Loot Boxes
- Pets
- Skins
- Itens especiais

---

# Loot Boxes

Raridades:

Common
Rare
Epic
Legendary

Distribuem recompensas aleatórias.

---

# Conquistas

Exemplos:

- Primeiro Dia
- 7 Dias
- 30 Dias
- Primeira Missão
- Nível 10
- Nível 50

---

# Contratos

Sistema de apostas.

Exemplo:

Estudar por 7 dias consecutivos.

Se cumprir:
recebe recompensa.

Se falhar:
perde aposta.

---

# Notificações

Notificações locais.

Exemplos:

- Sua streak está em risco.
- Seu pet sente sua falta.
- Sua cidade precisa de você.

---

# Sistema de Foco

Android Only.

Monitoramento de aplicativos distrativos.

Exemplos:

- Instagram
- TikTok
- YouTube
- Facebook
- Reddit
- X

---

# Backup

Exportar:

- Player
- Missões
- Inventário
- Pet
- Cidade
- Contratos
- Conquistas

Formato JSON.

---

# Analytics

Registrar:

- Dias estudados
- Maior streak
- Tempo estudado
- Missões concluídas
- Contratos concluídos
- Loot boxes abertas
- Distrações detectadas
