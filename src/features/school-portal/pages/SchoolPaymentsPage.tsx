import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { EmptyState } from '@/components/common';

export default function SchoolPaymentsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('schoolPortal.nav.payments')} />
      <EmptyState
        icon={CreditCard}
        title={t('common.comingSoon')}
        description={t('schoolPortal.payments.comingSoonDesc')}
      />
    </div>
  );
}
