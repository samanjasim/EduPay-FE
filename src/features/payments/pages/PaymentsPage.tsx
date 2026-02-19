import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';
import { EmptyState } from '@/components/common';

export default function PaymentsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('payments.title')}</h1>
      </div>

      <div className="flex items-center justify-center py-20">
        <EmptyState
          icon={CreditCard}
          title={t('common.comingSoon')}
          description={t('common.comingSoonDesc')}
        />
      </div>
    </div>
  );
}
