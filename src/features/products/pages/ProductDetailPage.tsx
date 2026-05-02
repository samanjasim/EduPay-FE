import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Pencil,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  Archive,
  DollarSign,
  Package,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import { useProductDetail, useUpdateProductStatus, useProductStats } from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { ProductDetailDto, ProductStatus, ProductVariantDto } from '@/types';

const statusVariant = (s: ProductStatus) =>
  ({ Draft: 'warning', Active: 'success', Disabled: 'default', Archived: 'default' } as const)[s] ??
  'default';

function pickName(p: ProductDetailDto, lang: string) {
  if (lang.startsWith('ar') && p.nameAr) return p.nameAr;
  if (lang.startsWith('ku') && p.nameKu) return p.nameKu;
  return p.nameEn;
}
function pickVariantName(v: ProductVariantDto, lang: string) {
  if (lang.startsWith('ar') && v.displayNameAr) return v.displayNameAr;
  if (lang.startsWith('ku') && v.displayNameKu) return v.displayNameKu;
  return v.displayNameEn;
}

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProductDetail(id!);
  const { mutateAsync: updateStatus, isPending: isStatusPending } = useUpdateProductStatus();
  const { hasPermission } = usePermissions();

  // Stats scoped to this product (recent purchases + revenue)
  const { data: stats } = useProductStats({ productId: id });

  const [pendingTransition, setPendingTransition] = useState<ProductStatus | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const productImages = useMemo(
    () => (product?.images ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [product]
  );
  const sortedVariants = useMemo(
    () => (product?.variants ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [product]
  );

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

  const canUpdate = hasPermission(PERMISSIONS.Products.Update);
  const canActivate = product.status === 'Draft' || product.status === 'Disabled';
  const canDisable = product.status === 'Active';
  const canArchive = product.status === 'Active' || product.status === 'Disabled';
  const hasImage = productImages.length > 0;

  const transitionLabel = (s: ProductStatus) => {
    if (s === 'Active') return t('products.activate');
    if (s === 'Disabled') return t('products.disable');
    if (s === 'Archived') return t('products.archive');
    return s;
  };
  const transitionDescription = (s: ProductStatus) => {
    const name = pickName(product, lang);
    if (s === 'Active') return t('products.activateConfirm', { name });
    if (s === 'Disabled') return t('products.disableConfirm', { name });
    if (s === 'Archived') return t('products.archiveConfirm', { name });
    return '';
  };

  const handleTransition = async () => {
    if (!pendingTransition) return;
    await updateStatus({ id: product.id, data: { status: pendingTransition } });
    setPendingTransition(null);
  };

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: product.currency,
      maximumFractionDigits: 0,
    }).format(n);

  const heroImage = productImages[activeImageIdx];

  // Recent purchases for this product (server filters by productId)
  const recentPurchases = (stats?.recentPurchases ?? []).slice(0, 5);
  const totalRevenue = stats
    ? Object.entries(stats.revenueByCurrency).reduce<string[]>((acc, [cur, val]) => {
        const fmt = new Intl.NumberFormat(lang, {
          style: 'currency',
          currency: cur,
          maximumFractionDigits: 0,
        });
        acc.push(fmt.format(val));
        return acc;
      }, [])
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.PRODUCTS.LIST}
        backLabel={t('products.backToProducts')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canUpdate && (
              <Link to={ROUTES.PRODUCTS.getEdit(product.id)}>
                <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                  {t('common.edit')}
                </Button>
              </Link>
            )}
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

      {/* Hero gallery + summary */}
      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <Card>
          <CardContent className="p-3">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-elevated">
              {heroImage ? (
                <img
                  src={heroImage.downloadUrl}
                  alt={heroImage.altTextEn ?? pickName(product, lang)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-text-muted" />
                </div>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      idx === activeImageIdx
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img src={img.downloadUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 py-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-text-primary">{pickName(product, lang)}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" size="sm">
                    <Tag className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                    {t(`products.type${product.type}`)}
                  </Badge>
                  <Badge variant={statusVariant(product.status)}>
                    {t(`products.status${product.status}`)}
                  </Badge>
                </div>
                {product.description && (
                  <p className="mt-3 text-sm text-text-secondary">{product.description}</p>
                )}
              </div>
            </div>

            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoField label={t('products.academicYear')}>{product.academicYearName}</InfoField>
              <InfoField label={t('products.grade')}>
                {product.applicableGradeName ?? t('products.allGrades')}
              </InfoField>
              <InfoField label={t('products.section')}>
                {product.applicableSectionName ?? t('products.allSections')}
              </InfoField>
              <InfoField label={t('products.availableFrom')}>
                {product.availableFrom
                  ? format(new Date(product.availableFrom), 'MMM d, yyyy')
                  : '—'}
              </InfoField>
              <InfoField label={t('products.availableUntil')}>
                {product.availableUntil
                  ? format(new Date(product.availableUntil), 'MMM d, yyyy')
                  : '—'}
              </InfoField>
              <InfoField label={t('products.maxPerPurchase')}>
                {product.maxQuantityPerPurchase ?? t('products.unlimited')}
              </InfoField>
              <InfoField label={t('products.maxPerStudent')}>
                {product.maxQuantityPerStudent ?? t('products.unlimited')}
              </InfoField>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variants table */}
      <Card>
        <CardContent className="py-5">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-text-muted" />
            <h3 className="text-base font-semibold text-text-primary">{t('products.variants')}</h3>
            <Badge size="sm" variant="outline">
              {sortedVariants.length}
            </Badge>
          </div>
          {sortedVariants.length === 0 ? (
            <p className="text-sm text-text-muted">{t('products.noVariants')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-3 py-2 text-start">{t('productVariants.label')}</th>
                    <th className="px-3 py-2 text-start">{t('productVariants.sku')}</th>
                    <th className="px-3 py-2 text-start">{t('productVariants.price')}</th>
                    <th className="px-3 py-2 text-start">{t('productVariants.statusLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVariants.map((v) => (
                    <tr key={v.id} className="border-b border-border/50">
                      <td className="px-3 py-2 font-medium text-text-primary">
                        {pickVariantName(v, lang)}
                      </td>
                      <td className="px-3 py-2 text-text-secondary">{v.sku ?? '—'}</td>
                      <td className="px-3 py-2 text-text-primary">{fmtPrice(v.finalPrice)}</td>
                      <td className="px-3 py-2">
                        <Badge size="sm" variant={v.status === 'Active' ? 'success' : 'default'}>
                          {v.status === 'Active'
                            ? t('productVariants.statusActive')
                            : t('productVariants.statusDisabled')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent purchases + revenue */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="py-5">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-text-muted" />
              <h3 className="text-base font-semibold text-text-primary">
                {t('productPurchases.recentPurchases')}
              </h3>
            </div>
            {recentPurchases.length === 0 ? (
              <p className="text-sm text-text-muted">{t('productPurchases.noRecent')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th className="px-3 py-2 text-start">{t('productPurchases.student')}</th>
                      <th className="px-3 py-2 text-start">{t('productPurchases.amount')}</th>
                      <th className="px-3 py-2 text-start">{t('productPurchases.paidAt')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPurchases.map((p) => (
                      <tr key={p.orderId} className="border-b border-border/50">
                        <td className="px-3 py-2 text-text-primary">{p.studentName}</td>
                        <td className="px-3 py-2 text-text-primary">{fmtPrice(p.amount)}</td>
                        <td className="px-3 py-2 text-text-secondary">
                          {format(new Date(p.paidAt), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-text-muted" />
              <h3 className="text-base font-semibold text-text-primary">
                {t('productPurchases.revenue')}
              </h3>
            </div>
            {totalRevenue.length === 0 ? (
              <p className="text-sm text-text-muted">{t('productPurchases.noRevenue')}</p>
            ) : (
              <div className="space-y-1">
                {totalRevenue.map((line, i) => (
                  <p key={i} className="text-2xl font-semibold text-text-primary">
                    {line}
                  </p>
                ))}
                <p className="text-xs text-text-muted">
                  {t('productPurchases.unitsSold', { count: stats?.unitsSold ?? 0 })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
