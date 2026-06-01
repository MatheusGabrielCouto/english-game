import {
  CollectibleCategory,
  CollectibleRarity,
  type CollectibleDefinition,
} from '@/types/collectible';

const RELIC_NAMES = [
  'Ancient Dictionary',
  'Grammar Codex',
  'Global Passport',
  'Golden Keyboard',
  'Remote Contract',
  'Interview Handbook',
  'Tech Encyclopedia',
  'Developer Laptop',
  'Voice Trainer',
  'Silicon Valley Badge',
  'Fluency Compass',
  'Syntax Scroll',
  'API Atlas',
  'Cloud Certificate',
  'Debug Amulet',
  'Merge Stone',
  'Commit Crystal',
  'Pull Request Seal',
  'Standup Bell',
  'Sprint Hourglass',
  'Kanban Board',
  'Retrospective Mirror',
  'Code Review Lens',
  'Pair Programming Ring',
  'Whiteboard Marker',
  'Rubber Duck Idol',
  'Stack Overflow Tome',
  'Git Branch Charm',
  'Docker Container',
  'Kubernetes Helm',
  'CI Pipeline Pipe',
  'Unit Test Shield',
  'Integration Bridge',
  'E2E Telescope',
  'Agile Manifesto',
  'Scrum Master Whistle',
  'Product Owner Compass',
  'Stakeholder Map',
  'User Story Quill',
  'Acceptance Criteria Scroll',
  'Wireframe Sketch',
  'Design System Palette',
  'Figma Crystal',
  'Accessibility Key',
  'Performance Gauge',
  'Latency Stopwatch',
  'Cache Gem',
  'Database Index',
  'SQL Query Ring',
  'NoSQL Orb',
  'GraphQL Gateway',
  'RESTful Tablet',
  'WebSocket Wire',
  'Microservice Node',
  'Monolith Fragment',
  'Serverless Spark',
  'Edge Computing Shard',
  'CDN Feather',
  'Load Balancer Scale',
  'Firewall Ember',
  'Encryption Lock',
  'OAuth Token',
  'JWT Seal',
  'HTTPS Certificate',
  'SSL Shield',
  'Pen Test Dagger',
  'Bug Bounty Coin',
  'Incident Report',
  'Postmortem Quill',
  'On-Call Beacon',
  'Pager Duty Bell',
  'Slack Emoji Pack',
  'Zoom Background',
  'Notion Template',
  'Jira Ticket Stamp',
  'Confluence Page',
  'Linear Issue',
  'GitHub Star',
  'GitLab Runner',
  'Bitbucket Hook',
  'VS Code Extension',
  'JetBrains License',
  'Terminal Prompt',
  'Shell Script',
  'Regex Rune',
  'Algorithm Tome',
  'Data Structure Tree',
  'Big O Notation',
  'LeetCode Medal',
  'Hackathon Trophy',
  'Open Source Leaf',
  'Tech Blog Quill',
  'Conference Badge',
  'Meetup Sticker',
  'Networking Card',
  'Elevator Pitch',
  'LinkedIn Endorsement',
  'Portfolio Globe',
  'Resume Crystal',
  'Cover Letter',
  'Salary Negotiation',
  'Equity Scroll',
  'Stock Option',
  'RSU Token',
  'Benefits Package',
  'PTO Calendar',
  'Remote Setup',
  'Standing Desk',
  'Ergonomic Chair',
  'Noise Cancelling',
  'Focus Mode',
  'Deep Work Timer',
  'Pomodoro Tomato',
  'Study Streak Flame',
];

const RELIC_ICONS = ['📕', '💻', '🛂', '⌨️', '📄', '📖', '📚', '🔮', '🎯', '⚡', '💎', '🏅', '🔑', '🌐', '🦉'];
const ARTIFACT_PREFIX = ['Arcane', 'Blessed', 'Cursed', 'Enchanted', 'Forgotten', 'Lost', 'Sacred', 'Temporal'];
const ARTIFACT_SUFFIX = ['Compass', 'Orb', 'Shard', 'Relic', 'Emblem', 'Sigil', 'Fragment', 'Core'];
const MYTHIC_THEMES = ['Dragon', 'Phoenix', 'Titan', 'Oracle', 'Void', 'Cosmic', 'Eternal', 'Primordial'];
const COSMETIC_TYPES = ['Frame', 'Aura', 'Trail', 'Badge', 'Banner', 'Emote', 'Title Glow', 'Avatar Skin'];
const PET_EXCLUSIVE_NAMES = [
  'Legendary Dragon', 'Ancient Owl', 'Global Phoenix', 'Silicon Fox', 'Remote Panda',
  'FAANG Eagle', 'Startup Hedgehog', 'Unicorn Spirit', 'Cloud Whale', 'API Shark',
  'Bug Hunter Cat', 'Deploy Dragon', 'Merge Penguin', 'Review Raven', 'Standup Sloth',
  'Sprint Cheetah', 'Debug Duck Prime', 'Code Owl Elite', 'Git Cat Nova', 'Stack Fox',
  'Kernel Kraken', 'Async Phoenix', 'Remote Griffin', 'World Serpent', 'Quantum Owl',
  'Passport Phoenix', 'Legendary Lion', 'Celestial Whale', 'Fullstack Tiger', 'Micro Wolf',
];

const ULTRA_RARE_HANDCRAFTED: CollectibleDefinition[] = [
  {
    key: 'world_class_engineer_medal',
    name: 'World Class Engineer Medal',
    description: 'Concedida apenas aos engenheiros de elite global.',
    category: CollectibleCategory.ULTRA_RARE,
    rarity: CollectibleRarity.ANCIENT,
    icon: '🏅',
    passiveBonus: '+10% XP permanente',
    ultraRare: true,
  },
  {
    key: 'faang_invitation',
    name: 'FAANG Invitation',
    description: 'Convite mítico para entrevistas em big techs.',
    category: CollectibleCategory.ULTRA_RARE,
    rarity: CollectibleRarity.ANCIENT,
    icon: '✉️',
    passiveBonus: 'Desbloqueia entrevistas lendárias',
    ultraRare: true,
  },
  {
    key: 'silicon_valley_passport',
    name: 'Silicon Valley Passport',
    description: 'Acesso simbólico ao coração da tech mundial.',
    category: CollectibleCategory.ULTRA_RARE,
    rarity: CollectibleRarity.MYTHIC,
    icon: '🛂',
    passiveBonus: '+15% moedas',
    ultraRare: true,
  },
  {
    key: 'global_cto_badge',
    name: 'Global CTO Badge',
    description: 'Insígnia reservada a líderes técnicos globais.',
    category: CollectibleCategory.ULTRA_RARE,
    rarity: CollectibleRarity.ANCIENT,
    icon: '👔',
    passiveBonus: '+5% em todas recompensas',
    ultraRare: true,
  },
  {
    key: 'legendary_dragon_pet',
    name: 'Legendary Dragon Pet',
    description: 'Pet exclusivo de prestígio máximo.',
    category: CollectibleCategory.ULTRA_RARE,
    rarity: CollectibleRarity.ANCIENT,
    icon: '🐉',
    passiveBonus: '+25% XP e moedas',
    ultraRare: true,
  },
  {
    key: 'ancient_developer_crown',
    name: 'Ancient Developer Crown',
    description: 'Coroa dos desenvolvedores que dominaram o inglês técnico.',
    category: CollectibleCategory.ULTRA_RARE,
    rarity: CollectibleRarity.ANCIENT,
    icon: '👑',
    passiveBonus: 'Moldura e título exclusivos',
    ultraRare: true,
  },
];

const rarityForIndex = (index: number, max: number): CollectibleDefinition['rarity'] => {
  const ratio = index / max;
  if (ratio < 0.3) return CollectibleRarity.COMMON;
  if (ratio < 0.5) return CollectibleRarity.UNCOMMON;
  if (ratio < 0.7) return CollectibleRarity.RARE;
  if (ratio < 0.85) return CollectibleRarity.EPIC;
  if (ratio < 0.95) return CollectibleRarity.LEGENDARY;
  return CollectibleRarity.MYTHIC;
};

const buildRelics = (): CollectibleDefinition[] =>
  Array.from({ length: 100 }, (_, index) => {
    const name = RELIC_NAMES[index] ?? `Relic ${index + 1}`;
    const rarity = rarityForIndex(index, 100);
    return {
      key: `relic_${index + 1}`,
      name,
      description: `Relíquia permanente: ${name}. Bônus passivo de estudo.`,
      category: CollectibleCategory.RELIC,
      rarity,
      icon: RELIC_ICONS[index % RELIC_ICONS.length],
      passiveBonus: `+${1 + (index % 5)}% bônus`,
    };
  });

const buildArtifacts = (): CollectibleDefinition[] =>
  Array.from({ length: 50 }, (_, index) => {
    const name = `${ARTIFACT_PREFIX[index % ARTIFACT_PREFIX.length]} ${ARTIFACT_SUFFIX[index % ARTIFACT_SUFFIX.length]}`;
    return {
      key: `artifact_${index + 1}`,
      name,
      description: `Artefato místico que amplifica sua jornada de aprendizado.`,
      category: CollectibleCategory.ARTIFACT,
      rarity: rarityForIndex(index, 50),
      icon: ['🔮', '💠', '🧿', '✨', '🌀'][index % 5],
    };
  });

const buildMythics = (): CollectibleDefinition[] =>
  Array.from({ length: 50 }, (_, index) => {
    const theme = MYTHIC_THEMES[index % MYTHIC_THEMES.length];
    return {
      key: `mythic_${index + 1}`,
      name: `${theme} ${['Blade', 'Crown', 'Essence', 'Heart', 'Soul'][index % 5]}`,
      description: `Item mítico de poder incomparável.`,
      category: CollectibleCategory.MYTHIC,
      rarity: index < 35 ? CollectibleRarity.MYTHIC : CollectibleRarity.ANCIENT,
      icon: ['⚔️', '👑', '💫', '❤️', '🌟'][index % 5],
    };
  });

const buildCosmetics = (): CollectibleDefinition[] =>
  Array.from({ length: 50 }, (_, index) => {
    const type = COSMETIC_TYPES[index % COSMETIC_TYPES.length];
    return {
      key: `cosmetic_${index + 1}`,
      name: `${type} #${index + 1}`,
      description: `Cosmético exclusivo para personalizar seu avatar.`,
      category: CollectibleCategory.COSMETIC,
      rarity: rarityForIndex(index, 50),
      icon: ['🖼️', '✨', '🎨', '🏷️', '💫'][index % 5],
    };
  });

const buildExclusivePets = (): CollectibleDefinition[] =>
  PET_EXCLUSIVE_NAMES.map((name, index) => ({
    key: `exclusive_pet_${index + 1}`,
    name,
    description: `Pet exclusivo obtível apenas via loot boxes especiais.`,
    category: CollectibleCategory.PET_EXCLUSIVE,
    rarity: index < 20 ? CollectibleRarity.LEGENDARY : index < 27 ? CollectibleRarity.MYTHIC : CollectibleRarity.ANCIENT,
    icon: ['🐉', '🦉', '🐦‍🔥', '🦊', '🐼', '🦅', '🦔', '🦄', '🐋', '🦈'][index % 10],
  }));

export const RELIC_CATALOG = buildRelics();
export const ARTIFACT_CATALOG = buildArtifacts();
export const MYTHIC_CATALOG = buildMythics();
export const COSMETIC_CATALOG = buildCosmetics();
export const EXCLUSIVE_PET_CATALOG = buildExclusivePets();
export const ULTRA_RARE_CATALOG = ULTRA_RARE_HANDCRAFTED;

export const FULL_COLLECTIBLE_CATALOG: CollectibleDefinition[] = [
  ...RELIC_CATALOG,
  ...ARTIFACT_CATALOG,
  ...MYTHIC_CATALOG,
  ...COSMETIC_CATALOG,
  ...EXCLUSIVE_PET_CATALOG,
  ...ULTRA_RARE_CATALOG,
];

export const COLLECTIBLE_BY_KEY = Object.fromEntries(
  FULL_COLLECTIBLE_CATALOG.map((item) => [item.key, item]),
) as Record<string, CollectibleDefinition>;

export const COLLECTIBLES_BY_CATEGORY = {
  [CollectibleCategory.RELIC]: RELIC_CATALOG,
  [CollectibleCategory.ARTIFACT]: ARTIFACT_CATALOG,
  [CollectibleCategory.MYTHIC]: MYTHIC_CATALOG,
  [CollectibleCategory.COSMETIC]: COSMETIC_CATALOG,
  [CollectibleCategory.PET_EXCLUSIVE]: EXCLUSIVE_PET_CATALOG,
  [CollectibleCategory.ULTRA_RARE]: ULTRA_RARE_CATALOG,
};

export const COLLECTIBLE_CATALOG_STATS = {
  relics: RELIC_CATALOG.length,
  artifacts: ARTIFACT_CATALOG.length,
  mythics: MYTHIC_CATALOG.length,
  cosmetics: COSMETIC_CATALOG.length,
  exclusivePets: EXCLUSIVE_PET_CATALOG.length,
  ultraRare: ULTRA_RARE_CATALOG.length,
  total: FULL_COLLECTIBLE_CATALOG.length,
};
