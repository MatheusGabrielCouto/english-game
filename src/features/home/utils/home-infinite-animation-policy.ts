/**
 * Política para loops infinitos na Home (P-41).
 * Código puro — sem imports nativos — para testes Node.
 */
export const shouldRunHomeInfiniteAnimations = (
  isFocused: boolean,
  reduceMotion: boolean,
): boolean => isFocused && !reduceMotion
