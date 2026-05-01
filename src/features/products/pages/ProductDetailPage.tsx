import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package, Pencil, Trash2, Tag, DollarSign,
  Calendar, Hash,
} from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import { useProduct, useDeleteProduct } from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import type { ProductStatus } from '@/types';

const statusVariant = (s: ProductStatus) =>
  ({ Draft: 'warning', Active: 'success', Archived: 'default' } as const)[s] ?? 'default';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { hasPermission } = usePermissions();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canUpdate = hasPermission(PERMISSIONS.Products.Update);
  const canDelete = hasPermission(PERMISSIONS.Products.Delete);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!product) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const handleDelete = () => {
    deleteProduct(product.id, {
      onSuccess: () => navigate(ROUTES.PRODUCTS.LIST),
    });
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IQ', { minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.PRODUCTS.LIST}
        backLabel={t('products.backToProducts')}
      />

      {/* Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-text-primary">{product.name}</h1>
                <Badge variant="outline" size="sm">
                  <Tag className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                  {t(`products.type${product.type}`)}
                </Badge>
              </div>
              {product.description && (
                <p className="mt-1 text-text-secondary">{product.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusVariant(product.status)}>
                {t(`products.status${product.status}`)}
              </Badge>
              {canUpdate && (
                <Link to={ROUTES.PRODUCTS.getEdit(product.id)}>
                  <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                    {t('common.edit')}
                  </Button>
                </Link>
              )}
              {canDelete && product.status === 'Draft' && (
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t('common.delete')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{fmt(product.price)}</p>
              <p className="text-xs text-text-muted">{product.currency}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{product.academicYearStart}–{product.academicYearEnd}</p>
              <p className="text-xs text-text-muted">{t('products.academicYear')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
              <Hash className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">
                {product.maxQuantity ?? t('products.unlimited')}
              </p>
              <p className="text-xs text-text-muted">{t('products.maxQty')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardContent className="py-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">{t('products.details')}</h3>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label={t('products.grade')}>
              {product.applicableGrade || t('products.allGrades')}
            </InfoField>
            <InfoField label={t('products.section')}>
              {product.applicableSection || t('products.allSections')}
            </InfoField>
            <InfoField label={t('products.availableFrom')}>
              {product.availableFrom ? format(new Date(product.availableFrom), 'MMM d, yyyy') : '—'}
            </InfoField>
            <InfoField label={t('products.availableUntil')}>
              {product.availableUntil ? format(new Date(product.availableUntil), 'MMM d, yyyy') : '—'}
            </InfoField>
            <InfoField label={t('common.createdAt')}>
              {format(new Date(product.createdAt), 'MMM d, yyyy')}
            </InfoField>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('products.deleteProduct')}
        description={t('products.deleteConfirmation', { name: product.name })}
        confirmLabel={t('common.delete')}
        isLoading={isDeleting}
      />
    </div>
  );
}
