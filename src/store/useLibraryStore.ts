import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  bookApi,
  bookmarkApi,
  highlightApi,
  noteApi,
  isTauri,
} from '../api/tauri';
import type {
  Book,
  Bookmark,
  Highlight,
  Note,
  ThemeSettings,
  ReaderSettings,
  ReadingProgress,
} from '../types';

interface LibraryState {
  books: Book[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];
  theme: ThemeSettings;
  readerSettings: ReaderSettings;
  isLoading: boolean;
  isLoadingBookmarks: boolean;
  isLoadingHighlights: boolean;
  isLoadingNotes: boolean;
  error: string | null;

  fetchBooks: () => Promise<void>;
  addBook: (filePath: string) => Promise<Book>;
  removeBook: (bookId: string) => Promise<void>;
  updateBookProgress: (
    bookId: string,
    progress: ReadingProgress
  ) => Promise<void>;

  fetchBookmarks: (bookId: string) => Promise<void>;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => Promise<Bookmark>;
  removeBookmark: (bookmarkId: string) => Promise<void>;

  fetchHighlights: (bookId: string) => Promise<void>;
  addHighlight: (
    highlight: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Highlight>;
  updateHighlightNote: (highlightId: string, note?: string) => Promise<void>;
  removeHighlight: (highlightId: string) => Promise<void>;

  fetchNotes: (bookId: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  removeNote: (noteId: string) => Promise<void>;

  setTheme: (theme: Partial<ThemeSettings>) => void;
  setReaderSettings: (settings: Partial<ReaderSettings>) => void;

  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultTheme: ThemeSettings = {
  mode: 'light',
  fontSize: 16,
  fontFamily: 'Georgia, serif',
  lineHeight: 1.6,
  margin: 40,
};

const defaultReaderSettings: ReaderSettings = {
  layout: 'paginated',
  direction: 'ltr',
  spread: 'auto',
  minSpreadWidth: 800,
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: [],
      bookmarks: [],
      highlights: [],
      notes: [],
      theme: defaultTheme,
      readerSettings: defaultReaderSettings,
      isLoading: false,
      isLoadingBookmarks: false,
      isLoadingHighlights: false,
      isLoadingNotes: false,
      error: null,

      fetchBooks: async () => {
        set({ isLoading: true, error: null });
        try {
          const books = await bookApi.getBooks();
          set({ books, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || '加载书籍失败', isLoading: false });
          console.error('Failed to fetch books:', err);
        }
      },

      addBook: async (filePath: string) => {
        set({ isLoading: true, error: null });
        try {
          const book = await bookApi.importBook(filePath);
          set((state) => ({
            books: [book, ...state.books],
            isLoading: false,
          }));
          return book;
        } catch (err: any) {
          set({ error: err.message || '导入书籍失败', isLoading: false });
          console.error('Failed to add book:', err);
          throw err;
        }
      },

      removeBook: async (bookId: string) => {
        set({ error: null });
        try {
          await bookApi.deleteBook(bookId);
          set((state) => ({
            books: state.books.filter((b) => b.id !== bookId),
            bookmarks: state.bookmarks.filter((b) => b.bookId !== bookId),
            highlights: state.highlights.filter((h) => h.bookId !== bookId),
            notes: state.notes.filter((n) => n.bookId !== bookId),
          }));
        } catch (err: any) {
          set({ error: err.message || '删除书籍失败' });
          console.error('Failed to remove book:', err);
          throw err;
        }
      },

      updateBookProgress: async (bookId: string, progress: ReadingProgress) => {
        try {
          await bookApi.updateProgress(
            bookId,
            progress.percentage,
            progress.cfi,
            progress.location
          );
          set((state) => ({
            books: state.books.map((b) =>
              b.id === bookId
                ? {
                    ...b,
                    progress: progress.percentage,
                    currentLocation: progress.cfi,
                    currentPage: progress.location,
                    lastReadAt: Date.now(),
                  }
                : b
            ),
          }));
        } catch (err: any) {
          console.error('Failed to update progress:', err);
        }
      },

      fetchBookmarks: async (bookId: string) => {
        set({ isLoadingBookmarks: true, error: null });
        try {
          const bookmarks = await bookmarkApi.getBookmarks(bookId);
          set((state) => {
            const otherBookmarks = state.bookmarks.filter(
              (b) => b.bookId !== bookId
            );
            return {
              bookmarks: [...otherBookmarks, ...bookmarks],
              isLoadingBookmarks: false,
            };
          });
        } catch (err: any) {
          set({
            error: err.message || '加载书签失败',
            isLoadingBookmarks: false,
          });
          console.error('Failed to fetch bookmarks:', err);
        }
      },

      addBookmark: async (bookmarkData) => {
        const newBookmark: Bookmark = {
          ...bookmarkData,
          id: generateId(),
          createdAt: Date.now(),
        } as Bookmark;

        try {
          const saved = await bookmarkApi.addBookmark(newBookmark);
          set((state) => ({
            bookmarks: [...state.bookmarks, saved],
          }));
          return saved;
        } catch (err: any) {
          set({ error: err.message || '添加书签失败' });
          console.error('Failed to add bookmark:', err);
          throw err;
        }
      },

      removeBookmark: async (bookmarkId: string) => {
        try {
          await bookmarkApi.deleteBookmark(bookmarkId);
          set((state) => ({
            bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
          }));
        } catch (err: any) {
          set({ error: err.message || '删除书签失败' });
          console.error('Failed to remove bookmark:', err);
          throw err;
        }
      },

      fetchHighlights: async (bookId: string) => {
        set({ isLoadingHighlights: true, error: null });
        try {
          const highlights = await highlightApi.getHighlights(bookId);
          set((state) => {
            const otherHighlights = state.highlights.filter(
              (h) => h.bookId !== bookId
            );
            return {
              highlights: [...otherHighlights, ...highlights],
              isLoadingHighlights: false,
            };
          });
        } catch (err: any) {
          set({
            error: err.message || '加载高亮失败',
            isLoadingHighlights: false,
          });
          console.error('Failed to fetch highlights:', err);
        }
      },

      addHighlight: async (highlightData) => {
        const now = Date.now();
        const newHighlight: Highlight = {
          ...highlightData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        } as Highlight;

        try {
          const saved = await highlightApi.addHighlight(newHighlight);
          set((state) => ({
            highlights: [...state.highlights, saved],
          }));
          return saved;
        } catch (err: any) {
          set({ error: err.message || '添加高亮失败' });
          console.error('Failed to add highlight:', err);
          throw err;
        }
      },

      updateHighlightNote: async (highlightId: string, note?: string) => {
        try {
          await highlightApi.updateHighlightNote(highlightId, note);
          set((state) => ({
            highlights: state.highlights.map((h) =>
              h.id === highlightId
                ? { ...h, note, updatedAt: Date.now() }
                : h
            ),
          }));
        } catch (err: any) {
          set({ error: err.message || '更新笔记失败' });
          console.error('Failed to update highlight note:', err);
          throw err;
        }
      },

      removeHighlight: async (highlightId: string) => {
        try {
          await highlightApi.deleteHighlight(highlightId);
          set((state) => ({
            highlights: state.highlights.filter((h) => h.id !== highlightId),
          }));
        } catch (err: any) {
          set({ error: err.message || '删除高亮失败' });
          console.error('Failed to remove highlight:', err);
          throw err;
        }
      },

      fetchNotes: async (bookId: string) => {
        set({ isLoadingNotes: true, error: null });
        try {
          const notes = await noteApi.getNotes(bookId);
          set((state) => {
            const otherNotes = state.notes.filter((n) => n.bookId !== bookId);
            return {
              notes: [...otherNotes, ...notes],
              isLoadingNotes: false,
            };
          });
        } catch (err: any) {
          set({
            error: err.message || '加载笔记失败',
            isLoadingNotes: false,
          });
          console.error('Failed to fetch notes:', err);
        }
      },

      addNote: async (noteData) => {
        const now = Date.now();
        const newNote: Note = {
          ...noteData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        } as Note;

        try {
          const saved = await noteApi.addNote(newNote);
          set((state) => ({
            notes: [...state.notes, saved],
          }));
          return saved;
        } catch (err: any) {
          set({ error: err.message || '添加笔记失败' });
          console.error('Failed to add note:', err);
          throw err;
        }
      },

      updateNote: async (noteId: string, content: string) => {
        try {
          await noteApi.updateNote(noteId, content);
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
            ),
          }));
        } catch (err: any) {
          set({ error: err.message || '更新笔记失败' });
          console.error('Failed to update note:', err);
          throw err;
        }
      },

      removeNote: async (noteId: string) => {
        try {
          await noteApi.deleteNote(noteId);
          set((state) => ({
            notes: state.notes.filter((n) => n.id !== noteId),
          }));
        } catch (err: any) {
          set({ error: err.message || '删除笔记失败' });
          console.error('Failed to remove note:', err);
          throw err;
        }
      },

      setTheme: (theme) =>
        set((state) => ({ theme: { ...state.theme, ...theme } })),
      setReaderSettings: (settings) =>
        set((state) => ({
          readerSettings: { ...state.readerSettings, ...settings },
        })),

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ebook-reader-storage',
      partialize: (state) => ({
        theme: state.theme,
        readerSettings: state.readerSettings,
      }),
    }
  )
);

export default useLibraryStore;
