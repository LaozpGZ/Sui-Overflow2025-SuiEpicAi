use std::collections::HashMap;
use actix_web::{get, HttpResponse, post, Responder, web};
use serde::{Deserialize, Serialize, Serializer};
use sqlx::PgPool;
use time::PrimitiveDateTime;

// Custom datetime serialization function
fn serialize_datetime<S>(
    datetime: &PrimitiveDateTime,
    serializer: S,
) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let string_value = datetime.to_string();
    serializer.serialize_str(&string_value)
}

#[derive(Debug, Serialize)]
pub struct Agent {
    pub agent_name: String,
    pub subject_address: String,
    pub bio: Option<String>,
    pub image: Option<String>,
    #[serde(serialize_with = "serialize_datetime")]
    pub created_at: PrimitiveDateTime,
}

#[derive(Debug, Serialize)]
pub struct AgentListResponse {
    pub agents: Vec<Agent>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[derive(Debug, Serialize)]
pub struct AgentResponse {
    pub agent: Option<Agent>,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AgentDetailResponse {
    pub agent_name: String,
    pub subject_address: String,
    pub invite_url: String,
    pub bio: Option<String>,
    pub image: Option<String>,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AddTelegramBotRequest {
    pub bot_token: String,
    pub chat_group_id: String,
    pub subject_address: String,
    pub agent_name: String,
    pub invite_url: String,
    pub bio: Option<String>,
    pub image: Option<String>,
    pub chain_type: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AddTelegramBotResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[post("/add_tg_bot")]
async fn handle_add_tg_bot(
    data: web::Json<AddTelegramBotRequest>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let subject_address = data.subject_address.to_lowercase().trim_start_matches("0x").to_owned();
    let chain_type = data.chain_type.clone().unwrap_or_else(|| "sui".to_string());
    
    let existing = sqlx::query!(
        "SELECT agent_name FROM telegram_bots WHERE subject_address = $1 AND chain_type = $2",
        subject_address.clone(),
        chain_type.clone()
    )
    .fetch_optional(pool.get_ref())
    .await;
    
    match existing {
        Ok(Some(existing_bot)) => {
            println!("Bot already exists for subject address {} on chain {}: Agent {}", subject_address, chain_type, existing_bot.agent_name);
            return HttpResponse::BadRequest().json(AddTelegramBotResponse {
                success: false,
                error: Some(format!("A bot with the same address already exists: {}", existing_bot.agent_name)),
            });
        },
        Ok(None) => {},
        Err(e) => {
            println!("Error checking existing bot: {:?}", e);
            return HttpResponse::InternalServerError().json(AddTelegramBotResponse {
                success: false,
                error: Some(format!("Error checking existing bot: {}", e)),
            });
        }
    }
    
    // Store bot information in database
    let result = sqlx::query!(
        "INSERT INTO telegram_bots (agent_name, bot_token, chat_group_id, subject_address, invite_url, bio, image, chain_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        data.agent_name,
        data.bot_token,
        data.chat_group_id,
        subject_address.clone(),
        data.invite_url,
        data.bio,
        data.image,
        chain_type
    )
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => {
            println!("New Telegram bot added, Agent: {}", data.agent_name);
            HttpResponse::Ok().json(AddTelegramBotResponse {
                success: true,
                error: None,
            })
        },
        Err(e) => {
            println!("Failed to add Telegram bot: {:?}", e);
            HttpResponse::InternalServerError().json(AddTelegramBotResponse {
                success: false,
                error: Some(format!("Failed to add bot: {}", e)),
            })
        }
    }
}

#[get("/agents")]
async fn get_agents(
    query: web::Query<HashMap<String, String>>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    // Parse pagination parameters
    let page = query.get("page").and_then(|p| p.parse::<i64>().ok()).unwrap_or(1);
    let page_size = query.get("page_size").and_then(|ps| ps.parse::<i64>().ok()).unwrap_or(10);

    if page < 1 || page_size < 1 {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "success": false,
            "error": "Invalid pagination parameters"
        }));
    }

    let offset = (page - 1) * page_size;

    // Get total count
    let total_result = sqlx::query!(
        "SELECT COUNT(*) as count FROM telegram_bots"
    )
        .fetch_one(pool.get_ref())
        .await;

    let total = match total_result {
        Ok(record) => record.count.unwrap_or(0),
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "error": format!("Database error: {}", e)
            }));
        }
    };

    // Get paginated agents
    let agents_result = sqlx::query!(
        "SELECT agent_name, bio,subject_address, image, created_at FROM telegram_bots ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        page_size,
        offset
    )
        .fetch_all(pool.get_ref())
        .await;

    match agents_result {
        Ok(rows) => {
            // Manually convert query results to Agent struct
            let agents: Vec<Agent> = rows.into_iter()
                .map(|row| Agent {
                    agent_name: row.agent_name,
                    bio: row.bio,
                    subject_address: row.subject_address,
                    image: row.image,
                    created_at: row.created_at,
                })
                .collect();

            HttpResponse::Ok().json(AgentListResponse {
                agents,
                total,
                page,
                page_size,
            })
        },
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "error": format!("Database error: {}", e)
            }))
        }
    }
}

#[get("/agents/{agent_name}")]
async fn get_agent_by_name(
    path: web::Path<String>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let agent_name = path.into_inner();

    let agent_result = sqlx::query!(
        "SELECT agent_name, bio, subject_address, image, created_at FROM telegram_bots WHERE agent_name = $1",
        agent_name
    )
        .fetch_optional(pool.get_ref())
        .await;

    match agent_result {
        Ok(Some(row)) => {
            // Manually create Agent struct
            let agent = Agent {
                agent_name: row.agent_name,
                subject_address: row.subject_address,
                bio: row.bio,
                image: row.image,
                created_at: row.created_at,
            };
            
            HttpResponse::Ok().json(AgentResponse {
                agent: Some(agent),
                success: true,
                error: None,
            })
        },
        Ok(None) => {
            HttpResponse::Ok().json(AgentResponse {
                agent: None,
                success: true,
                error: None,
            })
        },
        Err(e) => {
            HttpResponse::InternalServerError().json(AgentResponse {
                agent: None,
                success: false,
                error: Some(format!("Database error: {}", e)),
            })
        }
    }
}

#[get("/agent/detail/{agent_name}")]
async fn get_agent_detail(
    path: web::Path<String>,
    pool: web::Data<PgPool>,
) -> impl Responder {
    let agent_name = path.into_inner();

    // Query agent details from database
    let agent_result = sqlx::query!(
        "SELECT agent_name, subject_address, invite_url, bio, image FROM telegram_bots WHERE agent_name = $1",
        agent_name
    )
        .fetch_optional(pool.get_ref())
        .await;

    match agent_result {
        Ok(Some(agent)) => {
            HttpResponse::Ok().json(AgentDetailResponse {
                agent_name: agent.agent_name,
                subject_address: agent.subject_address,
                invite_url: agent.invite_url,
                bio: agent.bio,
                image: agent.image,
                success: true,
                error: None,
            })
        },
        Ok(None) => {
            HttpResponse::NotFound().json(AgentDetailResponse {
                agent_name: String::new(),
                subject_address: String::new(),
                invite_url: String::new(),
                bio: None,
                image: None,
                success: false,
                error: Some("Agent not found".to_string()),
            })
        },
        Err(e) => {
            HttpResponse::InternalServerError().json(AgentDetailResponse {
                agent_name: String::new(),
                subject_address: String::new(),
                invite_url: String::new(),
                bio: None,
                image: None,
                success: false,
                error: Some(format!("Database error: {}", e)),
            })
        }
    }
}