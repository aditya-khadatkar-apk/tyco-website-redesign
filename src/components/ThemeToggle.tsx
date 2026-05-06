import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-industrial-800 text-primary-400 hover:bg-industrial-700' 
          : 'bg-industrial-100 text-industrial-600 hover:bg-industrial-200'
      } ${className}`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
