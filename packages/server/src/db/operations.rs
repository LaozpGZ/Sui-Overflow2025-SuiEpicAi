use sqlx::{PgPool, types::BigDecimal};
use std::str::FromStr;
use ethers::prelude::*;
use anyhow;
use crate::db::models::UserShares;

// Get the last synchronized block number
pub async fn get_last_synced_block(pool: &PgPool, start_block: u64, chain_type: &str) -> Result<u64, sqlx::Error> {
    let record = sqlx::query!(
        "SELECT last_synced_block FROM sync_status WHERE chain_type = $1 ORDER BY id DESC LIMIT 1",
        chain_type
    )
    .fetch_optional(pool)
    .await?;
    
    match record {
        Some(row) => Ok(row.last_synced_block as u64),
        None => {
            // If no record exists, insert the initial block number
            sqlx::query!(
                "INSERT INTO sync_status (last_synced_block, chain_type) VALUES ($1, $2)",
                start_block as i64,
                chain_type
            )
            .execute(pool)
            .await?;
            
            Ok(start_block)
        }
    }
}

// Get the last synchronized block number with metadata
pub async fn get_last_synced_block_with_metadata(
    pool: &PgPool, 
    start_block: u64, 
    chain_type: &str
) -> Result<(u64, Option<String>), sqlx::Error> {
    let record = sqlx::query!(
        "SELECT last_synced_block, metadata FROM sync_status WHERE chain_type = $1 ORDER BY id DESC LIMIT 1",
        chain_type
    )
    .fetch_optional(pool)
    .await?;
    
    match record {
        Some(row) => Ok((row.last_synced_block as u64, row.metadata)),
        None => {
            // If no record exists, insert the initial block number
            sqlx::query!(
                "INSERT INTO sync_status (last_synced_block, chain_type) VALUES ($1, $2)",
                start_block as i64,
                chain_type
            )
            .execute(pool)
            .await?;
            
            Ok((start_block, None))
        }
    }
}

// Update the last synchronized block number
pub async fn update_last_synced_block(pool: &PgPool, block_number: u64, chain_type: &str) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE sync_status SET last_synced_block = $1 WHERE chain_type = $2 AND id = (SELECT id FROM sync_status WHERE chain_type = $2 ORDER BY id DESC LIMIT 1)",
        block_number as i64,
        chain_type
    )
    .execute(pool)
    .await?;
    
    Ok(())
}

// Process buy trade
pub async fn process_buy_trade(
    pool: &PgPool, 
    trader: String, 
    subject: String, 
    share_amount: BigDecimal,
    chain_type: &str
) -> anyhow::Result<()> {
    sqlx::query!(
        "INSERT INTO trades (trader, subject, share_amount, chain_type) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (trader, subject, chain_type) 
        DO UPDATE SET share_amount = trades.share_amount + $3",
        trader,
        subject,
        share_amount,
        chain_type
    )
    .execute(pool)
    .await?;
    
    Ok(())
}

// Process sell trade
pub async fn process_sell_trade(
    pool: &PgPool, 
    trader: String, 
    subject: String, 
    share_amount: BigDecimal,
    chain_type: &str
) -> anyhow::Result<(bool, Option<String>)> {
    let ret = sqlx::query!(
        "UPDATE trades SET share_amount = share_amount - $1 
        WHERE trader = $2 AND subject = $3 AND chain_type = $4
        RETURNING share_amount",
        share_amount,
        trader,
        subject,
        chain_type
    )
    .fetch_optional(pool)
    .await?;
    
    match ret {
        Some(record) => {
            // Check if share_amount is 0
            if record.share_amount == 0.into() {
                // Get user's Telegram ID
                let telegram_id = sqlx::query!(
                    "SELECT telegram_id FROM user_mappings WHERE address = $1 AND chain_type = $2",
                    trader,
                    chain_type
                )
                .fetch_optional(pool)
                .await?;
                
                if let Some(user_record) = telegram_id {
                    return Ok((true, Some(user_record.telegram_id)));
                }
            }
            Ok((false, None))
        },
        None => {
            println!("Trade record not found: trader={}, subject={}, chain={}", trader, subject, chain_type);
            Ok((false, None))
        }
    }
}

// Get user's shares for a subject
pub async fn get_user_subject_shares(
    pool: &PgPool,
    trader: &str,
    subject: &str,
    chain_type: &str
) -> Result<BigDecimal, sqlx::Error> {
    let record = sqlx::query!(
        "SELECT share_amount FROM trades WHERE trader = $1 AND subject = $2 AND chain_type = $3",
        trader,
        subject,
        chain_type
    )
    .fetch_optional(pool)
    .await?;
    
    match record {
        Some(row) => Ok(row.share_amount),
        None => Ok(BigDecimal::from_str("0").unwrap())
    }
}

pub async fn get_user_shares(
    pool: &PgPool,
    trader: &str,
    chain_type: &str
) -> Result<Vec<UserShares>, sqlx::Error> {
    let rows = sqlx::query_as!(
        UserShares,
        "SELECT trader, subject, share_amount, chain_type FROM trades WHERE trader = $1 AND chain_type = $2",
        trader,
        chain_type
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

// Update last synchronized block info with metadata
pub async fn update_last_synced_block_with_metadata(
    pool: &PgPool, 
    block_number: u64, 
    metadata: String,
    chain_type: &str
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "UPDATE sync_status 
         SET last_synced_block = $1, metadata = $2 
         WHERE chain_type = $3 AND id = (
             SELECT id FROM sync_status WHERE chain_type = $3 ORDER BY id DESC LIMIT 1
         )",
        block_number as i64,
        metadata,
        chain_type
    )
    .execute(pool)
    .await?;
    
    Ok(())
}