import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${className}`}
      style={{
        backgroundColor: theme === 'dark'
          ? 'rgba(var(--st-primary-rgb, 234,88,12), 0.15)'
          : 'var(--st-surface-2, #f8fafc)',
        color: theme === 'dark'
          ? 'var(--st-primary, #ea580c)'
          : 'var(--st-text-muted, #475569)',
        border: `1px solid ${theme === 'dark' ? 'rgba(var(--st-primary-rgb, 234,88,12), 0.25)' : 'var(--st-border, #e2e8f0)'}`,
      }}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
