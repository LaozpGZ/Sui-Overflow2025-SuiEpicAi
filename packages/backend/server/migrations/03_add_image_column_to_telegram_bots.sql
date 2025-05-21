-- Add image column to telegram_bots table
ALTER TABLE telegram_bots ADD COLUMN IF NOT EXISTS image TEXT;

-- Add comment explaining purpose of the column
COMMENT ON COLUMN telegram_bots.image IS 'Store image URL or base64 encoded image data representing the agent'; 