import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/config';
import { ProductPurchaseStats } from '../components/ProductPurchaseStats';

export default function ProductPurchaseStatsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('productPurchases.stats.title')}
        subtitle={t('productPurchases.stats.subtitle')}
        backTo={ROUTES.SCHOOL.PRODUCTS.PURCHASES}
        backLabel={t('productPurchases.stats.backToHistory')}
      />
      <ProductPurchaseStats />
    </div>
  );
}
