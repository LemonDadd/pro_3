import { invoke } from '@tauri-apps/api/tauri';
import type { Book, Bookmark, Highlight, Note, SearchResult, TocItem } from '../types';

const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;

async function safeInvoke<T>(command: string, args?: Record<string, any>): Promise<T> {
  if (!isTauri) {
    console.warn(`[Tauri Mock] ${command}`, args);
    throw new Error('Tauri environment not available');
  }
  return invoke<T>(command, args);
}

export const bookApi = {
  getBooks: (): Promise<Book[]> => {
    return safeInvoke<Book[]>('get_books');
  },

  getBook: (bookId: string): Promise<Book | null> => {
    return safeInvoke<Book | null>('get_book', { bookId });
  },

  importBook: (filePath: string): Promise<Book> => {
    return safeInvoke<Book>('import_book', { filePath });
  },

  deleteBook: (bookId: string): Promise<void> => {
    return safeInvoke<void>('delete_book', { bookId });
  },

  updateProgress: (
    bookId: string,
    progress: number,
    currentLocation?: string,
    currentPage?: number
  ): Promise<void> => {
    return safeInvoke<void>('update_reading_progress', {
      bookId,
      progress,
      currentLocation,
      currentPage,
    });
  },

  getToc: (filePath: string): Promise<TocItem[]> => {
    return safeInvoke<TocItem[]>('get_toc', { filePath });
  },
};

export const bookmarkApi = {
  getBookmarks: (bookId: string): Promise<Bookmark[]> => {
    return safeInvoke<Bookmark[]>('get_bookmarks', { bookId });
  },

  addBookmark: (bookmark: Bookmark): Promise<Bookmark> => {
    return safeInvoke<Bookmark>('add_bookmark', { bookmark });
  },

  deleteBookmark: (bookmarkId: string): Promise<void> => {
    return safeInvoke<void>('delete_bookmark', { bookmarkId });
  },
};

export const highlightApi = {
  getHighlights: (bookId: string): Promise<Highlight[]> => {
    return safeInvoke<Highlight[]>('get_highlights', { bookId });
  },

  addHighlight: (highlight: Highlight): Promise<Highlight> => {
    return safeInvoke<Highlight>('add_highlight', { highlight });
  },

  updateHighlightNote: (highlightId: string, note?: string): Promise<void> => {
    return safeInvoke<void>('update_highlight_note', { highlightId, note });
  },

  deleteHighlight: (highlightId: string): Promise<void> => {
    return safeInvoke<void>('delete_highlight', { highlightId });
  },
};

export const noteApi = {
  getNotes: (bookId: string): Promise<Note[]> => {
    return safeInvoke<Note[]>('get_notes', { bookId });
  },

  addNote: (note: Note): Promise<Note> => {
    return safeInvoke<Note>('add_note', { note });
  },

  updateNote: (noteId: string, content: string): Promise<void> => {
    return safeInvoke<void>('update_note', { noteId, content });
  },

  deleteNote: (noteId: string): Promise<void> => {
    return safeInvoke<void>('delete_note', { noteId });
  },
};

export const searchApi = {
  searchBook: (bookId: string, query: string): Promise<SearchResult[]> => {
    return safeInvoke<SearchResult[]>('search_book', { bookId, query });
  },
};

export const exportApi = {
  exportHighlightsMarkdown: (bookId?: string): Promise<string> => {
    return safeInvoke<string>('export_highlights_markdown', { bookId });
  },
};

export const dialogApi = {
  openFileDialog: async (): Promise<string | null> => {
    if (!isTauri) return null;
    const { open } = await import('@tauri-apps/api/dialog');
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: '电子书',
          extensions: ['epub', 'mobi', 'pdf'],
        },
      ],
    });
    if (Array.isArray(selected)) return selected[0] || null;
    return selected as string | null;
  },

  saveFileDialog: async (defaultName: string): Promise<string | null> => {
    if (!isTauri) return null;
    const { save } = await import('@tauri-apps/api/dialog');
    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });
    return path as string | null;
  },
};

export { isTauri };
