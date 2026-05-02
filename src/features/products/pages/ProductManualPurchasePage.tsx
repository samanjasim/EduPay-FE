import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/config';
import { ManualPurchaseForm } from '../components/ManualPurchaseForm';

export default function ProductManualPurchasePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('productPurchases.manual.pageTitle')}
        subtitle={t('productPurchases.manual.pageSubtitle')}
        backTo={ROUTES.SCHOOL.PRODUCTS.PURCHASES}
        backLabel={t('productPurchases.manual.backToHistory')}
      />
      <ManualPurchaseForm />
    </div>
  );
}
