import { Database, Lock, ShieldCheck, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

const ICONS = [Database, Lock, ShieldCheck, Layers];

export function Trust() {
  const { t } = useTranslation();
  const items = t('landing.trust.items', { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;
  return (
    <Section>
      <Container>
        <SectionHeader eyebrow={t('landing.trust.eyebrow')} title={t('landing.trust.title')} />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = ICONS[i] ?? ShieldCheck;
            return (
              <li
                key={it.title}
                className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-hover"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-text-primary">{it.title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{it.body}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
