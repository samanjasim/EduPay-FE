import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { ProductPurchaseHistoryTable } from '../components/ProductPurchaseHistoryTable';

export default function ProductPurchasesPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const canRecord = hasPermission(PERMISSIONS.ProductPurchases.Create);
  const canViewStats = hasPermission(PERMISSIONS.ProductPurchases.ViewStats);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('productPurchases.history.title')}
        subtitle={t('productPurchases.history.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            {canViewStats && (
              <Link to={ROUTES.SCHOOL.PRODUCTS.STATS}>
                <Button variant="secondary" leftIcon={<BarChart3 className="h-4 w-4" />}>
                  {t('productPurchases.history.viewStats')}
                </Button>
              </Link>
            )}
            {canRecord && (
              <Link to={ROUTES.SCHOOL.PRODUCTS.MANUAL_PURCHASE}>
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  {t('productPurchases.history.recordPurchase')}
                </Button>
              </Link>
            )}
          </div>
        }
      />
      <ProductPurchaseHistoryTable />
    </div>
  );
}
