import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores';
import { cn } from '@/utils';

const LANGS = [
  { code: 'en', native: 'English' },
  { code: 'ar', native: 'العربية' },
  { code: 'ku', native: 'کوردی' },
] as const;

type LangCode = (typeof LANGS)[number]['code'];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { language, setLanguage } = useUIStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGS.find((l) => l.code === language) ?? LANGS[0];

  const change = (code: LangCode) => {
    setLanguage(code);
    void i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('landing.language.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{current.native}</span>
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-soft-lg"
        >
          {LANGS.map((l) => {
            const active = l.code === current.code;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => change(l.code)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-hover'
                  )}
                >
                  <span>{l.native}</span>
                  {active ? <Check size={14} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
