ALTER TABLE sync_status ADD COLUMN IF NOT EXISTS metadata TEXT;

CREATE INDEX IF NOT EXISTS idx_sync_status_metadata ON sync_status(metadata);

COMMENT ON COLUMN sync_status.metadata IS 'Store additional metadata about the sync status, such as the full cursor information for the Sui blockchain'; 