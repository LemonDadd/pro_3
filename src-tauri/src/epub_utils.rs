use crate::models::{Book, TocItem};
use anyhow::{Context, Result};
use epub::doc::EpubDoc;
use std::fs;
use std::io::BufReader;
use std::path::{Path, PathBuf};

pub struct EpubParser {
    doc: EpubDoc<BufReader<fs::File>>,
}

impl EpubParser {
    pub fn new(path: &Path) -> Result<Self> {
        let doc = EpubDoc::new(path)
            .with_context(|| format!("Failed to open EPUB file: {}", path.display()))?;
        Ok(Self { doc })
    }

    pub fn parse_metadata(&mut self, file_path: &str, file_size: i64) -> Result<Book> {
        let title = self
            .doc
            .mdata("title")
            .unwrap_or_else(|| "未知标题".to_string());
        let author = self
            .doc
            .mdata("creator")
            .unwrap_or_else(|| "未知作者".to_string());
        let description = self.doc.mdata("description");
        let language = self.doc.mdata("language");
        let publisher = self.doc.mdata("publisher");
        let pub_date = self.doc.mdata("date");
        let subject = self.doc.mdata("subject");

        let mut book = Book::new(
            title,
            author,
            "epub".to_string(),
            file_path.to_string(),
            file_size,
        );
        book.description = description;
        book.language = language;
        book.publisher = publisher;
        book.pub_date = pub_date;
        book.categories = subject;

        Ok(book)
    }

    pub fn extract_cover(&mut self, book_id: &str, data_dir: &Path) -> Result<Option<String>> {
        match self.doc.get_cover() {
            Ok(data) => {
                let cover_dir = data_dir.join("covers");
                fs::create_dir_all(&cover_dir)?;

                let cover_path = cover_dir.join(format!("{}.png", book_id));

                if let Ok(img) = image::load_from_memory(&data) {
                    img.save(&cover_path)?;
                    return Ok(Some(cover_path.to_string_lossy().to_string()));
                }
                Ok(None)
            }
            Err(_) => Ok(None),
        }
    }

    pub fn get_toc(&self) -> Vec<TocItem> {
        self.doc
            .toc
            .iter()
            .enumerate()
            .map(|(i, chapter)| TocItem {
                id: format!("chapter-{}", i),
                title: chapter.label.clone(),
                href: chapter.content.to_string_lossy().to_string(),
                level: 1,
            })
            .collect()
    }

    pub fn get_chapter_count(&self) -> usize {
        self.doc.spine.len()
    }

    pub fn get_current_content(&mut self) -> Result<String> {
        let content = self.doc.get_current_str().unwrap_or_default();
        Ok(content)
    }

    pub fn go_to_chapter(&mut self, index: usize) -> Result<()> {
        if index >= self.doc.spine.len() {
            return Err(anyhow::anyhow!("Chapter index out of bounds"));
        }
        self.doc.set_current_page(index).ok();
        Ok(())
    }

    pub fn next_chapter(&mut self) -> bool {
        self.doc.go_next().is_ok()
    }

    pub fn prev_chapter(&mut self) -> bool {
        self.doc.go_prev().is_ok()
    }

    pub fn get_current_chapter_num(&self) -> usize {
        self.doc.get_current_page()
    }
}

pub fn get_file_size(path: &Path) -> Result<i64> {
    let metadata = fs::metadata(path)?;
    Ok(metadata.len() as i64)
}

pub fn copy_book_to_library(
    src_path: &Path,
    library_dir: &Path,
    book_id: &str,
) -> Result<PathBuf> {
    fs::create_dir_all(library_dir)?;

    let extension = src_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("epub");

    let dest_path = library_dir.join(format!("{}.{}", book_id, extension));
    fs::copy(src_path, &dest_path)?;

    Ok(dest_path)
}
