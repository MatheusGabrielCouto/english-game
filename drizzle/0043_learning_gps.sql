-- Fase 22: Learning GPS — mundos CEFR, perfil do jogador e skills

CREATE TABLE IF NOT EXISTS learning_worlds (
  key text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  emoji text NOT NULL,
  cefr_level text NOT NULL,
  sort_order integer NOT NULL,
  estimated_days_min integer NOT NULL,
  estimated_days_max integer NOT NULL,
  goal_description text NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS player_learning_profile (
  id integer PRIMARY KEY NOT NULL,
  current_world_key text NOT NULL,
  world_progress integer DEFAULT 0 NOT NULL,
  learning_gps_onboarded integer DEFAULT 0 NOT NULL,
  onboarded_at text,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_levels (
  skill_key text PRIMARY KEY NOT NULL,
  level integer DEFAULT 0 NOT NULL,
  updated_at text NOT NULL
);

INSERT OR IGNORE INTO learning_worlds (
  key, name, emoji, cefr_level, sort_order,
  estimated_days_min, estimated_days_max, goal_description, description
) VALUES
  ('survivor', 'Survivor', '🏕️', 'A1', 1, 30, 60,
   'Manter uma conversa de 2 minutos',
   'Sobreviver em inglês básico — apresentações, números, rotina simples.'),
  ('explorer', 'Explorer', '🧭', 'A2', 2, 60, 90,
   'Manter uma conversa de 5 minutos',
   'Viagens, compras, restaurantes e conversas do cotidiano.'),
  ('professional', 'Professional', '💼', 'B1', 3, 90, 120,
   'Participar de reuniões simples',
   'Trabalho, tecnologia e comunicação profissional inicial.'),
  ('developer', 'Developer', '💻', 'B2', 4, 120, 180,
   'Trabalhar em ambiente internacional',
   'Programação, documentação técnica e mensagens profissionais.'),
  ('global_engineer', 'Global Engineer', '🛰️', 'C1', 5, 180, 360,
   'Ser contratado internacionalmente',
   'Fluência profissional, entrevistas e liderança técnica.'),
  ('legend', 'Legend', '👑', 'C2', 6, 365, 730,
   'Domínio avançado do idioma',
   'Debates, apresentações, negociação e ensino.');

INSERT OR IGNORE INTO player_learning_profile (
  id, current_world_key, world_progress, learning_gps_onboarded, updated_at
) VALUES (1, 'survivor', 0, 0, datetime('now'));

INSERT OR IGNORE INTO skill_levels (skill_key, level, updated_at) VALUES
  ('vocabulary', 0, datetime('now')),
  ('reading', 0, datetime('now')),
  ('listening', 0, datetime('now')),
  ('speaking', 0, datetime('now')),
  ('writing', 0, datetime('now')),
  ('grammar', 0, datetime('now'));
