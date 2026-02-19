import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Globe, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/stores';

const LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'ar' as const, label: 'العربية' },
  { code: 'ku' as const, label: 'کوردی' },
];

export function AuthLayout() {
  const { t, i18n } = useTranslation();
  const theme = useUIStore((state) => state.theme);
  const language = useUIStore((state) => state.language);
  const setTheme = useUIStore((state) => state.setTheme);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const changeLanguage = (code: 'en' | 'ar' | 'ku') => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 relative">
        <div className="max-w-md text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">
            {t('auth.brandTitle')}
          </h1>
          <p className="text-lg text-primary-100">
            {t('auth.brandSubtitle')}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 h-1/3 w-1/2 bg-gradient-to-t from-white/5 to-transparent" />
      </div>

      {/* Right side - Auth form */}
      <div className="relative flex w-full flex-col lg:w-1/2">
        {/* Top bar with language + theme toggles */}
        <div className="flex items-center justify-end gap-2 px-6 py-4">
          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{LANGUAGES.find((l) => l.code === language)?.label}</span>
            </button>
            {langOpen && (
              <div className="absolute end-0 top-full mt-1 z-50 w-36 rounded-lg border border-border bg-surface py-1 shadow-lg">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full px-4 py-2 text-start text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                      language === lang.code
                        ? 'text-primary-600 font-medium'
                        : 'text-text-secondary'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-8 pb-8">
            <div className="w-full max-w-md">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
