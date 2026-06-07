use crate::db::Database;
use crate::epub_utils::{copy_book_to_library, get_file_size, EpubParser};
use crate::models::{Book, Bookmark, Highlight, Note, SearchResult, TocItem};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub db: Mutex<Database>,
    pub library_dir: PathBuf,
    pub data_dir: PathBuf,
}

#[tauri::command]
pub fn get_books(state: State<AppState>) -> Result<Vec<Book>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_books().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_book(book_id: String, state: State<AppState>) -> Result<Option<Book>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_book(&book_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_book(
    file_path: String,
    state: State<AppState>,
) -> Result<Book, String> {
    let path = PathBuf::from(&file_path);
    if !path.exists() {
        return Err("文件不存在".to_string());
    }

    let extension = path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    if !["epub", "mobi", "pdf"].contains(&extension.as_str()) {
        return Err("不支持的文件格式".to_string());
    }

    let file_size = get_file_size(&path).map_err(|e| e.to_string())?;

    let mut book = Book::new(
        path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("未知书籍")
            .to_string(),
        "未知作者".to_string(),
        extension.clone(),
        file_path.clone(),
        file_size,
    );

    if extension == "epub" {
        match EpubParser::new(&path) {
            Ok(mut parser) => {
                match parser.parse_metadata(&file_path, file_size) {
                    Ok(parsed_book) => book = parsed_book,
                    Err(e) => eprintln!("Failed to parse EPUB metadata: {}", e),
                }
            }
            Err(e) => eprintln!("Failed to open EPUB: {}", e),
        }
    }

    let library_dir = state.library_dir.clone();
    let data_dir = state.data_dir.clone();
    let book_id = book.id.clone();

    let _ = copy_book_to_library(&path, &library_dir, &book_id)
        .map_err(|e| e.to_string())?;

    if extension == "epub" {
        if let Ok(mut parser) = EpubParser::new(&path) {
            if let Ok(Some(cover_path)) = parser.extract_cover(&book_id, &data_dir) {
                book.cover = Some(cover_path);
            }
        }
    }

    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_book(&book).map_err(|e| e.to_string())?;

    Ok(book)
}

#[tauri::command]
pub fn delete_book(book_id: String, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_book(&book_id).map_err(|e| e.to_string())?;

    let library_dir = state.library_dir.clone();
    let _ = std::fs::remove_dir_all(library_dir.join(&book_id));

    Ok(())
}

#[tauri::command]
pub fn update_reading_progress(
    book_id: String,
    progress: f32,
    current_location: Option<String>,
    current_page: Option<i32>,
    state: State<AppState>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_book_progress(
        &book_id,
        progress,
        current_location.as_deref(),
        current_page,
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_bookmarks(book_id: String, state: State<AppState>) -> Result<Vec<Bookmark>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_bookmarks(&book_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_bookmark(bookmark: Bookmark, state: State<AppState>) -> Result<Bookmark, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_bookmark(&bookmark).map_err(|e| e.to_string())?;
    Ok(bookmark)
}

#[tauri::command]
pub fn delete_bookmark(bookmark_id: String, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_bookmark(&bookmark_id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_highlights(book_id: String, state: State<AppState>) -> Result<Vec<Highlight>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_highlights(&book_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_highlight(highlight: Highlight, state: State<AppState>) -> Result<Highlight, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_highlight(&highlight).map_err(|e| e.to_string())?;
    Ok(highlight)
}

#[tauri::command]
pub fn update_highlight_note(
    highlight_id: String,
    note: Option<String>,
    state: State<AppState>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_highlight_note(&highlight_id, note.as_deref())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_highlight(highlight_id: String, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_highlight(&highlight_id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_notes(book_id: String, state: State<AppState>) -> Result<Vec<Note>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_notes(&book_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_note(note: Note, state: State<AppState>) -> Result<Note, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.add_note(&note).map_err(|e| e.to_string())?;
    Ok(note)
}

#[tauri::command]
pub fn update_note(note_id: String, content: String, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_note(&note_id, &content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_note(note_id: String, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_note(&note_id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn search_book(
    book_id: String,
    query: String,
    state: State<AppState>,
) -> Result<Vec<SearchResult>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.search_in_book(&book_id, &query).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_toc(file_path: String) -> Result<Vec<TocItem>, String> {
    let path = PathBuf::from(&file_path);
    match EpubParser::new(&path) {
        Ok(parser) => Ok(parser.get_toc()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn export_highlights_markdown(
    book_id: Option<String>,
    state: State<AppState>,
) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    let books = db.get_books().map_err(|e| e.to_string())?;
    let highlights = if let Some(bid) = &book_id {
        db.get_highlights(bid).map_err(|e| e.to_string())?
    } else {
        let mut all = Vec::new();
        for book in &books {
            let hls = db.get_highlights(&book.id).map_err(|e| e.to_string())?;
            all.extend(hls);
        }
        all
    };

    let mut markdown = String::from("# 读书笔记导出\n\n");
    markdown.push_str(&format!("> 导出时间：{}\n", chrono::Local::now().format("%Y-%m-%d %H:%M:%S")));
    markdown.push_str(&format!("> 共 {} 条高亮\n\n", highlights.len()));
    markdown.push_str("---\n\n");

    use std::collections::HashMap;
    let mut grouped: HashMap<String, Vec<Highlight>> = HashMap::new();
    for hl in highlights {
        grouped.entry(hl.book_id.clone()).or_default().push(hl);
    }

    for (bid, hls) in &grouped {
        if let Some(book) = books.iter().find(|b| &b.id == bid) {
            markdown.push_str(&format!("## 📖 {}\n\n", book.title));
            markdown.push_str(&format!("**作者：** {}\n\n", book.author));
        }

        let mut chapter_grouped: HashMap<String, Vec<Highlight>> = HashMap::new();
        for hl in hls {
            chapter_grouped.entry(hl.chapter.clone()).or_default().push(hl.clone());
        }

        for (chapter, chapter_hls) in &chapter_grouped {
            markdown.push_str(&format!("### 📑 {}\n\n", chapter));
            for hl in chapter_hls {
                markdown.push_str(&format!("> {}\n\n", hl.text));
                if let Some(note) = &hl.note {
                    markdown.push_str(&format!("📝 **笔记：** {}\n\n", note));
                }
                markdown.push_str(&format!("<sub>📍 定位：`{}`</sub>\n\n", hl.cfi));
                markdown.push_str(&format!(
                    "<sub>🕐 {}</sub>\n\n",
                    hl.created_at.with_timezone(&chrono::Local).format("%Y-%m-%d %H:%M:%S")
                ));
                markdown.push_str("---\n\n");
            }
        }
    }

    Ok(markdown)
}
