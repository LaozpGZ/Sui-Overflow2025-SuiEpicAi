use actix_web::{HttpResponse, ResponseError, http::StatusCode};
use derive_more::Display;

#[derive(Debug, Display)]
pub enum AppError {
    #[display(fmt = "Internal Server Error")]
    InternalError,
    #[display(fmt = "Resource not found: {}", _0)]
    NotFound(String),
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::InternalError => HttpResponse::InternalServerError()
                .json(json!({"error": "Internal Server Error"})),
            AppError::NotFound(ref message) => HttpResponse::NotFound()
                .json(json!({"error": format!("Resource not found: {}", message)})),
        }
    }

    fn status_code(&self) -> StatusCode {
        match self {
            AppError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
        }
    }
} 