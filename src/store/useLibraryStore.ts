import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Bookmark, Highlight, Note, ThemeSettings, ReaderSettings, ReadingProgress } from '../types';

interface LibraryState {
  books: Book[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];
  theme: ThemeSettings;
  readerSettings: ReaderSettings;
  isLoading: boolean;
  error: string | null;

  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  updateBookProgress: (bookId: string, progress: ReadingProgress) => void;

  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookmarkId: string) => void;
  getBookmarks: (bookId: string) => Bookmark[];

  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (highlightId: string) => void;
  updateHighlight: (highlightId: string, updates: Partial<Highlight>) => void;
  getHighlights: (bookId: string) => Highlight[];

  addNote: (note: Note) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  removeNote: (noteId: string) => void;
  getNotes: (bookId: string) => Note[];

  setTheme: (theme: Partial<ThemeSettings>) => void;
  setReaderSettings: (settings: Partial<ReaderSettings>) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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
      error: null,

      setBooks: (books) => set({ books }),
      addBook: (book) => set((state) => ({ books: [...state.books, book] })),
      removeBook: (bookId) =>
        set((state) => ({
          books: state.books.filter((b) => b.id !== bookId),
          bookmarks: state.bookmarks.filter((b) => b.bookId !== bookId),
          highlights: state.highlights.filter((h) => h.bookId !== bookId),
          notes: state.notes.filter((n) => n.bookId !== bookId),
        })),
      updateBookProgress: (bookId, progress) =>
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
        })),

      addBookmark: (bookmark) =>
        set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
      removeBookmark: (bookmarkId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
        })),
      getBookmarks: (bookId) =>
        get().bookmarks.filter((b) => b.bookId === bookId),

      addHighlight: (highlight) =>
        set((state) => ({ highlights: [...state.highlights, highlight] })),
      removeHighlight: (highlightId) =>
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== highlightId),
        })),
      updateHighlight: (highlightId, updates) =>
        set((state) => ({
          highlights: state.highlights.map((h) =>
            h.id === highlightId ? { ...h, ...updates, updatedAt: Date.now() } : h
          ),
        })),
      getHighlights: (bookId) =>
        get().highlights.filter((h) => h.bookId === bookId),

      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (noteId, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId ? { ...n, ...updates, updatedAt: Date.now() } : n
          ),
        })),
      removeNote: (noteId) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
        })),
      getNotes: (bookId) => get().notes.filter((n) => n.bookId === bookId),

      setTheme: (theme) =>
        set((state) => ({ theme: { ...state.theme, ...theme } })),
      setReaderSettings: (settings) =>
        set((state) => ({
          readerSettings: { ...state.readerSettings, ...settings },
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
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
