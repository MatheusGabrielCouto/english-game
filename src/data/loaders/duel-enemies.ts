import enemiesJson from '../duels/enemies.json';

export type DuelEnemyDef = {
  key: string;
  name: string;
  emoji: string;
  hp: number;
  playerDamage: number;
  counterDamage: number;
  tagline: string;
  arenaKey: string;
};

type DuelEnemiesFile = {
  version: number;
  enemies: DuelEnemyDef[];
};

const data = enemiesJson as DuelEnemiesFile;

export const DUEL_ENEMIES: DuelEnemyDef[] = data.enemies;

export const DUEL_ENEMIES_BY_KEY = Object.fromEntries(
  DUEL_ENEMIES.map((enemy) => [enemy.key, enemy]),
) as Record<string, DuelEnemyDef>;

export const getDuelEnemy = (key: string): DuelEnemyDef | null =>
  DUEL_ENEMIES_BY_KEY[key] ?? null;

export const DEFAULT_DUEL_ENEMY_KEY = 'slime_typos';
