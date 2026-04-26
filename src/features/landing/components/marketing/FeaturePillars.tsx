import { CreditCard, Wallet, LayoutDashboard, Languages, ShieldCheck, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

const ICONS = [Receipt, CreditCard, Wallet, LayoutDashboard, Languages, ShieldCheck];

export function FeaturePillars() {
  const { t } = useTranslation();
  const items = t('landing.features.items', { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;
  return (
    <Section id="features">
      <Container>
        <SectionHeader
          eyebrow={t('landing.features.eyebrow')}
          title={t('landing.features.title')}
          subtitle={t('landing.features.subtitle')}
        />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i] ?? Receipt;
            return (
              <li
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
