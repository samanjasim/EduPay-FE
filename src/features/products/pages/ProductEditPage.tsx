import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Button, Spinner, Badge } from '@/components/ui';
import { PageHeader, ConfirmModal } from '@/components/common';
import { CheckCircle, XCircle, Archive, AlertTriangle, ImageOff } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';
import { ProductVariantBuilder } from '../components/ProductVariantBuilder';
import { ProductImageManager } from '../components/ProductImageManager';
import { useProductDetail, useUpdateProductStatus } from '../api';
import { ROUTES } from '@/config';
import type { ProductStatus } from '@/types';

const statusVariant = (s: ProductStatus) =>
  ({ Draft: 'warning', Active: 'success', Disabled: 'default', Archived: 'default' } as const)[s] ??
  'default';

export default function ProductEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductDetail(id!);
  const { mutateAsync: updateStatus, isPending: isStatusPending } = useUpdateProductStatus();

  const [pendingTransition, setPendingTransition] = useState<ProductStatus | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!product) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const hasImage = product.images.length > 0;
  const restrictedEdit = product.status === 'Active' || product.status === 'Disabled';

  // ─── transition state-machine ───
  // Draft -> Active (needs at least one image)
  // Active -> Disabled
  // Disabled -> Active
  // Active|Disabled -> Archived
  const canActivate = product.status === 'Draft' || product.status === 'Disabled';
  const canDisable = product.status === 'Active';
  const canArchive = product.status === 'Active' || product.status === 'Disabled';

  const transitionLabel = (s: ProductStatus) => {
    if (s === 'Active') return t('products.activate');
    if (s === 'Disabled') return t('products.disable');
    if (s === 'Archived') return t('products.archive');
    return s;
  };

  const transitionDescription = (s: ProductStatus) => {
    if (s === 'Active') return t('products.activateConfirm', { name: product.nameEn });
    if (s === 'Disabled') return t('products.disableConfirm', { name: product.nameEn });
    if (s === 'Archived') return t('products.archiveConfirm', { name: product.nameEn });
    return '';
  };

  const handleTransition = async () => {
    if (!pendingTransition) return;
    await updateStatus({ id: product.id, data: { status: pendingTransition } });
    setPendingTransition(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('products.editProduct')}: ${product.nameEn}`}
        backTo={ROUTES.PRODUCTS.getDetail(product.id)}
        backLabel={t('products.backToProducts')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(product.status)}>
              {t(`products.status${product.status}`)}
            </Badge>
            {canActivate && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={() => setPendingTransition('Active')}
                disabled={!hasImage}
                title={!hasImage ? t('products.activateNeedsImage') : undefined}
                isLoading={isStatusPending && pendingTransition === 'Active'}
              >
                {t('products.activate')}
              </Button>
            )}
            {canDisable && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<XCircle className="h-4 w-4" />}
                onClick={() => setPendingTransition('Disabled')}
                isLoading={isStatusPending && pendingTransition === 'Disabled'}
              >
                {t('products.disable')}
              </Button>
            )}
            {canArchive && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Archive className="h-4 w-4" />}
                onClick={() => setPendingTransition('Archived')}
                isLoading={isStatusPending && pendingTransition === 'Archived'}
              >
                {t('products.archive')}
              </Button>
            )}
          </div>
        }
      />

      {!hasImage && product.status === 'Draft' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <ImageOff className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t('products.activateNeedsImageInline')}</span>
        </div>
      )}

      {restrictedEdit && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t('products.restrictedEditNotice')}</span>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardContent className="py-2">
          <ProductForm
            mode="edit"
            product={product}
            restrictedEdit={restrictedEdit}
            onSaved={() => navigate(ROUTES.PRODUCTS.getDetail(product.id))}
          />
        </CardContent>
      </Card>

      {/* Images */}
      <ProductImageManager product={product} />

      {/* Variants */}
      <ProductVariantBuilder product={product} currency={product.currency} />

      <div className="flex items-center justify-end pt-2">
        <Link to={ROUTES.PRODUCTS.getDetail(product.id)}>
          <Button variant="ghost" type="button">
            {t('common.cancel')}
          </Button>
        </Link>
      </div>

      <ConfirmModal
        isOpen={!!pendingTransition}
        onClose={() => setPendingTransition(null)}
        onConfirm={handleTransition}
        title={transitionLabel(pendingTransition!)}
        description={transitionDescription(pendingTransition!)}
        confirmLabel={transitionLabel(pendingTransition!)}
        variant={pendingTransition === 'Archived' ? 'danger' : 'primary'}
        isLoading={isStatusPending}
      />
    </div>
  );
}
