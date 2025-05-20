use serde::{Deserialize, Serialize};
use sqlx::types::BigDecimal;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub telegram_bot_token: String,
    pub telegram_group_id: String,
    pub shares_contract: String,
    pub chain_rpc: String,
    pub database_url: String,
    pub start_block: u64,
    pub sui_rpc: Option<String>,
    pub sui_contract: Option<String>,
    pub sui_start_tx_digest: Option<String>,
    pub sui_shares_trading_object_id: Option<String>,
}

#[derive(Clone, Debug)]
pub struct UserShares {
    pub trader: String,
    pub subject: String,
    pub share_amount: BigDecimal,
    pub chain_type: String,
}

#[derive(Debug, Deserialize)]
pub struct ChallengeRequest {
    pub challenge: String,
    pub signature: String,
    pub shares_subject: String,
    pub user: String,
    pub chain_type: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ChallengeResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}