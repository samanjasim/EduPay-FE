import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { formatCurrency } from '../../utils/format';
import type { ParentHomeDueThisMonth } from '../../api/parent-portal.api';

interface Props {
  data: ParentHomeDueThisMonth;
  onPayAll: () => void;
}

export function DueThisMonthCard({ data, onPayAll }: Props) {
  const { t } = useTranslation();
  const hasDue = data.pendingCount > 0;

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_45%,#0ea5b8_100%)] p-6 text-white shadow-soft-md"
      aria-label={t('parent.due.title')}
    >
      <div className="absolute -top-10 -end-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="absolute bottom-0 end-0 flex flex-col gap-1 pe-4 pb-4 opacity-30" aria-hidden>
        <span className="h-1 w-12 rounded-full bg-white" />
        <span className="h-1 w-16 rounded-full bg-white" />
        <span className="h-1 w-20 rounded-full bg-white" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{t('parent.due.title')}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {data.currency} {formatCurrency(data.amount)}
      </p>
      <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/80">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden />
        {t('parent.due.pendingCount', { count: data.pendingCount })}
      </p>

      <div className="mt-5">
        <Button
          type="button"
          onClick={onPayAll}
          disabled={!hasDue}
          variant="secondary"
          className="border-white/20 bg-white text-text-primary hover:bg-white/90"
          rightIcon={<ArrowRight className="h-4 w-4 rtl:rotate-180" />}
        >
          {t('parent.due.payAll')}
        </Button>
      </div>
    </section>
  );
}
