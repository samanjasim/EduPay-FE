import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { Container } from '../ui/Container';
import { Section, SectionHeader } from '../ui/Section';

export function FAQ() {
  const { t } = useTranslation();
  const items = t('landing.faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq">
      <Container>
        <SectionHeader eyebrow={t('landing.faq.eyebrow')} title={t('landing.faq.title')} />

        <ul className="mx-auto mt-12 max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <li key={it.q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span className="text-base font-semibold text-text-primary">{it.q}</span>
                  <Plus
                    size={18}
                    className={cn(
                      'shrink-0 text-text-muted transition-transform duration-300',
                      isOpen && 'rotate-45'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{it.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <FaqJsonLd items={items} />
      </Container>
    </Section>
  );
}

function FaqJsonLd({ items }: { items: Array<{ q: string; a: string }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
