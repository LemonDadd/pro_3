import useLibraryStore from '../store/useLibraryStore';

interface ReaderSettingsProps {
  onClose: () => void;
}

export default function ReaderSettings({ onClose }: ReaderSettingsProps) {
  const { theme, readerSettings, setTheme, setReaderSettings } = useLibraryStore();

  const themes = [
    { id: 'light', label: '浅色', bg: '#ffffff' },
    { id: 'sepia', label: '护眼', bg: '#f4ecd8' },
    { id: 'dark', label: '深色', bg: '#1a1a2e' },
  ];

  const fonts = [
    { id: 'Georgia, serif', label: '衬线' },
    { id: '-apple-system, BlinkMacSystemFont, sans-serif', label: '无衬线' },
    { id: '"Microsoft YaHei", sans-serif', label: '雅黑' },
    { id: '"SimSun", serif', label: '宋体' },
  ];

  return (
    <aside
      className="w-72 border-l flex flex-col"
      style={{ borderColor: 'rgba(128,128,128,0.2)', backgroundColor: 'var(--bg-color)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
        <h3 className="font-medium">阅读设置</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          style={{ color: 'var(--secondary-color)' }}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">主题</h4>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme({ mode: t.id as any })}
                className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                  theme.mode === t.id ? 'border-blue-500 scale-105' : 'border-transparent'
                }`}
                style={{ backgroundColor: t.bg }}
              >
                <span className="text-xs font-medium" style={{ color: t.id === 'dark' ? '#fff' : '#000' }}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">字号</h4>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme({ fontSize: Math.max(12, theme.fontSize - 2) })}
              className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ borderColor: 'rgba(128,128,128,0.3)' }}
            >
              -
            </button>
            <div className="flex-1 text-center text-sm">
              {theme.fontSize}px
            </div>
            <button
              onClick={() => setTheme({ fontSize: Math.min(32, theme.fontSize + 2) })}
              className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ borderColor: 'rgba(128,128,128,0.3)' }}
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="12"
            max="32"
            value={theme.fontSize}
            onChange={(e) => setTheme({ fontSize: Number(e.target.value) })}
            className="w-full mt-3"
          />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">字体</h4>
          <div className="grid grid-cols-2 gap-2">
            {fonts.map((font) => (
              <button
                key={font.id}
                onClick={() => setTheme({ fontFamily: font.id })}
                className={`py-2 px-3 text-sm rounded border ${
                  theme.fontFamily === font.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                style={{ fontFamily: font.id }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">行间距</h4>
          <input
            type="range"
            min="1.2"
            max="2.5"
            step="0.1"
            value={theme.lineHeight}
            onChange={(e) => setTheme({ lineHeight: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>
            <span>紧凑</span>
            <span>{theme.lineHeight.toFixed(1)}</span>
            <span>宽松</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">边距</h4>
          <input
            type="range"
            min="10"
            max="100"
            value={theme.margin}
            onChange={(e) => setTheme({ margin: Number(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>
            <span>窄</span>
            <span>{theme.margin}px</span>
            <span>宽</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">阅读模式</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setReaderSettings({ layout: 'paginated' })}
              className={`flex-1 py-2 text-sm rounded border ${
                readerSettings.layout === 'paginated'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              分页
            </button>
            <button
              onClick={() => setReaderSettings({ layout: 'scrolled' })}
              className={`flex-1 py-2 text-sm rounded border ${
                readerSettings.layout === 'scrolled'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              滚动
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
