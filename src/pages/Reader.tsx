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
  const {
    books,
    bookmarks,
    highlights,
    theme,
    readerSettings,
    isLoadingBookmarks,
    isLoadingHighlights,
    updateBookProgress,
    fetchBookmarks,
    fetchHighlights,
    addBookmark,
    removeBookmark,
    addHighlight,
  } = useLibraryStore();

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

  const bookBookmarks = bookmarks.filter((bm) => bm.bookId === bookId);
  const bookHighlights = highlights.filter((hl) => hl.bookId === bookId);

  useEffect(() => {
    if (book) {
      setProgress(book.progress);
    }
  }, [book]);

  useEffect(() => {
    if (bookId) {
      fetchBookmarks(bookId);
      fetchHighlights(bookId);
    }
  }, [bookId, fetchBookmarks, fetchHighlights]);

  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (bookId && bookBookmarks.length > 0) {
      const bookmarked = bookBookmarks.some(
        (bm) => bm.location === Math.floor(progress)
      );
      setIsBookmarked(bookmarked);
    } else {
      setIsBookmarked(false);
    }
  }, [bookId, progress, bookBookmarks, book]);

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

  const handleToggleBookmark = async () => {
    if (!bookId || !book) return;

    try {
      if (isBookmarked) {
        const bookmark = bookBookmarks.find((bm) => bm.location === Math.floor(progress));
        if (bookmark) {
          await removeBookmark(bookmark.id);
          setIsBookmarked(false);
        }
      } else {
        const bookmarkData: Omit<Bookmark, 'id' | 'createdAt'> = {
          bookId,
          cfi: `epubcfi(/6/${currentChapter + 10}!/4/2/2[page${Math.floor(progress)}]/2)`,
          chapter: mockChapters[currentChapter]?.title || '',
          location: Math.floor(progress),
          text: '书签位置',
        };
        await addBookmark(bookmarkData);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('书签操作失败:', error);
    }
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

  const handleHighlight = async (color: string) => {
    if (!bookId || !selectedText) return;

    try {
      const highlightData: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'> = {
        bookId,
        cfi: `epubcfi(/6/${currentChapter + 10}!/4/2/2[hl${Date.now()}]/2)`,
        color,
        text: selectedText,
        chapter: mockChapters[currentChapter]?.title || '',
      };
      await addHighlight(highlightData);
      setShowHighlightMenu(false);
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('添加高亮失败:', error);
    }
  };

  useEffect(() => {
    if (bookId && book) {
      updateBookProgress(bookId, {
        bookId,
        cfi: `epubcfi(/6/${currentChapter + 10}!/4/2/2[page${Math.floor(progress)}]/2)`,
        location: Math.floor(progress),
        percentage: progress,
        chapter: mockChapters[currentChapter]?.title || '',
        updatedAt: Date.now(),
      });
    }
  }, [progress, currentChapter, bookId, book, updateBookProgress]);

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
  }, [handlePrevChapter, handleNextChapter, handleToggleBookmark, showSidebar, showSettings]);

  const handleSidebarTabChange = (tab: 'toc' | 'bookmarks' | 'highlights' | 'search') => {
    setSidebarTab(tab);
    if (tab === 'bookmarks' && bookId) {
      fetchBookmarks(bookId);
    } else if (tab === 'highlights' && bookId) {
      fetchHighlights(bookId);
    }
  };

  if (!book && books.length > 0) {
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
            <h1 className="font-medium text-sm">{book?.title || '加载中...'}</h1>
            <p className="text-xs" style={{ color: 'var(--secondary-color)' }}>
              {book?.author || ''} · {mockChapters[currentChapter]?.title}
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
            onTabChange={handleSidebarTabChange}
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
            {!book ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin text-3xl mb-4">⏳</div>
                <p style={{ color: 'var(--secondary-color)' }}>加载书籍中...</p>
              </div>
            ) : (
              <div
                className="max-w-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: mockReadingContent }}
              />
            )}

            {readerSettings.layout === 'paginated' && book && (
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
