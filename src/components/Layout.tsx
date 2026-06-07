import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isReader = location.pathname.startsWith('/reader');

  if (isReader) {
    return <div className="w-full h-full">{children}</div>;
  }

  const navItems = [
    { path: '/', label: '书架', icon: '📚' },
    { path: '/notes', label: '笔记', icon: '📝' },
    { path: '/stats', label: '统计', icon: '📊' },
  ];

  return (
    <div className="flex w-full h-full" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <aside
        className={`flex flex-col border-r transition-all duration-300 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
        style={{ borderColor: 'rgba(128,128,128,0.2)' }}
      >
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
          {sidebarOpen && <span className="font-bold text-lg">阅读器</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            style={{ color: 'var(--secondary-color)' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                style={isActive ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t text-sm" style={{ borderColor: 'rgba(128,128,128,0.2)', color: 'var(--secondary-color)' }}>
            离线电子书阅读器 v0.1
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
