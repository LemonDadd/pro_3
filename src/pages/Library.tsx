import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import useLibraryStore from '../store/useLibraryStore';
import { generateMockBooks } from '../utils/mockData';
import type { Book } from '../types';

export default function Library() {
  const navigate = useNavigate();
  const { books, addBook, removeBook, isLoading, setLoading } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  const handleImportBook = async () => {
    setLoading(true);
    try {
      if (books.length === 0) {
        const mockBooks = generateMockBooks(5);
        mockBooks.forEach((book) => addBook(book));
      } else {
        const newBook = generateMockBooks(1)[0];
        addBook(newBook);
      }
    } catch (error) {
      console.error('导入失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这本书吗？')) {
      removeBook(bookId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的书架</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索书籍..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--bg-color)',
                borderColor: 'rgba(128,128,128,0.3)',
                color: 'var(--text-color)',
              }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ borderColor: 'rgba(128,128,128,0.3)' }}
          >
            {viewMode === 'grid' ? '☰' : '▦'}
          </button>

          <button
            onClick={handleImportBook}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <span>+</span>
            导入书籍
          </button>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-semibold mb-2">书架空空如也</h2>
          <p style={{ color: 'var(--secondary-color)' }} className="mb-6">
            点击上方按钮导入你的第一本书
          </p>
          <button
            onClick={handleImportBook}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            导入示例书籍
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onOpen={() => navigate(`/reader/${book.id}`)} onDelete={(e) => handleDeleteBook(book.id, e)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBooks.map((book) => (
            <BookListItem
              key={book.id}
              book={book}
              onOpen={() => navigate(`/reader/${book.id}`)}
              onDelete={(e) => handleDeleteBook(book.id, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookCard({ book, onOpen, onDelete }: { book: Book; onOpen: () => void; onDelete: (e: React.MouseEvent) => void }) {
  return (
    <div
      className="group cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative aspect-[3/4] rounded-lg shadow-md overflow-hidden mb-2 group-hover:shadow-lg transition-shadow">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            📕
          </div>
        )}

        {book.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
            <div className="h-full bg-blue-500" style={{ width: `${book.progress}%` }} />
          </div>
        )}

        <button
          onClick={onDelete}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm flex items-center justify-center"
        >
          ×
        </button>

        <div className="absolute top-2 left-2">
          <span className="px-1.5 py-0.5 text-xs bg-black/50 text-white rounded">
            {book.format.toUpperCase()}
          </span>
        </div>
      </div>

      <h3 className="font-medium text-sm truncate">{book.title}</h3>
      <p className="text-xs truncate" style={{ color: 'var(--secondary-color)' }}>
        {book.author}
      </p>
    </div>
  );
}

function BookListItem({ book, onOpen, onDelete }: { book: Book; onOpen: () => void; onDelete: (e: React.MouseEvent) => void }) {
  return (
    <div
      className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
      style={{ borderColor: 'rgba(128,128,128,0.2)' }}
      onClick={onOpen}
    >
      <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 mr-4">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            📕
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{book.title}</h3>
        <p className="text-sm truncate" style={{ color: 'var(--secondary-color)' }}>
          {book.author}
        </p>
        {book.progress > 0 && (
          <div className="mt-1 h-1 bg-gray-200 rounded-full w-32">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${book.progress}%` }} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4">
        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(128,128,128,0.1)' }}>
          {book.format.toUpperCase()}
        </span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500 transition-opacity"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
