-- 更新所有表中chain_type列的默认值从'monad'改为'sui'

-- 更新sync_status表
ALTER TABLE sync_status ALTER COLUMN chain_type SET DEFAULT 'sui';

-- 更新trades表
ALTER TABLE trades ALTER COLUMN chain_type SET DEFAULT 'sui';

-- 更新user_mappings表
ALTER TABLE user_mappings ALTER COLUMN chain_type SET DEFAULT 'sui';

-- 更新telegram_bots表
ALTER TABLE telegram_bots ALTER COLUMN chain_type SET DEFAULT 'sui'; 