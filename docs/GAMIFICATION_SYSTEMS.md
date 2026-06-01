# English Quest — Sistemas de gamificação avançados

Documento de design: ideias em nível de **sistema** (não features isoladas), focadas em retenção de longo prazo, vínculo com o pet, progressão constante, aprendizado invisível e interação emergente entre pet, economia, quests e cidade.

> **Contexto técnico atual:** offline-first, `GameEvents` (pub/sub), pet com vitais e cooldown de 5 min, season pass mensal, contratos, cidade (skyline), farm/Study Points, prestígio, coleção. Ver [`FEATURES.md`](./FEATURES.md). Cidade Viva (mapa + POIs): [`LIVING_CITY.md`](./LIVING_CITY.md). Aprendizado invisível (inglês ↔ gameplay): [`INVISIBLE_LEARNING_SYSTEMS.md`](./INVISIBLE_LEARNING_SYSTEMS.md).

---

## Índice

1. [Pacto de Ritmo (Pet ↔ Relógio ↔ Missões)](#1-pacto-de-ritmo-pet--relógio--missões)
2. [Livro-Razão de Atenção (Care Debt)](#2-livro-razão-de-atenção-care-debt)
3. [Lexicon como recurso da cidade](#3-lexicon-como-recurso-da-cidade)
4. [Contratos como relacionamentos com decay](#4-contratos-como-relacionamentos-com-decay)
5. [Trilema da moeda única](#5-trilema-da-moeda-única)
6. [Linhagem do companion (pós-prestígio)](#6-linhagem-do-companion-pós-prestígio)
7. [Modos de trabalho (títulos como lentes)](#7-modos-de-trabalho-títulos-como-lentes)
8. [Museu das temporadas](#8-museu-das-temporadas)
9. [Viagem de foco (Focus Mode como co-presença)](#9-viagem-de-foco-focus-mode-como-co-presença)
10. [Rede de rumores (gossip graph)](#10-rede-de-rumores-gossip-graph)
11. [Motivação como profundidade de diálogo](#11-motivação-como-profundidade-de-diálogo)
12. [Arco de retorno (anti-frágil pós-streak)](#12-arco-de-retorno-anti-frágil-pós-streak)
13. [Epidemia de bons hábitos na cidade](#13-epidemia-de-bons-hábitos-na-cidade)
14. [Priorização sugerida](#priorização-sugerida)

---

## 1. Pacto de Ritmo (Pet ↔ Relógio ↔ Missões)

### Mecânica

O pet tem fase de rotina (manhã / tarde / noite / dormindo). Cada fase define um **perfil de estudo ideal**:

- **Manhã** — vocabulário rápido
- **Tarde** — speaking
- **Noite** — revisão leve
- **Dormindo** — micro-sessão ou “sonhar” (flashcards passivos ~30s)

Completar missões **alinhadas à fase** dá bônus duplo em vitais do pet e +season points. Fora da fase ainda funciona, mas o pet reage (sono, irritação) e a cidade registra **“jet lag”** (-5% moedas até a próxima fase correta).

### Por que engaja

Não é punição dura — é **timing social** com o companion. Cria hábito de “hora do Buddy”, como streak no Duolingo, mas com personagem que tem rotina própria (investimento + compromisso agendado).

### Conexões

| Sistema      | Integração                                                                            |
| ------------ | ------------------------------------------------------------------------------------- |
| **Pet**      | Vitais e humor já dependem de rotina; o pacto torna a fase mecânica, não só cosmética |
| **Quests**   | Templates de daily mudam peso por fase (`template_key`)                               |
| **Cidade**   | Prédios desbloqueiam “turno noturno” após N consistências noturnas                    |
| **Economia** | Boosters consumíveis com eficácia maior na fase certa                                 |

---

## 2. Livro-Razão de Atenção (Care Debt)

### Mecânica

Cada dia sem estudo ou sem interação mínima com o pet gera **dívida de atenção** (separada da streak — escudo protege streak, não dívida).

Dívida acumula **ecos**:

- Diálogos do pet mais curtos
- NPCs da cidade comentam distância
- Loot boxes podem dropar “carta perdida” (remove dívida parcial)

Estudar **não zera tudo de uma vez** — exige 2–3 dias de **reconciliação** (missões de baixa fricção). Memórias do pet registram reconciliações como capítulos do álbum.

### Por que engaja

Evita o abismo pós-falha (“quebrei tudo, desinstalo”). Modela **reparação de vínculo**, não só punição. Histórico de reconciliações vira identidade de longo prazo (“sempre volto”).

### Conexões

| Sistema               | Integração                                                       |
| --------------------- | ---------------------------------------------------------------- |
| **Pet**               | Memórias + afinidade; treinar/conversar drena dívida mais rápido |
| **Streak / escudos**  | Escudo ≠ proteção de dívida — decisão estratégica                |
| **Cidade**            | Edifícios de “comunidade” reduzem taxa de acúmulo                |
| **Metagame / legado** | Marcos “Voltei 10 vezes após pausa”                              |

---

## 3. Lexicon como recurso da cidade

> **Especificação expandida:** esta ideia está detalhada dentro da [Cidade Viva](./LIVING_CITY.md#recursos-da-cidade-lexicon-e-insumos) (mapa, POIs, biblioteca, obras).

### Mecânica

Palavras aprendidas no farm (`WORDS_LEARNED`) viram **insumo**: _lexicon bricks_.

A cidade consome bricks para subir prédios (biblioteca, embassy, coworking). O jogador não vê “aula de 20 palavras” — vê **“A biblioteca precisa de 40 bricks esta semana”**.

- **Speaking** → _cement_ (fluência)
- **Dailies** → _wood_ (consistência)

Desbalanceamento atrasa bairros inteiros.

### Por que engaja

Progressão tangível e espacial com custo claro. Aprendizado vira **logística**, não dever escolar (autonomia + competência).

### Conexões

| Sistema            | Integração                                |
| ------------------ | ----------------------------------------- |
| **Farm / SP**      | Fonte primária de bricks                  |
| **Cidade**         | Loop de spend e unlock                    |
| **Pet**            | Espécies com passivo “+brick quality”     |
| **Contratos**      | Entrega de bricks + dias                  |
| **Loot / coleção** | Relíquias multiplicam yield por categoria |

---

## 4. Contratos como relacionamentos com decay

### Mecânica

Contrato ativo = NPC com **trust meter** (0–100).

- Cada dia de estudo + progresso na meta → sobe trust
- Dias off → desce (escudo não protege trust)
- Trust alto → recompensas escalonadas, diálogos em inglês mais longos
- Trust baixo → contrato “frio”, pet empático mas triste
- Quebrar contrato → **blacklist temporária** na carreira (7 dias)

### Por que engaja

Loss aversion social (não decepcionar mentor). “Tarefa de 7 dias” vira **relacionamento** — retenção por obrigação + identidade (“sou confiável”).

### Conexões

| Sistema                | Integração                         |
| ---------------------- | ---------------------------------- |
| **Contratos / career** | Mesma camada narrativa             |
| **Pet**                | Comenta o NPC; treinar reduz decay |
| **Weeklies**           | Alinhadas ao NPC ativo             |
| **Season pass**        | Trust milestones = pontos extras   |

---

## 5. Trilema da moeda única

### Mecânica

Moedas do dia passam por **alocação única** (slider, uma vez por dia): três caixas virtuais:

1. **Pet Care**
2. **City**
3. **Career Prep**

Alocação altera modificadores reais (não dá para maxar as três). Exemplo:

- Muito pet → +afinidade, cap de vitais
- Muito cidade → +loot luck
- Muito carreira → +XP em contratos

Temporada pode impor **meta econômica** (“este mês: 60% cidade”).

### Por que engaja

Escolha significativa diária sem árvore de skills pesada. Identidade de longo prazo (“main pet”, “main city”).

### Conexões

| Sistema                           | Integração                    |
| --------------------------------- | ----------------------------- |
| **Economia / loja / consumíveis** | Mesmo pool competitivo        |
| **Pet / cidade / career**         | Cada pilar recebe modificador |
| **Prestígio**                     | Quarto slot “Legado”          |

---

## 6. Linhagem do companion (pós-prestígio)

### Mecânica

Ascensão de prestígio não remove o pet: vira **mentor** (estátua na cidade + passivo permanente).

Jogador escolhe **ovo de linhagem** com 1 traço herdado (loot, XP, diálogo). Afinidade do mentor afeta hatch. Petédex registra árvore genealógica. Ascensões seguintes exigem pet adulto + sacrifício já existente.

### Por que engaja

Continuidade transgeracional (Pokémon + legacy roguelites). Prestígio vira **capítulo familiar**, não só reset numérico.

### Conexões

| Sistema            | Integração               |
| ------------------ | ------------------------ |
| **Prestígio**      | Sacrifício moedas ou pet |
| **Pet collection** | Árvore de espécies       |
| **Cidade**         | Monumento ao mentor      |
| **Legado**         | Marcos “3ª geração”      |

---

## 7. Modos de trabalho (títulos como lentes)

### Mecânica

Título equipado = **lente de missão** (mesma mecânica, framing diferente):

- _Remote Developer_ → dailies como tickets Jira (+coins)
- _Season Scholar_ → deadlines acadêmicos (+XP)

**Título + fase do pet + bairro da cidade** desbloqueia _synergy hidden quests_ via `GameEvents`.

### Por que engaja

Fantasia renovada sem rebalancear números toda semana — variedade dentro da repetição (crítico para anos de uso).

### Conexões

| Sistema            | Integração               |
| ------------------ | ------------------------ |
| **Titles / level** | Lentes e bônus marginais |
| **Quests**         | Templates por lente      |
| **Pet / cidade**   | Triads de sinergia       |
| **Achievements**   | “50 missions as Senior”  |

---

## 8. Museu das temporadas

### Mecânica

Cada tier resgatado no season pass deposita **artefato** no museu da cidade (slot no mapa).

- Artefatos passivos fracos (+0,5% loot por tier resgatado na vida)
- Temporadas incompletas = **ruínas** revisitáveis (missões retrospectiva 5 min, pontos retroativos limitados)
- Museu único por jogador veterano — prova social (screenshot)

### Por que engaja

Colecionismo de longo prazo + FOMO suave (ruínas, não perda total). Season pass vira **história pessoal**.

### Conexões

| Sistema                      | Integração                                             |
| ---------------------------- | ------------------------------------------------------ |
| **Season pass**              | Artefatos por tier                                     |
| **Cidade / collection book** | Exibição e bônus                                       |
| **Pet**                      | Tour guiado com easter eggs em inglês (afinidade alta) |

---

## 9. Viagem de foco (Focus Mode como co-presença)

### Mecânica

Sessão de foco = pet em estado `traveling`. Barra de foco = distância; interrupção = pet assustado (felicidade -, memória negativa rara). Conclusão = cartão postal no álbum + SP + season points.

Viagens no mesmo horário desbloqueiam **rota favorita** (bônus passivo). Módulo Android de focus alimenta eventos reais.

### Por que engaja

Body doubling digital — pet como âncora de atenção. Interrupção dói emocionalmente, não só em XP.

### Conexões

| Sistema                    | Integração                         |
| -------------------------- | ---------------------------------- |
| **Focus mode / farm / SP** | Recompensas e eventos              |
| **Pet**                    | Vitais, memórias, estado traveling |
| **Cidade**                 | Distrito Airport                   |
| **Contratos**              | Metas de N viagens de foco         |

---

## 10. Rede de rumores (gossip graph)

### Mecânica

`GameEvents` alimentam grafo local de rumores (7 dias): “contrato completo”, “pet faminto”, “loot épica”.

Rumores alteram **micro-mercado**:

- Pet faminto → desconto em comida na loja
- Sorte recente → +loot luck

Jogador pode **plantar rumor** (moedas, café da cidade) — buff 24h com custo de reputação.

### Por que engaja

Mundo que “fala de você” — ilusão de sociedade offline. Ações com efeitos de segunda ordem emergentes.

### Conexões

| Sistema                    | Integração                   |
| -------------------------- | ---------------------------- |
| **GameEvents**             | Fonte do grafo               |
| **Shop / loot / pet food** | Preços e odds                |
| **Career**                 | Diálogos referenciam rumores |
| **Punishments**            | Amplificam rumores negativos |

---

## 11. Motivação como profundidade de diálogo

### Mecânica

`motivation` do pet desbloqueia **camadas de diálogo**:

| Camada | Conteúdo                                             |
| ------ | ---------------------------------------------------- |
| 1      | Frases simples                                       |
| 3      | Idiom + pergunta de follow-up                        |
| 5      | Mini-choice que grava vocabulário no sistema Lexicon |

“Conversar” (cooldown 5 min) = micro-prática sem tela de aula. Erros não punem — pet reformula (scaffolding emocional).

### Por que engaja

Relação segura para praticar. Competência cresce no vínculo (relatedness + mastery — SDT).

### Conexões

| Sistema              | Integração                              |
| -------------------- | --------------------------------------- |
| **Pet**              | Interação, afinidade, vitais            |
| **Lexicon → cidade** | Palavras das choices                    |
| **Career**           | English Score via diálogo, não só grind |

---

## 12. Arco de retorno (anti-frágil pós-streak)

### Mecânica

Após quebra de streak (sem escudo ou escudos zerados): **modo Comeback** por 5 dias.

- Dailies menores
- Pet: “eu sabia que você voltava”
- Recompensas crescentes (dia 1 modesto → dia 5 forte)
- Abandonar comeback reinicia e aumenta care debt
- Shields durante comeback custam mais (incentivo a jogar, não comprar saída)

### Por que engaja

Anti-frágilidade: falha vira narrativa heroica. Crítico para retenção em **anos**.

### Conexões

| Sistema                            | Integração                       |
| ---------------------------------- | -------------------------------- |
| **Streak / shields / punishments** | Gatilho e custos                 |
| **Pet / memórias**                 | Narrativa e recompensa emocional |
| **Season pass**                    | Pontos dobrados no comeback      |
| **Legado**                         | Título “Phoenix Streak”          |

---

## 13. Epidemia de bons hábitos na cidade

### Mecânica

Se “dias estudados” na semana local passa limiar → cidade em **Surto de Produtividade** (+10% em todos os sistemas, 48h).

Se cair → **Surto de Preguiça** (leve).

Pet pode **contagiar** bairro: 3 dias com vitais altos ativam buff comunitário.

### Por que engaja

Norma social simulada — “minha cidade estuda”. Orgulho coletivo offline.

### Conexões

| Sistema              | Integração                  |
| -------------------- | --------------------------- |
| **Streak / dailies** | Métrica de surto            |
| **Pet vitais**       | Contágio de bairro          |
| **Reward modifiers** | Buff global temporário      |
| **Cidade**           | Visual / narrativa do surto |

---

## Priorização sugerida

| Prioridade      | Sistema                | Por que encaixa no código atual             |
| --------------- | ---------------------- | ------------------------------------------- |
| **Alta**        | Pacto de Ritmo         | Rotina + vitais + cooldown 5 min já existem |
| **Alta**        | Lexicon → cidade       | Farm + city + `GameEvents`                  |
| **Alta**        | Motivação → diálogo    | Pet + aprendizado invisível                 |
| **Média**       | Care debt              | Streak, memórias, escudos                   |
| **Média**       | Museu das temporadas   | Season pass + city                          |
| **Média**       | Viagem de foco         | Focus module + pet                          |
| **Longo prazo** | Linhagem pós-prestígio | Prestígio + pet collection                  |
| **Longo prazo** | Gossip graph           | Hub de eventos maduro                       |
| **Longo prazo** | Trilema de moedas      | Balanceamento econômico cuidadoso           |

---

## Próximo passo (implementação)

Para cada sistema escolhido, especificar em doc filho ou PRD:

- Tabelas SQLite / campos novos
- Eventos `GameEvents` emitidos e consumidos
- Telas e copy (PT + EN onde aplicável)
- Curva de balanceamento (semana 1 vs ano 2)

---

_Documento de design — maio/2026. Não implementado; referência para roadmap._
