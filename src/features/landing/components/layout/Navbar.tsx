import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { Container } from '../ui/Container';
import { LandingButton } from '../ui/Button';
import { ThemeToggle } from '../theme/ThemeToggle';
import { LanguageSwitcher } from '../theme/LanguageSwitcher';
import { LandingLogo } from './Logo';

export function LandingNavbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: Array<{ href: string; label: string }> = [
    { href: '#features', label: t('landing.nav.features') },
    { href: '#how', label: t('landing.nav.how') },
    { href: '#pricing', label: t('landing.nav.pricing') },
    { href: '#roadmap', label: t('landing.nav.roadmap') },
    { href: '#faq', label: t('landing.nav.faq') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all',
        scrolled ? 'glass border-b border-border' : 'bg-transparent'
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-3 focus:py-1.5 focus:text-white"
      >
        {t('landing.nav.skipToContent')}
      </a>
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4" aria-label="Primary">
          <Link to={ROUTES.LANDING} className="flex items-center text-text-primary" aria-label="EduPay home">
            <LandingLogo className="h-8 w-auto" />
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 ms-1">
              <LandingButton as="link" to={ROUTES.LOGIN} variant="ghost" size="sm">
                {t('landing.nav.signIn')}
              </LandingButton>
              <LandingButton as="link" to={ROUTES.REGISTER} variant="gradient" size="sm">
                {t('landing.nav.getStarted')}
              </LandingButton>
            </div>
            <button
              type="button"
              aria-label={open ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')}
              aria-expanded={open}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-hover"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {open ? (
          <div className="lg:hidden pb-4">
            <ul className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-hover"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 grid grid-cols-2 gap-2">
                <LandingButton as="link" to={ROUTES.LOGIN} variant="secondary" size="sm">
                  {t('landing.nav.signIn')}
                </LandingButton>
                <LandingButton as="link" to={ROUTES.REGISTER} variant="gradient" size="sm">
                  {t('landing.nav.getStarted')}
                </LandingButton>
              </li>
            </ul>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
