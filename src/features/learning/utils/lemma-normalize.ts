/** Normalizes user-facing text to a canonical lemma key (lowercase, first token). */
export const normalizeLemma = (text: string): string | null => {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return null;

  const firstToken = trimmed.split(/\s+/)[0]?.replace(/[^a-z'-]/gi, '') ?? '';
  return firstToken.length > 0 ? firstToken : null;
};
