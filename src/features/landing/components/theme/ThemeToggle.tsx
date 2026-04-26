import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores';

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  const { t } = useTranslation();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      type="button"
      aria-label={t('landing.theme.toggle')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
