ALTER TABLE binding ADD COLUMN updated_at INTEGER;

UPDATE binding
SET updated_at = created_at
WHERE updated_at IS NULL;

CREATE TRIGGER IF NOT EXISTS trg_binding_ai
AFTER INSERT ON binding
BEGIN
  UPDATE binding
  SET updated_at = NEW.created_at
  WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER IF NOT EXISTS trg_binding_au
AFTER UPDATE ON binding
BEGIN
  UPDATE binding
  SET updated_at = CAST(strftime('%s','now') AS INTEGER)
  WHERE rowid = NEW.rowid;
END;
