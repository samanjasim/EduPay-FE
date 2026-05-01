import { useState } from 'react';
import { Check, GraduationCap, School, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

type Key = 'parents' | 'schools' | 'platform';
const ICONS: Record<Key, typeof GraduationCap> = {
  parents: GraduationCap,
  schools: School,
  platform: ShieldCheck,
};

export function AudienceTabs() {
  const { t } = useTranslation();
  const [key, setKey] = useState<Key>('parents');
  const data = t(`landing.audience.${key}`, { returnObjects: true }) as {
    title: string;
    body: string;
    points: string[];
  };
  const Icon = ICONS[key];

  return (
    <Section>
      <Container>
        <SectionHeader eyebrow={t('landing.audience.eyebrow')} title={t('landing.audience.title')} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <ul className="flex flex-row gap-2 lg:flex-col" role="tablist">
            {(['parents', 'schools', 'platform'] as const).map((k) => {
              const active = k === key;
              return (
                <li key={k} className="flex-1">
                  <button
                    role="tab"
                    aria-selected={active}
                    onClick={() => setKey(k)}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-start transition-colors',
                      active
                        ? 'border-primary-500/50 bg-primary-50/60 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                        : 'border-border bg-surface text-text-secondary hover:bg-hover'
                    )}
                  >
                    <span className="text-sm font-semibold">{t(`landing.audience.tabs.${k}`)}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-2xl border border-border bg-surface p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#10b981)] text-white shadow-soft-md">
              <Icon size={22} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-text-primary">{data.title}</h3>
            <p className="mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">{data.body}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-text-secondary">
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
