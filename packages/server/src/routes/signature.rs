use std::sync::Arc;
use actix_web::{HttpResponse, post, Responder, web};
use ethers::addressbook::Address;
use ethers::prelude::Signature;
use ethers::utils::{hash_message, hex};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use crate::AppConfig;
use teloxide::Bot;
use teloxide::prelude::{Requester, UserId};
use teloxide::types::ChatPermissions;
use crate::block_chain::{Blockchain, create_blockchain};

#[derive(Debug, Deserialize)]
pub struct ChallengeRequest {
    pub challenge: String,
    pub chat_id: String,
    pub signature: String,
    pub user: String,
    pub chain_type: Option<String>, // Add chain type, default is monad
}

#[derive(Debug, Serialize)]
pub struct ChallengeResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}
pub fn verify_signature(
    challenge: &str,
    signature: &str,
) -> Result<Address, String> {
    let sig_bytes = hex::decode(signature)
        .map_err(|e| format!("Invalid signature hex: {}", e))?;

    if sig_bytes.len() != 65 {
        return Err("Signature must be 65 bytes".into());
    }

    let message_hash = hash_message(challenge);
    let signature = Signature::try_from(sig_bytes.as_slice()).map_err(|e| format!("Invalid signature: {}!",e))?;
    let recovered_address = signature
        .recover(message_hash)
        .map_err(|e| format!("Recovery failed: {}", e))?;
    Ok(recovered_address)
}


#[post("/verify-signature")]
async fn handle_verify(
    data: web::Json<ChallengeRequest>,
    config: web::Data<AppConfig>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    println!("Received request: {:?}", data);
    // Determine chain type, default is monad
    let chain_type = data.chain_type.clone().unwrap_or_else(|| "monad".to_string());

    // Query bot info including subject_address from telegram_bots table using chat_id
    let bot_info = match sqlx::query!(
        "SELECT bot_token, chat_group_id, subject_address FROM telegram_bots WHERE chat_group_id = $1 AND chain_type = $2",
        data.chat_id,
        chain_type
    )
    .fetch_optional(pool.get_ref())
    .await {
        Ok(Some(info)) => info,
        Ok(None) => {
            println!("No bot info found for chat_id: {} and chain: {}", data.chat_id, chain_type);
            return HttpResponse::BadRequest().json(ChallengeResponse {
                success: false,
                error: Some(format!("Bot not found for this chat_id in {} chain", chain_type)),
            });
        },
        Err(e) => {
            println!("Failed to query bot info: {:?}", e);
            return HttpResponse::InternalServerError().json(ChallengeResponse {
                success: false,
                error: Some(format!("Database query failed: {}", e)),
            });
        }
    };

    // Create blockchain instance for the appropriate chain
    let blockchain = create_blockchain(&chain_type, Arc::new(config.get_ref().clone()));
    
    let own_shares = match blockchain.verify_signature(
        if chain_type == "sui" { &data.user } else { &data.challenge },
        &data.signature,
    ) {
        Ok(verified_address) => {
            println!("Verified address is {}", verified_address);
            
            if data.user == verified_address {
                println!("Address matches! Verified: {}, Expected: {}", verified_address, data.user);
                // When address matches, save user address and Telegram ID to database
                let telegram_id = &data.challenge;

                // Check if user address already exists
                let result = sqlx::query!(
                    "INSERT INTO user_mappings (address, telegram_id, chain_type)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (address, chain_type) DO UPDATE SET telegram_id = $2",
                    verified_address,
                    telegram_id,
                    chain_type
                )
                    .execute(pool.get_ref())
                    .await;

                if let Err(e) = result {
                    println!("Failed to save user mapping: {:?}", e);
                }

                // Get user's share balance
                let has_shares = match blockchain.get_shares_balance(&bot_info.subject_address, &verified_address).await {
                    Ok(balance) => {
                        println!("User {} balance for subject {}: {}", verified_address, bot_info.subject_address, balance);
                        balance > 0
                    },
                    Err(e) => {
                        println!("Failed to get shares balance: {:?}", e);
                        false
                    }
                };

                has_shares
            } else {
                println!("Address mismatch with signature! Verified: {}, Expected: {}", verified_address, data.user);
                false
            }
        }
        Err(e) => {
            println!("Verify signature failed: {:?}",e);
            false
        },
    };
    
    if own_shares {
        let permissions = ChatPermissions::empty()
            | ChatPermissions::SEND_MESSAGES
            | ChatPermissions::SEND_MEDIA_MESSAGES
            | ChatPermissions::SEND_OTHER_MESSAGES
            | ChatPermissions::SEND_POLLS
            | ChatPermissions::ADD_WEB_PAGE_PREVIEWS;

        let bot = Bot::new(bot_info.bot_token);
        let user_id: u64 = data.challenge.parse().unwrap();
        match bot.restrict_chat_member(bot_info.chat_group_id, UserId(user_id), permissions).await {
            Ok(_) => {
                return HttpResponse::Ok().json(ChallengeResponse {
                    success: true,
                    error: None,
                });
            }
            Err(e) => {
                println!(" restrict_chat_member failed: {:?}",e);
                return HttpResponse::InternalServerError().json(ChallengeResponse {
                    success: false,
                    error: Some(format!("Telegram restrict_chat_member failed: {}", e)),
                });
            },
        }
    }

    HttpResponse::Ok().json(ChallengeResponse {
        success: true,
        error: None,
    })
}