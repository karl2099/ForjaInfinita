-- Recria a tabela campaign permitindo guild_id NULL
-- e adiciona DEFAULTs para created_at / updated_at (epoch segundos)

CREATE TABLE campaign_new (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  guild_id           TEXT,                                    -- agora pode ser NULL
  gm_ids             TEXT,
  created_at         INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at         INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  discord_channel_id TEXT
);

INSERT INTO campaign_new (id, name, guild_id, gm_ids, created_at, updated_at, discord_channel_id)
SELECT
  id,
  name,
  guild_id,
  gm_ids,
  COALESCE(created_at, strftime('%s','now')),
  COALESCE(updated_at, strftime('%s','now')),
  discord_channel_id
FROM campaign;

DROP TABLE campaign;
ALTER TABLE campaign_new RENAME TO campaign;

CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_channel ON campaign(discord_channel_id);
CREATE INDEX        IF NOT EXISTS ix_campaign_guild   ON campaign(guild_id);
