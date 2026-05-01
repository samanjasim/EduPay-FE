import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

export function ProblemSolution() {
  const { t } = useTranslation();
  const pains = t('landing.problem.pains', { returnObjects: true }) as string[];
  const outcomes = t('landing.problem.outcomes', { returnObjects: true }) as string[];

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow={t('landing.problem.eyebrow')}
          title={t('landing.problem.title')}
          subtitle={t('landing.problem.body')}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-error">Before</h3>
            <ul className="mt-4 space-y-3">
              {pains.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                    <X size={12} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-accent-200/60 dark:border-accent-500/20 bg-accent-50/40 dark:bg-accent-500/5 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-400">
              With EduPay
            </h3>
            <ul className="mt-4 space-y-3">
              {outcomes.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-700 dark:text-accent-300">
                    <Check size={12} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
