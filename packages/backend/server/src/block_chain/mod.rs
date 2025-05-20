pub mod monad;
pub mod utils;
pub mod sui;

use anyhow::Result;
use sqlx::PgPool;
use std::sync::Arc;
use async_trait::async_trait;

/// Blockchain interface abstraction
#[async_trait]
pub trait Blockchain: Send + Sync {
    /// Get blockchain name
    fn get_name(&self) -> &'static str;
    
    /// Sync transaction events
    async fn sync_events(&self, pool: &PgPool) -> Result<()>;
    
    /// Verify user signature
    fn verify_signature(&self, challenge: &str, signature: &str) -> Result<String, String>;
    
    /// Get user's shares balance
    async fn get_shares_balance(&self, subject: &str, user: &str) -> Result<u64>;
}

// Factory function to create different chain implementations
pub fn create_blockchain(chain_type: &str, config: Arc<crate::AppConfig>) -> Box<dyn Blockchain> {
    match chain_type {
        "monad" => Box::new(monad::MonadBlockchain::new(config)),
        "sui" => Box::new(sui::SuiBlockchain::new(config)),
        _ => panic!("Unsupported blockchain type: {}", chain_type),
    }
} 