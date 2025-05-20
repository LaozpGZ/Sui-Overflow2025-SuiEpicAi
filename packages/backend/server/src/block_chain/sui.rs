use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;
use anyhow::{Result, anyhow};
use sqlx::types::BigDecimal;
use sqlx::PgPool;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use teloxide::Bot;
use teloxide::prelude::{Requester, UserId};
use teloxide::types::ChatPermissions;
use async_trait::async_trait;
use base64::prelude::*;
use sui_sdk::types::crypto::{Signature, SignatureScheme};
use sui_sdk::types::base_types::SuiAddress;

use crate::block_chain::Blockchain;
use crate::db::operations::{get_last_synced_block, get_last_synced_block_with_metadata, process_buy_trade, process_sell_trade, update_last_synced_block, update_last_synced_block_with_metadata};
use crate::AppConfig;

/// Sui blockchain implementation
pub struct SuiBlockchain {
    rpc_url: String,
    contract_address: String,
    shares_trading_object_id: String,
    config: Arc<AppConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SuiTradeEvent {
    /// Trader address
    trader: String,
    /// Object address
    subject: String,
    /// Whether it's a buy
    is_buy: bool,
    /// Transaction amount (string format)
    amount: String,
    /// Price (string format)
    price: String,
    /// Protocol fee (string format)
    protocol_fee: String,
    /// Object owner fee (string format)
    subject_fee: String,
    /// Total supply (string format)
    supply: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SuiEventPage {
    data: Vec<SuiEvent>,
    nextCursor: Option<EventID>,
    hasNextPage: bool,
}

/// Sui event cursor structure
#[derive(Debug, Serialize, Deserialize, Clone)]
struct EventID {
    /// Transaction digest
    #[serde(rename = "txDigest")]
    tx_digest: String,
    /// Event sequence number
    #[serde(rename = "eventSeq")]
    event_seq: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SuiEvent {
    id: EventID,
    #[serde(rename = "timestampMs")]
    timestamp_ms: String,
    #[serde(rename = "transactionModule")]
    transaction_module: String,
    #[serde(rename = "type")]
    event_type: String,
    sender: String,
    #[serde(rename = "packageId")]
    package_id: String,
    #[serde(rename = "parsedJson")]
    parsed_json: SuiTradeEvent,
    bcs: String,
    #[serde(rename = "bcsEncoding")]
    bcs_encoding: String,
}

impl SuiBlockchain {
    pub fn new(config: Arc<AppConfig>) -> Self {
        let rpc_url = config.sui_rpc.clone().unwrap_or_else(|| "https://fullnode.mainnet.sui.io:443".to_string());
        let contract_address = config.sui_contract.clone().unwrap_or_else(|| "0x000".to_string());
        let shares_trading_object_id = config.sui_shares_trading_object_id.clone().unwrap_or_else(|| "0x000".to_string());
        
        Self {
            rpc_url,
            contract_address,
            shares_trading_object_id,
            config,
        }
    }
    
    /// Remove 0x prefix from address
    fn remove_0x_prefix(&self, address: &str) -> String {
        if address.starts_with("0x") {
            address[2..].to_string()
        } else {
            address.to_string()
        }
    }
    
    /// Process Sui trade event
    async fn process_trade_event(&self, event: &SuiTradeEvent, pool: &sqlx::PgPool) -> Result<()> {
        println!("Processing Sui Trade event: {:?}", event);
        
        // Parse string to u64
        let share_amount = match event.amount.parse::<u64>() {
            Ok(amount) => BigDecimal::from(amount),
            Err(e) => {
                println!("Cannot parse transaction amount: {} - {:?}", event.amount, e);
                return Err(anyhow!("Cannot parse transaction amount"));
            }
        };
        
        // Remove 0x prefix from address
        let trader = self.remove_0x_prefix(&event.trader);
        let subject = self.remove_0x_prefix(&event.subject);
        
        if event.is_buy {
            // Buy operation, increase shares
            process_buy_trade(
                pool, 
                trader.clone(),
                subject.clone(),
                share_amount,
                self.get_name(),
            ).await?;
            
            // Check if user is banned
            let user_mapping = sqlx::query!(
                "SELECT telegram_id, is_banned FROM user_mappings WHERE address = $1 AND chain_type = $2",
                trader.clone(), 
                self.get_name()
            )
            .fetch_optional(pool)
            .await?;
            
            if let Some(user) = user_mapping {
                if user.is_banned {
                    let user_share = sqlx::query!(
                        "SELECT share_amount FROM trades WHERE trader = $1 AND subject = $2 AND chain_type = $3",
                        trader.clone(),
                        subject.clone(),
                        self.get_name()
                    )
                    .fetch_optional(pool)
                    .await?;
                    
                    if let Some(share) = user_share {
                        if share.share_amount > BigDecimal::from(0) {
                            let bot_info = sqlx::query!(
                                "SELECT bot_token, chat_group_id FROM telegram_bots WHERE subject_address = $1 AND chain_type = $2",
                                subject.clone(),
                                self.get_name()
                            )
                            .fetch_optional(pool)
                            .await?;
                            
                            if let Some(bot_info) = bot_info {
                                let permissions = ChatPermissions::empty()
                                    | ChatPermissions::SEND_MESSAGES
                                    | ChatPermissions::SEND_MEDIA_MESSAGES
                                    | ChatPermissions::SEND_OTHER_MESSAGES
                                    | ChatPermissions::SEND_POLLS
                                    | ChatPermissions::ADD_WEB_PAGE_PREVIEWS;

                                let bot = Bot::new(bot_info.bot_token);
                                let user_id: u64 = user.telegram_id.parse().unwrap();
                                bot.restrict_chat_member(bot_info.chat_group_id, UserId(user_id), permissions).await?;
                            }
                        }
                    }
                }
            }
        } else {
            // Sell operation, decrease shares
            println!("Trader {} sell {} shares of subject {}", trader, share_amount, subject);
            let (should_ban, telegram_id_opt) = process_sell_trade(
                pool,
                trader.clone(),
                subject.clone(),
                share_amount,
                self.get_name(),
            ).await?;
            
            if should_ban {
                if let Some(telegram_id) = telegram_id_opt {
                    println!("User {} has 0 shares for {}, banning user", &trader, &subject);
                    
                    // Get the bot token and chat group id from telegram_bots table for this subject
                    let bot_info = sqlx::query!(
                        "SELECT bot_token, chat_group_id FROM telegram_bots WHERE subject_address = $1 AND chain_type = $2",
                        subject.clone(),
                        self.get_name()
                    )
                    .fetch_optional(pool)
                    .await?;
                    
                    if let Some(bot_info) = bot_info {
                        let permissions = ChatPermissions::empty();

                        let bot = Bot::new(bot_info.bot_token);
                        let user_id: u64 = telegram_id.parse().unwrap();
                        bot.restrict_chat_member(bot_info.chat_group_id, UserId(user_id), permissions).await?;
                        sqlx::query!(
                            "UPDATE user_mappings SET is_banned = true WHERE address = $1 AND chain_type = $2",
                            trader.clone(),
                            self.get_name()
                        )
                        .execute(pool)
                        .await?;
                    } else {
                        println!("No telegram bot info found for subject {}", &subject);
                    }
                }
            }
        }
        Ok(())
    }
    
    /// Call Sui RPC to get events
    async fn get_events(&self, start_cursor: Option<String>, limit: u64) -> Result<SuiEventPage> {
        let client = Client::new();
        
        // Build query JSON
        let query_type = if self.contract_address.is_empty() {
            // Use MoveEvent event type
            json!({
                "MoveEventType": "package::module::Trade"
            })
        } else {
            // Use specific package address
            json!({
                "MoveEventType": format!("{}::shares_trading::Trade", self.contract_address)
            })
        };
        
        // Process cursor parameter
        let cursor_param: Option<serde_json::Value> = match start_cursor {
            Some(cursor_str) => {
                // Check if already JSON format
                if cursor_str.trim().starts_with('{') {
                    match serde_json::from_str(&cursor_str) {
                        Ok(json_val) => Some(json_val),
                        Err(_) => {
                            // If parsing fails, try to create a new EventID
                            // Use valid transaction hash (64 hexadecimal characters)
                            Some(json!({
                                "txDigest": "0000000000000000000000000000000000000000000000000000000000000000",
                                "eventSeq": cursor_str
                            }))
                        }
                    }
                } else {
                    // Assume simple string, wrap as EventID structure
                    // Use valid transaction hash (64 hexadecimal characters)
                    Some(json!({
                        "txDigest": "0000000000000000000000000000000000000000000000000000000000000000",
                        "eventSeq": cursor_str
                    }))
                }
            },
            None => None,
        };
        
        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "suix_queryEvents",
            "params": {
                "query": query_type,
                "cursor": cursor_param,
                "limit": limit,
                "descending_order": false
            }
        });
        
        let response = client.post(&self.rpc_url)
            .json(&payload)
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(anyhow!("Sui RPC request failed: {}", response.status()));
        }
        
        let response_json: Value = response.json().await?;
        
        if let Some(error) = response_json.get("error") {
            return Err(anyhow!("Sui RPC returned error: {}", error));
        }
        
        // Parse result
        if let Some(result) = response_json.get("result") {
            // println!("result: {:?}", result);
            let events: SuiEventPage = serde_json::from_value(result.clone())?;
            return Ok(events);
        }
        
        Err(anyhow!("Cannot parse Sui RPC response"))
    }
    
    /// Get shares on Sui
    async fn get_sui_shares(&self, subject: &str, user: &str) -> Result<u64> {
        let client = Client::new();
        
        // Remove address prefix, ensure consistency
        let clean_subject = self.remove_0x_prefix(subject);
        let clean_user = self.remove_0x_prefix(user);
        
        // For RPC call, need to add back 0x prefix
        let subject_with_prefix = format!("0x{}", clean_subject);
        let user_with_prefix = format!("0x{}", clean_user);
        
        // Build JSON-RPC request to call smart contract function
        let payload = json!({
            "jsonrpc": "2.0",
            "method": "sui_devInspectTransactionBlock",
            "params": [
                "0x0", // Sender address (meaningless, just reading state)
                {
                    "kind": "moveCall",
                    "data": {
                        "packageObjectId": self.contract_address,
                        "module": "shares_trading",
                        "function": "get_shares_balance",
                        "arguments": [
                            self.shares_trading_object_id,
                            subject_with_prefix,
                            user_with_prefix
                        ]
                    }
                }
            ],
            "id": 1
        });
        
        let response = client.post(&self.rpc_url)
            .json(&payload)
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(anyhow!("Sui RPC request failed: {}", response.status()));
        }
        
        let response_json: Value = response.json().await?;
        
        if let Some(error) = response_json.get("error") {
            return Err(anyhow!("Sui RPC returned error: {}", error));
        }
        
        // Parse return result (actual deployment needs to adjust based on contract's specific return format)
        if let Some(result) = response_json.get("result").and_then(|r| r.get("results")).and_then(|r| r.as_array()) {
            if let Some(first_result) = result.first() {
                if let Some(return_values) = first_result.get("returnValues").and_then(|v| v.as_array()) {
                    if let Some(first_value) = return_values.first() {
                        if let Some(balance) = first_value.as_u64() {
                            return Ok(balance);
                        }
                    }
                }
            }
        }
        
        // Default return 0
        Ok(0)
    }
}

#[async_trait]
impl Blockchain for SuiBlockchain {
    fn get_name(&self) -> &'static str {
        "sui"
    }
    
    async fn sync_events(&self, pool: &PgPool) -> Result<()> {
        // Get last synced data (Sui uses cursor) and get metadata
        let (last_cursor_num, metadata) = get_last_synced_block_with_metadata(pool, 0, self.get_name()).await?;
        println!("last_cursor_num: {}", last_cursor_num);
        println!("Metadata query result: {:?}", metadata);
        
        // Initialize cursor - prioritize using metadata
        let mut cursor_str: Option<String> = if let Some(meta_str) = metadata {
            println!("Found valid metadata: {}", meta_str);
            // If there's valid metadata, use it to restore cursor
            Some(meta_str)
        } else {
            None
        };
        
        println!("Starting sync from cursor {:?} for {}", cursor_str, self.get_name());
        
        // Event sync loop
        loop {
            // Query events
            match self.get_events(cursor_str.clone(), 100).await {
                Ok(events) => {
                    //println!("Found {} events for {} with cursor {:?}", events.data.len(), self.get_name(), cursor_str);
                    
                    // Process each event
                    for event in &events.data {
                        if let Err(e) = self.process_trade_event(&event.parsed_json, pool).await {
                            println!("Error processing Sui trade event: {:?}", e);
                        }
                    }
                    
                    // Update cursor
                    if let Some(next_cursor) = events.nextCursor {
                        // Serialize EventID to JSON string
                        let next_cursor_json = serde_json::to_string(&next_cursor).unwrap_or_default();
                        cursor_str = Some(next_cursor_json.clone());
                        
                        // Serialize full EventID as JSON string to database
                        // Use txDigest as numeric part (converted to u64), and full JSON in metadata field
                        let tx_digest_hash = u64::from_str_radix(&next_cursor.tx_digest[0..16], 16).unwrap_or(0);
                        
                        // println!("Updating sync progress: tx_digest={}, eventSeq={}, hash={}, json={}",
                        //     next_cursor.tx_digest, next_cursor.event_seq, tx_digest_hash, next_cursor_json);
                            
                        if let Err(e) = update_last_synced_block_with_metadata(pool, tx_digest_hash, next_cursor_json, self.get_name()).await {
                            println!("Failed to update last synced cursor: {:?}", e);
                        }
                    } else if !events.hasNextPage {
                        // No more events, wait for new events
                        println!("No more events available for {}, waiting for new events...", self.get_name());
                        tokio::time::sleep(Duration::from_secs(60)).await;
                    }
                },
                Err(e) => {
                    println!("Failed to query Sui events: {:?}", e);
                    tokio::time::sleep(Duration::from_secs(10)).await;
                }
            }
            
            // Brief rest, avoid too frequent requests
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    }
    
    fn verify_signature(&self, challenge: &str, signature: &str) -> Result<String, String> {
        // Use sui-sdk library for signature verification
        // Step 1: Decode Base64 format signature
        let signature_bytes = match BASE64_STANDARD.decode(signature) {
            Ok(bytes) => bytes,
            Err(e) => return Err(format!("Cannot decode signature: {}", e)),
        };
        
        // Now the challenge parameter is already the user's address, just return it directly
        // This is just a temporary solution, long term should implement complete Sui signature verification logic
        
        Ok(challenge.to_string())
    }
    
    async fn get_shares_balance(&self, subject: &str, user: &str) -> Result<u64> {
        self.get_sui_shares(subject, user).await
    }
} 