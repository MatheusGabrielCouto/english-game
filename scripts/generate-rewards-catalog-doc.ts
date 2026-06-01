/**
 * Generates docs/REWARDS_CATALOG.md from in-app catalogs.
 * Run: pnpm exec tsx scripts/generate-rewards-catalog-doc.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ACHIEVEMENT_DEFINITIONS } from '../src/features/achievements/constants/default-achievements';
import { BUILDING_DEFINITIONS } from '../src/features/city/constants/default-buildings';
import { CONTRACT_DEFINITIONS } from '../src/features/contracts/constants/default-contracts';
import {
  CAREER_COMPANIES,
  CAREER_DREAMS,
  CAREER_INTERVIEWS,
  CAREER_JOB_OFFERS,
  CAREER_ROLES,
} from '../src/features/career/constants/career-catalog';
import { AVATAR_BADGES, AVATAR_FRAMES } from '../src/features/avatar/constants/avatar-customization';
import {
  ARTIFACT_CATALOG,
  COSMETIC_CATALOG,
  EXCLUSIVE_PET_CATALOG,
  FULL_COLLECTIBLE_CATALOG,
  MYTHIC_CATALOG,
  RELIC_CATALOG,
  ULTRA_RARE_CATALOG,
} from '../src/features/game-design/catalogs/collectible-catalog';
import { GAME_ITEM_CATALOG } from '../src/features/game-design/catalogs/item-catalog';
import { STUDY_POINTS_SHOP } from '../src/features/game-design/catalogs/loot-economy';
import { PET_SPECIES_CATALOG } from '../src/features/game-design/catalogs/pet-species-catalog';
import { LOOT_BOX_CATALOG_META } from '../src/features/loot-boxes/constants/loot-box-catalog-meta';
import { PRESTIGE_CATALOG } from '../src/features/prestige/constants/prestige-catalog';
import { SHOP_PRODUCTS } from '../src/features/shop/constants/shop-products';
import { STREAK_SHIELD_MILESTONES } from '../src/features/shields/constants';
import { TITLE_DEFINITIONS } from '../src/features/titles/constants/default-titles';
import { LootBoxRarity } from '../src/types/inventory';

const lines: string[] = [];

const h1 = (text: string) => lines.push(`# ${text}`, '');
const h2 = (text: string) => lines.push(`## ${text}`, '');
const h3 = (text: string) => lines.push(`### ${text}`, '');
const p = (text: string) => lines.push(text, '');
const table = (headers: string[], rows: string[][]) => {
  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
  rows.forEach((row) => lines.push(`| ${row.join(' | ')} |`));
  lines.push('');
};

const collectiblesByRarity = (items: typeof FULL_COLLECTIBLE_CATALOG) => {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    counts[item.rarity] = (counts[item.rarity] ?? 0) + 1;
  });
  return counts;
};

const formatRewards = (rewards: { label?: string; type?: string; amount?: number; rarity?: string }[]) =>
  rewards.map((r) => r.label ?? `${r.type}${r.amount ? ` ${r.amount}` : ''}${r.rarity ? ` (${r.rarity})` : ''}`).join(' · ');

// --- Document ---

h1('Catálogo Completo de Recompensas — English Quest');

p('> Documento gerado automaticamente a partir dos catálogos em `src/`.');
p('> Execute `pnpm exec tsx scripts/generate-rewards-catalog-doc.ts` para atualizar.');
p(`> Última geração: ${new Date().toISOString().split('T')[0]}`);

h2('Índice');

p(`1. [Resumo por categoria](#resumo-por-categoria)
2. [Escalas de raridade](#escalas-de-raridade)
3. [Relíquias](#relíquias) (${RELIC_CATALOG.length})
4. [Artefatos](#artefatos) (${ARTIFACT_CATALOG.length})
5. [Itens míticos](#itens-míticos) (${MYTHIC_CATALOG.length})
6. [Cosméticos](#cosméticos) (${COSMETIC_CATALOG.length})
7. [Pets exclusivos (coleção)](#pets-exclusivos-coleção) (${EXCLUSIVE_PET_CATALOG.length})
8. [Ultra raros](#ultra-raros) (${ULTRA_RARE_CATALOG.length})
9. [Espécies de pets (jogáveis)](#espécies-de-pets-jogáveis) (${PET_SPECIES_CATALOG.length})
10. [Itens especiais e consumíveis](#itens-especiais-e-consumíveis) (${GAME_ITEM_CATALOG.length})
11. [Títulos](#títulos) (${TITLE_DEFINITIONS.length})
12. [Conquistas](#conquistas) (${ACHIEVEMENT_DEFINITIONS.length})
13. [Loot boxes](#loot-boxes)
14. [Loja (coins)](#loja-coins)
15. [Loja (Study Points)](#loja-study-points)
16. [Contratos](#contratos)
17. [Cidade](#cidade)
18. [Carreira](#carreira)
19. [Prestígio](#prestígio)
20. [Avatar (molduras e badges)](#avatar-molduras-e-badges)
21. [Escudos (milestones)](#escudos-milestones)`);

h2('Resumo por categoria');

table(
  ['Categoria', 'Quantidade', 'Raridades'],
  [
    ['Relíquias (Collection Book)', String(RELIC_CATALOG.length), 'common → mythic'],
    ['Artefatos', String(ARTIFACT_CATALOG.length), 'common → mythic'],
    ['Itens míticos', String(MYTHIC_CATALOG.length), 'mythic, ancient'],
    ['Cosméticos', String(COSMETIC_CATALOG.length), 'common → mythic'],
    ['Pets exclusivos (coleção)', String(EXCLUSIVE_PET_CATALOG.length), 'legendary → ancient'],
    ['Ultra raros', String(ULTRA_RARE_CATALOG.length), 'mythic, ancient'],
    ['**Total colecionáveis**', `**${FULL_COLLECTIBLE_CATALOG.length}**`, '—'],
    ['Espécies de pets jogáveis', String(PET_SPECIES_CATALOG.length), 'common → legendary'],
    ['Itens especiais/consumíveis', String(GAME_ITEM_CATALOG.length), 'common → legendary'],
    ['Títulos', String(TITLE_DEFINITIONS.length), 'por nível / prestígio'],
    ['Conquistas', String(ACHIEVEMENT_DEFINITIONS.length), 'por categoria'],
    ['Edifícios da cidade', String(BUILDING_DEFINITIONS.length), 'por nível'],
    ['Contratos', String(CONTRACT_DEFINITIONS.length), 'por duração'],
    ['Níveis de prestígio', String(PRESTIGE_CATALOG.length), 'I → V'],
  ],
);

const rarityCounts = collectiblesByRarity(FULL_COLLECTIBLE_CATALOG);
h2('Escalas de raridade');

h3('Colecionáveis (Collection Book)');
table(
  ['Raridade', 'Quantidade'],
  Object.entries(rarityCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rarity, count]) => [rarity, String(count)]),
);

h3('Pets jogáveis');
const petRarityCounts: Record<string, number> = {};
PET_SPECIES_CATALOG.forEach((s) => {
  petRarityCounts[s.rarity] = (petRarityCounts[s.rarity] ?? 0) + 1;
});
table(
  ['Raridade', 'Quantidade'],
  Object.entries(petRarityCounts).map(([r, c]) => [r, String(c)]),
);

h3('Loot boxes');
table(
  ['Raridade', 'Emoji', 'Descrição'],
  Object.values(LootBoxRarity).map((rarity) => {
    const meta = LOOT_BOX_CATALOG_META[rarity];
    return [meta.title.replace(' Box', ''), meta.emoji, meta.description];
  }),
);

h3('Regra de raridade procedural (relíquias, artefatos, cosméticos)');
p('Distribuição por índice no catálogo (`rarityForIndex`):');
p('- 0–30% → **common**');
p('- 30–50% → **uncommon**');
p('- 50–70% → **rare**');
p('- 70–85% → **epic**');
p('- 85–95% → **legendary**');
p('- 95–100% → **mythic**');
p('Bônus passivo das relíquias: `+1%` a `+5%` (cíclico por índice).');

// Relics
h2('Relíquias');
table(
  ['Key', 'Nome', 'Ícone', 'Raridade', 'Bônus'],
  RELIC_CATALOG.map((item) => [
    item.key,
    item.name,
    item.icon,
    item.rarity,
    item.passiveBonus ?? '—',
  ]),
);

// Artifacts
h2('Artefatos');
table(
  ['Key', 'Nome', 'Ícone', 'Raridade'],
  ARTIFACT_CATALOG.map((item) => [item.key, item.name, item.icon, item.rarity]),
);

// Mythics
h2('Itens míticos');
table(
  ['Key', 'Nome', 'Ícone', 'Raridade'],
  MYTHIC_CATALOG.map((item) => [item.key, item.name, item.icon, item.rarity]),
);

// Cosmetics
h2('Cosméticos');
table(
  ['Key', 'Nome', 'Ícone', 'Raridade'],
  COSMETIC_CATALOG.map((item) => [item.key, item.name, item.icon, item.rarity]),
);

// Exclusive pets collection
h2('Pets exclusivos (coleção)');
p('Obtidos via loot boxes especiais. Distribuição: índice 0–19 legendary, 20–26 mythic, 27–29 ancient.');
table(
  ['Key', 'Nome', 'Ícone', 'Raridade'],
  EXCLUSIVE_PET_CATALOG.map((item) => [item.key, item.name, item.icon, item.rarity]),
);

// Ultra rare
h2('Ultra raros');
table(
  ['Key', 'Nome', 'Ícone', 'Raridade', 'Bônus'],
  ULTRA_RARE_CATALOG.map((item) => [
    item.key,
    item.name,
    item.icon,
    item.rarity,
    item.passiveBonus ?? '—',
  ]),
);

// Playable pets
h2('Espécies de pets (jogáveis)');
table(
  ['Key', 'Nome', 'Ícone', 'Raridade', 'Passivo', 'Chocagem (h)'],
  PET_SPECIES_CATALOG.map((s) => [s.key, s.name, s.emoji, s.rarity, s.passive.label, String(s.hatchHours)]),
);

// Game items
h2('Itens especiais e consumíveis');
table(
  ['Key', 'Nome', 'Ícone', 'Categoria', 'Raridade', 'Efeito'],
  GAME_ITEM_CATALOG.map((item) => [
    item.key,
    item.name,
    item.icon,
    item.category,
    item.rarity,
    `${item.effectType} (${item.effectValue}${item.durationMinutes ? `, ${item.durationMinutes}min` : ''})`,
  ]),
);

// Titles
h2('Títulos');
table(
  ['Key', 'Nome', 'Ícone', 'Nível req.', 'Descrição'],
  TITLE_DEFINITIONS.map((t) => [t.key, t.name, t.icon, String(t.requiredLevel), t.description]),
);

// Achievements - base vs extended
h2('Conquistas');
const baseAchievements = ACHIEVEMENT_DEFINITIONS.filter((a) => !a.key.startsWith('extended_'));
const extendedAchievements = ACHIEVEMENT_DEFINITIONS.filter((a) => a.key.startsWith('extended_'));

h3(`Conquistas base (${baseAchievements.length})`);
table(
  ['Key', 'Nome', 'Ícone', 'Categoria', 'Meta', 'Recompensas'],
  baseAchievements.map((a) => [
    a.key,
    a.name,
    a.icon,
    a.category,
    String(a.target),
    formatRewards(a.rewards),
  ]),
);

h3(`Conquistas estendidas (${extendedAchievements.length}) — geradas proceduralmente`);
p('Fórmula: `extended_achievement_{1..50}` · target = 5 + tier × (500 se XP, 2 se level, 3 caso contrário)');
p('Recompensa: `25 + tier × 15` moedas · a cada 5 tiers: loot box (rare ou epic se tier ≥ 40)');
table(
  ['Key', 'Nome', 'Ícone', 'Categoria', 'Meta', 'Recompensas'],
  extendedAchievements.map((a) => [
    a.key,
    a.name,
    a.icon,
    a.category,
    String(a.target),
    formatRewards(a.rewards),
  ]),
);

// Loot boxes
h2('Loot boxes');
table(
  ['Raridade', 'Emoji', 'Como obter'],
  Object.values(LootBoxRarity).map((rarity) => {
    const meta = LOOT_BOX_CATALOG_META[rarity];
    const sources = [
      'Shop (coins/SP)',
      'Contratos',
      'Conquistas',
      'Prestígio',
      'Upgrade chain',
      'Drops internos',
    ].join(', ');
    return [meta.title, meta.emoji, sources];
  }),
);

// Shop
h2('Loja (coins)');
table(
  ['Key', 'Nome', 'Ícone', 'Preço (coins)', 'Recompensa'],
  SHOP_PRODUCTS.map((p) => [p.key, p.name, p.icon, String(p.price), p.reward.type + (p.reward.rarity ? ` ${p.reward.rarity}` : '')]),
);

h2('Loja (Study Points)');
table(
  ['Key', 'Nome', 'Custo (SP)', 'Recompensa'],
  STUDY_POINTS_SHOP.map((p) => [
    p.key,
    p.label,
    String(p.cost),
    'lootRarity' in p ? p.lootRarity : 'itemKey' in p ? p.itemKey : '—',
  ]),
);

// Contracts
h2('Contratos');
table(
  ['Key', 'Nome', 'Ícone', 'Dias', 'Aposta', 'Recompensas'],
  CONTRACT_DEFINITIONS.map((c) => [
    c.key,
    c.name,
    c.icon,
    String(c.targetDays),
    String(c.stakeAmount),
    c.rewards.map((r) => r.label).join(' · '),
  ]),
);

// City
h2('Cidade');
table(
  ['Key', 'Nome', 'Ícone', 'Nível req.', 'Título vinculado'],
  BUILDING_DEFINITIONS.map((b) => [b.key, b.name, b.icon, String(b.requiredLevel), b.linkedTitleKey ?? '—']),
);

// Career
h2('Carreira');

h3('Roles');
table(
  ['Key', 'Nome', 'Ícone', 'Nível req.'],
  CAREER_ROLES.map((r) => [r.key, r.name, r.icon, String(r.requiredLevel)]),
);

h3('Empresas');
table(
  ['Key', 'Nome', 'Ícone', 'Nível req.', 'Requisitos extras'],
  CAREER_COMPANIES.map((c) => [
    c.key,
    c.name,
    c.icon,
    String(c.requiredLevel),
    [c.requiredStreak ? `streak ${c.requiredStreak}` : '', c.requiredRoleKey ?? '', c.requiredAchievements ? `${c.requiredAchievements} conquistas` : '']
      .filter(Boolean)
      .join(', ') || '—',
  ]),
);

h3('Entrevistas');
table(
  ['Key', 'Nome', 'Ícone', 'Nível req.', 'Recompensa'],
  CAREER_INTERVIEWS.map((i) => [
    i.key,
    i.name,
    i.icon,
    String(i.requiredLevel),
    `${i.rewardCoins} coins · ${i.rewardXp} XP`,
  ]),
);

h3('Ofertas de emprego');
table(
  ['Key', 'Nome', 'Ícone', 'Nível req.', 'Salário'],
  CAREER_JOB_OFFERS.map((o) => [o.key, o.name, o.icon, String(o.requiredLevel), o.salaryLabel ?? '—']),
);

h3('Sonhos de carreira');
table(
  ['Key', 'Nome', 'Ícone', 'Meta', 'Métrica'],
  CAREER_DREAMS.map((d) => [d.key, d.name, d.icon, String(d.target), d.metric]),
);

// Prestige
h2('Prestígio');
PRESTIGE_CATALOG.forEach((tier) => {
  h3(`Prestígio ${tier.roman} — ${tier.name}`);
  p(`**Nível requerido:** ${tier.requiredPlayerLevel} · **Título:** ${tier.exclusiveTitle}`);
  p(`**Recompensas:** ${tier.rewards.join(' · ')}`);
  p(`**Bônus permanentes:** ${tier.permanentBonuses.map((b) => `${b.label} ${b.value}`).join(' · ')}`);
  table(
    ['Key', 'Item exclusivo', 'Ícone', 'Tipo'],
    tier.exclusiveItems.map((item) => [item.key, item.name, item.icon, item.category]),
  );
});

// Avatar
h2('Avatar (molduras e badges)');

h3('Molduras');
table(
  ['Key', 'Nome', 'Nível req.'],
  Object.entries(AVATAR_FRAMES).map(([key, frame]) => [key, frame.label, String(frame.unlockLevel)]),
);

h3('Badges');
table(
  ['Key', 'Nome', 'Ícone', 'Nível req.'],
  Object.entries(AVATAR_BADGES).map(([key, badge]) => [key, badge.label, badge.emoji || '—', String(badge.unlockLevel)]),
);

p('Molduras de prestígio (via claim): `rare`, `legendary`, `mythic`, `ancient`');

// Shields
h2('Escudos (milestones)');
table(
  ['Key', 'Streak', 'Escudos', 'Label'],
  STREAK_SHIELD_MILESTONES.map((m) => [m.key, String(m.streakDays), String(m.shieldsAwarded), m.label]),
);

p('Escudos também obtidos via: conquistas, loot boxes, contratos, shop.');

// Write file
const outputPath = resolve(process.cwd(), 'docs/REWARDS_CATALOG.md');
writeFileSync(outputPath, lines.join('\n'), 'utf-8');
console.log(`Generated ${outputPath} (${lines.length} lines)`);
