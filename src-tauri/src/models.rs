use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: String,
    pub cover: Option<String>,
    pub description: Option<String>,
    pub format: String,
    pub file_path: String,
    pub file_size: i64,
    pub progress: f32,
    pub current_location: Option<String>,
    pub total_pages: Option<i32>,
    pub current_page: Option<i32>,
    pub added_at: DateTime<Utc>,
    pub last_read_at: Option<DateTime<Utc>>,
    pub language: Option<String>,
    pub publisher: Option<String>,
    pub pub_date: Option<String>,
    pub categories: Option<String>,
}

impl Book {
    pub fn new(
        title: String,
        author: String,
        format: String,
        file_path: String,
        file_size: i64,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            author,
            cover: None,
            description: None,
            format,
            file_path,
            file_size,
            progress: 0.0,
            current_location: None,
            total_pages: None,
            current_page: None,
            added_at: Utc::now(),
            last_read_at: None,
            language: None,
            publisher: None,
            pub_date: None,
            categories: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bookmark {
    pub id: String,
    pub book_id: String,
    pub cfi: String,
    pub chapter: String,
    pub location: i32,
    pub text: String,
    pub created_at: DateTime<Utc>,
}

impl Bookmark {
    pub fn new(book_id: String, cfi: String, chapter: String, location: i32, text: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            book_id,
            cfi,
            chapter,
            location,
            text,
            created_at: Utc::now(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Highlight {
    pub id: String,
    pub book_id: String,
    pub cfi: String,
    pub color: String,
    pub text: String,
    pub note: Option<String>,
    pub chapter: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Highlight {
    pub fn new(book_id: String, cfi: String, color: String, text: String, chapter: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            book_id,
            cfi,
            color,
            text,
            note: None,
            chapter,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub book_id: String,
    pub highlight_id: Option<String>,
    pub cfi: Option<String>,
    pub content: String,
    pub chapter: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Note {
    pub fn new(book_id: String, content: String, chapter: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            book_id,
            highlight_id: None,
            cfi: None,
            content,
            chapter,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingProgress {
    pub book_id: String,
    pub cfi: String,
    pub location: i32,
    pub percentage: f32,
    pub chapter: String,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub book_id: String,
    pub chapter: String,
    pub cfi: String,
    pub excerpt: String,
    pub match_index: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TocItem {
    pub id: String,
    pub title: String,
    pub href: String,
    pub level: i32,
}
