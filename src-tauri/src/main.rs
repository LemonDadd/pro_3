#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod commands;
mod epub_utils;

use db::Database;
use commands::AppState;
use std::path::PathBuf;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app
                .path_resolver()
                .app_data_dir()
                .unwrap_or_else(|| PathBuf::from("."));
            
            let library_dir = app_dir.join("library");
            let data_dir = app_dir.join("data");
            let db_path = app_dir.join("reader.db");

            std::fs::create_dir_all(&library_dir).ok();
            std::fs::create_dir_all(&data_dir).ok();

            let db = Database::new(db_path)
                .expect("Failed to initialize database");

            app.manage(AppState {
                db: std::sync::Mutex::new(db),
                library_dir,
                data_dir,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_books,
            commands::get_book,
            commands::import_book,
            commands::delete_book,
            commands::update_reading_progress,
            commands::get_bookmarks,
            commands::add_bookmark,
            commands::delete_bookmark,
            commands::get_highlights,
            commands::add_highlight,
            commands::update_highlight_note,
            commands::delete_highlight,
            commands::get_notes,
            commands::add_note,
            commands::update_note,
            commands::delete_note,
            commands::search_book,
            commands::get_toc,
            commands::export_highlights_markdown,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
