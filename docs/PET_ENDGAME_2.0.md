# Fase 22 — Pet Endgame 2.0 (Linhagem, Traits, Gerações, Missões e Liga)

Documento de design e roadmap para transformar **Pets** no principal sistema de retenção do English Quest — apego emocional + progressão infinita + sensação de **jogo mobile premium** (Pokémon · Palworld · Dragon City · Stardew · Duolingo/Habitica).

**Status:** 🚧 Em progresso — **22.0–22.10 concluídas** (fazenda endgame + evolução cinematográfica)  
**Pré-requisito:** [PET_FARM_UPDATE.md](./PET_FARM_UPDATE.md) (fazenda, stats, breeding) — **MVP parcial em código**  
**Base emocional:** [PET_SYSTEM.md](./PET_SYSTEM.md) (companheiro ativo, vitals, memórias globais)

---

## 0. North Star

> O jogador abre o app **só para ver os pets**, mesmo com inglês do dia concluído.

| Pilar      | Entrega                                                   |
| ---------- | --------------------------------------------------------- |
| Apego      | Nome, personalidade, timeline, evolução cinematográfica   |
| Coleção    | Espécies, híbridos, traits, cosméticos, Hall da Fama      |
| Otimização | Stats, traits, breeding, gerações, Liga                   |
| Retenção   | Aventuras idle, Academia, temporada semanal, notificações |

**Anti-padrões (proibidos):**

- UI tipo CRUD / dashboard corporativo
- Tabelas densas sem hierarquia visual
- Progressão só numérica sem “momento wow”

**Referências visuais:** Pokémon (breeding + evolução) · Palworld (base viva) · Clash/Brawl (cards + juice) · Monster Legends / Dragon City (liga + breeding) · Hay Day / Stardew (mapa de prédios)

---

## 1. Inventário do que já existe (auditoria)

### 1.1 Implementado (código atual)

| Sistema                              | Estado      | Onde                                            |
| ------------------------------------ | ----------- | ----------------------------------------------- |
| Multi-instância                      | ✅ MVP      | `pet_instances`, `PetRosterService`             |
| Stats 5 + herança breeding           | ✅          | `pet-stat-rules`, `pet-stat-inheritance`        |
| Gênero ♀/♂                           | ✅          | `PetInstance.gender`                            |
| Fazenda (pasto, incubadora, celeiro) | ✅          | `/pet-farm`                                     |
| Melhorias de campo                   | ✅          | `/pet-farm/upgrades`                            |
| Breeding + % outcomes                | ✅          | `pet-breeding-outcomes`, laboratório            |
| Enciclopédia + glossário             | ✅          | `/pet-farm/encyclopedia`, `glossary`            |
| Ícone único por pet                  | ✅ parcial  | `PetSpeciesIcon`                                |
| 8 híbridos                           | ✅ catálogo | `pet-hybrid-species.ts`                         |
| Memórias globais (conta)             | ✅          | `pet_memories`, `PetMemoryService`              |
| Cosméticos (catálogo)                | ✅ catálogo | `pet-cosmetics-catalog.ts` (equip no pet ativo) |
| Companheiro ativo (vitals, XP)       | ✅          | `/pet`, `PetService`                            |

### 1.2 Planejado em PET_FARM mas pendente

- 14 espécies novas no catálogo
- ~~Bônus da fazenda no pipeline global de XP/moedas/loot~~ → ✅ 22.0 (`PetFarmBonusCache`, `RewardModifierService`)
- ~~Trocar pet ativo entre instâncias (UI)~~ → ✅ 22.0 (`setActiveInstance` + detalhe)
- ~~Detalhe completo por instância (`/pet-farm/instance/:id`)~~ → ✅ 22.0
- ~~Mapa básico da fazenda (prédios clicáveis)~~ → ✅ 22.0 (`PetFarmMapContent`, `/pet-farm/pasture`)

### 1.3 Pontos fracos (avaliação honesta)

| Problema                               | Impacto                  | Mitigação Endgame 2.0                               |
| -------------------------------------- | ------------------------ | --------------------------------------------------- |
| Só 1 pet “vivo” com vitals             | Baixo apego na coleção   | Aventuras/Academia em qualquer instância; favoritos |
| Memórias são da conta, não por pet     | Menos vínculo individual | `pet_instance_memories` + timeline                  |
| ~~Sem geração/linhagem visível~~       | —                        | ✅ 22.1 — GEN, resumo, árvore, molduras             |
| Sem traits/personalidade               | Pets parecem iguais      | 50 traits + 30 personalidades                       |
| Fazenda ainda “lista de cards”         | Não parece jogo          | **Home mapa** Hay Day style                         |
| Evolução sem evento                    | Perde wow moment         | Tela Evolution 2.0                                  |
| Economia de breeding barata vs SP shop | Inflação                 | Custos escalam com GEN + trait reroll               |

---

## 2. Arquitetura de dados (extensão)

### 2.1 `pet_instances` — campos novos

```ts
type PetInstance = {
  // existentes: speciesKey, gender, stats, parents, slots, ...

  generation: number; // 1 = selvagem/ovo loja; filho = max(pai,mãe)+1
  motherInstanceId: number | null;
  fatherInstanceId: number | null;

  personalityKey: string; // catálogo 30+
  traitKeysJson: string; // string[] até 4

  favoriteTag: "none" | "star" | "heart" | "crown";
  hallOfFameSlot: number | null; // 0..5 exposição

  totalAdventures: number;
  leagueRating: number; // Elo simplificado
  leagueSeasonId: string | null;

  bornAt: string; // createdAt já existe — alias em UI
};
```

### 2.2 Tabelas novas

| Tabela                   | Função                                                 |
| ------------------------ | ------------------------------------------------------ |
| `pet_lineage_cache`      | Opcional: ancestral_ids_json até bisavós (performance) |
| `pet_instance_memories`  | Timeline por instância                                 |
| `pet_adventures`         | Missões idle em andamento                              |
| `pet_academy_sessions`   | Estudo na academia                                     |
| `pet_league_entries`     | Ranking temporada                                      |
| `pet_trait_reroll_log`   | Auditoria reroll                                       |
| `pet_cosmetic_inventory` | Cosméticos por instância (separar do JSON do ativo)    |

### 2.3 Geração — regra canônica

```ts
generation(child) =
  parents both null ? 1
  : Math.max(generation(mother), generation(father)) + 1;

// Teto soft: 999; UI especial a cada marco 5/10/25/50/100
```

**Valor emocional:** moldura, cor de nome, partículas no avatar a partir de GEN 5+.

---

## 3. Sistema de linhagem

### 3.1 Armazenamento

- Já existe: `parentMotherId`, `parentFatherId` no MVP.
- Adicionar: `generation` persistido (não só derivado).
- Log de breeding já guarda snapshot de stats — estender com `generation` dos pais.

### 3.2 UI — painel resumo (tela de detalhes)

```
Quantum Serpent
GEN 7

Pai:   Quantum Owl    (GEN 4)  [ver]
Mãe:   World Serpent  (GEN 6)  [ver]
Avô:   Code Owl       (GEN 1)
Avó:   Stack Fox      (GEN 2)
Bisavô: … (bloqueado se não registrado)
```

- Bisavós+: busca recursiva até 4 níveis ou cache; slots vazios = “?” até descobrir linhagem (breeding revela pais).

### 3.3 Tela — Árvore genealógica

**Rota:** `/pet-farm/instance/[id]/tree`

**Layout:**

- Nó central = pet selecionado
- Ramos para pai (♂) e mãe (♀) acima
- Mais 2 níveis visíveis; botão “expandir” para bisavós
- Estilo: cartões com `PetSpeciesIcon` + GEN badge + nome
- Pinch-zoom + pan (gesture handler) — sensação “mapa”, não tabela

**Desbloqueio:** disponível desde GEN ≥ 2 ou após 1º breeding.

---

## 4. Sistema de gerações (GEN)

### 4.1 Indicadores visuais

| GEN   | Tratamento visual                        |
| ----- | ---------------------------------------- |
| 1–4   | Badge cinza `GEN n`                      |
| 5–9   | Borda bronze                             |
| 10–24 | Borda prata + partículas leves           |
| 25–49 | Borda ouro                               |
| 50–99 | Aura roxa + nome gradiente               |
| 100+  | Moldura mítica animada + título “Legacy” |

### 4.2 Conquistas

| key           | Condição                     |
| ------------- | ---------------------------- |
| `pet_gen_5`   | Possuir ou criar pet GEN ≥ 5 |
| `pet_gen_10`  | GEN ≥ 10                     |
| `pet_gen_25`  | GEN ≥ 25                     |
| `pet_gen_50`  | GEN ≥ 50                     |
| `pet_gen_100` | GEN ≥ 100                    |

### 4.3 Ranking de gerações

- **Global local:** maior GEN na coleção do jogador
- **Hall interno:** top 10 instâncias por GEN → nível → soma stats
- **Opcional futuro:** leaderboard online (Fase 22.G)

---

## 5. Sistema de traits (50+)

### 5.1 Quantidade por raridade da espécie

| Raridade espécie | Traits ao nascer |
| ---------------- | ---------------- |
| common           | 1                |
| rare             | 2                |
| epic             | 3                |
| legendary        | 4                |

Híbridos: usar raridade do filho rolado.

### 5.2 Herança no breeding

1. Roll espécie (já existe).
2. Roll traits:
   - 60% chance de herdar trait de cada pai (se possui slot)
   - 40% roll novo do pool da raridade
   - Máx 1 trait “épico+” por filho sem item
3. Traits negativos: 15% do pool em comum, 8% em rare+.

### 5.3 Reroll

| Item                  | Efeito                                |
| --------------------- | ------------------------------------- |
| `trait_reroll_single` | Reroll 1 trait (escolhe slot)         |
| `trait_reroll_all`    | Reroll todos (lendário, loja SP cara) |

Custo alternativo: 800 moedas × GEN do pet (teto 50k).

### 5.4 Catálogo — 50 traits (implementar em `pet-traits-catalog.ts`)

#### XP / estudo (12)

| key               | Nome            | Efeito                    |
| ----------------- | --------------- | ------------------------- |
| `fast_learner`    | Fast Learner    | +5% XP jogador            |
| `study_addict`    | Study Addict    | +10% XP                   |
| `speaking_genius` | Speaking Genius | +15% XP em speaking farm  |
| `reading_master`  | Reading Master  | +10% reading farm         |
| `listening_pro`   | Listening Pro   | +10% listening            |
| `vocab_sage`      | Vocab Sage      | +8% vocab farm            |
| `focus_resonance` | Focus Resonance | +10% XP em sessão foco    |
| `daily_duo`       | Daily Duo       | +5% XP se daily completa  |
| `weekly_warrior`  | Weekly Warrior  | +8% XP em weekly          |
| `contract_mind`   | Contract Mind   | +10% XP em contrato       |
| `journal_scribe`  | Journal Scribe  | +5% XP por entrada diário |
| `prestige_echo`   | Prestige Echo   | +12% XP pós-prestígio     |

#### Economia (10)

| key               | Nome            | Efeito                           |
| ----------------- | --------------- | -------------------------------- |
| `lucky_hunter`    | Lucky Hunter    | +10% loot luck                   |
| `golden_paw`      | Golden Paw      | +15% moedas                      |
| `treasure_finder` | Treasure Finder | +20% chance item extra em loot   |
| `coin_magnet`     | Coin Magnet     | +8% moedas                       |
| `sp_saver`        | SP Saver        | +5% SP ganho                     |
| `shop_haggler`    | Shop Haggler    | -5% custo loja (teto -15% stack) |
| `loot_surge`      | Loot Surge      | +5% raridade +1 step em box      |
| `shield_broker`   | Shield Broker   | +10% chance shield em reward     |
| `farm_harvest`    | Farm Harvest    | +10% SP no farm inglês           |
| `city_tax`        | City Tax        | +5% moedas da cidade             |

#### Utilidade / defesa (10)

| key                 | Nome              | Efeito                       |
| ------------------- | ----------------- | ---------------------------- |
| `guardian`          | Guardian          | +1 shield/semana             |
| `motivator`         | Motivator         | +5% motivação vital (ativo)  |
| `contract_expert`   | Contract Expert   | +10% progresso contrato      |
| `streak_guard`      | Streak Guard      | 1 “grace” streak / mês       |
| `vital_bloom`       | Vital Bloom       | -10% decay fome              |
| `night_owl`         | Night Owl         | +bônus rotina noite          |
| `early_bird`        | Early Bird        | +bônus rotina manhã          |
| `hybrid_affinity`   | Hybrid Affinity   | +5% chance híbrido em breed  |
| `genetic_stability` | Genetic Stability | +10% chance herdar trait bom |
| `incubator_haste`   | Incubator Haste   | -8% hatch time               |

#### Aventura / Liga (8)

| key               | Nome            | Efeito                      |
| ----------------- | --------------- | --------------------------- |
| `adventurer`      | Adventurer      | +10% sucesso aventura       |
| `treasure_runner` | Treasure Runner | +15% loot em aventura       |
| `league_star`     | League Star     | +20 rating Liga             |
| `scout`           | Scout           | Desbloqueia missão 8h+      |
| `pathfinder`      | Pathfinder      | +1 slot aventura simultânea |
| `academy_ace`     | Academy Ace     | +15% ganho academia         |
| `mentor_spirit`   | Mentor Spirit   | +5% stats ganhos academia   |
| `breed_master`    | Breed Master    | -5% cooldown breeding       |

#### Negativos (10) — reroll ou aceitar risco

| key          | Nome       | Efeito                        |
| ------------ | ---------- | ----------------------------- |
| `lazy`       | Lazy       | -5% XP                        |
| `distracted` | Distracted | -5% focus stat cap            |
| `sleepy`     | Sleepy     | -5% moedas                    |
| `shy`        | Shy        | -5% sucesso speaking aventura |
| `glutton`    | Glutton    | +15% decay fome               |
| `moody`      | Moody      | -5% felicidade max            |
| `unlucky`    | Unlucky    | -8% loot                      |
| `slow_hatch` | Slow Hatch | +10% hatch time               |
| `breed_shy`  | Breed Shy  | -5% chance herdar trait       |
| `coin_sink`  | Coin Sink  | -3% moedas                    |

**Teto de bônus por tipo (stack traits + passivo + fazenda):** mesmo que PET_FARM — +18% XP, +18% coins, +12% loot, +3 shields/sem extras de traits.

---

## 6. Sistema de personalidade (30)

Não substitui mood do pet ativo — é **identidade fixa** da instância.

| #   | key           | Nome        | Animação preferida | Tom de diálogo |
| --- | ------------- | ----------- | ------------------ | -------------- |
| 1   | `curious`     | Curious     | idle inquisitivo   | perguntas      |
| 2   | `brave`       | Brave       | excited            | motivacional   |
| 3   | `shy`         | Shy         | sad suave          | curto          |
| 4   | `playful`     | Playful     | happy jump         | brincalhão     |
| 5   | `lazy`        | Lazy        | sleep              | preguiçoso     |
| 6   | `smart`       | Smart       | thinking           | facts inglês   |
| 7   | `friendly`    | Friendly    | happy              | caloroso       |
| 8   | `ambitious`   | Ambitious   | excited            | metas carreira |
| 9   | `energetic`   | Energetic   | fast bounce        | alta energia   |
| 10  | `calm`        | Calm        | slow idle          | zen            |
| 11  | `loyal`       | Loyal       | heart              | apego          |
| 12  | `mischief`    | Mischief    | wink               | humor          |
| 13  | `gentle`      | Gentle      | soft               | cuidado        |
| 14  | `proud`       | Proud       | pose               | confiante      |
| 15  | `dreamer`     | Dreamer     | cloud              | aspirações     |
| 16  | `rebel`       | Rebel       | shake              | informal       |
| 17  | `mentor`      | Mentor      | nod                | ensina         |
| 18  | `foodie`      | Foodie      | eat anim           | fome           |
| 19  | `athlete`     | Athlete     | run                | exercício      |
| 20  | `artist`      | Artist      | spin               | criativo       |
| 21  | `techie`      | Techie      | typing             | dev jokes      |
| 22  | `bookworm`    | Bookworm    | read               | leitura        |
| 23  | `social`      | Social      | wave               | speaking       |
| 24  | `guardian`    | Guardian    | shield             | proteção       |
| 25  | `romantic`    | Romantic    | blush              | emojis suaves  |
| 26  | `stoic`       | Stoic       | still              | minimal        |
| 27  | `chaotic`     | Chaotic     | random             | imprevisível   |
| 28  | `wise`        | Wise        | elder              | provérbios     |
| 29  | `competitive` | Competitive | fire               | liga           |
| 30  | `collector`   | Collector   | sparkle            | dex            |

**Roll:** peso por espécie/família opcional; padrão uniforme.

**Gameplay:** filtra linhas em `pet-dialogues-catalog` por `personalityKey`; override de `currentAnimationKey` em reações.

---

## 7. Memórias 2.0 — timeline por pet

### 7.1 Separar memórias

| Escopo         | Exemplos                          | Storage                 |
| -------------- | --------------------------------- | ----------------------- |
| Conta (legado) | Primeiro contrato global          | `pet_memories`          |
| Instância      | Primeiro breed deste pet como pai | `pet_instance_memories` |

### 7.2 Eventos automáticos

| memoryKey         | Título                             |
| ----------------- | ---------------------------------- |
| `born`            | Nasceu na fazenda                  |
| `first_level_up`  | Primeiro level up                  |
| `first_evolution` | Primeira evolução                  |
| `first_breed`     | Primeiro cruzamento (como pai/mãe) |
| `gen_milestone_5` | Atingiu GEN 5                      |
| `league_debut`    | Estreou na Liga                    |
| `adventure_epic`  | Aventura 24h concluída             |
| `trait_legendary` | Rolou trait lendário               |
| `hall_inducted`   | Entrou no Hall da Fama             |

### 7.3 UI — Timeline

**Rota:** `/pet-farm/instance/[id]/timeline`

Agrupamento: Hoje · Ontem · 7 dias · 30 dias · Mais antigo

Visual: linha vertical estilo rede social; ícone do evento + frase em inglês simples.

---

## 8. Pet Adventures (missões idle)

### 8.1 Menu

**Rota:** `/pet-farm/adventures` — prédio no mapa.

### 8.2 Durações e slots

| Duração        | Slots simultâneos (base) |
| -------------- | ------------------------ |
| 15m / 30m / 1h | 2                        |
| 2h / 4h        | 2                        |
| 8h / 12h / 24h | 1 (trait `scout` +1)     |

### 8.3 Chance de sucesso

```ts
success =
  0.45 +
  level * 0.008 +
  avgStat / 200 +
  generation * 0.005 +
  traitBonus +
  adventureTypeMod;

clamp(0.35, 0.95);
```

Falha parcial: 50% recompensa + mensagem flavor.

### 8.4 Tipos de aventura (mapa)

| Bioma    | Recompensa principal | Desbloqueio |
| -------- | -------------------- | ----------- |
| Meadow   | Moedas               | Nv.1        |
| Cave     | Loot box comum       | Nv.5        |
| Shore    | SP                   | Nv.8        |
| Summit   | Ovo / item breed     | GEN 3+      |
| Ruins    | Relíquia chance      | GEN 10+     |
| Sky Isle | Cosmético raro       | Liga Gold   |

**Visual:** mapa isométrico simplificado (ilustração estática + pins animados); pet chip “caminhando” (Reanimated translate).

### 8.5 Recompensas (balance)

| Duração | Moedas   | XP pet | Outros                    |
| ------- | -------- | ------ | ------------------------- |
| 15m     | 15–30    | 5      | —                         |
| 1h      | 80–120   | 25     | —                         |
| 8h      | 400–600  | 120    | loot comum                |
| 24h     | 900–1400 | 300    | chance ovo / trait scroll |

**Teto:** 3 aventuras 24h / semana por conta.

---

## 9. Academia dos Pets

**Rota:** `/pet-farm/academy`

| Academia   | Duração | Foco        |
| ---------- | ------- | ----------- |
| Vocabulary | 2h      | +vocab stat |
| Grammar    | 2h      | +focus      |
| Listening  | 2h      | +luck       |
| Speaking   | 3h      | +charm      |
| Career     | 4h      | +strength   |

**Regra:** pet em academia não pode estar no pasto nem breeding.

**Retorno:** XP instância + 1–3 pontos stat + 5% chance trait academia-only (`academy_ace` não stacka roll).

---

## 10. Pet League (torneios)

### 10.1 Temporada

- Duração: **7 dias** (alinhado weekly quests)
- Reset segunda 00:00 local

### 10.2 Ligas por raridade da espécie

| Liga   | Pool                           |
| ------ | ------------------------------ |
| Common | common only                    |
| Rare   | rare                           |
| Epic   | epic                           |
| Legend | legendary + híbridos lendários |

### 10.3 Rating

```ts
rating =
  level * 12 + sum(stats) * 2 + generation * 8 + traitScore + winStreak * 15;
```

**Matchmaking offline:** oponentes são “ghosts” gerados (não PvP real Fase 1).

### 10.4 Recompensas temporada

| Tier     | Moedas | SP  | Extras                        |
| -------- | ------ | --- | ----------------------------- |
| Bronze   | 200    | 50  | —                             |
| Silver   | 500    | 120 | cosmético rare                |
| Gold     | 1200   | 300 | título + frame                |
| Champion | 2500   | 600 | pet exclusivo temporada / ovo |

---

## 11. Cosméticos 2.0

- **Só visual** — zero stats.
- Slots: hat · glasses · cape · accessory · backpack · wings · aura
- Raridade: common → mythic
- Inventário por `instanceId` (não só pet ativo)
- Obtenção: loot · liga · aventura · loja · prestígio

Migrar `equippedCosmeticsJson` para estrutura tipada por slot.

---

## 12. Favoritos e filtros

| Tag     | Ícone | Uso                   |
| ------- | ----- | --------------------- |
| `star`  | ⭐    | Favorito              |
| `heart` | ❤️    | Companheiro emocional |
| `crown` | 👑    | Campeão (liga / hall) |

Filtros no celeiro: todos · favoritos · GEN > n · espécie · prontos breed · em aventura.

---

## 13. Hall da Fama

**Rota:** `/pet-farm/hall`

- **6 pedestais** (expandir com upgrade)
- Categorias sugeridas: Maior GEN · Maior nível · Maior soma stats · Mais antigo · Mais aventuras · Mais vitórias Liga
- Visitante vê animação idle do pet + placa

---

## 14. Home da fazenda — mapa vivo

Substituir lista única por **mapa 2.5D / ilha** com prédios:

```
        [ Hall da Fama ]
    [ Academia ]   [ Liga ]
 [ Pasto ]  [ Lab ]  [ Incubadora ]
        [ Celeiro ]
      [ Aventuras ]
```

- Cada prédio: sprite + bounce idle + badge notificação (ovo pronto, aventura done)
- Tap → navega para sub-tela
- Zoom leve parallax no scroll (Reanimated)
- Clima/hora sincronizado com `routinePhase` do pet ativo (opcional)

**Inspiração:** Hay Day · Dragon City · Stardew (sem pixel art obrigatório — NativeWind + imagens WebP)

---

## 15. Tela de detalhes do pet (hub)

**Rota:** `/pet-farm/instance/[id]`

| Seção    | Conteúdo                                        |
| -------- | ----------------------------------------------- |
| Hero     | Avatar grande animado, GEN moldura, favorito    |
| Resumo   | Nível, XP bar, personalidade chip               |
| Stats    | 5 barras animadas                               |
| Traits   | Chips com reroll                                |
| Passivo  | Valor efetivo                                   |
| Linhagem | Resumo + link árvore                            |
| Ações    | Ativar · Pasto · Breed · Aventura · Academia    |
| Tabs     | Memórias · Conquistas · Equip · Histórico breed |

Transições: shared element do ícone celeiro → hero (Reanimated).

---

## 16. Evolução 2.0 (evento)

**Trigger:** `PetStage` sobe (baby → teen → adult → legendary)

**Sequência (2–4s):**

1. Overlay escurece (`opacity` 0 → 0.85)
2. Haptic heavy → light
3. Partículas (Lottie `evolution_burst.json`)
4. Pet scale 1 → 1.2 → 1 com spring
5. Flash branco 100ms
6. Nova forma / ícone glow
7. Confete + som `SFX_EVOLVE` (expo-audio)
8. Card recompensa moedas

**Skip:** tap após 1s.

---

## 17. Animações (camada de jogo)

| Estado      | Tech                       |
| ----------- | -------------------------- |
| Idle        | Reanimated loop translateY |
| Walk        | translateX loop no mapa    |
| Sleep       | opacity pulse + Zzz Lottie |
| Tap react   | scale 0.95 + haptic        |
| Happy / sad | swap Lottie overlay        |
| Hungry      | shake + ícone maçã         |
| Evolve      | §16                        |

**Stack:** Reanimated 3 + expo-haptics + Lottie (opcional Moti se já no projeto).

**Regra:** animação não substitui `PetSpeciesIcon` — complementa ao redor.

---

## 18. Integração com inglês (retenção)

| Loop diário | Gancho pet                            |
| ----------- | ------------------------------------- |
| Daily done  | +boost vitals + diálogo personalidade |
| Farm inglês | SP → upgrades fazenda                 |
| Foco        | trait `focus_resonance`               |
| Diário      | memória instância                     |
| Contrato    | memória + trait                       |

**Push (Fase posterior):** “Seu Owlyote voltou da aventura!” · “Ovo pronto!”

---

## 19. Balanceamento econômico (anti-inflação)

| Fonte         | Teto/semana (alvo)          |
| ------------- | --------------------------- |
| Aventuras     | 8k moedas                   |
| Liga          | 3k moedas                   |
| Breeding sink | 5k moedas gastos            |
| Trait reroll  | 2k moedas equivalente       |
| Academia      | tempo, não moedas infinitas |

**Stats:** manter cap 90; traits não somam mais +25% XP cada — usar diminishing returns no `RewardModifierService`.

**SP:** Liga e aventuras longas — não competir com farm de inglês (máx 200 SP/semana via pets).

---

## 20. Retenção — metas

| Métrica                     | Alvo D30  |
| --------------------------- | --------- |
| % com 2+ pets               | 40%       |
| Breeding / semana           | 0.8 média |
| Aventura iniciada / DAU pet | 35%       |
| Retorno notificação ovo     | 60% open  |
| Sessão pet-only (sem quest) | 15% DAU   |

---

## 21. Roadmap de implementação (Fase 22)

### 22.0 — Completar PET_FARM MVP doc ✅

- [x] Trocar pet ativo (`PetRosterService.setActiveInstance` + tela detalhe)
- [x] Bônus global (`PetFarmBonusCache` + `RewardModifierService` + breakdown)
- [x] Detalhe instância (`/pet-farm/instance/[id]`)
- [x] Mapa básico (`PetFarmMapContent` + `/pet-farm/pasture`)

### 22.1 — Linhagem + GEN (1 sprint) ✅

- [x] `generation` + migração backfill (`PetGenerationService`)
- [x] UI resumo + árvore genealógica (`PetLineageSummaryCard`, `/pet-farm/instance/[id]/tree`)
- [x] Conquistas GEN (`pet_gen_5` … `pet_gen_100`)
- [x] Molduras badge (`PetGenBadge`, `PetGenAvatarFrame`)

### 22.2 — Traits (1–2 sprints) ✅

- [x] `pet-traits-catalog.ts` (50 traits)
- [x] Roll hatch + breed (`PetTraitRollService`, `trait_keys_json`)
- [x] Reroll moedas + UI chips (`PetTraitChips`)
- [x] Itens `trait_reroll_single` / `trait_reroll_all` + loot
- [x] Integração `RewardModifierService` + breakdown (`PetTraitBonusCache`)

### 22.3 — Personalidade (0.5 sprint) ✅

- [x] Catálogo 30 + roll (`pet-personalities-catalog`, `personality_key`)
- [x] Filtro diálogos (`pet-personality-dialogues`, `pickDialogue`)
- [x] Preferência de animação (`PetPersonalityService.pickAnimation` + cache do companheiro)

### 22.4 — Memórias instância + timeline (0.5 sprint) ✅

- [x] Tabela `pet_instance_memories` + `PetInstanceMemoryRepository`
- [x] Catálogo de eventos + `PetInstanceMemoryService` (born, level, evolução, breed, GEN 5, trait epic)
- [x] Backfill + log de cruzamento
- [x] Timeline UI — rota `/pet-farm/instance/[id]/timeline`

### 22.5 — Mapa fazenda + detalhe pet (1 sprint) ✅

- [x] `PetFarmMapScreen` — ilha 2.5D, prédios posicionados, bounce Reanimated, parallax scroll, chip do companheiro
- [x] Rotas stub: `/pet-farm/adventures`, `academy`, `league`, `hall` (Em breve)
- [x] `PetInstanceDetailScreen` hub — hero animado, XP, ações, abas (Resumo · Memórias · Cruzamentos · …)
- [x] Histórico de cruzamento por instância (`listBreedingHistoryForInstance`)

### 22.6 — Aventuras (1–2 sprints) ✅

- [x] Tabelas `pet_adventures` + `pet_adventure_24h_log` (teto 3×24h/semana)
- [x] Catálogo biomas/durações, fórmula de sucesso, recompensas (moedas, XP pet, SP, loot)
- [x] `PetAdventureService` — iniciar, coletar, slots curtos/longos, traits Pathfinder/Scout
- [x] Tela `/pet-farm/adventures` + badge no mapa da ilha
- [x] Notificação local ao concluir expedição (`PET_REMINDER`)

### 22.7 — Academia (1 sprint) ✅

- [x] Tabela `pet_academy_sessions` + `PetAcademyService`
- [x] 5 trilhas (Vocabulary, Grammar, Listening, Speaking, Career) com durações 2h–4h
- [x] Bloqueio: pasto, breeding, aventura; 2 salas simultâneas
- [x] Recompensa: XP pet + 1–3 stat + 5% trait (`academy_ace` / `mentor_spirit`)
- [x] Tela `/pet-farm/academy` + badge no mapa + notificação local

### 22.8 — Liga (1–2 sprints) ✅

- [x] Tabelas `pet_league_meta` + `pet_league_entries`
- [x] Temporada 7 dias (reset segunda) · divisões por raridade
- [x] Rating + matchmaking ghosts offline + 5 lutas/pet/dia
- [x] Recompensas Bronze → Champion (moedas + SP) · Ouro desbloqueia Ilha do Céu
- [x] Tela `/pet-farm/league` + mapa ativo + memória `league_debut`

### 22.9 — Hall + favoritos + cosméticos por instância (1 sprint) ✅

- [x] Campos `favoriteTag`, `hallOfFameSlot`, `totalAdventures`, `equippedCosmeticsJson`
- [x] Tabela `pet_cosmetic_inventory` + `PetCosmeticService` (equipar por instância)
- [x] Hall 6 pedestais com categorias + auto-fill + memória `hall_inducted`
- [x] Favoritos ⭐❤️👑 no detalhe do pet + filtros no celeiro
- [x] Tela `/pet-farm/hall` + aba Equipar no hub + cosmético bônus Liga Prata

### 22.10 — Evolução cinematográfica + polish Lottie (1 sprint) ✅

- [x] `PetEvolutionService` centraliza recompensa + evento rico
- [x] Overlay fullscreen: escurecimento, burst de partículas, flash, spring, confete
- [x] Haptic heavy → light · SFX legendary + moedas · skip após 1s
- [x] Dispara em XP da Home, aventuras, academia e sync de instância

### 22.11 — Balance pass + métricas (contínuo)

---

## 22. Checklist de aceite Endgame 2.0

- [ ] Todo pet mostra GEN e pais (se existirem)
- [ ] Árvore genealógica navegável
- [ ] 50 traits catalogados; roll e reroll funcionam
- [ ] 30 personalidades afetam diálogo/animação
- [x] Timeline por instância
- [x] Mapa fazenda com prédios clicáveis (não CRUD)
- [x] Aventuras idle 15m–24h
- [x] Academia 5 tipos
- [x] Liga semanal com recompensas
- [x] Hall 6 slots + favoritos ⭐❤️👑
- [x] Evolução com overlay + haptic + partículas
- [x] Detalhe pet = hub visual completo
- [ ] Economia dentro dos tetos §19

---

## 23. Referências de código

| Área                | Path                                                           |
| ------------------- | -------------------------------------------------------------- |
| Fazenda MVP         | `src/features/pet-farm/`                                       |
| Instâncias          | `src/storage/repositories/pet-instance-repository.ts`          |
| Breeding            | `src/features/pet-farm/services/pet-breeding-service.ts`       |
| Memórias conta      | `src/features/pet/services/pet-memory-service.ts`              |
| Cosméticos catálogo | `src/features/pet/catalogs/pet-cosmetics-catalog.ts`           |
| Conquistas          | `src/features/achievements/constants/default-achievements.ts`  |
| Recompensas         | `src/features/game-design/services/reward-modifier-service.ts` |

---

## 24. Próximo passo

1. Aprovar catálogo de **50 traits** e **30 personalidades** (ajustar nomes/efeitos).
2. Priorizar **22.1 Linhagem + GEN** (baixo esforço, alto impacto emocional).
3. Em paralelo: fechar gaps do [PET_FARM_UPDATE.md](./PET_FARM_UPDATE.md) (mapa + detalhe + pet ativo).

Quando aprovado, implementar em PRs `pet-endgame/22.1-lineage`, `22.2-traits`, etc.
