BEGIN TRANSACTION;

-- 1) Recria a tabela com os ajustes
CREATE TABLE campaign_new (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  guild_id           TEXT,                                    -- agora pode ser NULL
  gm_ids             TEXT,                                    -- deixa NULL também (lista JSON opcional)
  created_at         INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- epoch seconds
  updated_at         INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  discord_channel_id TEXT
);

-- 2) Copia dados existentes (preservando valores)
INSERT INTO campaign_new (id, name, guild_id, gm_ids, created_at, updated_at, discord_channel_id)
SELECT
  id,
  name,
  guild_id,                       -- se existir NOT NULL, mantém; senão aceita NULL
  gm_ids,
  COALESCE(created_at, strftime('%s','now')),
  COALESCE(updated_at, strftime('%s','now')),
  discord_channel_id
FROM campaign;

-- 3) Substitui a tabela antiga
DROP TABLE campaign;
ALTER TABLE campaign_new RENAME TO campaign;

-- 4) Índices úteis
CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_channel ON campaign(discord_channel_id);
CREATE INDEX        IF NOT EXISTS ix_campaign_guild   ON campaign(guild_id);

COMMIT;
