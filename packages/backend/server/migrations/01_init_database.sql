-- Initialize database table structure, support multi-chain (monad and sui)

-- Sync status table
CREATE TABLE IF NOT EXISTS sync_status (
    id SERIAL PRIMARY KEY,
    last_synced_block BIGINT NOT NULL,
    chain_type VARCHAR(20) NOT NULL DEFAULT 'monad',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_sync_status_chain_type ON sync_status(chain_type);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    trader VARCHAR(66) NOT NULL,  -- Trader address
    subject VARCHAR(66) NOT NULL, -- Subject address
    share_amount NUMERIC NOT NULL DEFAULT 0,
    chain_type VARCHAR(20) NOT NULL DEFAULT 'monad',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trader, subject, chain_type)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_trades_trader ON trades(trader);
CREATE INDEX IF NOT EXISTS idx_trades_subject ON trades(subject);
CREATE INDEX IF NOT EXISTS idx_trades_chain_type ON trades(chain_type);

-- User mapping table
CREATE TABLE IF NOT EXISTS user_mappings (
    id SERIAL PRIMARY KEY,
    address VARCHAR(66) NOT NULL,  -- Blockchain address
    telegram_id VARCHAR(50) NOT NULL,  -- Telegram ID
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    chain_type VARCHAR(20) NOT NULL DEFAULT 'monad',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(address, chain_type)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_mappings_address ON user_mappings(address);
CREATE INDEX IF NOT EXISTS idx_user_mappings_telegram_id ON user_mappings(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_mappings_chain_type ON user_mappings(chain_type);

-- Telegram bot table
CREATE TABLE IF NOT EXISTS telegram_bots (
    agent_name VARCHAR NOT NULL PRIMARY KEY,
    bio TEXT,
    invite_url VARCHAR(128) NOT NULL,
    bot_token VARCHAR NOT NULL,
    chat_group_id VARCHAR NOT NULL,
    subject_address VARCHAR NOT NULL,
    chain_type VARCHAR(20) NOT NULL DEFAULT 'monad',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_telegram_bots_subject_address ON telegram_bots(subject_address);
CREATE INDEX IF NOT EXISTS idx_telegram_bots_chain_type ON telegram_bots(chain_type);

-- Update time trigger function
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to automatically update the modified time for tables that need it
CREATE TRIGGER update_sync_status_modtime
    BEFORE UPDATE ON sync_status
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_trades_modtime
    BEFORE UPDATE ON trades
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_mappings_modtime
    BEFORE UPDATE ON user_mappings
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();