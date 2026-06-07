import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import useLibraryStore from '../store/useLibraryStore';
import { mockChapters, mockReadingContent } from '../utils/mockData';
import ReaderSidebar from '../components/ReaderSidebar';
import ReaderSettings from '../components/ReaderSettings';
import type { Bookmark, Highlight } from '../types';

export default function Reader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books, theme, readerSettings, updateBookProgress, getBookmarks, addBookmark, getHighlights } = useLibraryStore();

  const [currentChapter, setCurrentChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'bookmarks' | 'highlights' | 'search'>('toc');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightMenuPos, setHighlightMenuPos] = useState({ x: 0, y: 0 });
  const [readingTime, setReadingTime] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const book = books.find((b) => b.id === bookId);

  useEffect(() => {
    if (book) {
      setProgress(book.progress);
    }
  }, [book]);

  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (bookId && book) {
      const bookmarked = getBookmarks(bookId).some(
        (bm) => bm.location === Math.floor(progress)
      );
      setIsBookmarked(bookmarked);
    }
  }, [bookId, progress, getBookmarks, book]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevChapter = useCallback(() => {
    setCurrentChapter((prev) => Math.max(0, prev - 1));
    setProgress(Math.max(0, progress - 10));
  }, [progress]);

  const handleNextChapter = useCallback(() => {
    setCurrentChapter((prev) => Math.min(mockChapters.length - 1, prev + 1));
    setProgress(Math.min(100, progress + 10));
  }, [progress]);

  const handleToggleBookmark = () => {
    if (!bookId || !book) return;

    if (isBookmarked) {
      const bookmarks = getBookmarks(bookId);
      const bookmark = bookmarks.find((bm) => bm.location === Math.floor(progress));
      if (bookmark) {
        useLibraryStore.getState().removeBookmark(bookmark.id);
      }
    } else {
      const newBookmark: Bookmark = {
        id: Math.random().toString(36).substring(2, 15),
        bookId,
        cfi: `epubcfi(/6/${currentChapter + 10}!/4/2/2[page${Math.floor(progress)}]/2)`,
        chapter: mockChapters[currentChapter]?.title || '',
        location: Math.floor(progress),
        text: '书签位置',
        createdAt: Date.now(),
      };
      addBookmark(newBookmark);
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setHighlightMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
      setShowHighlightMenu(true);
    } else {
      setShowHighlightMenu(false);
    }
  };

  const handleHighlight = (color: string) => {
    if (!bookId || !selectedText) return;

    const newHighlight: Highlight = {
      id: Math.random().toString(36).substring(2, 15),
      bookId,
      cfi: `epubcfi(/6/${currentChapter + 10}!/4/2/2[hl${Date.now()}]/2)`,
      color,
      text: selectedText,
      chapter: mockChapters[currentChapter]?.title || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    useLibraryStore.getState().addHighlight(newHighlight);
    setShowHighlightMenu(false);
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    if (bookId) {
      updateBookProgress(bookId, {
        bookId,
        cfi: `epubcfi(/6/${currentChapter + 10}!/4/2/2[page${Math.floor(progress)}]/2)`,
        location: Math.floor(progress),
        percentage: progress,
        chapter: mockChapters[currentChapter]?.title || '',
        updatedAt: Date.now(),
      });
    }
  }, [progress, currentChapter, bookId, updateBookProgress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevChapter();
      if (e.key === 'ArrowRight') handleNextChapter();
      if (e.key === 'b' || e.key === 'B') handleToggleBookmark();
      if (e.key === 'Escape') {
        if (showSidebar) setShowSidebar(false);
        if (showSettings) setShowSettings(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevChapter, handleNextChapter, showSidebar, showSettings]);

  if (!book) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="mb-4">书籍不存在</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            返回书架
          </button>
        </div>
      </div>
    );
  }

  const themeClass = `theme-${theme.mode}`;

  return (
    <div className={`h-full flex flex-col ${themeClass}`} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <header className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            style={{ color: 'var(--secondary-color)' }}
          >
            ←
          </button>
          <div>
            <h1 className="font-medium text-sm">{book.title}</h1>
            <p className="text-xs" style={{ color: 'var(--secondary-color)' }}>
              {book.author} · {mockChapters[currentChapter]?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${showSidebar ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            title="目录"
          >
            ☰
          </button>
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isBookmarked ? 'text-yellow-500' : ''}`}
            title="书签 (B)"
          >
            {isBookmarked ? '⭐' : '☆'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
            title="设置"
          >
            ⚙️
          </button>
          <span className="ml-2 text-xs" style={{ color: 'var(--secondary-color)' }}>
            阅读 {formatTime(readingTime)}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <ReaderSidebar
            bookId={bookId!}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            onChapterSelect={(index) => {
              setCurrentChapter(index);
              setProgress((index / mockChapters.length) * 100);
            }}
            onClose={() => setShowSidebar(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={contentRef}
            className="flex-1 overflow-auto"
            style={{
              padding: `${theme.margin}px`,
              fontFamily: theme.fontFamily,
              fontSize: `${theme.fontSize}px`,
              lineHeight: theme.lineHeight,
            }}
            onMouseUp={handleTextSelect}
            onClick={() => setShowHighlightMenu(false)}
          >
            <div
              className="max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: mockReadingContent }}
            />

            {readerSettings.layout === 'paginated' && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handlePrevChapter}
                  disabled={currentChapter === 0}
                  className="px-4 py-2 rounded border disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ borderColor: 'rgba(128,128,128,0.3)' }}
                >
                  上一章
                </button>
                <button
                  onClick={handleNextChapter}
                  disabled={currentChapter === mockChapters.length - 1}
                  className="px-4 py-2 rounded border disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ borderColor: 'rgba(128,128,128,0.3)' }}
                >
                  下一章
                </button>
              </div>
            )}
          </div>
        </div>

        {showSettings && (
          <ReaderSettings onClose={() => setShowSettings(false)} />
        )}
      </div>

      <footer className="px-4 py-2 border-t" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
        <div className="flex items-center gap-4">
          <span className="text-xs w-16" style={{ color: 'var(--secondary-color)' }}>
            {Math.floor(progress)}%
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-color) ${progress}%, rgba(128,128,128,0.3) ${progress}%)`,
            }}
          />
          <span className="text-xs w-24 text-right" style={{ color: 'var(--secondary-color)' }}>
            第 {currentChapter + 1} / {mockChapters.length} 章
          </span>
        </div>
      </footer>

      {showHighlightMenu && (
        <div
          className="fixed z-50 flex gap-1 p-1 rounded-lg shadow-lg border"
          style={{
            left: highlightMenuPos.x,
            top: highlightMenuPos.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'var(--bg-color)',
            borderColor: 'rgba(128,128,128,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff'].map((color) => (
            <button
              key={color}
              onClick={() => handleHighlight(color)}
              className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
              style={{ backgroundColor: color, borderColor: 'rgba(128,128,128,0.3)' }}
            />
          ))}
          <div className="w-px bg-gray-300 mx-1" />
          <button
            onClick={() => {
              setShowHighlightMenu(false);
              setSidebarTab('highlights');
              setShowSidebar(true);
            }}
            className="px-2 text-xs"
            style={{ color: 'var(--secondary-color)' }}
          >
            笔记
          </button>
        </div>
      )}
    </div>
  );
}
