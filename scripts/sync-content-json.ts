/**
 * Formata e valida os JSONs em src/data/.
 * Edite missions.json / items.json diretamente; rode para pretty-print:
 *
 *   pnpm run sync:data
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(__dirname, '../src/data');

const formatFile = (filename: string) => {
  const path = join(DATA_DIR, filename);
  const raw = readFileSync(path, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  writeFileSync(path, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
  console.log(`Formatted ${path}`);
};

formatFile('missions.json');
formatFile('items.json');
formatFile('contracts.json');
formatFile('city.json');
formatFile('poi-missions.json');
formatFile('poi-projects.json');
formatFile('poi-chains.json');
formatFile('lemma-pool.json');

console.log('Done.');
