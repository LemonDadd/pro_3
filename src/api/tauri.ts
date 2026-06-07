import { invoke } from '@tauri-apps/api/tauri';
import type { Book, Bookmark, Highlight, Note, SearchResult, TocItem } from '../types';
import {
  mockBookApi,
  mockBookmarkApi,
  mockHighlightApi,
  mockNoteApi,
  mockSearchApi,
  mockExportApi,
  mockDialogApi,
} from './mockApi';

export const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;

async function safeInvoke<T>(command: string, args?: Record<string, any>): Promise<T> {
  if (!isTauri) {
    throw new Error('Tauri environment not available');
  }
  return invoke<T>(command, args);
}

export const bookApi = {
  getBooks: (): Promise<Book[]> => {
    if (!isTauri) return mockBookApi.getBooks();
    return safeInvoke<Book[]>('get_books');
  },

  getBook: (bookId: string): Promise<Book | null> => {
    if (!isTauri) return mockBookApi.getBook(bookId);
    return safeInvoke<Book | null>('get_book', { bookId });
  },

  importBook: (filePath: string): Promise<Book> => {
    if (!isTauri) return mockBookApi.importBook(filePath);
    return safeInvoke<Book>('import_book', { filePath });
  },

  deleteBook: (bookId: string): Promise<void> => {
    if (!isTauri) return mockBookApi.deleteBook(bookId);
    return safeInvoke<void>('delete_book', { bookId });
  },

  updateProgress: (
    bookId: string,
    progress: number,
    currentLocation?: string,
    currentPage?: number
  ): Promise<void> => {
    if (!isTauri) return mockBookApi.updateProgress(bookId, progress, currentLocation, currentPage);
    return safeInvoke<void>('update_reading_progress', {
      bookId,
      progress,
      currentLocation,
      currentPage,
    });
  },

  getToc: (filePath: string): Promise<TocItem[]> => {
    if (!isTauri) return mockBookApi.getToc(filePath);
    return safeInvoke<TocItem[]>('get_toc', { filePath });
  },
};

export const bookmarkApi = {
  getBookmarks: (bookId: string): Promise<Bookmark[]> => {
    if (!isTauri) return mockBookmarkApi.getBookmarks(bookId);
    return safeInvoke<Bookmark[]>('get_bookmarks', { bookId });
  },

  addBookmark: (bookmark: Bookmark): Promise<Bookmark> => {
    if (!isTauri) return mockBookmarkApi.addBookmark(bookmark);
    return safeInvoke<Bookmark>('add_bookmark', { bookmark });
  },

  deleteBookmark: (bookmarkId: string): Promise<void> => {
    if (!isTauri) return mockBookmarkApi.deleteBookmark(bookmarkId);
    return safeInvoke<void>('delete_bookmark', { bookmarkId });
  },
};

export const highlightApi = {
  getHighlights: (bookId: string): Promise<Highlight[]> => {
    if (!isTauri) return mockHighlightApi.getHighlights(bookId);
    return safeInvoke<Highlight[]>('get_highlights', { bookId });
  },

  addHighlight: (highlight: Highlight): Promise<Highlight> => {
    if (!isTauri) return mockHighlightApi.addHighlight(highlight);
    return safeInvoke<Highlight>('add_highlight', { highlight });
  },

  updateHighlightNote: (highlightId: string, note?: string): Promise<void> => {
    if (!isTauri) return mockHighlightApi.updateHighlightNote(highlightId, note);
    return safeInvoke<void>('update_highlight_note', { highlightId, note });
  },

  deleteHighlight: (highlightId: string): Promise<void> => {
    if (!isTauri) return mockHighlightApi.deleteHighlight(highlightId);
    return safeInvoke<void>('delete_highlight', { highlightId });
  },
};

export const noteApi = {
  getNotes: (bookId: string): Promise<Note[]> => {
    if (!isTauri) return mockNoteApi.getNotes(bookId);
    return safeInvoke<Note[]>('get_notes', { bookId });
  },

  addNote: (note: Note): Promise<Note> => {
    if (!isTauri) return mockNoteApi.addNote(note);
    return safeInvoke<Note>('add_note', { note });
  },

  updateNote: (noteId: string, content: string): Promise<void> => {
    if (!isTauri) return mockNoteApi.updateNote(noteId, content);
    return safeInvoke<void>('update_note', { noteId, content });
  },

  deleteNote: (noteId: string): Promise<void> => {
    if (!isTauri) return mockNoteApi.deleteNote(noteId);
    return safeInvoke<void>('delete_note', { noteId });
  },
};

export const searchApi = {
  searchBook: (bookId: string, query: string): Promise<SearchResult[]> => {
    if (!isTauri) return mockSearchApi.searchBook(bookId, query);
    return safeInvoke<SearchResult[]>('search_book', { bookId, query });
  },
};

export const exportApi = {
  exportHighlightsMarkdown: (bookId?: string): Promise<string> => {
    if (!isTauri) return mockExportApi.exportHighlightsMarkdown(bookId);
    return safeInvoke<string>('export_highlights_markdown', { bookId });
  },
};

export const dialogApi = {
  openFileDialog: async (): Promise<string | null> => {
    if (!isTauri) return mockDialogApi.openFileDialog();
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
    if (!isTauri) return mockDialogApi.saveFileDialog(defaultName);
    const { save } = await import('@tauri-apps/api/dialog');
    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });
    return path as string | null;
  },
};
