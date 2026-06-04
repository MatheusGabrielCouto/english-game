-- Knowledge Vault expansion — spaces, folders, links, collections, progression

ALTER TABLE journal_entries ADD COLUMN space_key text DEFAULT 'personal_notes' NOT NULL;
ALTER TABLE journal_entries ADD COLUMN folder_id text;
ALTER TABLE journal_entries ADD COLUMN is_pinned integer DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_journal_entries_space ON journal_entries (space_key);
CREATE INDEX IF NOT EXISTS idx_journal_entries_folder ON journal_entries (folder_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_pinned ON journal_entries (is_pinned);

CREATE TABLE IF NOT EXISTS journal_folders (
  id text PRIMARY KEY NOT NULL,
  space_key text NOT NULL,
  parent_id text,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_folders_space ON journal_folders (space_key);

CREATE TABLE IF NOT EXISTS journal_entry_links (
  from_entry_id text NOT NULL,
  to_entry_id text NOT NULL,
  created_at text NOT NULL,
  PRIMARY KEY (from_entry_id, to_entry_id)
);

CREATE TABLE IF NOT EXISTS journal_collections (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  description text,
  emoji text DEFAULT '📚' NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS journal_entry_collections (
  entry_id text NOT NULL,
  collection_id text NOT NULL,
  created_at text NOT NULL,
  PRIMARY KEY (entry_id, collection_id)
);

ALTER TABLE journal_stats ADD COLUMN knowledge_points integer DEFAULT 0 NOT NULL;
ALTER TABLE journal_stats ADD COLUMN knowledge_level integer DEFAULT 1 NOT NULL;
ALTER TABLE journal_stats ADD COLUMN knowledge_mastery_bps integer DEFAULT 0 NOT NULL;
ALTER TABLE journal_stats ADD COLUMN total_connections integer DEFAULT 0 NOT NULL;
ALTER TABLE journal_stats ADD COLUMN total_collections integer DEFAULT 0 NOT NULL;
ALTER TABLE journal_stats ADD COLUMN library_tier integer DEFAULT 0 NOT NULL;

ALTER TABLE achievement_stats ADD COLUMN total_journal_connections integer DEFAULT 0 NOT NULL;
