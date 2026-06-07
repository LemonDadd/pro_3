import { generateMockBooks, generateMockBookmarks, generateMockHighlights, generateMockNotes, generateMockSearchResults } from './mockData';
import type { Book, Bookmark, Highlight, Note, SearchResult, TocItem } from '../types';

const mockBooksKey = 'mock-books';
const mockBookmarksKey = 'mock-bookmarks';
const mockHighlightsKey = 'mock-highlights';
const mockNotesKey = 'mock-notes';

function getMockBooks(): Book[] {
  const stored = localStorage.getItem(mockBooksKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  const books = generateMockBooks(5);
  localStorage.setItem(mockBooksKey, JSON.stringify(books));
  return books;
}

function saveMockBooks(books: Book[]) {
  localStorage.setItem(mockBooksKey, JSON.stringify(books));
}

function getMockBookmarks(bookId: string): Bookmark[] {
  const stored = localStorage.getItem(mockBookmarksKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Bookmark[];
      return all.filter((b) => b.bookId === bookId);
    } catch {
      // ignore
    }
  }
  const bookmarks = generateMockBookmarks(bookId);
  const all = bookmarks;
  localStorage.setItem(mockBookmarksKey, JSON.stringify(all));
  return bookmarks;
}

function saveMockBookmark(bookmark: Bookmark) {
  const stored = localStorage.getItem(mockBookmarksKey);
  let all: Bookmark[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  all.push(bookmark);
  localStorage.setItem(mockBookmarksKey, JSON.stringify(all));
}

function removeMockBookmark(bookmarkId: string) {
  const stored = localStorage.getItem(mockBookmarksKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Bookmark[];
      const filtered = all.filter((b) => b.id !== bookmarkId);
      localStorage.setItem(mockBookmarksKey, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }
}

function getMockHighlights(bookId: string): Highlight[] {
  const stored = localStorage.getItem(mockHighlightsKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Highlight[];
      return all.filter((h) => h.bookId === bookId);
    } catch {
      // ignore
    }
  }
  const highlights = generateMockHighlights(bookId);
  localStorage.setItem(mockHighlightsKey, JSON.stringify(highlights));
  return highlights;
}

function saveMockHighlight(highlight: Highlight) {
  const stored = localStorage.getItem(mockHighlightsKey);
  let all: Highlight[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  all.push(highlight);
  localStorage.setItem(mockHighlightsKey, JSON.stringify(all));
}

function updateMockHighlightNote(highlightId: string, note?: string) {
  const stored = localStorage.getItem(mockHighlightsKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Highlight[];
      const updated = all.map((h) =>
        h.id === highlightId ? { ...h, note, updatedAt: Date.now() } : h
      );
      localStorage.setItem(mockHighlightsKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

function removeMockHighlight(highlightId: string) {
  const stored = localStorage.getItem(mockHighlightsKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Highlight[];
      const filtered = all.filter((h) => h.id !== highlightId);
      localStorage.setItem(mockHighlightsKey, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }
}

function getMockNotes(bookId: string): Note[] {
  const stored = localStorage.getItem(mockNotesKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Note[];
      return all.filter((n) => n.bookId === bookId);
    } catch {
      // ignore
    }
  }
  const notes = generateMockNotes(bookId);
  localStorage.setItem(mockNotesKey, JSON.stringify(notes));
  return notes;
}

function saveMockNote(note: Note) {
  const stored = localStorage.getItem(mockNotesKey);
  let all: Note[] = [];
  if (stored) {
    try {
      all = JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  all.push(note);
  localStorage.setItem(mockNotesKey, JSON.stringify(all));
}

function updateMockNote(noteId: string, content: string) {
  const stored = localStorage.getItem(mockNotesKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Note[];
      const updated = all.map((n) =>
        n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
      );
      localStorage.setItem(mockNotesKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

function removeMockNote(noteId: string) {
  const stored = localStorage.getItem(mockNotesKey);
  if (stored) {
    try {
      const all = JSON.parse(stored) as Note[];
      const filtered = all.filter((n) => n.id !== noteId);
      localStorage.setItem(mockNotesKey, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }
}

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const mockBookApi = {
  getBooks: (): Promise<Book[]> => {
    return delay(getMockBooks());
  },

  getBook: (bookId: string): Promise<Book | null> => {
    const books = getMockBooks();
    const book = books.find((b) => b.id === bookId) || null;
    return delay(book);
  },

  importBook: (_filePath: string): Promise<Book> => {
    const books = getMockBooks();
    const newBook = generateMockBooks(1)[0];
    books.unshift(newBook);
    saveMockBooks(books);
    return delay(newBook, 800);
  },

  deleteBook: (bookId: string): Promise<void> => {
    const books = getMockBooks();
    const filtered = books.filter((b) => b.id !== bookId);
    saveMockBooks(filtered);
    return delay(undefined, 300);
  },

  updateProgress: (
    bookId: string,
    progress: number,
    currentLocation?: string,
    currentPage?: number
  ): Promise<void> => {
    const books = getMockBooks();
    const updated = books.map((b) =>
      b.id === bookId
        ? {
            ...b,
            progress,
            currentLocation,
            currentPage,
            lastReadAt: Date.now(),
          }
        : b
    );
    saveMockBooks(updated);
    return delay(undefined, 100);
  },

  getToc: (_filePath: string): Promise<TocItem[]> => {
    const chapters = [
      { id: 'chapter1', title: '第一章 序幕', href: 'chapter1.xhtml', level: 1 },
      { id: 'chapter2', title: '第二章 发展', href: 'chapter2.xhtml', level: 1 },
      { id: 'chapter3', title: '第三章 转折点', href: 'chapter3.xhtml', level: 1 },
      { id: 'chapter4', title: '第一节 细节', href: 'chapter4.xhtml', level: 2 },
      { id: 'chapter5', title: '第二节 深入', href: 'chapter5.xhtml', level: 2 },
      { id: 'chapter6', title: '第四章 高潮', href: 'chapter6.xhtml', level: 1 },
      { id: 'chapter7', title: '第五章 结局', href: 'chapter7.xhtml', level: 1 },
      { id: 'chapter8', title: '尾声', href: 'chapter8.xhtml', level: 1 },
    ];
    return delay(chapters);
  },
};

export const mockBookmarkApi = {
  getBookmarks: (bookId: string): Promise<Bookmark[]> => {
    return delay(getMockBookmarks(bookId));
  },

  addBookmark: (bookmark: Bookmark): Promise<Bookmark> => {
    saveMockBookmark(bookmark);
    return delay(bookmark);
  },

  deleteBookmark: (bookmarkId: string): Promise<void> => {
    removeMockBookmark(bookmarkId);
    return delay(undefined);
  },
};

export const mockHighlightApi = {
  getHighlights: (bookId: string): Promise<Highlight[]> => {
    return delay(getMockHighlights(bookId));
  },

  addHighlight: (highlight: Highlight): Promise<Highlight> => {
    saveMockHighlight(highlight);
    return delay(highlight);
  },

  updateHighlightNote: (highlightId: string, note?: string): Promise<void> => {
    updateMockHighlightNote(highlightId, note);
    return delay(undefined);
  },

  deleteHighlight: (highlightId: string): Promise<void> => {
    removeMockHighlight(highlightId);
    return delay(undefined);
  },
};

export const mockNoteApi = {
  getNotes: (bookId: string): Promise<Note[]> => {
    return delay(getMockNotes(bookId));
  },

  addNote: (note: Note): Promise<Note> => {
    saveMockNote(note);
    return delay(note);
  },

  updateNote: (noteId: string, content: string): Promise<void> => {
    updateMockNote(noteId, content);
    return delay(undefined);
  },

  deleteNote: (noteId: string): Promise<void> => {
    removeMockNote(noteId);
    return delay(undefined);
  },
};

export const mockSearchApi = {
  searchBook: (bookId: string, query: string): Promise<SearchResult[]> => {
    const results = generateMockSearchResults(bookId, query);
    return delay(results, 500);
  },
};

export const mockExportApi = {
  exportHighlightsMarkdown: (_bookId?: string): Promise<string> => {
    const markdown = `# 读书笔记导出

> 导出时间：${new Date().toLocaleString()}
> 共 3 条高亮

---

## 📖 示例书籍

**作者：** 示例作者

### 📑 第一章

> 这是一段被高亮的示例文字。

📝 **笔记：** 这里是笔记内容

<sub>📍 定位：\`epubcfi(/6/10!/4/2/2)\`</sub>

<sub>🕐 ${new Date().toLocaleString()}</sub>

---
`;
    return delay(markdown);
  },
};

export const mockDialogApi = {
  openFileDialog: async (): Promise<string | null> => {
    alert('Mock 模式：请选择真实的 EPUB 文件进行导入\n\n这是模拟环境，将生成一本示例书籍');
    return '/mock/path/book.epub';
  },

  saveFileDialog: async (defaultName: string): Promise<string | null> => {
    alert(`Mock 模式：将保存文件 ${defaultName}\n\n实际保存请在 Tauri 环境中使用`);
    return defaultName;
  },
};
