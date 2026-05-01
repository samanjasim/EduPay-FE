import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

type Step = { title: string; body: string };

export function HowItWorks() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'parents' | 'schools'>('parents');

  const steps = t(`landing.how.${tab}`, { returnObjects: true }) as Step[];

  return (
    <Section id="how">
      <Container>
        <SectionHeader eyebrow={t('landing.how.eyebrow')} title={t('landing.how.title')} />

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-surface p-1">
            {(['parents', 'schools'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                  tab === k
                    ? 'bg-[linear-gradient(135deg,#2563eb,#10b981)] text-white shadow-soft-sm'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {t(`landing.how.tabs.${k}`)}
              </button>
            ))}
          </div>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-border bg-surface p-6">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
