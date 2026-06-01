-- Baralho padrão: 1000 palavras essenciais (metadados; cartas via FlashDeckSeedService)
UPDATE flash_decks
SET
  name = '1000 palavras essenciais',
  description = 'As palavras mais usadas em inglês — pronto para revisar',
  cover_emoji = '🌍',
  new_per_day = 15
WHERE id = 'deck_default';
