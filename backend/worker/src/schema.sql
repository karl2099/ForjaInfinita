CREATE TABLE IF NOT EXISTS campaign (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  name TEXT NOT NULL,
  gm_ids TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS character (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  owner_user_id TEXT,
  data_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS binding (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  character_id TEXT NOT NULL REFERENCES character(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'player',
  created_at INTEGER NOT NULL,
  UNIQUE (campaign_id, user_id)
);
