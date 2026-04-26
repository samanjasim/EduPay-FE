import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

export function Roadmap() {
  const { t } = useTranslation();
  const phases = t('landing.roadmap.phases', { returnObjects: true }) as Array<{
    tag: string;
    title: string;
    items: string[];
  }>;
  return (
    <Section id="roadmap">
      <Container>
        <SectionHeader
          eyebrow={t('landing.roadmap.eyebrow')}
          title={t('landing.roadmap.title')}
          subtitle={t('landing.roadmap.subtitle')}
        />
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {phases.map((p, i) => {
            const isCurrent = i === 0;
            return (
              <li key={p.title} className="relative rounded-2xl border border-border bg-surface p-6">
                <span
                  className={
                    isCurrent
                      ? 'inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 px-3 py-1 text-[11px] font-semibold text-accent-700 dark:text-accent-300'
                      : 'inline-flex items-center gap-1.5 rounded-full bg-surface-200 dark:bg-white/10 px-3 py-1 text-[11px] font-semibold text-text-secondary'
                  }
                >
                  <span
                    className={
                      isCurrent
                        ? 'h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse'
                        : 'h-1.5 w-1.5 rounded-full bg-text-muted'
                    }
                  />
                  {p.tag}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{p.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                        <Check size={12} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
