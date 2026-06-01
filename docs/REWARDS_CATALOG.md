# Catálogo Completo de Recompensas — English Quest

> Documento gerado automaticamente a partir dos catálogos em `src/`.

> Execute `pnpm exec tsx scripts/generate-rewards-catalog-doc.ts` para atualizar.

> Última geração: 2026-05-31

## Índice

1. [Resumo por categoria](#resumo-por-categoria)
2. [Escalas de raridade](#escalas-de-raridade)
3. [Relíquias](#relíquias) (100)
4. [Artefatos](#artefatos) (50)
5. [Itens míticos](#itens-míticos) (50)
6. [Cosméticos](#cosméticos) (50)
7. [Pets exclusivos (coleção)](#pets-exclusivos-coleção) (30)
8. [Ultra raros](#ultra-raros) (6)
9. [Espécies de pets (jogáveis)](#espécies-de-pets-jogáveis) (29)
10. [Itens especiais e consumíveis](#itens-especiais-e-consumíveis) (50)
11. [Títulos](#títulos) (42)
12. [Conquistas](#conquistas) (72)
13. [Loot boxes](#loot-boxes)
14. [Loja (coins)](#loja-coins)
15. [Loja (Study Points)](#loja-study-points)
16. [Contratos](#contratos)
17. [Cidade](#cidade)
18. [Carreira](#carreira)
19. [Prestígio](#prestígio)
20. [Avatar (molduras e badges)](#avatar-molduras-e-badges)
21. [Escudos (milestones)](#escudos-milestones)

## Resumo por categoria

| Categoria | Quantidade | Raridades |
| --- | --- | --- |
| Relíquias (Collection Book) | 100 | common → mythic |
| Artefatos | 50 | common → mythic |
| Itens míticos | 50 | mythic, ancient |
| Cosméticos | 50 | common → mythic |
| Pets exclusivos (coleção) | 30 | legendary → ancient |
| Ultra raros | 6 | mythic, ancient |
| **Total colecionáveis** | **286** | — |
| Espécies de pets jogáveis | 29 | common → legendary |
| Itens especiais/consumíveis | 50 | common → legendary |
| Títulos | 42 | por nível / prestígio |
| Conquistas | 72 | por categoria |
| Edifícios da cidade | 31 | por nível |
| Contratos | 24 | por duração |
| Níveis de prestígio | 5 | I → V |

## Escalas de raridade

### Colecionáveis (Collection Book)

| Raridade | Quantidade |
| --- | --- |
| ancient | 23 |
| common | 60 |
| epic | 31 |
| legendary | 40 |
| mythic | 52 |
| rare | 40 |
| uncommon | 40 |

### Pets jogáveis

| Raridade | Quantidade |
| --- | --- |
| common | 8 |
| rare | 8 |
| epic | 7 |
| legendary | 6 |

### Loot boxes

| Raridade | Emoji | Descrição |
| --- | --- | --- |
| Common | 📦 | Entrada ideal — moedas, escudos e colecionáveis comuns. |
| Uncommon | 🎁 | Melhores chances de upgrade e colecionáveis incomuns. |
| Rare | 💎 | Relíquias, consumíveis, tickets e pets raros. |
| Epic | 🔮 | Relíquias raras, pets raros e cosméticos épicos. |
| Legendary | 👑 | Itens lendários, pets lendários e relíquias lendárias. |
| Mythic | ✨ | Itens únicos, cosméticos únicos e títulos exclusivos. |
| Ancient | 🔥 | Endgame — FAANG Invitation, World Class Medal e ultra raros. |

### Regra de raridade procedural (relíquias, artefatos, cosméticos)

Distribuição por índice no catálogo (`rarityForIndex`):

- 0–30% → **common**

- 30–50% → **uncommon**

- 50–70% → **rare**

- 70–85% → **epic**

- 85–95% → **legendary**

- 95–100% → **mythic**

Bônus passivo das relíquias: `+1%` a `+5%` (cíclico por índice).

## Relíquias

| Key | Nome | Ícone | Raridade | Bônus |
| --- | --- | --- | --- | --- |
| relic_1 | Ancient Dictionary | 📕 | common | +1% bônus |
| relic_2 | Grammar Codex | 💻 | common | +2% bônus |
| relic_3 | Global Passport | 🛂 | common | +3% bônus |
| relic_4 | Golden Keyboard | ⌨️ | common | +4% bônus |
| relic_5 | Remote Contract | 📄 | common | +5% bônus |
| relic_6 | Interview Handbook | 📖 | common | +1% bônus |
| relic_7 | Tech Encyclopedia | 📚 | common | +2% bônus |
| relic_8 | Developer Laptop | 🔮 | common | +3% bônus |
| relic_9 | Voice Trainer | 🎯 | common | +4% bônus |
| relic_10 | Silicon Valley Badge | ⚡ | common | +5% bônus |
| relic_11 | Fluency Compass | 💎 | common | +1% bônus |
| relic_12 | Syntax Scroll | 🏅 | common | +2% bônus |
| relic_13 | API Atlas | 🔑 | common | +3% bônus |
| relic_14 | Cloud Certificate | 🌐 | common | +4% bônus |
| relic_15 | Debug Amulet | 🦉 | common | +5% bônus |
| relic_16 | Merge Stone | 📕 | common | +1% bônus |
| relic_17 | Commit Crystal | 💻 | common | +2% bônus |
| relic_18 | Pull Request Seal | 🛂 | common | +3% bônus |
| relic_19 | Standup Bell | ⌨️ | common | +4% bônus |
| relic_20 | Sprint Hourglass | 📄 | common | +5% bônus |
| relic_21 | Kanban Board | 📖 | common | +1% bônus |
| relic_22 | Retrospective Mirror | 📚 | common | +2% bônus |
| relic_23 | Code Review Lens | 🔮 | common | +3% bônus |
| relic_24 | Pair Programming Ring | 🎯 | common | +4% bônus |
| relic_25 | Whiteboard Marker | ⚡ | common | +5% bônus |
| relic_26 | Rubber Duck Idol | 💎 | common | +1% bônus |
| relic_27 | Stack Overflow Tome | 🏅 | common | +2% bônus |
| relic_28 | Git Branch Charm | 🔑 | common | +3% bônus |
| relic_29 | Docker Container | 🌐 | common | +4% bônus |
| relic_30 | Kubernetes Helm | 🦉 | common | +5% bônus |
| relic_31 | CI Pipeline Pipe | 📕 | uncommon | +1% bônus |
| relic_32 | Unit Test Shield | 💻 | uncommon | +2% bônus |
| relic_33 | Integration Bridge | 🛂 | uncommon | +3% bônus |
| relic_34 | E2E Telescope | ⌨️ | uncommon | +4% bônus |
| relic_35 | Agile Manifesto | 📄 | uncommon | +5% bônus |
| relic_36 | Scrum Master Whistle | 📖 | uncommon | +1% bônus |
| relic_37 | Product Owner Compass | 📚 | uncommon | +2% bônus |
| relic_38 | Stakeholder Map | 🔮 | uncommon | +3% bônus |
| relic_39 | User Story Quill | 🎯 | uncommon | +4% bônus |
| relic_40 | Acceptance Criteria Scroll | ⚡ | uncommon | +5% bônus |
| relic_41 | Wireframe Sketch | 💎 | uncommon | +1% bônus |
| relic_42 | Design System Palette | 🏅 | uncommon | +2% bônus |
| relic_43 | Figma Crystal | 🔑 | uncommon | +3% bônus |
| relic_44 | Accessibility Key | 🌐 | uncommon | +4% bônus |
| relic_45 | Performance Gauge | 🦉 | uncommon | +5% bônus |
| relic_46 | Latency Stopwatch | 📕 | uncommon | +1% bônus |
| relic_47 | Cache Gem | 💻 | uncommon | +2% bônus |
| relic_48 | Database Index | 🛂 | uncommon | +3% bônus |
| relic_49 | SQL Query Ring | ⌨️ | uncommon | +4% bônus |
| relic_50 | NoSQL Orb | 📄 | uncommon | +5% bônus |
| relic_51 | GraphQL Gateway | 📖 | rare | +1% bônus |
| relic_52 | RESTful Tablet | 📚 | rare | +2% bônus |
| relic_53 | WebSocket Wire | 🔮 | rare | +3% bônus |
| relic_54 | Microservice Node | 🎯 | rare | +4% bônus |
| relic_55 | Monolith Fragment | ⚡ | rare | +5% bônus |
| relic_56 | Serverless Spark | 💎 | rare | +1% bônus |
| relic_57 | Edge Computing Shard | 🏅 | rare | +2% bônus |
| relic_58 | CDN Feather | 🔑 | rare | +3% bônus |
| relic_59 | Load Balancer Scale | 🌐 | rare | +4% bônus |
| relic_60 | Firewall Ember | 🦉 | rare | +5% bônus |
| relic_61 | Encryption Lock | 📕 | rare | +1% bônus |
| relic_62 | OAuth Token | 💻 | rare | +2% bônus |
| relic_63 | JWT Seal | 🛂 | rare | +3% bônus |
| relic_64 | HTTPS Certificate | ⌨️ | rare | +4% bônus |
| relic_65 | SSL Shield | 📄 | rare | +5% bônus |
| relic_66 | Pen Test Dagger | 📖 | rare | +1% bônus |
| relic_67 | Bug Bounty Coin | 📚 | rare | +2% bônus |
| relic_68 | Incident Report | 🔮 | rare | +3% bônus |
| relic_69 | Postmortem Quill | 🎯 | rare | +4% bônus |
| relic_70 | On-Call Beacon | ⚡ | rare | +5% bônus |
| relic_71 | Pager Duty Bell | 💎 | epic | +1% bônus |
| relic_72 | Slack Emoji Pack | 🏅 | epic | +2% bônus |
| relic_73 | Zoom Background | 🔑 | epic | +3% bônus |
| relic_74 | Notion Template | 🌐 | epic | +4% bônus |
| relic_75 | Jira Ticket Stamp | 🦉 | epic | +5% bônus |
| relic_76 | Confluence Page | 📕 | epic | +1% bônus |
| relic_77 | Linear Issue | 💻 | epic | +2% bônus |
| relic_78 | GitHub Star | 🛂 | epic | +3% bônus |
| relic_79 | GitLab Runner | ⌨️ | epic | +4% bônus |
| relic_80 | Bitbucket Hook | 📄 | epic | +5% bônus |
| relic_81 | VS Code Extension | 📖 | epic | +1% bônus |
| relic_82 | JetBrains License | 📚 | epic | +2% bônus |
| relic_83 | Terminal Prompt | 🔮 | epic | +3% bônus |
| relic_84 | Shell Script | 🎯 | epic | +4% bônus |
| relic_85 | Regex Rune | ⚡ | epic | +5% bônus |
| relic_86 | Algorithm Tome | 💎 | legendary | +1% bônus |
| relic_87 | Data Structure Tree | 🏅 | legendary | +2% bônus |
| relic_88 | Big O Notation | 🔑 | legendary | +3% bônus |
| relic_89 | LeetCode Medal | 🌐 | legendary | +4% bônus |
| relic_90 | Hackathon Trophy | 🦉 | legendary | +5% bônus |
| relic_91 | Open Source Leaf | 📕 | legendary | +1% bônus |
| relic_92 | Tech Blog Quill | 💻 | legendary | +2% bônus |
| relic_93 | Conference Badge | 🛂 | legendary | +3% bônus |
| relic_94 | Meetup Sticker | ⌨️ | legendary | +4% bônus |
| relic_95 | Networking Card | 📄 | legendary | +5% bônus |
| relic_96 | Elevator Pitch | 📖 | mythic | +1% bônus |
| relic_97 | LinkedIn Endorsement | 📚 | mythic | +2% bônus |
| relic_98 | Portfolio Globe | 🔮 | mythic | +3% bônus |
| relic_99 | Resume Crystal | 🎯 | mythic | +4% bônus |
| relic_100 | Cover Letter | ⚡ | mythic | +5% bônus |

## Artefatos

| Key | Nome | Ícone | Raridade |
| --- | --- | --- | --- |
| artifact_1 | Arcane Compass | 🔮 | common |
| artifact_2 | Blessed Orb | 💠 | common |
| artifact_3 | Cursed Shard | 🧿 | common |
| artifact_4 | Enchanted Relic | ✨ | common |
| artifact_5 | Forgotten Emblem | 🌀 | common |
| artifact_6 | Lost Sigil | 🔮 | common |
| artifact_7 | Sacred Fragment | 💠 | common |
| artifact_8 | Temporal Core | 🧿 | common |
| artifact_9 | Arcane Compass | ✨ | common |
| artifact_10 | Blessed Orb | 🌀 | common |
| artifact_11 | Cursed Shard | 🔮 | common |
| artifact_12 | Enchanted Relic | 💠 | common |
| artifact_13 | Forgotten Emblem | 🧿 | common |
| artifact_14 | Lost Sigil | ✨ | common |
| artifact_15 | Sacred Fragment | 🌀 | common |
| artifact_16 | Temporal Core | 🔮 | uncommon |
| artifact_17 | Arcane Compass | 💠 | uncommon |
| artifact_18 | Blessed Orb | 🧿 | uncommon |
| artifact_19 | Cursed Shard | ✨ | uncommon |
| artifact_20 | Enchanted Relic | 🌀 | uncommon |
| artifact_21 | Forgotten Emblem | 🔮 | uncommon |
| artifact_22 | Lost Sigil | 💠 | uncommon |
| artifact_23 | Sacred Fragment | 🧿 | uncommon |
| artifact_24 | Temporal Core | ✨ | uncommon |
| artifact_25 | Arcane Compass | 🌀 | uncommon |
| artifact_26 | Blessed Orb | 🔮 | rare |
| artifact_27 | Cursed Shard | 💠 | rare |
| artifact_28 | Enchanted Relic | 🧿 | rare |
| artifact_29 | Forgotten Emblem | ✨ | rare |
| artifact_30 | Lost Sigil | 🌀 | rare |
| artifact_31 | Sacred Fragment | 🔮 | rare |
| artifact_32 | Temporal Core | 💠 | rare |
| artifact_33 | Arcane Compass | 🧿 | rare |
| artifact_34 | Blessed Orb | ✨ | rare |
| artifact_35 | Cursed Shard | 🌀 | rare |
| artifact_36 | Enchanted Relic | 🔮 | epic |
| artifact_37 | Forgotten Emblem | 💠 | epic |
| artifact_38 | Lost Sigil | 🧿 | epic |
| artifact_39 | Sacred Fragment | ✨ | epic |
| artifact_40 | Temporal Core | 🌀 | epic |
| artifact_41 | Arcane Compass | 🔮 | epic |
| artifact_42 | Blessed Orb | 💠 | epic |
| artifact_43 | Cursed Shard | 🧿 | epic |
| artifact_44 | Enchanted Relic | ✨ | legendary |
| artifact_45 | Forgotten Emblem | 🌀 | legendary |
| artifact_46 | Lost Sigil | 🔮 | legendary |
| artifact_47 | Sacred Fragment | 💠 | legendary |
| artifact_48 | Temporal Core | 🧿 | legendary |
| artifact_49 | Arcane Compass | ✨ | mythic |
| artifact_50 | Blessed Orb | 🌀 | mythic |

## Itens míticos

| Key | Nome | Ícone | Raridade |
| --- | --- | --- | --- |
| mythic_1 | Dragon Blade | ⚔️ | mythic |
| mythic_2 | Phoenix Crown | 👑 | mythic |
| mythic_3 | Titan Essence | 💫 | mythic |
| mythic_4 | Oracle Heart | ❤️ | mythic |
| mythic_5 | Void Soul | 🌟 | mythic |
| mythic_6 | Cosmic Blade | ⚔️ | mythic |
| mythic_7 | Eternal Crown | 👑 | mythic |
| mythic_8 | Primordial Essence | 💫 | mythic |
| mythic_9 | Dragon Heart | ❤️ | mythic |
| mythic_10 | Phoenix Soul | 🌟 | mythic |
| mythic_11 | Titan Blade | ⚔️ | mythic |
| mythic_12 | Oracle Crown | 👑 | mythic |
| mythic_13 | Void Essence | 💫 | mythic |
| mythic_14 | Cosmic Heart | ❤️ | mythic |
| mythic_15 | Eternal Soul | 🌟 | mythic |
| mythic_16 | Primordial Blade | ⚔️ | mythic |
| mythic_17 | Dragon Crown | 👑 | mythic |
| mythic_18 | Phoenix Essence | 💫 | mythic |
| mythic_19 | Titan Heart | ❤️ | mythic |
| mythic_20 | Oracle Soul | 🌟 | mythic |
| mythic_21 | Void Blade | ⚔️ | mythic |
| mythic_22 | Cosmic Crown | 👑 | mythic |
| mythic_23 | Eternal Essence | 💫 | mythic |
| mythic_24 | Primordial Heart | ❤️ | mythic |
| mythic_25 | Dragon Soul | 🌟 | mythic |
| mythic_26 | Phoenix Blade | ⚔️ | mythic |
| mythic_27 | Titan Crown | 👑 | mythic |
| mythic_28 | Oracle Essence | 💫 | mythic |
| mythic_29 | Void Heart | ❤️ | mythic |
| mythic_30 | Cosmic Soul | 🌟 | mythic |
| mythic_31 | Eternal Blade | ⚔️ | mythic |
| mythic_32 | Primordial Crown | 👑 | mythic |
| mythic_33 | Dragon Essence | 💫 | mythic |
| mythic_34 | Phoenix Heart | ❤️ | mythic |
| mythic_35 | Titan Soul | 🌟 | mythic |
| mythic_36 | Oracle Blade | ⚔️ | ancient |
| mythic_37 | Void Crown | 👑 | ancient |
| mythic_38 | Cosmic Essence | 💫 | ancient |
| mythic_39 | Eternal Heart | ❤️ | ancient |
| mythic_40 | Primordial Soul | 🌟 | ancient |
| mythic_41 | Dragon Blade | ⚔️ | ancient |
| mythic_42 | Phoenix Crown | 👑 | ancient |
| mythic_43 | Titan Essence | 💫 | ancient |
| mythic_44 | Oracle Heart | ❤️ | ancient |
| mythic_45 | Void Soul | 🌟 | ancient |
| mythic_46 | Cosmic Blade | ⚔️ | ancient |
| mythic_47 | Eternal Crown | 👑 | ancient |
| mythic_48 | Primordial Essence | 💫 | ancient |
| mythic_49 | Dragon Heart | ❤️ | ancient |
| mythic_50 | Phoenix Soul | 🌟 | ancient |

## Cosméticos

| Key | Nome | Ícone | Raridade |
| --- | --- | --- | --- |
| cosmetic_1 | Frame #1 | 🖼️ | common |
| cosmetic_2 | Aura #2 | ✨ | common |
| cosmetic_3 | Trail #3 | 🎨 | common |
| cosmetic_4 | Badge #4 | 🏷️ | common |
| cosmetic_5 | Banner #5 | 💫 | common |
| cosmetic_6 | Emote #6 | 🖼️ | common |
| cosmetic_7 | Title Glow #7 | ✨ | common |
| cosmetic_8 | Avatar Skin #8 | 🎨 | common |
| cosmetic_9 | Frame #9 | 🏷️ | common |
| cosmetic_10 | Aura #10 | 💫 | common |
| cosmetic_11 | Trail #11 | 🖼️ | common |
| cosmetic_12 | Badge #12 | ✨ | common |
| cosmetic_13 | Banner #13 | 🎨 | common |
| cosmetic_14 | Emote #14 | 🏷️ | common |
| cosmetic_15 | Title Glow #15 | 💫 | common |
| cosmetic_16 | Avatar Skin #16 | 🖼️ | uncommon |
| cosmetic_17 | Frame #17 | ✨ | uncommon |
| cosmetic_18 | Aura #18 | 🎨 | uncommon |
| cosmetic_19 | Trail #19 | 🏷️ | uncommon |
| cosmetic_20 | Badge #20 | 💫 | uncommon |
| cosmetic_21 | Banner #21 | 🖼️ | uncommon |
| cosmetic_22 | Emote #22 | ✨ | uncommon |
| cosmetic_23 | Title Glow #23 | 🎨 | uncommon |
| cosmetic_24 | Avatar Skin #24 | 🏷️ | uncommon |
| cosmetic_25 | Frame #25 | 💫 | uncommon |
| cosmetic_26 | Aura #26 | 🖼️ | rare |
| cosmetic_27 | Trail #27 | ✨ | rare |
| cosmetic_28 | Badge #28 | 🎨 | rare |
| cosmetic_29 | Banner #29 | 🏷️ | rare |
| cosmetic_30 | Emote #30 | 💫 | rare |
| cosmetic_31 | Title Glow #31 | 🖼️ | rare |
| cosmetic_32 | Avatar Skin #32 | ✨ | rare |
| cosmetic_33 | Frame #33 | 🎨 | rare |
| cosmetic_34 | Aura #34 | 🏷️ | rare |
| cosmetic_35 | Trail #35 | 💫 | rare |
| cosmetic_36 | Badge #36 | 🖼️ | epic |
| cosmetic_37 | Banner #37 | ✨ | epic |
| cosmetic_38 | Emote #38 | 🎨 | epic |
| cosmetic_39 | Title Glow #39 | 🏷️ | epic |
| cosmetic_40 | Avatar Skin #40 | 💫 | epic |
| cosmetic_41 | Frame #41 | 🖼️ | epic |
| cosmetic_42 | Aura #42 | ✨ | epic |
| cosmetic_43 | Trail #43 | 🎨 | epic |
| cosmetic_44 | Badge #44 | 🏷️ | legendary |
| cosmetic_45 | Banner #45 | 💫 | legendary |
| cosmetic_46 | Emote #46 | 🖼️ | legendary |
| cosmetic_47 | Title Glow #47 | ✨ | legendary |
| cosmetic_48 | Avatar Skin #48 | 🎨 | legendary |
| cosmetic_49 | Frame #49 | 🏷️ | mythic |
| cosmetic_50 | Aura #50 | 💫 | mythic |

## Pets exclusivos (coleção)

Obtidos via loot boxes especiais. Distribuição: índice 0–19 legendary, 20–26 mythic, 27–29 ancient.

| Key | Nome | Ícone | Raridade |
| --- | --- | --- | --- |
| exclusive_pet_1 | Legendary Dragon | 🐉 | legendary |
| exclusive_pet_2 | Ancient Owl | 🦉 | legendary |
| exclusive_pet_3 | Global Phoenix | 🐦‍🔥 | legendary |
| exclusive_pet_4 | Silicon Fox | 🦊 | legendary |
| exclusive_pet_5 | Remote Panda | 🐼 | legendary |
| exclusive_pet_6 | FAANG Eagle | 🦅 | legendary |
| exclusive_pet_7 | Startup Hedgehog | 🦔 | legendary |
| exclusive_pet_8 | Unicorn Spirit | 🦄 | legendary |
| exclusive_pet_9 | Cloud Whale | 🐋 | legendary |
| exclusive_pet_10 | API Shark | 🦈 | legendary |
| exclusive_pet_11 | Bug Hunter Cat | 🐉 | legendary |
| exclusive_pet_12 | Deploy Dragon | 🦉 | legendary |
| exclusive_pet_13 | Merge Penguin | 🐦‍🔥 | legendary |
| exclusive_pet_14 | Review Raven | 🦊 | legendary |
| exclusive_pet_15 | Standup Sloth | 🐼 | legendary |
| exclusive_pet_16 | Sprint Cheetah | 🦅 | legendary |
| exclusive_pet_17 | Debug Duck Prime | 🦔 | legendary |
| exclusive_pet_18 | Code Owl Elite | 🦄 | legendary |
| exclusive_pet_19 | Git Cat Nova | 🐋 | legendary |
| exclusive_pet_20 | Stack Fox | 🦈 | legendary |
| exclusive_pet_21 | Kernel Kraken | 🐉 | mythic |
| exclusive_pet_22 | Async Phoenix | 🦉 | mythic |
| exclusive_pet_23 | Remote Griffin | 🐦‍🔥 | mythic |
| exclusive_pet_24 | World Serpent | 🦊 | mythic |
| exclusive_pet_25 | Quantum Owl | 🐼 | mythic |
| exclusive_pet_26 | Passport Phoenix | 🦅 | mythic |
| exclusive_pet_27 | Legendary Lion | 🦔 | mythic |
| exclusive_pet_28 | Celestial Whale | 🦄 | ancient |
| exclusive_pet_29 | Fullstack Tiger | 🐋 | ancient |
| exclusive_pet_30 | Micro Wolf | 🦈 | ancient |

## Ultra raros

| Key | Nome | Ícone | Raridade | Bônus |
| --- | --- | --- | --- | --- |
| world_class_engineer_medal | World Class Engineer Medal | 🏅 | ancient | +10% XP permanente |
| faang_invitation | FAANG Invitation | ✉️ | ancient | Desbloqueia entrevistas lendárias |
| silicon_valley_passport | Silicon Valley Passport | 🛂 | mythic | +15% moedas |
| global_cto_badge | Global CTO Badge | 👔 | ancient | +5% em todas recompensas |
| legendary_dragon_pet | Legendary Dragon Pet | 🐉 | ancient | +25% XP e moedas |
| ancient_developer_crown | Ancient Developer Crown | 👑 | ancient | Moldura e título exclusivos |

## Espécies de pets (jogáveis)

| Key | Nome | Ícone | Raridade | Passivo | Chocagem (h) |
| --- | --- | --- | --- | --- | --- |
| codeowl | Code Owl | 🦉 | common | +5% XP | 24 |
| debugduck | Debug Duck | 🦆 | common | +5% Coins | 24 |
| gitcat | Git Cat | 🐱 | common | +3% Loot | 24 |
| bytebunny | Byte Bunny | 🐰 | common | +4% XP | 24 |
| stackfox | Stack Fox | 🦊 | common | +4% Coins | 24 |
| loopfrog | Loop Frog | 🐸 | common | +1 Shield/semana | 18 |
| cachebear | Cache Bear | 🐻 | common | +6% XP | 24 |
| pingpanda | Ping Panda | 🐼 | common | +6% Coins | 24 |
| mergepenguin | Merge Penguin | 🐧 | rare | +8% XP | 36 |
| deploydragon | Deploy Dragon | 🐲 | rare | +8% Coins | 36 |
| cloudkoala | Cloud Koala | 🐨 | rare | +5% Loot | 36 |
| apishark | API Shark | 🦈 | rare | +10% XP | 48 |
| reactraptor | React Raptor | 🦖 | rare | +10% Coins | 48 |
| nodeunicorn | Node Unicorn | 🦄 | rare | +1 Shield/semana | 48 |
| sqlsnake | SQL Snake | 🐍 | rare | +8% Loot | 48 |
| devdolphin | Dev Dolphin | 🐬 | rare | +9% XP | 42 |
| bugbee | Bug Bee | 🐝 | epic | +12% Coins | 72 |
| scal_eagle | Scale Eagle | 🦅 | epic | +12% XP | 72 |
| kernelkraken | Kernel Kraken | 🐙 | epic | +10% Loot | 72 |
| asyncphoenix | Async Phoenix | 🔥 | epic | +15% XP | 96 |
| remotegriffin | Remote Griffin | 🦁 | epic | +15% Coins | 96 |
| fullstacktiger | Fullstack Tiger | 🐯 | epic | +1 Shield/semana | 96 |
| microservicewolf | Micro Wolf | 🐺 | epic | +12% Loot | 96 |
| globalhawk | Global Hawk | 🦅 | legendary | +20% XP | 120 |
| legendarylion | Legendary Lion | 🦁 | legendary | +20% Coins | 120 |
| celestialwhale | Celestial Whale | 🐋 | legendary | +15% Loot | 120 |
| quantumowl | Quantum Owl | 🦉 | legendary | +25% XP | 168 |
| passportphoenix | Passport Phoenix | 🐦‍🔥 | legendary | +25% Coins | 168 |
| worldserpent | World Serpent | 🐉 | legendary | +2 Shields/semana | 168 |

## Itens especiais e consumíveis

| Key | Nome | Ícone | Categoria | Raridade | Efeito |
| --- | --- | --- | --- | --- | --- |
| xp_potion_small | XP Potion (S) | 🧪 | consumable | common | xp_boost (50) |
| xp_potion_large | XP Potion (L) | 🧪 | consumable | rare | xp_boost (200) |
| coin_booster_small | Coin Booster (S) | 🪙 | consumable | common | coin_boost (30) |
| coin_booster_large | Coin Booster (L) | 🪙 | consumable | rare | coin_boost (120) |
| focus_potion | Focus Potion | ⚡ | consumable | rare | focus (1, 30min) |
| shield_repair_kit | Shield Repair Kit | 🛡️ | consumable | rare | shield_repair (1) |
| double_xp_1h | Double XP (1h) | ✨ | booster | rare | double_xp (2, 60min) |
| double_xp_24h | Double XP (24h) | ✨ | booster | epic | double_xp (2, 1440min) |
| double_coins_1h | Double Coins (1h) | 💰 | booster | rare | double_coins (2, 60min) |
| double_coins_24h | Double Coins (24h) | 💰 | booster | epic | double_coins (2, 1440min) |
| quest_multiplier | Quest Multiplier | 🎯 | booster | epic | quest_multiplier (1.5, 120min) |
| contract_retry | Contract Retry Ticket | 🎫 | ticket | epic | contract_retry (1) |
| streak_protection | Streak Protection Ticket | 🎟️ | ticket | legendary | streak_protection (1) |
| free_loot_ticket | Free Loot Ticket | 🎁 | ticket | rare | free_loot (1) |
| silver_key | Silver Key | 🗝️ | key | rare | unlock_loot (1) |
| gold_key | Gold Key | 🔑 | key | epic | unlock_loot (2) |
| legendary_key | Legendary Key | 🗝️ | key | legendary | unlock_loot (3) |
| ancient_dictionary | Ancient Dictionary | 📕 | relic | legendary | passive_xp (2) |
| developer_laptop | Developer Laptop | 💻 | relic | legendary | passive_coins (3) |
| remote_contract | Remote Contract | 📄 | relic | epic | passive_xp (1) |
| global_passport | Global Passport | 🛂 | relic | legendary | passive_coins (5) |
| item_extra_1 | Study Item 1 | 📦 | consumable | common | xp_boost (10, 30min) |
| item_extra_2 | Study Item 2 | ⭐ | booster | rare | coin_boost (15) |
| item_extra_3 | Study Item 3 | 🎲 | ticket | epic | focus (20, 30min) |
| item_extra_4 | Study Item 4 | 📦 | consumable | common | xp_boost (25) |
| item_extra_5 | Study Item 5 | ⭐ | booster | rare | coin_boost (30, 30min) |
| item_extra_6 | Study Item 6 | 🎲 | ticket | epic | focus (35) |
| item_extra_7 | Study Item 7 | 📦 | consumable | common | xp_boost (40, 30min) |
| item_extra_8 | Study Item 8 | ⭐ | booster | rare | coin_boost (45) |
| item_extra_9 | Study Item 9 | 🎲 | ticket | epic | focus (50, 30min) |
| item_extra_10 | Study Item 10 | 📦 | consumable | common | xp_boost (55) |
| item_extra_11 | Study Item 11 | ⭐ | booster | rare | coin_boost (60, 30min) |
| item_extra_12 | Study Item 12 | 🎲 | ticket | epic | focus (65) |
| item_extra_13 | Study Item 13 | 📦 | consumable | common | xp_boost (70, 30min) |
| item_extra_14 | Study Item 14 | ⭐ | booster | rare | coin_boost (75) |
| item_extra_15 | Study Item 15 | 🎲 | ticket | epic | focus (80, 30min) |
| item_extra_16 | Study Item 16 | 📦 | consumable | common | xp_boost (85) |
| item_extra_17 | Study Item 17 | ⭐ | booster | rare | coin_boost (90, 30min) |
| item_extra_18 | Study Item 18 | 🎲 | ticket | epic | focus (95) |
| item_extra_19 | Study Item 19 | 📦 | consumable | common | xp_boost (100, 30min) |
| item_extra_20 | Study Item 20 | ⭐ | booster | rare | coin_boost (105) |
| item_extra_21 | Study Item 21 | 🎲 | ticket | epic | focus (110, 30min) |
| item_extra_22 | Study Item 22 | 📦 | consumable | common | xp_boost (115) |
| item_extra_23 | Study Item 23 | ⭐ | booster | rare | coin_boost (120, 30min) |
| item_extra_24 | Study Item 24 | 🎲 | ticket | epic | focus (125) |
| item_extra_25 | Study Item 25 | 📦 | consumable | common | xp_boost (130, 30min) |
| item_extra_26 | Study Item 26 | ⭐ | booster | rare | coin_boost (135) |
| item_extra_27 | Study Item 27 | 🎲 | ticket | epic | focus (140, 30min) |
| item_extra_28 | Study Item 28 | 📦 | consumable | common | xp_boost (145) |
| item_extra_29 | Study Item 29 | ⭐ | booster | rare | coin_boost (150, 30min) |

## Títulos

| Key | Nome | Ícone | Nível req. | Descrição |
| --- | --- | --- | --- | --- |
| local_developer | Local Developer | 💻 | 1 | O início da jornada rumo à carreira internacional. |
| junior_remote_developer | Junior Remote Developer | 🌍 | 5 | Sua primeira grande evolução no mercado remoto. |
| mid_remote_developer | Mid Remote Developer | 🚀 | 10 | Crescimento profissional consolidado no trabalho remoto. |
| senior_remote_developer | Senior Remote Developer | ⭐ | 20 | Experiência sólida e impacto técnico reconhecido. |
| international_developer | International Developer | 🌐 | 30 | Seu primeiro grande marco internacional. |
| global_engineer | Global Engineer | 🛰️ | 50 | Atuação em escala global com visão ampliada. |
| tech_lead | Tech Lead | 🎯 | 75 | Maturidade técnica e liderança de equipes. |
| world_class_engineer | World Class Engineer | 👑 | 100 | Excelência de longo prazo — o ápice da jornada. |
| veteran_learner | Veteran Learner | 🏅 | 50 | Título exclusivo de Prestígio I. |
| global_professional | Global Professional | 🌐 | 100 | Título exclusivo de Prestígio II. |
| elite_engineer | Elite Engineer | 🎯 | 200 | Título exclusivo de Prestígio III. |
| legacy_architect | Legacy Architect | 🏛️ | 500 | Título exclusivo de Prestígio V — legado eterno. |
| extended_title_1 | Global Talent 1 | 🌍 | 5 | Título desbloqueado no nível 5. |
| extended_title_2 | Global Talent 2 | 🚀 | 7 | Título desbloqueado no nível 7. |
| extended_title_3 | Global Talent 3 | 💼 | 9 | Título desbloqueado no nível 9. |
| extended_title_4 | Global Talent 4 | 🏆 | 11 | Título desbloqueado no nível 11. |
| extended_title_5 | Global Talent 5 | 👑 | 13 | Título desbloqueado no nível 13. |
| extended_title_6 | Global Talent 6 | 🌍 | 15 | Título desbloqueado no nível 15. |
| extended_title_7 | Global Talent 7 | 🚀 | 17 | Título desbloqueado no nível 17. |
| extended_title_8 | Global Talent 8 | 💼 | 19 | Título desbloqueado no nível 19. |
| extended_title_9 | Global Talent 9 | 🏆 | 21 | Título desbloqueado no nível 21. |
| extended_title_10 | Global Talent 10 | 👑 | 23 | Título desbloqueado no nível 23. |
| extended_title_11 | Global Talent 11 | 🌍 | 25 | Título desbloqueado no nível 25. |
| extended_title_12 | Global Talent 12 | 🚀 | 27 | Título desbloqueado no nível 27. |
| extended_title_13 | Global Talent 13 | 💼 | 29 | Título desbloqueado no nível 29. |
| extended_title_14 | Global Talent 14 | 🏆 | 31 | Título desbloqueado no nível 31. |
| extended_title_15 | Global Talent 15 | 👑 | 33 | Título desbloqueado no nível 33. |
| extended_title_16 | Global Talent 16 | 🌍 | 35 | Título desbloqueado no nível 35. |
| extended_title_17 | Global Talent 17 | 🚀 | 37 | Título desbloqueado no nível 37. |
| extended_title_18 | Global Talent 18 | 💼 | 39 | Título desbloqueado no nível 39. |
| extended_title_19 | Global Talent 19 | 🏆 | 41 | Título desbloqueado no nível 41. |
| extended_title_20 | Global Talent 20 | 👑 | 43 | Título desbloqueado no nível 43. |
| extended_title_21 | Global Talent 21 | 🌍 | 45 | Título desbloqueado no nível 45. |
| extended_title_22 | Global Talent 22 | 🚀 | 47 | Título desbloqueado no nível 47. |
| extended_title_23 | Global Talent 23 | 💼 | 49 | Título desbloqueado no nível 49. |
| extended_title_24 | Global Talent 24 | 🏆 | 51 | Título desbloqueado no nível 51. |
| extended_title_25 | Global Talent 25 | 👑 | 53 | Título desbloqueado no nível 53. |
| extended_title_26 | Global Talent 26 | 🌍 | 55 | Título desbloqueado no nível 55. |
| extended_title_27 | Global Talent 27 | 🚀 | 57 | Título desbloqueado no nível 57. |
| extended_title_28 | Global Talent 28 | 💼 | 59 | Título desbloqueado no nível 59. |
| extended_title_29 | Global Talent 29 | 🏆 | 61 | Título desbloqueado no nível 61. |
| extended_title_30 | Global Talent 30 | 👑 | 63 | Título desbloqueado no nível 63. |

## Conquistas

### Conquistas base (22)

| Key | Nome | Ícone | Categoria | Meta | Recompensas |
| --- | --- | --- | --- | --- | --- |
| first_day | Primeiro Dia | 🌱 | streak | 1 | 25 moedas |
| streak_7 | 7 Dias | 🔥 | streak | 7 | 50 moedas · 1 escudo |
| streak_30 | 30 Dias | ⚡ | streak | 30 | 150 moedas · Loot Box Rara |
| streak_100 | 100 Dias | 💎 | streak | 100 | 500 moedas · Loot Box Épica |
| first_quest | Primeira Missão | 📜 | missions | 1 | 30 moedas |
| missions_10 | 10 Missões | 📋 | missions | 10 | 75 moedas |
| missions_50 | 50 Missões | 🗂️ | missions | 50 | 200 moedas · 1 escudo |
| missions_100 | 100 Missões | 🏆 | missions | 100 | 400 moedas · Loot Box Rara |
| xp_1000 | 1.000 XP | ✨ | xp | 1000 | 100 moedas |
| xp_5000 | 5.000 XP | 🌟 | xp | 5000 | 250 moedas · 1 escudo |
| xp_10000 | 10.000 XP | 💫 | xp | 10000 | 500 moedas · Loot Box Épica |
| level_5 | Nível 5 | 🎖️ | level | 5 | 75 moedas |
| level_10 | Nível 10 | 🥇 | level | 10 | 150 moedas |
| level_25 | Nível 25 | 🏅 | level | 25 | 300 moedas · Loot Box Rara |
| level_50 | Nível 50 | 👑 | level | 50 | 750 moedas · Loot Box Lendária |
| pet_baby | Baby Pet | 🐣 | pet | baby | 100 moedas |
| pet_teen | Teen Pet | 🐥 | pet | teen | 200 moedas |
| pet_adult | Adult Pet | 🐦 | pet | adult | 400 moedas · 1 escudo |
| pet_legendary | Legendary Pet | 🦅 | pet | legendary | 1000 moedas · Loot Box Lendária |
| first_loot_box | Primeira Loot Box | 🎁 | loot_boxes | 1 | 50 moedas |
| loot_boxes_10 | 10 Loot Boxes | 📦 | loot_boxes | 10 | 150 moedas · Loot Box Comum |
| loot_boxes_50 | 50 Loot Boxes | 🧰 | loot_boxes | 50 | 400 moedas · Loot Box Épica |

### Conquistas estendidas (50) — geradas proceduralmente

Fórmula: `extended_achievement_{1..50}` · target = 5 + tier × (500 se XP, 2 se level, 3 caso contrário)

Recompensa: `25 + tier × 15` moedas · a cada 5 tiers: loot box (rare ou epic se tier ≥ 40)

| Key | Nome | Ícone | Categoria | Meta | Recompensas |
| --- | --- | --- | --- | --- | --- |
| extended_achievement_1 | Marco 1 | 🏅 | streak | 8 | 40 moedas |
| extended_achievement_2 | Marco 2 | ⭐ | missions | 11 | 55 moedas |
| extended_achievement_3 | Marco 3 | 🎯 | xp | 1505 | 70 moedas |
| extended_achievement_4 | Marco 4 | 🔥 | level | 13 | 85 moedas |
| extended_achievement_5 | Marco 5 | 💎 | pet | 20 | 100 moedas · Loot Box bônus |
| extended_achievement_6 | Marco 6 | 🏅 | loot_boxes | 23 | 115 moedas |
| extended_achievement_7 | Marco 7 | ⭐ | streak | 26 | 130 moedas |
| extended_achievement_8 | Marco 8 | 🎯 | missions | 29 | 145 moedas |
| extended_achievement_9 | Marco 9 | 🔥 | xp | 4505 | 160 moedas |
| extended_achievement_10 | Marco 10 | 💎 | level | 25 | 175 moedas · Loot Box bônus |
| extended_achievement_11 | Marco 11 | 🏅 | pet | 38 | 190 moedas |
| extended_achievement_12 | Marco 12 | ⭐ | loot_boxes | 41 | 205 moedas |
| extended_achievement_13 | Marco 13 | 🎯 | streak | 44 | 220 moedas |
| extended_achievement_14 | Marco 14 | 🔥 | missions | 47 | 235 moedas |
| extended_achievement_15 | Marco 15 | 💎 | xp | 7505 | 250 moedas · Loot Box bônus |
| extended_achievement_16 | Marco 16 | 🏅 | level | 37 | 265 moedas |
| extended_achievement_17 | Marco 17 | ⭐ | pet | 56 | 280 moedas |
| extended_achievement_18 | Marco 18 | 🎯 | loot_boxes | 59 | 295 moedas |
| extended_achievement_19 | Marco 19 | 🔥 | streak | 62 | 310 moedas |
| extended_achievement_20 | Marco 20 | 💎 | missions | 65 | 325 moedas · Loot Box bônus |
| extended_achievement_21 | Marco 21 | 🏅 | xp | 10505 | 340 moedas |
| extended_achievement_22 | Marco 22 | ⭐ | level | 49 | 355 moedas |
| extended_achievement_23 | Marco 23 | 🎯 | pet | 74 | 370 moedas |
| extended_achievement_24 | Marco 24 | 🔥 | loot_boxes | 77 | 385 moedas |
| extended_achievement_25 | Marco 25 | 💎 | streak | 80 | 400 moedas · Loot Box bônus |
| extended_achievement_26 | Marco 26 | 🏅 | missions | 83 | 415 moedas |
| extended_achievement_27 | Marco 27 | ⭐ | xp | 13505 | 430 moedas |
| extended_achievement_28 | Marco 28 | 🎯 | level | 61 | 445 moedas |
| extended_achievement_29 | Marco 29 | 🔥 | pet | 92 | 460 moedas |
| extended_achievement_30 | Marco 30 | 💎 | loot_boxes | 95 | 475 moedas · Loot Box bônus |
| extended_achievement_31 | Marco 31 | 🏅 | streak | 98 | 490 moedas |
| extended_achievement_32 | Marco 32 | ⭐ | missions | 101 | 505 moedas |
| extended_achievement_33 | Marco 33 | 🎯 | xp | 16505 | 520 moedas |
| extended_achievement_34 | Marco 34 | 🔥 | level | 73 | 535 moedas |
| extended_achievement_35 | Marco 35 | 💎 | pet | 110 | 550 moedas · Loot Box bônus |
| extended_achievement_36 | Marco 36 | 🏅 | loot_boxes | 113 | 565 moedas |
| extended_achievement_37 | Marco 37 | ⭐ | streak | 116 | 580 moedas |
| extended_achievement_38 | Marco 38 | 🎯 | missions | 119 | 595 moedas |
| extended_achievement_39 | Marco 39 | 🔥 | xp | 19505 | 610 moedas |
| extended_achievement_40 | Marco 40 | 💎 | level | 85 | 625 moedas · Loot Box bônus |
| extended_achievement_41 | Marco 41 | 🏅 | pet | 128 | 640 moedas |
| extended_achievement_42 | Marco 42 | ⭐ | loot_boxes | 131 | 655 moedas |
| extended_achievement_43 | Marco 43 | 🎯 | streak | 134 | 670 moedas |
| extended_achievement_44 | Marco 44 | 🔥 | missions | 137 | 685 moedas |
| extended_achievement_45 | Marco 45 | 💎 | xp | 22505 | 700 moedas · Loot Box bônus |
| extended_achievement_46 | Marco 46 | 🏅 | level | 97 | 715 moedas |
| extended_achievement_47 | Marco 47 | ⭐ | pet | 146 | 730 moedas |
| extended_achievement_48 | Marco 48 | 🎯 | loot_boxes | 149 | 745 moedas |
| extended_achievement_49 | Marco 49 | 🔥 | streak | 152 | 760 moedas |
| extended_achievement_50 | Marco 50 | 💎 | missions | 155 | 775 moedas · Loot Box bônus |

## Loot boxes

| Raridade | Emoji | Como obter |
| --- | --- | --- |
| Common Box | 📦 | Shop (coins/SP), Contratos, Conquistas, Prestígio, Upgrade chain, Drops internos |
| Uncommon Box | 🎁 | Shop (coins/SP), Contratos, Conquistas, Prestígio, Upgrade chain, Drops internos |
| Rare Box | 💎 | Shop (coins/SP), Contratos, Conquistas, Prestígio, Upgrade chain, Drops internos |
| Epic Box | 🔮 | Shop (coins/SP), Contratos, Conquistas, Prestígio, Upgrade chain, Drops internos |
| Legendary Box | 👑 | Shop (coins/SP), Contratos, Conquistas, Prestígio, Upgrade chain, Drops internos |
| Mythic Box | ✨ | Shop (coins/SP), Contratos, Conquistas, Prestígio, Upgrade chain, Drops internos |
| Ancient Box | 🔥 | Shop (coins/SP), Contratos, Conquistas, Prestígio, Upgrade chain, Drops internos |

## Loja (coins)

| Key | Nome | Ícone | Preço (coins) | Recompensa |
| --- | --- | --- | --- | --- |
| shield_1 | Escudo | 🛡️ | 100 | shield |
| shield_pack | Pack de Escudos | 🛡️ | 250 | shield |
| loot_box_common | Loot Box Comum | 📦 | 150 | loot_box common |
| loot_box_rare | Loot Box Rara | 🎁 | 500 | loot_box rare |
| loot_box_epic | Loot Box Épica | 💎 | 1500 | loot_box epic |

## Loja (Study Points)

| Key | Nome | Custo (SP) | Recompensa |
| --- | --- | --- | --- |
| box_common | Loot Box Comum | 80 | common |
| box_uncommon | Loot Box Incomum | 150 | uncommon |
| box_rare | Loot Box Rara | 300 | rare |
| box_epic | Loot Box Épica | 600 | epic |
| pet_egg | Ovo de Pet | 400 | pet_egg |
| golden_ticket | Ticket Dourado | 200 | golden_ticket |
| free_loot_ticket | Ticket de Loot | 120 | free_loot_ticket |

## Contratos

| Key | Nome | Ícone | Dias | Aposta | Recompensas |
| --- | --- | --- | --- | --- | --- |
| consistency_starter | Consistency Starter | 🌱 | 3 | 25 | 75 moedas · 1 escudo |
| weekly_focus | Weekly Focus | 🔥 | 7 | 100 | 300 moedas · 1 Loot Box Rara |
| discipline_builder | Discipline Builder | 💪 | 14 | 200 | 700 moedas · 2 escudos · 1 Loot Box Rara |
| commitment_master | Commitment Master | 👑 | 30 | 500 | 2000 moedas · 3 escudos · 1 Loot Box Épica |
| extended_contract_1 | Challenge 3D | 🌱 | 3 | 50 | 120 moedas |
| extended_contract_2 | Challenge 5D | 🔥 | 5 | 75 | 200 moedas |
| extended_contract_3 | Challenge 7D | 💪 | 7 | 100 | 280 moedas |
| extended_contract_4 | Challenge 9D | 👑 | 9 | 125 | 360 moedas |
| extended_contract_5 | Challenge 11D | 🌱 | 11 | 150 | 440 moedas |
| extended_contract_6 | Challenge 13D | 🔥 | 13 | 175 | 520 moedas |
| extended_contract_7 | Challenge 15D | 💪 | 15 | 200 | 600 moedas |
| extended_contract_8 | Challenge 17D | 👑 | 17 | 225 | 680 moedas |
| extended_contract_9 | Challenge 19D | 🌱 | 19 | 250 | 760 moedas |
| extended_contract_10 | Challenge 21D | 🔥 | 21 | 275 | 840 moedas |
| extended_contract_11 | Challenge 23D | 💪 | 23 | 300 | 920 moedas |
| extended_contract_12 | Challenge 25D | 👑 | 25 | 325 | 1000 moedas |
| extended_contract_13 | Challenge 27D | 🌱 | 27 | 350 | 1080 moedas |
| extended_contract_14 | Challenge 29D | 🔥 | 29 | 375 | 1160 moedas |
| extended_contract_15 | Challenge 31D | 💪 | 31 | 400 | 1240 moedas |
| extended_contract_16 | Challenge 33D | 👑 | 33 | 425 | 1320 moedas |
| extended_contract_17 | Challenge 35D | 🌱 | 35 | 450 | 1400 moedas |
| extended_contract_18 | Challenge 37D | 🔥 | 37 | 475 | 1480 moedas |
| extended_contract_19 | Challenge 39D | 💪 | 39 | 500 | 1560 moedas |
| extended_contract_20 | Challenge 41D | 👑 | 41 | 525 | 1640 moedas |

## Cidade

| Key | Nome | Ícone | Nível req. | Título vinculado |
| --- | --- | --- | --- | --- |
| house | House | 🏠 | 1 | local_developer |
| office | Office | 🏢 | 5 | junior_remote_developer |
| startup | Startup | 🚀 | 10 | mid_remote_developer |
| company | Company | 🏬 | 20 | senior_remote_developer |
| airport | Airport | ✈️ | 30 | international_developer |
| skyscraper | Skyscraper | 🏙️ | 50 | global_engineer |
| co_working_hub | Co-working Hub | 🏗️ | 35 | extended_title_1 |
| tech_campus | Tech Campus | 🎓 | 45 | extended_title_2 |
| innovation_lab | Innovation Lab | 🔬 | 60 | extended_title_3 |
| global_hq | Global HQ | 🌐 | 80 | extended_title_4 |
| financial_center | Financial Center | 🏦 | 100 | world_class_engineer |
| extended_building_1 | District 1 | 🏙️ | 30 | extended_title_1 |
| extended_building_2 | District 2 | 🌉 | 35 | extended_title_2 |
| extended_building_3 | District 3 | 🏗️ | 40 | extended_title_3 |
| extended_building_4 | District 4 | 🛫 | 45 | extended_title_4 |
| extended_building_5 | District 5 | 🗼 | 50 | extended_title_5 |
| extended_building_6 | District 6 | 🏙️ | 55 | extended_title_6 |
| extended_building_7 | District 7 | 🌉 | 60 | extended_title_7 |
| extended_building_8 | District 8 | 🏗️ | 65 | extended_title_8 |
| extended_building_9 | District 9 | 🛫 | 70 | extended_title_9 |
| extended_building_10 | District 10 | 🗼 | 75 | extended_title_10 |
| extended_building_11 | District 11 | 🏙️ | 80 | extended_title_11 |
| extended_building_12 | District 12 | 🌉 | 85 | extended_title_12 |
| extended_building_13 | District 13 | 🏗️ | 90 | extended_title_13 |
| extended_building_14 | District 14 | 🛫 | 95 | extended_title_14 |
| extended_building_15 | District 15 | 🗼 | 100 | extended_title_15 |
| extended_building_16 | District 16 | 🏙️ | 105 | extended_title_16 |
| extended_building_17 | District 17 | 🌉 | 110 | extended_title_17 |
| extended_building_18 | District 18 | 🏗️ | 115 | extended_title_18 |
| extended_building_19 | District 19 | 🛫 | 120 | extended_title_19 |
| extended_building_20 | District 20 | 🗼 | 125 | extended_title_20 |

## Carreira

### Roles

| Key | Nome | Ícone | Nível req. |
| --- | --- | --- | --- |
| student | Student | 🎓 | 1 |
| junior_developer | Junior Developer | 💻 | 5 |
| remote_developer | Remote Developer | 🌍 | 12 |
| senior_developer | Senior Developer | ⭐ | 20 |
| international_developer | International Developer | 🌐 | 30 |
| global_engineer | Global Engineer | 🛰️ | 45 |
| tech_lead | Tech Lead | 🎯 | 60 |
| cto | CTO | 👑 | 80 |

### Empresas

| Key | Nome | Ícone | Nível req. | Requisitos extras |
| --- | --- | --- | --- | --- |
| startup_local | Startup Local | 🏠 | 1 | — |
| startup_national | Startup Nacional | 🏢 | 15 | streak 7 |
| international_company | Empresa Internacional | ✈️ | 30 | international_developer |
| big_tech | Big Tech | 🦄 | 50 | 10 conquistas |

### Entrevistas

| Key | Nome | Ícone | Nível req. | Recompensa |
| --- | --- | --- | --- | --- |
| behavioral | Behavioral Interview | 💬 | 10 | 100 coins · 50 XP |
| technical | Technical Interview | ⚙️ | 20 | 200 coins · 100 XP |
| english | English Interview | 🗣️ | 25 | 300 coins · 150 XP |
| leadership | Leadership Interview | 🎤 | 55 | 500 coins · 250 XP |

### Ofertas de emprego

| Key | Nome | Ícone | Nível req. | Salário |
| --- | --- | --- | --- | --- |
| remote_junior | Remote Junior Offer | 📩 | 12 | $2k/mo |
| international_mid | International Mid Offer | 💼 | 30 | $5k/mo |
| big_tech_senior | Big Tech Senior Offer | 🏆 | 50 | $10k/mo |
| tech_lead_offer | Tech Lead Offer | 🚀 | 65 | $15k/mo |

### Sonhos de carreira

| Key | Nome | Ícone | Meta | Métrica |
| --- | --- | --- | --- | --- |
| work_remote | Trabalhar remoto | 🏡 | 30 | streak |
| earn_dollars | Ganhar em dólar | 💵 | 5000 | coins |
| move_abroad | Mudar para outro país | 🌎 | 50 | city_percent |
| join_big_tech | Entrar em Big Tech | 🦄 | 50 | level |

## Prestígio

### Prestígio I — Veteran Learner

**Nível requerido:** 50 · **Título:** Veteran Learner

**Recompensas:** Moldura Rara exclusiva · 200 moedas · Loot Box Épica

**Bônus permanentes:** XP Global +2% · Moedas +2%

| Key | Item exclusivo | Ícone | Tipo |
| --- | --- | --- | --- |
| prestige_frame_rare | Moldura Veteran | 🖼️ | frame |
| veteran_learner | Título: Veteran Learner | 🏅 | title |
| relic_15 | Relíquia de Prestígio I | 📕 | relic |

### Prestígio II — Global Professional

**Nível requerido:** 100 · **Título:** Global Professional

**Recompensas:** Moldura Lendária · 400 moedas · Loot Box Lendária · Relíquia épica

**Bônus permanentes:** XP Global +4% · Moedas +4% · Chance de raros +1%

| Key | Item exclusivo | Ícone | Tipo |
| --- | --- | --- | --- |
| prestige_frame_legendary | Moldura Global | 👑 | frame |
| global_professional | Título: Global Professional | 🌐 | title |
| cosmetic_10 | Aura Global | ✨ | cosmetic |
| relic_50 | Relíquia Global | 💎 | relic |

### Prestígio III — Elite Engineer

**Nível requerido:** 200 · **Título:** Elite Engineer

**Recompensas:** Avatar exclusivo · 600 moedas · Loot Box Mítica · Pet exclusivo

**Bônus permanentes:** XP Global +6% · Moedas +6% · Slot de Contrato +1 · Chance de raros +2%

| Key | Item exclusivo | Ícone | Tipo |
| --- | --- | --- | --- |
| prestige_frame_mythic | Moldura Elite | ⚔️ | frame |
| elite_engineer | Título: Elite Engineer | 🎯 | title |
| exclusive_pet_5 | FAANG Eagle | 🦅 | pet |
| mythic_10 | Essência Elite | 💫 | relic |

### Prestígio IV — World Class Engineer

**Nível requerido:** 350 · **Título:** World Class Engineer

**Recompensas:** Moldura Ancestral · 800 moedas · Loot Box Mítica x2 · Relíquia lendária

**Bônus permanentes:** XP Global +8% · Moedas +8% · Slot de Pet +1 · Chance de raros +3%

| Key | Item exclusivo | Ícone | Tipo |
| --- | --- | --- | --- |
| prestige_frame_ancient | Moldura World Class | 🔥 | frame |
| world_class_engineer | Título: World Class Engineer | 👑 | title |
| legendary_dragon_pet | Legendary Dragon Pet | 🐉 | pet |
| world_class_engineer_medal | World Class Engineer Medal | 🏅 | relic |

### Prestígio V — Legacy Architect

**Nível requerido:** 500 · **Título:** Legacy Architect

**Recompensas:** Coroa Ancestral · 1200 moedas · Loot Box Ancestral · Todos bônus máximos

**Bônus permanentes:** XP Global +10% · Moedas +10% · Slots de Contrato +2 · Slots de Pet +2 · Chance de raros +5%

| Key | Item exclusivo | Ícone | Tipo |
| --- | --- | --- | --- |
| ancient_developer_crown | Ancient Developer Crown | 👑 | relic |
| legacy_architect | Título: Legacy Architect | 🏛️ | title |
| faang_invitation | FAANG Invitation | ✉️ | relic |
| cosmetic_50 | Cosmético Ancestral | 🎨 | cosmetic |

## Avatar (molduras e badges)

### Molduras

| Key | Nome | Nível req. |
| --- | --- | --- |
| default | Padrão | 1 |
| bronze | Bronze | 5 |
| silver | Prata | 15 |
| gold | Ouro | 30 |
| neon | Neon | 50 |
| legendary | Lendário | 75 |

### Badges

| Key | Nome | Ícone | Nível req. |
| --- | --- | --- | --- |
| none | Nenhum | — | 0 |
| scholar | Estudioso | 📚 | 10 |
| streak | Consistente | 🔥 | 20 |
| champion | Campeão | 🏆 | 40 |
| legend | Lenda | 👑 | 60 |

Molduras de prestígio (via claim): `rare`, `legendary`, `mythic`, `ancient`

## Escudos (milestones)

| Key | Streak | Escudos | Label |
| --- | --- | --- | --- |
| streak_7 | 7 | 1 | 7 dias de sequência |
| streak_30 | 30 | 2 | 30 dias de sequência |
| streak_100 | 100 | 5 | 100 dias de sequência |

Escudos também obtidos via: conquistas, loot boxes, contratos, shop.
