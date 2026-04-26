import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';
import { LandingButton } from '../ui/Button';

export function Pricing() {
  const { t } = useTranslation();
  const plans = t('landing.pricing.plans', { returnObjects: true }) as Array<{
    name: string;
    price: string;
    priceNote: string;
    body: string;
    features: string[];
  }>;

  return (
    <Section id="pricing">
      <Container>
        <SectionHeader
          eyebrow={t('landing.pricing.eyebrow')}
          title={t('landing.pricing.title')}
          subtitle={t('landing.pricing.subtitle')}
        />

        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((p, i) => {
            const featured = i === 1;
            return (
              <li
                key={p.name}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg',
                  featured ? 'border-primary-500/40 ring-1 ring-primary-500/20 shadow-soft-md' : 'border-border'
                )}
              >
                {featured ? (
                  <span className="absolute -top-3 start-7 rounded-full bg-[linear-gradient(135deg,#2563eb,#10b981)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {t('landing.pricing.mostPopular')}
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-text-primary">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-text-primary">{p.price}</span>
                  <span className="text-xs text-text-muted">{p.priceNote}</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary">{p.body}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-700 dark:text-accent-300">
                        <Check size={12} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  {i === 2 ? (
                    <LandingButton as="a" href="#" variant="secondary" size="md" className="w-full">
                      {t('landing.pricing.contact')}
                    </LandingButton>
                  ) : (
                    <LandingButton
                      as="link"
                      to={ROUTES.REGISTER}
                      variant={featured ? 'gradient' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      {t('landing.pricing.select')}
                    </LandingButton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
