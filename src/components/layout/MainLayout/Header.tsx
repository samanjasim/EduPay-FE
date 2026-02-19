import { LogOut, User, Menu, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, selectUser, useUIStore, selectSidebarCollapsed, selectTheme, selectLanguage } from '@/stores';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import { useLogout } from '@/features/auth/api';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'ar' as const, label: 'العربية' },
  { code: 'ku' as const, label: 'کوردی' },
];

export function Header() {
  const { i18n } = useTranslation();
  const user = useAuthStore(selectUser);
  const isCollapsed = useUIStore(selectSidebarCollapsed);
  const theme = useUIStore(selectTheme);
  const language = useUIStore(selectLanguage);
  const setTheme = useUIStore((state) => state.setTheme);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const handleLogout = useLogout();

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
    <header
      className={cn(
        'fixed top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-sm px-6 transition-all duration-300',
        isCollapsed
          ? 'ltr:left-16 rtl:right-16 ltr:right-0 rtl:left-0'
          : 'ltr:left-64 rtl:right-64 ltr:right-0 rtl:left-0'
      )}
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <div ref={langRef} className="relative">
          <Button variant="ghost" size="sm" onClick={() => setLangOpen(!langOpen)}>
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline text-xs uppercase">{language}</span>
          </Button>
          {langOpen && (
            <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-36 rounded-lg border border-border bg-surface py-1 shadow-soft-lg z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-left transition-colors',
                    language === lang.code
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                      : 'text-text-primary hover:bg-hover'
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User info */}
        <div className="flex items-center gap-3 ltr:ml-2 rtl:mr-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20">
            <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-text-muted">{user?.email}</p>
          </div>
        </div>

        {/* Logout button */}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-text-secondary hover:text-red-500">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
