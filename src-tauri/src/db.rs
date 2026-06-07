use rusqlite::{params, Connection, Result};
use std::path::PathBuf;
use crate::models::{Book, Bookmark, Highlight, Note};

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(path: PathBuf) -> Result<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).ok();
        }
        
        let conn = Connection::open(path)?;
        let db = Self { conn };
        db.init()?;
        Ok(db)
    }

    fn init(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                cover TEXT,
                description TEXT,
                format TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                progress REAL DEFAULT 0,
                current_location TEXT,
                total_pages INTEGER,
                current_page INTEGER,
                added_at TEXT NOT NULL,
                last_read_at TEXT,
                language TEXT,
                publisher TEXT,
                pub_date TEXT,
                categories TEXT
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS bookmarks (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                cfi TEXT NOT NULL,
                chapter TEXT NOT NULL,
                location INTEGER NOT NULL,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS highlights (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                cfi TEXT NOT NULL,
                color TEXT NOT NULL,
                text TEXT NOT NULL,
                note TEXT,
                chapter TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                highlight_id TEXT,
                cfi TEXT,
                content TEXT NOT NULL,
                chapter TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS book_fts USING fts5(
                book_id,
                chapter,
                content,
                content=''
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS reading_sessions (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT,
                pages_read INTEGER DEFAULT 0,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )",
            [],
        )?;

        self.conn.execute("PRAGMA foreign_keys = ON", [])?;

        Ok(())
    }

    pub fn add_book(&self, book: &Book) -> Result<()> {
        self.conn.execute(
            "INSERT INTO books (id, title, author, cover, description, format, file_path, 
                file_size, progress, current_location, total_pages, current_page, 
                added_at, last_read_at, language, publisher, pub_date, categories)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)",
            params![
                book.id,
                book.title,
                book.author,
                book.cover,
                book.description,
                book.format,
                book.file_path,
                book.file_size,
                book.progress,
                book.current_location,
                book.total_pages,
                book.current_page,
                book.added_at.to_rfc3339(),
                book.last_read_at.map(|d| d.to_rfc3339()),
                book.language,
                book.publisher,
                book.pub_date,
                book.categories,
            ],
        )?;
        Ok(())
    }

    pub fn get_books(&self) -> Result<Vec<Book>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, author, cover, description, format, file_path, file_size,
                    progress, current_location, total_pages, current_page, added_at, last_read_at,
                    language, publisher, pub_date, categories
             FROM books ORDER BY last_read_at DESC NULLS LAST, added_at DESC",
        )?;

        let books = stmt.query_map([], |row| {
            Ok(Book {
                id: row.get(0)?,
                title: row.get(1)?,
                author: row.get(2)?,
                cover: row.get(3)?,
                description: row.get(4)?,
                format: row.get(5)?,
                file_path: row.get(6)?,
                file_size: row.get(7)?,
                progress: row.get(8)?,
                current_location: row.get(9)?,
                total_pages: row.get(10)?,
                current_page: row.get(11)?,
                added_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(12)?)
                    .unwrap()
                    .with_timezone(&chrono::Utc),
                last_read_at: row
                    .get::<_, Option<String>>(13)?
                    .map(|s| {
                        chrono::DateTime::parse_from_rfc3339(&s)
                            .unwrap()
                            .with_timezone(&chrono::Utc)
                    }),
                language: row.get(14)?,
                publisher: row.get(15)?,
                pub_date: row.get(16)?,
                categories: row.get(17)?,
            })
        })?;

        Ok(books.filter_map(|b| b.ok()).collect())
    }

    pub fn get_book(&self, id: &str) -> Result<Option<Book>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, author, cover, description, format, file_path, file_size,
                    progress, current_location, total_pages, current_page, added_at, last_read_at,
                    language, publisher, pub_date, categories
             FROM books WHERE id = ?1",
        )?;

        let mut books = stmt.query_map(params![id], |row| {
            Ok(Book {
                id: row.get(0)?,
                title: row.get(1)?,
                author: row.get(2)?,
                cover: row.get(3)?,
                description: row.get(4)?,
                format: row.get(5)?,
                file_path: row.get(6)?,
                file_size: row.get(7)?,
                progress: row.get(8)?,
                current_location: row.get(9)?,
                total_pages: row.get(10)?,
                current_page: row.get(11)?,
                added_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(12)?)
                    .unwrap()
                    .with_timezone(&chrono::Utc),
                last_read_at: row
                    .get::<_, Option<String>>(13)?
                    .map(|s| {
                        chrono::DateTime::parse_from_rfc3339(&s)
                            .unwrap()
                            .with_timezone(&chrono::Utc)
                    }),
                language: row.get(14)?,
                publisher: row.get(15)?,
                pub_date: row.get(16)?,
                categories: row.get(17)?,
            })
        })?;

        Ok(books.next().transpose()?)
    }

    pub fn update_book_progress(
        &self,
        book_id: &str,
        progress: f32,
        current_location: Option<&str>,
        current_page: Option<i32>,
    ) -> Result<()> {
        self.conn.execute(
            "UPDATE books SET progress = ?1, current_location = ?2, current_page = ?3, 
                last_read_at = ?4 WHERE id = ?5",
            params![
                progress,
                current_location,
                current_page,
                chrono::Utc::now().to_rfc3339(),
                book_id
            ],
        )?;
        Ok(())
    }

    pub fn delete_book(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM books WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn add_bookmark(&self, bookmark: &Bookmark) -> Result<()> {
        self.conn.execute(
            "INSERT INTO bookmarks (id, book_id, cfi, chapter, location, text, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                bookmark.id,
                bookmark.book_id,
                bookmark.cfi,
                bookmark.chapter,
                bookmark.location,
                bookmark.text,
                bookmark.created_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn get_bookmarks(&self, book_id: &str) -> Result<Vec<Bookmark>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, book_id, cfi, chapter, location, text, created_at
             FROM bookmarks WHERE book_id = ?1 ORDER BY location ASC",
        )?;

        let bookmarks = stmt.query_map(params![book_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                book_id: row.get(1)?,
                cfi: row.get(2)?,
                chapter: row.get(3)?,
                location: row.get(4)?,
                text: row.get(5)?,
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                    .unwrap()
                    .with_timezone(&chrono::Utc),
            })
        })?;

        Ok(bookmarks.filter_map(|b| b.ok()).collect())
    }

    pub fn delete_bookmark(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM bookmarks WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn add_highlight(&self, highlight: &Highlight) -> Result<()> {
        self.conn.execute(
            "INSERT INTO highlights (id, book_id, cfi, color, text, note, chapter, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                highlight.id,
                highlight.book_id,
                highlight.cfi,
                highlight.color,
                highlight.text,
                highlight.note,
                highlight.chapter,
                highlight.created_at.to_rfc3339(),
                highlight.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn get_highlights(&self, book_id: &str) -> Result<Vec<Highlight>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, book_id, cfi, color, text, note, chapter, created_at, updated_at
             FROM highlights WHERE book_id = ?1 ORDER BY created_at DESC",
        )?;

        let highlights = stmt.query_map(params![book_id], |row| {
            Ok(Highlight {
                id: row.get(0)?,
                book_id: row.get(1)?,
                cfi: row.get(2)?,
                color: row.get(3)?,
                text: row.get(4)?,
                note: row.get(5)?,
                chapter: row.get(6)?,
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                    .unwrap()
                    .with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(8)?)
                    .unwrap()
                    .with_timezone(&chrono::Utc),
            })
        })?;

        Ok(highlights.filter_map(|h| h.ok()).collect())
    }

    pub fn update_highlight_note(&self, id: &str, note: Option<&str>) -> Result<()> {
        self.conn.execute(
            "UPDATE highlights SET note = ?1, updated_at = ?2 WHERE id = ?3",
            params![note, chrono::Utc::now().to_rfc3339(), id],
        )?;
        Ok(())
    }

    pub fn delete_highlight(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM highlights WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn add_note(&self, note: &Note) -> Result<()> {
        self.conn.execute(
            "INSERT INTO notes (id, book_id, highlight_id, cfi, content, chapter, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                note.id,
                note.book_id,
                note.highlight_id,
                note.cfi,
                note.content,
                note.chapter,
                note.created_at.to_rfc3339(),
                note.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    pub fn get_notes(&self, book_id: &str) -> Result<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, book_id, highlight_id, cfi, content, chapter, created_at, updated_at
             FROM notes WHERE book_id = ?1 ORDER BY created_at DESC",
        )?;

        let notes = stmt.query_map(params![book_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                book_id: row.get(1)?,
                highlight_id: row.get(2)?,
                cfi: row.get(3)?,
                content: row.get(4)?,
                chapter: row.get(5)?,
                created_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(6)?)
                    .unwrap()
                    .with_timezone(&chrono::Utc),
                updated_at: chrono::DateTime::parse_from_rfc3339(&row.get::<_, String>(7)?)
                    .unwrap()
                    .with_timezone(&chrono::Utc),
            })
        })?;

        Ok(notes.filter_map(|n| n.ok()).collect())
    }

    pub fn update_note(&self, id: &str, content: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE notes SET content = ?1, updated_at = ?2 WHERE id = ?3",
            params![content, chrono::Utc::now().to_rfc3339(), id],
        )?;
        Ok(())
    }

    pub fn delete_note(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM notes WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn search_in_book(&self, book_id: &str, query: &str) -> Result<Vec<crate::models::SearchResult>> {
        let mut stmt = self.conn.prepare(
            "SELECT book_id, chapter, content, cfi FROM book_fts 
             WHERE book_id = ?1 AND book_fts MATCH ?2
             ORDER BY rank LIMIT 50",
        )?;

        let results = stmt.query_map(params![book_id, query], |row| {
            Ok(crate::models::SearchResult {
                book_id: row.get(0)?,
                chapter: row.get(1)?,
                cfi: "".to_string(),
                excerpt: row.get(2)?,
                match_index: 0,
            })
        })?;

        Ok(results.filter_map(|r| r.ok()).collect())
    }
}
