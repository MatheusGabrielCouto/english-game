/** Splits user input into normalized search terms (min 2 chars). */
export const splitJournalSearchTerms = (search: string): string[] =>
  search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/["'*]/g, '').trim())
    .filter((term) => term.length >= 2)

export const buildJournalSearchLikeClause = (
  search: string,
): { clause: string; params: string[] } | null => {
  const terms = splitJournalSearchTerms(search)
  if (terms.length === 0) return null

  const params = terms.map((term) => `%${term}%`)
  const clause = terms.map(() => 'search_text LIKE ?').join(' AND ')

  return { clause, params }
}
