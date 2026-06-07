import { useMemo } from 'react';
import useLibraryStore from '../store/useLibraryStore';

export default function Stats() {
  const { books, highlights, bookmarks } = useLibraryStore();

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const readingBooks = books.filter((b) => b.progress > 0 && b.progress < 100).length;
    const finishedBooks = books.filter((b) => b.progress === 100).length;
    const totalHighlights = highlights.length;
    const totalBookmarks = bookmarks.length;

    const totalProgress = books.reduce((sum, b) => sum + b.progress, 0);
    const avgProgress = totalBooks > 0 ? totalProgress / totalBooks : 0;

    const recentlyRead = [...books]
      .filter((b) => b.lastReadAt)
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
      .slice(0, 5);

    return {
      totalBooks,
      readingBooks,
      finishedBooks,
      totalHighlights,
      totalBookmarks,
      avgProgress,
      recentlyRead,
    };
  }, [books, highlights, bookmarks]);

  const statCards = [
    { label: '总书籍', value: stats.totalBooks, icon: '📚', color: 'bg-blue-500' },
    { label: '正在读', value: stats.readingBooks, icon: '📖', color: 'bg-green-500' },
    { label: '已完成', value: stats.finishedBooks, icon: '✅', color: 'bg-purple-500' },
    { label: '高亮', value: stats.totalHighlights, icon: '🖍️', color: 'bg-yellow-500' },
    { label: '书签', value: stats.totalBookmarks, icon: '🔖', color: 'bg-red-500' },
    { label: '平均进度', value: `${Math.floor(stats.avgProgress)}%`, icon: '📊', color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">阅读统计</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border"
            style={{ borderColor: 'rgba(128,128,128,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-xl`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--secondary-color)' }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-6 rounded-xl border"
          style={{ borderColor: 'rgba(128,128,128,0.2)' }}
        >
          <h2 className="font-semibold mb-4">阅读进度分布</h2>
          <div className="space-y-3">
            {['0-25%', '25-50%', '50-75%', '75-100%'].map((range, idx) => {
              const [min, max] = range.replace('%', '').split('-').map(Number);
              const count = books.filter((b) => b.progress >= min && b.progress < max).length;
              const percentage = books.length > 0 ? (count / books.length) * 100 : 0;
              const colors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];

              return (
                <div key={range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{range}</span>
                    <span style={{ color: 'var(--secondary-color)' }}>{count} 本</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[idx]} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="p-6 rounded-xl border"
          style={{ borderColor: 'rgba(128,128,128,0.2)' }}
        >
          <h2 className="font-semibold mb-4">最近阅读</h2>
          {stats.recentlyRead.length === 0 ? (
            <div className="py-8 text-center" style={{ color: 'var(--secondary-color)' }}>
              暂无阅读记录
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentlyRead.map((book) => (
                <div key={book.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-14 rounded flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    📕
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{book.title}</h4>
                    <p className="text-xs truncate" style={{ color: 'var(--secondary-color)' }}>
                      {book.author}
                    </p>
                    <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--secondary-color)' }}>
                    {book.progress}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="mt-6 p-6 rounded-xl border"
        style={{ borderColor: 'rgba(128,128,128,0.2)' }}
      >
        <h2 className="font-semibold mb-4">所有书籍进度</h2>
        {books.length === 0 ? (
          <div className="py-8 text-center" style={{ color: 'var(--secondary-color)' }}>
            书架空空如也
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <div key={book.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div
                  className="w-12 h-16 rounded flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  📕
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{book.title}</h4>
                  <p className="text-xs truncate mb-2" style={{ color: 'var(--secondary-color)' }}>
                    {book.author}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          book.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">{book.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
