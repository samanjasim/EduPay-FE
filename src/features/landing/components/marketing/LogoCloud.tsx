import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';

const PARTNERS = ['Qi Card', 'Aqsati', 'ZainCash', 'FIB', 'Visa', 'Mastercard'];

export function LogoCloud() {
  const { t } = useTranslation();
  return (
    <section className="border-y border-border bg-surface/60">
      <Container>
        <div className="py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            {t('landing.logos.eyebrow')}
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PARTNERS.map((p) => (
              <li
                key={p}
                className="text-lg sm:text-xl font-semibold tracking-tight text-text-muted/80 hover:text-text-primary transition-colors"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
