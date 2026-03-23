import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { EmptyState } from '@/components/common';

export default function SchoolReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader title={t('schoolPortal.nav.reports')} />
      <EmptyState
        icon={BarChart3}
        title={t('common.comingSoon')}
        description={t('schoolPortal.reports.comingSoonDesc')}
      />
    </div>
  );
}
