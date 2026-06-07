import { useEffect } from 'react';
import useLibraryStore from '../store/useLibraryStore';

export default function Toast() {
  const { error, clearError } = useLibraryStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-pulse">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-md"
        style={{
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          color: '#991b1b',
        }}
      >
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <p className="font-medium text-sm">操作失败</p>
          <p className="text-xs opacity-80">{error}</p>
        </div>
        <button
          onClick={clearError}
          className="text-lg opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
