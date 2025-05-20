use crate::db::operations::get_user_shares;
use actix_web::{web, get};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Serialize)]
pub struct UserSharesResponse {
    user_address: String,
    shares: Vec<SubjectShare>,
    chain_type: String,
}

#[derive(Serialize)]
pub struct SubjectShare {
    subject_address: String,
    shares_amount: String,
}

#[derive(Deserialize)]
pub struct PathParams {
    user_address: String,
    chain_type: String,
}

// API endpoint to get all shares for a user
#[get("/users/{user_address}/shares/{chain_type}")]
pub async fn get_user_shares_handler(
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
) -> Result<web::Json<UserSharesResponse>, actix_web::Error> {
    let path_params = path.into_inner();
    let user_address = path_params.user_address.to_lowercase().trim_start_matches("0x").to_owned();
    let chain_type = path_params.chain_type;
    
    println!("user_address: {:?}", user_address);
    println!("chain_type: {:?}", chain_type);
    let shares = get_user_shares(&pool, &user_address, &chain_type)
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Database operation failed"))?;
    
    let subject_shares = shares
        .into_iter()
        .map(|share| SubjectShare {
            subject_address: share.subject,
            shares_amount: share.share_amount.to_string(),
        })
        .collect();
    
    Ok(web::Json(UserSharesResponse {
        user_address,
        shares: subject_shares,
        chain_type,
    }))
} 