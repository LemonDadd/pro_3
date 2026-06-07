import { useState } from 'react';
import useLibraryStore from '../store/useLibraryStore';
import { mockChapters, generateMockSearchResults } from '../utils/mockData';

interface ReaderSidebarProps {
  bookId: string;
  activeTab: 'toc' | 'bookmarks' | 'highlights' | 'search';
  onTabChange: (tab: 'toc' | 'bookmarks' | 'highlights' | 'search') => void;
  onChapterSelect: (index: number) => void;
  onClose: () => void;
}

export default function ReaderSidebar({
  bookId,
  activeTab,
  onTabChange,
  onChapterSelect,
  onClose,
}: ReaderSidebarProps) {
  const { getBookmarks, getHighlights, removeBookmark, removeHighlight, books } = useLibraryStore();
  const bookmarks = getBookmarks(bookId);
  const highlights = getHighlights(bookId);
  const book = books.find((b) => b.id === bookId);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const tabs = [
    { id: 'toc', label: '目录', icon: '📑' },
    { id: 'bookmarks', label: '书签', icon: '🔖' },
    { id: 'highlights', label: '高亮', icon: '🖍️' },
    { id: 'search', label: '搜索', icon: '🔍' },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const results = generateMockSearchResults(bookId, searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  };

  return (
    <aside
      className="w-72 border-r flex flex-col"
      style={{ borderColor: 'rgba(128,128,128,0.2)', backgroundColor: 'var(--bg-color)' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          style={{ color: 'var(--secondary-color)' }}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'toc' && (
          <div className="py-2">
            {book && (
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
                <h3 className="font-medium text-sm">{book.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>
                  {book.author}
                </p>
              </div>
            )}
            <nav className="py-2">
              {mockChapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => onChapterSelect(index)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    chapter.level === 2 ? 'pl-8 text-xs' : ''
                  }`}
                >
                  {chapter.title}
                </button>
              ))}
            </nav>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="py-2">
            {bookmarks.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--secondary-color)' }}>
                暂无书签
                <p className="mt-1 text-xs">按 B 键添加书签</p>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800 group"
                  style={{ borderColor: 'rgba(128,128,128,0.1)' }}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm flex-1 line-clamp-2">{bm.chapter}</p>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 text-xs"
                    >
                      删除
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>
                    第 {bm.location} 位置 · {new Date(bm.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'highlights' && (
          <div className="py-2">
            {highlights.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--secondary-color)' }}>
                暂无高亮
                <p className="mt-1 text-xs">选中文本添加高亮</p>
              </div>
            ) : (
              highlights.map((hl) => (
                <div
                  key={hl.id}
                  className="px-4 py-3 border-b group"
                  style={{
                    borderColor: 'rgba(128,128,128,0.1)',
                    backgroundColor: hl.color + '20',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-3 h-3 rounded-full mr-2 mt-1 flex-shrink-0"
                      style={{ backgroundColor: hl.color }}
                    />
                    <p className="text-sm flex-1">{hl.text}</p>
                    <button
                      onClick={() => removeHighlight(hl.id)}
                      className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 text-xs"
                    >
                      删除
                    </button>
                  </div>
                  {hl.note && (
                    <p className="text-xs mt-2 ml-5 p-2 rounded bg-black/5" style={{ color: 'var(--secondary-color)' }}>
                      💬 {hl.note}
                    </p>
                  )}
                  <p className="text-xs mt-2 ml-5" style={{ color: 'var(--secondary-color)' }}>
                    {hl.chapter}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-3">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索全书..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-2 pr-8 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--bg-color)',
                  borderColor: 'rgba(128,128,128,0.3)',
                  color: 'var(--text-color)',
                }}
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              >
                🔍
              </button>
            </div>

            <div className="mt-2 text-xs" style={{ color: 'var(--secondary-color)' }}>
              搜索范围：
              <button className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-600">全书</button>
              <button className="ml-1 px-2 py-0.5 rounded hover:bg-gray-100">当前章节</button>
            </div>

            {searching ? (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--secondary-color)' }}>
                搜索中...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs" style={{ color: 'var(--secondary-color)' }}>
                  找到 {searchResults.length} 个结果
                </p>
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    style={{ borderColor: 'rgba(128,128,128,0.2)' }}
                    onClick={() => onChapterSelect(idx % mockChapters.length)}
                  >
                    <p className="text-xs font-medium mb-1">{result.chapter}</p>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: result.excerpt }} />
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--secondary-color)' }}>
                无匹配结果
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}
