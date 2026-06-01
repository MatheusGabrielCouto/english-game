export type FlashCsvRow = {
  front: string;
  back: string;
  exampleSentence?: string;
  tags?: string[];
};

export type FlashCsvParseResult = {
  rows: FlashCsvRow[];
  skipped: number;
  errors: string[];
};

const splitCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
};

export const parseFlashCardsCsv = (raw: string): FlashCsvParseResult => {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const rows: FlashCsvRow[] = [];
  const errors: string[] = [];
  let skipped = 0;

  const startIndex =
    lines[0]?.toLowerCase().includes('front') && lines[0]?.toLowerCase().includes('back') ? 1 : 0;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index]!;
    const cells = splitCsvLine(line);
    const front = cells[0]?.trim() ?? '';
    const back = cells[1]?.trim() ?? '';

    if (!front || !back) {
      skipped += 1;
      errors.push(`Linha ${index + 1}: frente e verso obrigatórios`);
      continue;
    }

    rows.push({
      front,
      back,
      exampleSentence: cells[2]?.trim() || undefined,
      tags: cells[3]
        ?.split(';')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }

  return { rows, skipped, errors };
};
