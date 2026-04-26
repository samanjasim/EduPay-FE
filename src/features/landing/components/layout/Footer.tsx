import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Container } from '../ui/Container';
import { LandingLogo } from './Logo';
import { LanguageSwitcher } from '../theme/LanguageSwitcher';

export function LandingFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-1">
            <LandingLogo className="h-9 w-auto text-text-primary" />
            <p className="mt-4 max-w-xs text-sm text-text-secondary leading-relaxed">
              {t('landing.footer.tagline')}
            </p>
          </div>

          <FooterCol
            title={t('landing.footer.columns.product')}
            links={[
              { href: '#features', label: t('landing.footer.links.features') },
              { href: '#pricing', label: t('landing.footer.links.pricing') },
              { href: '#roadmap', label: t('landing.footer.links.roadmap') },
              { href: ROUTES.LOGIN, label: t('landing.footer.links.signIn'), routerLink: true },
            ]}
          />
          <FooterCol
            title={t('landing.footer.columns.company')}
            links={[
              { href: '#', label: t('landing.footer.links.about') },
              { href: '#', label: t('landing.footer.links.contact') },
              { href: '#', label: t('landing.footer.links.careers') },
            ]}
          />
          <FooterCol
            title={t('landing.footer.columns.legal')}
            links={[
              { href: '#', label: t('landing.footer.links.privacy') },
              { href: '#', label: t('landing.footer.links.terms') },
              { href: '#', label: t('landing.footer.links.security') },
            ]}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            © {year} EduPay. {t('landing.footer.rights')} · {t('landing.footer.builtIn')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{t('landing.footer.columns.language')}:</span>
            <LanguageSwitcher />
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string; routerLink?: boolean }>;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) =>
          l.routerLink ? (
            <li key={l.label}>
              <Link
                to={l.href}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ) : (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {l.label}
              </a>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
