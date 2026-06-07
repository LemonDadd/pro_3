export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  description?: string;
  format: 'epub' | 'mobi' | 'pdf';
  filePath: string;
  fileSize: number;
  progress: number;
  currentLocation?: string;
  totalPages?: number;
  currentPage?: number;
  addedAt: number;
  lastReadAt?: number;
  language?: string;
  publisher?: string;
  pubDate?: string;
  categories?: string[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  cfi: string;
  chapter: string;
  location: number;
  text: string;
  createdAt: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  cfi: string;
  color: string;
  text: string;
  note?: string;
  chapter: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  bookId: string;
  highlightId?: string;
  cfi?: string;
  content: string;
  chapter: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingProgress {
  bookId: string;
  cfi: string;
  location: number;
  percentage: number;
  chapter: string;
  updatedAt: number;
}

export interface SearchResult {
  bookId: string;
  chapter: string;
  cfi: string;
  excerpt: string;
  matchIndex: number;
}

export interface ReadingStats {
  bookId: string;
  totalReadingTime: number;
  pagesRead: number;
  lastReadAt: number;
  sessions: ReadingSession[];
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: number;
  endTime: number;
  pagesRead: number;
}

export interface ThemeSettings {
  mode: 'light' | 'sepia' | 'dark';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
}

export interface ReaderSettings {
  layout: 'paginated' | 'scrolled';
  direction: 'ltr' | 'rtl';
  spread: 'none' | 'auto' | 'always';
  minSpreadWidth: number;
}

export interface TocItem {
  id: string;
  title: string;
  href: string;
  level: number;
}
