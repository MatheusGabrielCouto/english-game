# Atualização Pet — Fazenda, Gênero e Crucamento

Documento de design e plano de implementação para a **Fazenda de Pets**: coleção visual, **melhorias de campos** (pasto de passivas, cercado de cruzamento), **atributos por instância** com herança no breeding, sistema de gênero (♀/♂), cruzamento com **vários pets possíveis por casal (%)**, min-max de stats/passivos, **um ícone vetorial por pet** (sem emoji duplo), enciclopédia de chances e glossário.

**Status:** 🚧 MVP implementado (instâncias, fazenda, breeding, ícones) — ver checklist §12  
**Próxima onda:** [PET_ENDGAME_2.0.md](./PET_ENDGAME_2.0.md) (linhagem, traits, aventuras, liga)  
**Relacionado:** [PET_SYSTEM.md](./PET_SYSTEM.md) · `src/features/pet-farm/`

---

## 1. Visão e objetivos

### O que o jogador ganha

| Objetivo                     | Como a fazenda entrega                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Ver todos os pets de uma vez | Mapa visual (pastos, celeiro, incubadora) com cada instância                                 |
| Progressão além do pet ativo | Colocar pets nos slots → bônus passivos empilhados (com teto)                                |
| Meta de coleção              | Novas espécies, híbridos exclusivos de cruzamento, glossário completo                        |
| Estratégia / min-max         | Cruzar pais com **melhores atributos** para filhos mais fortes; otimizar passivos na fazenda |
| Transparência                | Tela dedicada com **% de cada espécie filha** por par ♀+♂ + preview de stats herdáveis       |
| Melhoria da fazenda          | Gastar moedas/SP para **novos campos** (slots de passiva, cercados de breeding)              |
| Identidade visual            | **1 ícone por pet** (biblioteca vetorial), nunca dois símbolos no mesmo card                 |

### Princípios de design

1. **Pet ativo ≠ fazenda** — O pet da Home (`/pet`) continua sendo o companheiro emocional (vitals, interações, memórias). A fazenda é gestão e economia.
2. **Offline-first** — Tabelas de cruzamento e bônus em catálogos TypeScript versionados (sem API).
3. **Não punir quem tem 1 pet** — Fazenda desbloqueia com 2ª espécie descoberta ou nível 15; 1 slot grátis desde o início.
4. **Crucamento é lento e caro** — Cooldown, custo em moedas/SP, ovos com `hatchHours` maiores que ovo genérico da loja.
5. **Breeding = progression game** — O jogador repete cruzamentos para subir atributos (ex.: pai Força 20 → filho Força 25) e desbloquear passivos efetivos maiores.
6. **Um ícone só** — Cada espécie/instância renderiza exatamente **um** `PetSpeciesIcon`; proibido `🦉🐺`, emoji + ícone, ou emoji de gênero colado ao animal (gênero = badge separado).

---

## 2. Estado atual vs. alvo

### Hoje (baseline)

| Aspecto    | Implementação atual                                                             |
| ---------- | ------------------------------------------------------------------------------- |
| Instâncias | **1 linha** em `pets` (`getOrCreatePet` → `limit(1)`)                           |
| Espécies   | 29 em `PET_SPECIES_CATALOG`                                                     |
| Gênero     | Não existe                                                                      |
| Ovo        | Item genérico → espécie aleatória ponderada por raridade (`pet-egg-service.ts`) |
| Passivo    | Por espécie; só o pet ativo importa na prática                                  |
| Atributos  | Não existe (sem stats por instância)                                            |
| Ícone      | Emoji Unicode por espécie (`species.emoji`)                                     |
| Coleção    | `pet_collection` (dex por espécie, não por instância)                           |

### Alvo (esta atualização)

| Aspecto           | Alvo                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Instâncias        | Tabela `pet_instances` (N pets por jogador)                                              |
| Pet ativo         | `player_settings.active_pet_instance_id` ou coluna em perfil                             |
| Fazenda           | `pet_farm_slots` + layout visual                                                         |
| Gênero            | `gender: 'female' \| 'male'` por instância (atribuído na eclosão ou item “Determinante”) |
| Ovo de cruzamento | Item `breeding_egg` com `targetSpeciesKey` fixo ou pool restrito                         |
| Atributos         | 5 stats por instância + herança no cruzamento                                            |
| Passivo efetivo   | `espécie.passive × fator(atributo)` + bônus de slot na fazenda                           |
| Fazenda           | Campos melhoráveis (pasto passiva, cercado breeding, incubadora)                         |
| Ícone             | `iconId` único → `PetSpeciesIcon` (MaterialCommunityIcons / Lucide)                      |
| Telas novas       | Fazenda · Melhorias · Laboratório · Enciclopédia % · Glossário                           |

---

## 3. Conceitos do sistema

### 3.1 Instância de pet

Cada criatura possui:

```ts
type PetStatKey = "strength" | "focus" | "luck" | "resilience" | "charm";

type PetInstanceStats = Record<PetStatKey, number>; // 1–99 por stat (teto por raridade)

type PetInstance = {
  id: number;
  speciesKey: string;
  gender: "female" | "male";
  nickname: string;
  stage: PetStageValue;
  level: number;
  experience: number;
  stats: PetInstanceStats;
  statsJson: string; // persistência SQLite
  effectivePassiveValue: number; // cache: espécie × stats
  // vitals só no pet ATIVO; instâncias na fazenda ficam "descansando"
  isActive: boolean;
  passiveFieldSlot: number | null; // pasto de passivas (§3.8)
  breedingPenSlot: number | null; // cercado (só durante cruzamento)
  acquiredAt: string;
  parentMotherId: number | null;
  parentFatherId: number | null;
  breedingCooldownUntil: string | null;
};
```

**Regra:** Apenas o pet **ativo** recebe decay de vitals, interações e XP de estudo. Pets na fazenda não morrem de fome — ficam em estado `resting` com snapshot de nível/estágio/stats.

### 3.2 Atributos por instância (cada pet é único)

Cada **instância** tem 5 atributos numéricos, independentes da espécie base. A espécie define **valores base** e qual stat **escala o passivo**.

| Stat (`PetStatKey`) | Label PT    | Afeta principalmente                              |
| ------------------- | ----------- | ------------------------------------------------- |
| `strength`          | Força       | `coin_boost`                                      |
| `focus`             | Foco        | `xp_boost`                                        |
| `luck`              | Sorte       | `loot_luck`                                       |
| `resilience`        | Resiliência | `shield_weekly`, decay de vitals                  |
| `charm`             | Carisma     | Eficiência do slot na fazenda (`SLOT_EFFICIENCY`) |

**Base por raridade** (rolagem na primeira eclosão / ovo sem pais):

| Raridade  | Faixa por stat (rolagem uniforme) | Teto absoluto |
| --------- | --------------------------------- | ------------- |
| common    | 8–18                              | 45            |
| rare      | 12–24                             | 60            |
| epic      | 16–30                             | 75            |
| legendary | 20–35                             | 90            |

**Passivo efetivo da instância:**

```ts
const STAT_FOR_PASSIVE: Record<PassiveType, PetStatKey> = {
  xp_boost: "focus",
  coin_boost: "strength",
  loot_luck: "luck",
  shield_weekly: "resilience",
};

effectivePassive =
  species.passive.value *
  (1 + (instance.stats[STAT_FOR_PASSIVE[species.passive.type]] - 10) / 100);
// Ex.: species +5% coins, strength 25 → 5 * 1.15 = 5.75% → exibe +6% arredondado
```

**Por que breeding importa:** dois Code Owls podem ter passivos iguais na espécie (+5% XP), mas o filho com Foco 32 vs. 14 é estritamente melhor — o jogador cruza para **subir stats**, não só espécie.

### 3.3 Herança de atributos no cruzamento

Quando um casal ♀+♂ gera filho (após rolar **espécie** no pool §5):

1. **Por stat:** `base = max(mãe.stat, pai.stat)` — o filho **herda o mesmo atributo** do melhor pai naquele stat.
2. **Melhoria (roll-up):** `childStat = min(cap, base + upgrade)` onde `upgrade` é sorteado:

| upgrade  | Chance |
| -------- | ------ |
| +0       | 35%    |
| +1 a +3  | 40%    |
| +4 a +6  | 18%    |
| +7 a +10 | 7%     |

3. **Exemplo (pedido):** pai Força 20, mãe Força 14 → `base = 20` → roll +5 → **filho Força 25**.
4. **Stats sem “linhagem” forte:** se ambos pais têm stat baixo, filho ainda pode pular via roll-up — mas cruzar pais elite é a rota eficiente.
5. **Bônus mesmo espécie:** par ♀♂ mesma espécie → +5% chance de upgrade ≥ +4 em um stat aleatório.
6. **Híbrido:** usa bases da espécie filha rolada, mas herança usa stats dos **pais** (não zera).

**Preview na UI de cruzamento:** para cada linha do pool de espécies (ex. `owlyote 35%`), mostrar faixa estimada `Força 20–28` com base nos pais.

Persistir em `pet_breeding_log`: `outcome_species_key`, `rolled_stats_json`, `parent_stats_snapshot_json`.

### 3.4 Fazenda — campos melhoráveis e passivas

A fazenda não é só “nível = +1 slot”. O jogador **melhora campos** separados (moedas + opcional SP), cada um com cap e UI própria no mapa.

| Campo (`fieldKey`) | Função                                          | Nível inicial | Máx | Custo por nível (moedas) |
| ------------------ | ----------------------------------------------- | ------------- | --- | ------------------------ |
| `passive_pasture`  | Slots para pets **ativarem passivo** na fazenda | 1             | 8   | 300 × nível²             |
| `breeding_pen`     | Casais simultâneos no cercado                   | 1             | 3   | 500 × nível²             |
| `incubator_room`   | Fila de ovos incubando                          | 2             | 6   | 250 × nível              |
| `barn_storage`     | Capacidade do celeiro (instâncias guardadas)    | 12            | 50  | 150 × nível              |

**Pasto de passivas (`passive_pasture`):**

- Cada slot aceita 1 pet; passivo efetivo = `effectivePassive × SLOT_EFFICIENCY × (1 + charm/200)`.
- `SLOT_EFFICIENCY = 0.5` no nível 1 do campo; +0.05 por nível do campo (máx 0.85 no nível 8).
- Soma global ainda respeita **tetos** (tabela abaixo).
- Ordenação ao calcular bônus: maior `effectivePassive` primeiro.

| Tipo de passivo | Teto somado na fazenda |
| --------------- | ---------------------- |
| `xp_boost`      | +18%                   |
| `coin_boost`    | +18%                   |
| `loot_luck`     | +12%                   |
| `shield_weekly` | +2 escudos/semana      |

**Cercado de breeding (`breeding_pen`):**

- Nível 1: 1 casal por vez.
- Nível 2–3: 2–3 casais em paralelo (timers independentes).
- Pet no cercado não conta no pasto até terminar.

**Tela “Melhorar fazenda”:** lista de campos com preview do próximo nível, custo e botão comprar.

**Visual da fazenda (UI) — 1 ícone por tile:**

```
┌──────────────────────────────────────────────────┐
│  Fazenda de Pets    [Melhorar] [Glossário] [?]   │
│  Bônus: +12% XP · +6% Coins (pasto 3/5)         │
├──────────────────────────────────────────────────┤
│  PASTO DE PASSIVAS (melhorar → +slots)           │
│  [icon]♀  [icon]♂  [ vazio ]  [🔒] [🔒]         │
│  Nv.12    Nv.8     —                            │
├──────────────────────────────────────────────────┤
│  CERCADO BREEDING (1/2)        INCUBADORA (2/4) │
│  ♀ + ♂ → timer                 ovo · ovo         │
├──────────────────────────────────────────────────┤
│  Celeiro (scroll) — cada chip: UM ícone + ♀/♂   │
├──────────────────────────────────────────────────┤
│  [Pet ativo]  [Cruzar]  [Enciclopédia %]        │
└──────────────────────────────────────────────────┘
```

- **Pasto:** grade de slots = nível de `passive_pasture`.
- **Celeiro:** lista horizontal; **nunca** empilhar dois ícones no mesmo pet.
- **Incubadora:** fila = nível de `incubator_room`.

### 3.5 Gênero

| Regra                   | Detalhe                                                                    |
| ----------------------- | -------------------------------------------------------------------------- |
| Atribuição na eclosão   | 50% ♀ / 50% aleatório, **exceto** espécies com `defaultGender` no catálogo |
| Espécies “só um gênero” | Nenhuma — todas podem ser ♀ ou ♂                                           |
| Item opcional           | `gender_tonic` (loja): força ♀ ou ♂ no próximo hatch/cruzamento            |
| Cruzamento              | Obrigatório **♀ + ♂** (ordem na UI: mãe + pai)                             |
| UI                      | Badge ♀/♂ **separado** do ícone do animal (nunca segundo ícone no pet)     |

**Bias temático (só flavor, não gameplay):** nomes femininos/masculinos nas descrições do glossário; mecânica é sempre 50/50 salvo item.

### 3.6 Cruzamento (breeding) — vários filhos possíveis por casal

**Regra central:** cada par ♀+♂ define um **pool de espécies filhas**, cada uma com `weight` → % exibido na Enciclopédia. Um cruzamento rola **uma** espécie do pool; atributos do filho seguem §3.3.

**Fluxo:**

1. Jogador abre **Laboratório** (requer `breeding_pen` ≥ 1).
2. Seleciona **Mãe (♀)** e **Pai (♂)** — adultos, stats visíveis, fora de cooldown.
3. Vê lista de **todos os pets possíveis** com % + faixa de stats herdáveis (ex. `Owlyote 35% · Foco 18–26`).
4. Paga custo → ovo na incubadora com `speciesKey` já rolado + `statsPreview` aplicado na eclosão.
5. Pais em cooldown **72h** (ajustável por raridade).

**Motivação explícita (loop de poder):**

| Jogador quer                     | Ação                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Melhor % de espécie rara/híbrida | Escolher pares da Enciclopédia com peso alto no alvo                         |
| Melhor passivo numérico          | Cruzar pais com stat alto ligado ao `passive.type`                           |
| Melhor fazenda global            | Colocar instâncias com maior `effectivePassive` no pasto                     |
| “Perfect pet”                    | Repetir breeding da mesma linha subindo +Força/+Foco generation a generation |

**Custos sugeridos:**

| Raridade do pai (maior entre os dois) | Moedas | SP opcional |
| ------------------------------------- | ------ | ----------- |
| Comum                                 | 150    | —           |
| Rara                                  | 400    | 80          |
| Épica                                 | 900    | 200         |
| Lendária                              | 2000   | 500         |

**Tempo de gestação / incubadora do cruzamento:**

| Resultado                           | `hatchHours`                    |
| ----------------------------------- | ------------------------------- |
| Filho mesma linha (pai=mãe espécie) | `avg(parents.hatchHours) * 0.8` |
| Híbrido                             | `max(parents) * 1.2`            |
| Mutação rara                        | `max(parents) * 1.5`            |

**Item gerado:** `breeding_egg:{speciesKey}` ou entrada em `pet_incubators` com `speciesKey` + `source: 'breeding'`.

### 3.7 Ovo genérico vs. ovo de cruzamento

| Fonte                      | Comportamento                                             |
| -------------------------- | --------------------------------------------------------- |
| Loja SP / loot (`pet_egg`) | Pool aleatório de espécie + stats base §3.2 (sem herança) |
| Cruzamento                 | Pool `PET_BREEDING_OUTCOMES` + herança de stats §3.3      |
| Missão / conquista         | Pode conceder ovo com `speciesKey` fixo                   |

### 3.8 Ícone único por pet (bibliotecas)

**Regra absoluta:** em qualquer UI (fazenda, pet ativo, glossário, breeding, inventário), o pet renderiza **exatamente um** componente `PetSpeciesIcon`. Proibido: emoji Unicode como avatar, concatenação `🦉🐺`, emoji + Lucide, ou “ícone de fundo + ícone de frente”.

```tsx
// src/features/pet-farm/components/PetSpeciesIcon.tsx
type PetIconRef = {
  library: "MaterialCommunityIcons" | "Lucide";
  name: string; // ex. 'owl', 'shark', 'Cat'
};

// catálogo: species.icon: PetIconRef — substitui species.emoji
```

#### Avaliação de bibliotecas (projeto já tem `@expo/vector-icons` + `lucide-react-native`)

| Biblioteca                 | Pacote no app         | Animais                                                                                                                                                                                 | Recomendação                              |
| -------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **MaterialCommunityIcons** | `@expo/vector-icons`  | ~80+ (`cat`, `dog`, `owl`, `shark`, `penguin`, `snake`, `bee`, `dolphin`, `elephant`, `frog`, `panda`, `rabbit`, `turtle`, `bird`, `fish`, `horse`, `pig`, `sheep`, `crab`, `llama`, …) | **Principal** para espécies               |
| **Lucide**                 | `lucide-react-native` | Poucos (`Cat`, `Dog`, `Bird`, `Fish`, `Rabbit`, `Turtle`, `Squirrel`, `Bug`, `Snail`)                                                                                                   | UI chrome + espécies sem equivalente MCI  |
| Ionicons                   | `@expo/vector-icons`  | Subconjunto menor                                                                                                                                                                       | Fallback pontual                          |
| Phosphor / Tabler          | Não instalado         | Muito amplo                                                                                                                                                                             | Só se MCI faltar ícone; avaliar em Fase C |

**Decisão:** migrar `PET_SPECIES_CATALOG` de `emoji: string` para `icon: PetIconRef`. Deprecar `emoji` em exibição de pets (manter só em texto lore se necessário).

#### Mapeamento inicial (espécies existentes + novas — 1 ícone cada)

| speciesKey                                   | library | icon `name`                                                |
| -------------------------------------------- | ------- | ---------------------------------------------------------- |
| codeowl, quantumowl, openowl                 | MCI     | `owl`                                                      |
| debugduck                                    | MCI     | `duck`                                                     |
| gitcat                                       | MCI     | `cat`                                                      |
| bytebunny                                    | MCI     | `rabbit`                                                   |
| stackfox                                     | MCI     | `fox` (ou `dog` se fox indisponível no build)              |
| loopfrog                                     | MCI     | `frog`                                                     |
| cachebear, blockchainbear                    | MCI     | `bear`                                                     |
| pingpanda                                    | MCI     | `panda`                                                    |
| mergepenguin                                 | MCI     | `penguin`                                                  |
| deploydragon, worldserpent                   | MCI     | `snake`                                                    |
| cloudkoala                                   | MCI     | `koala`                                                    |
| apishark                                     | MCI     | `shark`                                                    |
| reactraptor                                  | MCI     | `dinosaur`                                                 |
| nodeunicorn                                  | MCI     | `horse`                                                    |
| sqlsnake, vimviper                           | MCI     | `snake`                                                    |
| devdolphin                                   | MCI     | `dolphin`                                                  |
| bugbee                                       | MCI     | `bee`                                                      |
| scal_eagle, globalhawk                       | MCI     | `bird`                                                     |
| kernelkraken                                 | MCI     | `octopus`                                                  |
| asyncphoenix, passportphoenix, aiphoenix     | Lucide  | `Bird` + cor `accent` (fênix = pássaro estilizado)         |
| remotegriffin, legendarylion, fullstacktiger | MCI     | `lion`                                                     |
| microservicewolf                             | MCI     | `wolf`                                                     |
| celestialwhale                               | MCI     | `whale`                                                    |
| rustcrab                                     | MCI     | `crab`                                                     |
| dockerdog                                    | MCI     | `dog`                                                      |
| lambdaotter                                  | MCI     | `otter`                                                    |
| graphqlama                                   | MCI     | `llama`                                                    |
| typescripturtle, terraformtortoise           | MCI     | `turtle`                                                   |
| kubchick                                     | MCI     | `bird` (pintinho)                                          |
| redisram                                     | MCI     | `sheep`                                                    |
| elasticelk                                   | MCI     | `deer`                                                     |
| agilegecko                                   | MCI     | `snake` (lagarto — usar asset custom Fase F se necessário) |
| **owlyote**                                  | MCI     | `wolf`                                                     |
| **ducktor**                                  | MCI     | `duck`                                                     |
| **catshark**                                 | MCI     | `shark`                                                    |
| **raptoracle**                               | MCI     | `dinosaur`                                                 |
| **phoenixbee**                               | MCI     | `bee`                                                      |
| **griffwhale**                               | MCI     | `whale`                                                    |
| **quantumserpent**                           | MCI     | `snake`                                                    |
| **fullstackling**                            | MCI     | `penguin`                                                  |

**Híbridos:** ícone próprio único (não combinar pai+mãe visualmente). Nome evoca mix; arte = um animal dominante.

**Tarefas de implementação:**

1. `PetSpeciesIcon` + testes snapshot por `speciesKey`.
2. Script `scripts/validate-pet-icons.ts` — falha CI se espécie sem `icon` ou duplicata inválida.
3. Substituir `species.emoji` em `PetHeroDisplay`, `PetCard`, `PetCollectionSection`, fazenda.
4. Glossário: silhueta = mesmo ícone com `opacity-20`, não “?” emoji.

---

## 4. Novas espécies (catálogo expandido)

Além das **29 espécies atuais**, adicionar **14 novas** (total **43**). Híbridos exclusivos de cruzamento: **8** (total jogável **51** entradas no glossário, sendo 8 só via breeding).

### 4.1 Stats base por espécie (além da raridade)

Cada espécie define `baseStats` — viés de rolagem inicial (não fixa o filho bred):

| speciesKey (ex.) | strength | focus | luck | resilience | charm |
| ---------------- | -------- | ----- | ---- | ---------- | ----- |
| codeowl          | 8        | 14    | 10   | 10         | 12    |
| debugduck        | 10       | 8     | 12   | 11         | 10    |
| apishark         | 14       | 10    | 16   | 12         | 8     |
| legendarylion    | 18       | 14    | 12   | 16         | 14    |

Fórmula primeira eclosão: `stat = baseStats[key] + random(0..5)`, clamp na faixa da raridade §3.2.

### 4.2 Novas espécies base (ovo, missão, loja)

| key                 | Nome               | Ícone MCI     | Raridade  | Passivo       | hatch h |
| ------------------- | ------------------ | ------------- | --------- | ------------- | ------- |
| `rustcrab`          | Rust Crab          | `crab`        | common    | +4% loot      | 20      |
| `vimviper`          | Vim Viper          | `snake`       | common    | +5% XP        | 22      |
| `dockerdog`         | Docker Dog         | `dog`         | common    | +5% coins     | 20      |
| `lambdaotter`       | Lambda Otter       | `otter`       | rare      | +7% XP        | 40      |
| `graphqlama`        | GraphQL Llama      | `llama`       | rare      | +7% loot      | 40      |
| `typescripturtle`   | TypeScript Turtle  | `turtle`      | rare      | +1 shield/sem | 44      |
| `kubchick`          | K8s Chick          | `bird`        | rare      | +8% coins     | 36      |
| `redisram`          | Redis Ram          | `sheep`       | epic      | +11% XP       | 80      |
| `elasticelk`        | Elastic Elk        | `deer`        | epic      | +11% coins    | 80      |
| `terraformtortoise` | Terraform Tortoise | `turtle`      | epic      | +10% loot     | 84      |
| `agilegecko`        | Agile Gecko        | `snake`\*     | epic      | +12% XP       | 72      |
| `blockchainbear`    | Chain Bear         | `polar-bear`  | legendary | +18% coins    | 144     |
| `openowl`           | Open Owl           | `owl`         | legendary | +22% XP       | 160     |
| `aiphoenix`         | AI Phoenix         | Lucide `Bird` | legendary | +15% loot     | 168     |

\*Gecko: trocar por SVG custom na Fase F se ícone não satisfizer.

### 4.3 Híbridos exclusivos (só cruzamento — 1 ícone cada)

| key              | Nome            | Ícone      | Raridade  | Pais típicos                   | Passivo        |
| ---------------- | --------------- | ---------- | --------- | ------------------------------ | -------------- |
| `owlyote`        | Owlyote         | `wolf`     | rare      | codeowl × stackfox             | +9% XP         |
| `ducktor`        | Ducktor         | `duck`     | rare      | debugduck × loopfrog           | +9% coins      |
| `catshark`       | Catshark        | `shark`    | epic      | gitcat × apishark              | +13% loot      |
| `raptoracle`     | Raptoracle      | `dinosaur` | epic      | reactraptor × sqlsnake         | +14% XP        |
| `phoenixbee`     | Phoenix Bee     | `bee`      | epic      | asyncphoenix × bugbee          | +14% coins     |
| `griffwhale`     | Griffwhale      | `whale`    | legendary | remotegriffin × celestialwhale | +22% loot      |
| `quantumserpent` | Quantum Serpent | `snake`    | legendary | quantumowl × worldserpent      | +28% XP        |
| `fullstackling`  | Fullstackling   | `penguin`  | legendary | fullstacktiger × mergepenguin  | +2 shields/sem |

---

## 5. Tabela de cruzamento (♀ mãe × ♂ pai) — múltiplos pets por casal

Cada casal define **N possíveis filhos** (espécies diferentes), cada um com peso. A UI **sempre** lista todos com %; o jogador nunca vê “só um resultado possível” sem saber dos outros.

Formato canônico em código:

```ts
type BreedingOutcome = {
  speciesKey: string;
  weight: number;
  // opcional: bônus de stat mínimo quando este outcome é rolado
  statBias?: Partial<Record<PetStatKey, number>>;
};

type BreedingPairKey = `${string}__${string}`; // motherSpecies__fatherSpecies

// PET_BREEDING_OUTCOMES: Record<BreedingPairKey, BreedingOutcome[]>
// Σ weight por par = 100 (normalizado em runtime se drift)
```

**Regras globais aplicadas em runtime:**

1. Se par não existe na tabela → **fallback** (§5.3).
2. Pesos são relativos; UI mostra `weight / sum(weights) * 100` arredondado — **lista completa**, ordenada do maior % ao menor.
3. Após rolar `speciesKey`, aplicar **herança de stats** §3.3 (independente de qual filho saiu).
4. Pais devem ser **espécies diferentes** para híbridos; mesmo espécie usa tabela “mesma linha” (§5.2).
5. Enciclopédia e Laboratório usam a **mesma fonte** `PET_BREEDING_OUTCOMES` (DRY).

### 5.1 Mesma espécie (♀ e ♂ iguais — ex.: codeowl × codeowl)

| Resultado                                      | Peso | %   |
| ---------------------------------------------- | ---- | --- |
| Mesma espécie (`codeowl`)                      | 70   | 70% |
| Mutação vizinha raridade\*                     | 20   | 20% |
| Ovo genérico misterioso (`pet_egg` pool comum) | 10   | 10% |

\*Mutação vizinha: espécie da **mesma família** na tabela de linhagem (§5.4) ou próxima raridade na cadeia owl→quantumowl.

### 5.2 Pares principais (amostra — implementar lista completa no catálogo)

> **Nota:** A implementação deve gerar **todas** as combinações ♀×♂ entre as 43 espécies base via script, mas **só pares listados** ou **famílias** têm pesos custom; demais usam fallback. Abaixo: pares desenhados + templates por família.

#### Família Owl (mãe owl × pai não-owl)

| Mãe ♀      | Pai ♂        | Resultados (speciesKey : peso)                                                   |
| ---------- | ------------ | -------------------------------------------------------------------------------- |
| codeowl    | stackfox     | owlyote:35, codeowl:40, stackfox:15, bytebunny:10                                |
| codeowl    | debugduck    | codeowl:55, debugduck:30, ducktor:10, owlyote:5                                  |
| quantumowl | worldserpent | quantumserpent:40, quantumowl:25, worldserpent:20, openowl:10, passportphoenix:5 |
| quantumowl | stackfox     | quantumowl:45, owlyote:25, stackfox:20, codeowl:10                               |

#### Família Aquática

| Mãe ♀          | Pai ♂          | Resultados                                                           |
| -------------- | -------------- | -------------------------------------------------------------------- |
| devdolphin     | apishark       | catshark:30, devdolphin:35, apishark:25, gitcat:10                   |
| celestialwhale | remotegriffin  | griffwhale:35, celestialwhale:30, remotegriffin:25, kernelkraken:10  |
| mergepenguin   | fullstacktiger | fullstackling:30, mergepenguin:40, fullstacktiger:25, deploydragon:5 |

#### Família Inseto / Fogo

| Mãe ♀        | Pai ♂        | Resultados                                                    |
| ------------ | ------------ | ------------------------------------------------------------- |
| bugbee       | asyncphoenix | phoenixbee:35, bugbee:35, asyncphoenix:20, aiphoenix:10       |
| asyncphoenix | bugbee       | phoenixbee:35, asyncphoenix:35, bugbee:20, passportphoenix:10 |

#### Cruzamentos “tech stack” (novas espécies)

| Mãe ♀             | Pai ♂      | Resultados                                                            |
| ----------------- | ---------- | --------------------------------------------------------------------- |
| dockerdog         | gitcat     | dockerdog:40, gitcat:35, catshark:15, debugduck:10                    |
| rustcrab          | vimviper   | rustcrab:40, vimviper:35, sqlsnake:15, loopfrog:10                    |
| lambdaotter       | graphqlama | lambdaotter:38, graphqlama:38, cloudkoala:14, typescripturtle:10      |
| kubchick          | redisram   | kubchick:35, redisram:30, mergepenguin:20, nodeunicorn:15             |
| terraformtortoise | agilegecko | terraformtortoise:40, agilegecko:35, fullstacktiger:15, scal_eagle:10 |

#### Lendários estritos (peso baixo no filho lendário)

| Mãe ♀          | Pai ♂      | Resultados                                                                          |
| -------------- | ---------- | ----------------------------------------------------------------------------------- |
| legendarylion  | globalhawk | legendarylion:40, globalhawk:35, griffwhale:8, quantumserpent:12, passportphoenix:5 |
| blockchainbear | openowl    | blockchainbear:45, openowl:40, aiphoenix:10, quantumowl:5                           |

### 5.3 Fallback (par não catalogado)

Para qualquer ♀ `M` e ♂ `P` sem entrada explícita:

| Resultado                                         | Peso |
| ------------------------------------------------- | ---- |
| Espécie da mãe                                    | 35   |
| Espécie do pai                                    | 35   |
| Híbrido se existir em `PET_HYBRID_LOOKUP[M,P]`    | 10   |
| Espécie de raridade `min(mother,rare)` da família | 15   |
| Ovo surpresa (pool raridade média dos pais)       | 5    |

`PET_HYBRID_LOOKUP` — matriz simétrica só para os 8 híbridos definidos em §4.2.

### 5.4 Famílias (linhagem para mutação mesma espécie)

| familyKey | Espécies                                           |
| --------- | -------------------------------------------------- |
| `owl`     | codeowl, quantumowl, openowl                       |
| `canine`  | stackfox, microservicewolf                         |
| `feline`  | gitcat, fullstacktiger                             |
| `aquatic` | devdolphin, apishark, celestialwhale, mergepenguin |
| `fire`    | asyncphoenix, passportphoenix, aiphoenix, bugbee   |
| `serpent` | sqlsnake, worldserpent, vimviper                   |
| `bear`    | cachebear, blockchainbear                          |
| `avian`   | globalhawk, scal_eagle, deploydragon               |

### 5.5 Matriz resumida — híbridos (chance do híbrido no pool do par)

| Mãe ♀          | Pai ♂          | Híbrido        | % aprox. |
| -------------- | -------------- | -------------- | -------- |
| codeowl        | stackfox       | owlyote        | 35%      |
| debugduck      | loopfrog       | ducktor        | 25%\*    |
| gitcat         | apishark       | catshark       | 30%      |
| reactraptor    | sqlsnake       | raptoracle     | 28%      |
| asyncphoenix   | bugbee         | phoenixbee     | 35%      |
| remotegriffin  | celestialwhale | griffwhale     | 35%      |
| quantumowl     | worldserpent   | quantumserpent | 40%      |
| fullstacktiger | mergepenguin   | fullstackling  | 30%      |

\*ducktor: peso 10% no par codeowl×debugduck; par canônico debugduck♀×loopfrog♂ → 25%.

### 5.6 Script de geração do catálogo completo

```bash
# Futuro — não commitar JSON gigante sem compressão
pnpm exec tsx scripts/generate-pet-breeding-matrix.ts
```

O script deve:

1. Ler `PET_SPECIES_CATALOG` + híbridos.
2. Emitir `pet-breeding-outcomes.ts` com pares explícitos + fallback marker.
3. Validar que soma de pesos por par = 100 (±0 por inteiros).
4. Gerar `docs/PET_BREEDING_MATRIX.generated.md` para QA (opcional).

---

## 6. Glossário de pets (Petédex 2.0)

### Conteúdo por entrada

| Campo            | Descrição                                       |
| ---------------- | ----------------------------------------------- |
| `speciesKey`     | ID                                              |
| `name` + `icon`  | **Um** `PetSpeciesIcon` + nome                  |
| `rarity`         | common → legendary                              |
| `baseStats`      | Viés dos 5 atributos                            |
| `description`    | 2–3 frases lore + dica de inglês dev            |
| `passive`        | Tipo + valor base (antes de stats da instância) |
| `howToObtain`    | Ovo, cruzamento, missão, loja SP                |
| `families`       | Tags                                            |
| `genderNote`     | “Qualquer gênero”                               |
| `breedingRole`   | Boa mãe / bom pai / híbrido exclusivo           |
| `relatedHybrids` | Links para filhos + % se par descoberto         |
| `statGuide`      | Qual stat priorizar para min-max                |

### Estados de descoberta

| Estado                 | UI                                        |
| ---------------------- | ----------------------------------------- |
| Desconhecido           | Silhueta + “???”                          |
| Visto (ovo/cruzamento) | Ícone embaçado (`opacity-30`) + nome      |
| Registrado             | Entrada completa + faixa de stats típica  |
| Mestre                 | 3+ instâncias possuídas — estrela dourada |

### Navegação

- Aba **Glossário** dentro da Fazenda (e atalho na tela `/pet`).
- Filtros: raridade, família, só híbridos, só obtíveis por cruzamento.
- Busca por nome (reutilizar padrão `MenuHubSearchField`).

---

## 7. Telas e rotas

| Rota                     | Componente                      | Função                                        |
| ------------------------ | ------------------------------- | --------------------------------------------- |
| `/pet-farm`              | `PetFarmScreen`                 | Mapa + pasto + cercado + celeiro              |
| `/pet-farm/upgrades`     | `PetFarmUpgradesScreen`         | Melhorar campos (§3.4)                        |
| `/pet-farm/breeding`     | `PetBreedingLabScreen`          | ♀♂ + lista de filhos possíveis com % + stats  |
| `/pet-farm/encyclopedia` | `PetBreedingEncyclopediaScreen` | Todos os % por par; filtros; ranking de pares |
| `/pet-farm/glossary`     | `PetGlossaryScreen`             | Petédex 2.0 + ícone único                     |
| `/pet-farm/instance/:id` | `PetInstanceDetailScreen`       | Stats, pais, passivo efetivo, histórico breed |

**Menu Hub:** nova entrada “Fazenda de Pets” em `progression` com keywords `fazenda, breeding, cruzar, pets`.

### 7.1 Enciclopédia de cruzamento (%)

- Fluxo: escolhe espécie **Mãe ♀** → lista pais **♂** compatíveis.
- Para cada par: **lista vertical de todos os filhos** — `PetSpeciesIcon` + nome + **%** + tag híbrido.
- Coluna extra: “Stats esperados” (min–max por stat com base nos teus melhores pais selecionados).
- Pares não testados: fallback §5.3 com label “Estimado”.
- Filtros: “Mostrar só híbridos”, “% ≥ 10%”, “Espécie alvo X”.
- **Simular ×1000** (dev): gráfico de barras por `speciesKey`.

### 7.2 Componentes UI reutilizáveis

| Componente                | Uso                                               |
| ------------------------- | ------------------------------------------------- |
| `PetSpeciesIcon`          | **Único** avatar de espécie (MCI/Lucide)          |
| `PetStatBars`             | 5 barras Força/Foco/Sorte/…                       |
| `PetFarmSlotTile`         | Pasto: 1 ícone + badge ♀/♂ + nível                |
| `PetFarmFieldUpgradeCard` | Melhoria de campo + custo                         |
| `PetInstanceChip`         | `PetSpeciesIcon` + ♀/♂ + nível (sem emoji animal) |
| `PetBreedingPairPicker`   | Dois slots + stats resumidos dos pais             |
| `PetBreedingOutcomeList`  | Lista de outcomes com % (obrigatório no lab)      |
| `PetOutcomeChanceRow`     | Barra % + ícone + nome                            |
| `PetGlossaryCard`         | Entrada expandível + stats base                   |

**Estética:** pasto verde suave (`bg-emerald-950/20`), cercas, celeiro — alinhado a `PetIncubationLab` (laboratório) mas tema rural.

---

## 8. Modelo de dados e migração

### 8.1 Novas tabelas

```sql
-- Instâncias (migração do row único em pets)
CREATE TABLE pet_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_key TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('female', 'male')),
  nickname TEXT NOT NULL,
  stage TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  stats_json TEXT NOT NULL DEFAULT '{}',
  effective_passive_value REAL NOT NULL DEFAULT 0,
  passive_field_slot INTEGER,
  breeding_pen_slot INTEGER,
  is_active INTEGER NOT NULL DEFAULT 0,
  parent_mother_id INTEGER,
  parent_father_id INTEGER,
  breeding_cooldown_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE pet_farm_fields (
  field_key TEXT PRIMARY KEY,
  level INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE pet_farm_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  farm_xp INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE pet_incubators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_key TEXT NOT NULL,
  source TEXT NOT NULL, -- 'shop' | 'breeding' | 'quest'
  hatch_at TEXT NOT NULL,
  parent_mother_id INTEGER,
  parent_father_id INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE pet_breeding_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mother_instance_id INTEGER NOT NULL,
  father_instance_id INTEGER NOT NULL,
  outcome_species_key TEXT NOT NULL,
  rolled_stats_json TEXT NOT NULL,
  parent_stats_snapshot_json TEXT NOT NULL,
  outcome_weights_snapshot_json TEXT NOT NULL,
  rolled_at TEXT NOT NULL
);
```

### 8.2 Migração do pet único

1. Copiar row `pets` → `pet_instances` com `is_active = 1`.
2. Gerar `gender` aleatório determinístico por hash do `id` (reprodutível).
3. Gerar `stats_json` a partir de `baseStats` da espécie se ausente.
4. Seed `pet_farm_fields`: `passive_pasture=1`, `breeding_pen=1`, `incubator_room=2`, `barn_storage=12`.
5. Manter tabela `pets` como compatibilidade até `PetService` usar instância ativa.
6. `pet_collection` por espécie; `times_owned++` ao chocar nova instância.

### 8.3 Alterações em catálogos

| Arquivo                    | Mudança                                                     |
| -------------------------- | ----------------------------------------------------------- |
| `pet-species-catalog.ts`   | `icon`, `baseStats`, +14/+8 espécies; remover `emoji` da UI |
| `pet-breeding-outcomes.ts` | Matriz de pesos — **vários filhos por par**                 |
| `pet-breeding-families.ts` | Linhagens                                                   |
| `pet-farm-catalog.ts`      | Campos melhoráveis, tetos, custos                           |
| `pet-stat-rules.ts`        | **Novo** — caps, herança, roll-up                           |
| `items.json`               | `breeding_egg`, `gender_tonic`                              |
| `loot-economy.ts`          | Opcional: ovo específico na loja SP                         |

---

## 9. Serviços e integrações

```
src/features/pet-farm/
├── catalogs/
│   ├── pet-breeding-outcomes.ts
│   ├── pet-breeding-families.ts
│   └── pet-farm-catalog.ts
├── components/
│   ├── PetSpeciesIcon.tsx           # ícone único MCI/Lucide
│   ├── PetStatBars.tsx
│   ├── PetFarmScreen.tsx
│   ├── PetFarmUpgradesScreen.tsx
│   ├── PetFarmSlotGrid.tsx
│   ├── PetBreedingLabScreen.tsx
│   ├── PetBreedingOutcomeList.tsx
│   ├── PetBreedingEncyclopediaScreen.tsx
│   ├── PetGlossaryScreen.tsx
│   └── PetInstanceDetailScreen.tsx
├── services/
│   ├── pet-farm-service.ts          # assign pasto, celeiro
│   ├── pet-farm-upgrade-service.ts  # comprar níveis de campo
│   ├── pet-farm-bonus-service.ts    # passivos efetivos × charm
│   ├── pet-breeding-service.ts      # roll espécie + herança stats
│   ├── pet-stats-service.ts         # roll inicial, effectivePassive
│   └── pet-roster-service.ts        # CRUD instances, set active
├── hooks/
│   └── use-pet-farm.ts
└── utils/
    ├── breeding-chance-display.ts   # weight → %
    └── pet-stat-inheritance.ts      # max(pais)+upgrade
```

| Integração     | Onde aplicar bônus da fazenda          |
| -------------- | -------------------------------------- |
| Player XP      | `applyPetExperience` / reward pipeline |
| Moedas         | `EconomyService` / quest rewards       |
| Loot           | `LootService` rarity roll              |
| Escudo semanal | `ShieldService`                        |

**Eventos:** `PET_FARM_SLOT_CHANGED`, `PET_FARM_FIELD_UPGRADED`, `PET_BRED`, `PET_STATS_INHERITED`, `PET_INSTANCE_HATCHED`, `PET_ACTIVE_CHANGED`.

**Conquistas novas:**

| key                    | Condição                                  |
| ---------------------- | ----------------------------------------- |
| `pet_farm_first_slot`  | 1 pet no pasto de passivas                |
| `pet_farm_upgrade_3`   | Algum campo da fazenda no nível 3         |
| `pet_breeder`          | 1 cruzamento concluído                    |
| `pet_stat_roll_25`     | Filho com qualquer stat ≥ 25 via breeding |
| `pet_hybrid_collector` | 3 híbridos únicos                         |
| `pet_glossary_master`  | 80% espécies registradas no glossário     |

---

## 10. Plano de implementação (fases)

### Fase A — Fundação multi-pet + stats (1–2 sprints)

| #   | Tarefa                                                           |
| --- | ---------------------------------------------------------------- |
| A1  | Schema `pet_instances`, `pet_farm_fields`, migração              |
| A2  | `pet-stat-rules.ts` + `PetStatsService` (roll, effectivePassive) |
| A3  | `PetRosterService` + refatorar `PetService` / `use-pet`          |
| A4  | Gênero + stats na eclosão (`pet-egg-service`)                    |
| A5  | Testes: migração, herança `max(mãe,pai)+upgrade`                 |

**Critério de pronto:** 2+ instâncias com stats visíveis; pet ativo na Home.

### Fase B — Ícones únicos (0.5–1 sprint)

| #   | Tarefa                                                      |
| --- | ----------------------------------------------------------- |
| B1  | `PetSpeciesIcon` (MCI + Lucide) + mapa §3.8                 |
| B2  | Migrar catálogo: `icon` em todas as 29 espécies atuais      |
| B3  | Remover emoji de avatar em `PetHeroDisplay`, coleção, cards |
| B4  | `scripts/validate-pet-icons.ts`                             |

### Fase C — Fazenda + melhorias de campo (1 sprint)

| #   | Tarefa                                                        |
| --- | ------------------------------------------------------------- |
| C1  | `pet-farm-catalog.ts` + `PetFarmUpgradeService`               |
| C2  | `PetFarmBonusService` (passivo efetivo × charm × nível campo) |
| C3  | `PetFarmScreen` + `PetFarmUpgradesScreen` + pasto/cercado     |
| C4  | Rotas `/pet-farm`, `/pet-farm/upgrades` + Menu Hub            |
| C5  | Preview de bônus agregado na Home                             |

### Fase D — Catálogo + glossário (1 sprint)

| #   | Tarefa                                          |
| --- | ----------------------------------------------- |
| D1  | +14 espécies + `baseStats` + ícones             |
| D2  | `PetGlossaryScreen` + `PetInstanceDetailScreen` |
| D3  | Estados descoberta + filtros por stat/passivo   |

### Fase E — Crucamento multi-outcome + herança (1–2 sprints)

| #   | Tarefa                                                            |
| --- | ----------------------------------------------------------------- |
| E1  | +8 híbridos (1 ícone cada)                                        |
| E2  | `pet-breeding-outcomes.ts` — **lista completa de filhos por par** |
| E3  | `PetBreedingService` — roll espécie + `pet-stat-inheritance`      |
| E4  | `PetBreedingLabScreen` + `PetBreedingOutcomeList` obrigatório     |
| E5  | `breeding_pen`, incubadora, log com stats snapshot                |

### Fase F — Enciclopédia de % (0.5 sprint)

| #   | Tarefa                                                |
| --- | ----------------------------------------------------- |
| F1  | `PetBreedingEncyclopediaScreen` — todos os filhos e % |
| F2  | Preview min–max de stats por outcome                  |
| F3  | Desbloqueio progressivo de pares testados             |

### Fase G — Polish e balance (contínuo)

| #   | Tarefa                                                      |
| --- | ----------------------------------------------------------- |
| G1  | Script `generate-pet-breeding-matrix.ts`                    |
| G2  | Playtest: roll-up de stats, tetos de passivo, custos campos |
| G3  | Notificações ovo / cruzamento                               |
| G4  | Backup/restore `pet_instances` + `pet_farm_fields`          |
| G5  | SVG custom para espécies sem ícone MCI satisfatório         |

---

## 11. Balanceamento e riscos

| Risco                 | Mitigação                                         |
| --------------------- | ------------------------------------------------- |
| Inflação de bônus     | Tetos §3.4; passivo usa `effectivePassive`        |
| Stats infinitos       | Caps por raridade §3.2; roll-up com teto          |
| Pay-to-win breeding   | Custos altos; lendário < 5% nos pares epic×epic   |
| Complexidade UX       | Enciclopédia + lista de outcomes no lab; tutorial |
| Ícones inconsistentes | `validate-pet-icons`; 1 `PetSpeciesIcon` por card |
| Save antigo           | Migração + stats derivados de espécie se vazio    |
| Performance           | Máx. 50 instâncias soft cap (avisar UI)           |

**Métricas pós-launch:**

- % jogadores com ≥2 instâncias (D7)
- Média de slots preenchidos
- Cruzamentos / semana
- Média de stats dos filhos vs. geração (gen 1, 2, 3…)
- Campos mais melhorados (`passive_pasture` vs `breeding_pen`)
- Espécies mais obtidas vs. híbridos

---

## 12. Checklist de aceite (definição de pronto)

- [ ] Possuo várias instâncias; uma é **ativa** na Home
- [ ] Cada instância tem **5 stats** visíveis; passivo efetivo calculado
- [ ] **Um ícone** por pet em toda UI (sem emoji animal duplo)
- [ ] Fazenda: pasto de passivas + melhorias de campo compráveis
- [ ] Colocar pet no pasto altera bônus (teto + `effectivePassive`)
- [ ] Cercado de breeding com N casais conforme nível do campo
- [ ] Cada pet exibe ♀ ou ♂ como badge separado do ícone
- [ ] Casal ♀+♂ mostra **lista de todos os filhos possíveis com %**
- [ ] Filho herda `max(stat mãe, stat pai)` e pode subir (ex. 20→25)
- [ ] Enciclopédia + Laboratório usam a mesma tabela de outcomes
- [ ] Glossário: 51 entradas, stats base, ícone único
- [ ] Migração não perde pet existente
- [ ] Testes: pesos somam 100%, herança, roll-up, tetos, ícone por espécie

---

## 13. Referências no código atual

| Conceito      | Arquivo                                                    |
| ------------- | ---------------------------------------------------------- |
| Espécies      | `src/features/game-design/catalogs/pet-species-catalog.ts` |
| Ovo aleatório | `src/features/pet/services/pet-egg-service.ts`             |
| Pet único     | `src/storage/repositories/pet-repository.ts`               |
| UI incubação  | `src/features/pet/components/PetIncubationLab.tsx`         |
| Coleção       | `src/features/pet/services/pet-collection-service.ts`      |
| Passivos      | `PetSpeciesDefinition.passive`                             |

---

## 14. Próximo passo imediato

1. Revisar caps de stats, tabela de roll-up §3.3 e custos de campos §3.4.
2. Aprovar mapa de ícones §3.8 (MCI vs Lucide vs SVG custom).
3. Aprovar **14 espécies + 8 híbridos** e tabela de breeding §5.
4. Implementar **Fase A → B** (dados + ícones) antes da fazenda visual.

Quando aprovado, abrir issue/PR por fase (A→G) para manter reviews pequenos.
