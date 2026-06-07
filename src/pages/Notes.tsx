import { useMemo, useState } from 'react';
import useLibraryStore from '../store/useLibraryStore';
import { exportHighlightsToMarkdown } from '../utils/export';

export default function Notes() {
  const { books, highlights, bookmarks, notes, removeHighlight, removeBookmark, removeNote, updateHighlight } = useLibraryStore();
  const [activeTab, setActiveTab] = useState<'highlights' | 'bookmarks' | 'notes'>('highlights');
  const [selectedBookId, setSelectedBookId] = useState<string | 'all'>('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const filteredHighlights = useMemo(() => {
    if (selectedBookId === 'all') return highlights;
    return highlights.filter((h) => h.bookId === selectedBookId);
  }, [highlights, selectedBookId]);

  const filteredBookmarks = useMemo(() => {
    if (selectedBookId === 'all') return bookmarks;
    return bookmarks.filter((b) => b.bookId === selectedBookId);
  }, [bookmarks, selectedBookId]);

  const filteredNotes = useMemo(() => {
    if (selectedBookId === 'all') return notes;
    return notes.filter((n) => n.bookId === selectedBookId);
  }, [notes, selectedBookId]);

  const getBookTitle = (bookId: string) => {
    return books.find((b) => b.id === bookId)?.title || '未知书籍';
  };

  const handleExport = () => {
    const bookHighlights = selectedBookId === 'all' 
      ? highlights 
      : highlights.filter((h) => h.bookId === selectedBookId);
    
    const markdown = exportHighlightsToMarkdown(bookHighlights, books, getBookTitle);
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `highlights-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartEditNote = (highlightId: string, currentNote?: string) => {
    setEditingNote(highlightId);
    setEditContent(currentNote || '');
  };

  const handleSaveNote = (highlightId: string) => {
    updateHighlight(highlightId, { note: editContent });
    setEditingNote(null);
    setEditContent('');
  };

  const tabs = [
    { id: 'highlights', label: '高亮', count: filteredHighlights.length },
    { id: 'bookmarks', label: '书签', count: filteredBookmarks.length },
    { id: 'notes', label: '笔记', count: filteredNotes.length },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">笔记中心</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <span>📥</span>
          导出 Markdown
        </button>
      </div>

      <div className="flex gap-6">
        <aside className="w-56 flex-shrink-0">
          <div className="sticky top-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--secondary-color)' }}>
              筛选书籍
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedBookId('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedBookId === 'all'
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                全部书籍 ({highlights.length + bookmarks.length + notes.length})
              </button>
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBookId(book.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${
                    selectedBookId === book.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {book.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent hover:text-gray-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {activeTab === 'highlights' && (
            <div className="space-y-4">
              {filteredHighlights.length === 0 ? (
                <EmptyState message="暂无高亮" />
              ) : (
                filteredHighlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="p-4 rounded-lg border group"
                    style={{
                      borderColor: 'rgba(128,128,128,0.2)',
                      backgroundColor: hl.color + '15',
                      borderLeftColor: hl.color,
                      borderLeftWidth: '4px',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--secondary-color)' }}>
                        {getBookTitle(hl.bookId)} · {hl.chapter}
                      </span>
                      <button
                        onClick={() => removeHighlight(hl.id)}
                        className="text-red-500 text-xs opacity-0 group-hover:opacity-100"
                      >
                        删除
                      </button>
                    </div>
                    <p className="text-sm">{hl.text}</p>
                    
                    {editingNote === hl.id ? (
                      <div className="mt-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            borderColor: 'rgba(128,128,128,0.3)',
                            color: 'var(--text-color)',
                          }}
                          rows={3}
                          placeholder="添加笔记..."
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setEditingNote(null)}
                            className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                            style={{ borderColor: 'rgba(128,128,128,0.3)' }}
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleSaveNote(hl.id)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditNote(hl.id, hl.note)}
                        className="mt-2 text-xs text-blue-500 hover:underline"
                      >
                        {hl.note ? '📝 编辑笔记' : '+ 添加笔记'}
                      </button>
                    )}
                    
                    {hl.note && editingNote !== hl.id && (
                      <div className="mt-2 p-2 rounded text-sm" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                        💬 {hl.note}
                      </div>
                    )}

                    <p className="text-xs mt-3" style={{ color: 'var(--secondary-color)' }}>
                      {new Date(hl.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {filteredBookmarks.length === 0 ? (
                <EmptyState message="暂无书签" />
              ) : (
                filteredBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-4 rounded-lg border group hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ borderColor: 'rgba(128,128,128,0.2)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">🔖 {bm.chapter}</h4>
                        <p className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>
                          {getBookTitle(bm.bookId)} · 位置 {bm.location}
                        </p>
                      </div>
                      <button
                        onClick={() => removeBookmark(bm.id)}
                        className="text-red-500 text-xs opacity-0 group-hover:opacity-100"
                      >
                        删除
                      </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--secondary-color)' }}>
                      {new Date(bm.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3">
              {filteredNotes.length === 0 ? (
                <EmptyState message="暂无独立笔记" />
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border group"
                    style={{ borderColor: 'rgba(128,128,128,0.2)' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--secondary-color)' }}>
                        {getBookTitle(note.bookId)} · {note.chapter}
                      </span>
                      <button
                        onClick={() => removeNote(note.id)}
                        className="text-red-500 text-xs opacity-0 group-hover:opacity-100"
                      >
                        删除
                      </button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs mt-3" style={{ color: 'var(--secondary-color)' }}>
                      {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <div className="text-4xl mb-3">📝</div>
      <p style={{ color: 'var(--secondary-color)' }}>{message}</p>
    </div>
  );
}
