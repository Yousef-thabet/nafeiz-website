import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle({ light = false }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${light ? 'text-white hover:bg-white/10' : 'text-navy-700 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-white/10'}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
