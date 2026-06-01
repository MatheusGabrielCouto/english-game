-- Baralho: entrevistas internacionais em tech (cartas via FlashDeckSeedService)
INSERT OR IGNORE INTO flash_decks (
  id,
  name,
  description,
  cover_emoji,
  sort_order,
  new_per_day,
  review_cap,
  created_at
) VALUES (
  'deck_interview_tech',
  'Entrevistas internacionais (Tech)',
  'Palavras e frases para entrevistas em inglês — comunicação profissional, sem jargão de linguagem específica',
  '💼',
  1,
  12,
  80,
  datetime('now')
);
