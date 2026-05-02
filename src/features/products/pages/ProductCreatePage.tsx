import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { ProductForm } from '../components/ProductForm';
import { ROUTES } from '@/config';

export default function ProductCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('products.createProduct')}
        subtitle={t('products.createSubtitle')}
        backTo={ROUTES.PRODUCTS.LIST}
        backLabel={t('products.backToProducts')}
      />

      <Card>
        <CardContent className="py-2">
          <ProductForm
            mode="create"
            onCreated={(id) => navigate(ROUTES.PRODUCTS.getEdit(id))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
