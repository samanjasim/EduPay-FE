import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Info, DollarSign, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, Button, Input, Textarea, Select, Spinner, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useProduct, useUpdateProduct, useUpdateProductStatus } from '../api';
import { ROUTES } from '@/config';
import type { UpdateProductData, ProductType, ProductStatus } from '@/types';

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'Activity', label: 'products.typeActivity' },
  { value: 'Trip', label: 'products.typeTrip' },
  { value: 'Uniform', label: 'products.typeUniform' },
  { value: 'Books', label: 'products.typeBooks' },
  { value: 'Lab', label: 'products.typeLab' },
  { value: 'Transport', label: 'products.typeTransport' },
  { value: 'Other', label: 'products.typeOther' },
];

const CURRENCIES = [
  { value: 'IQD', label: 'IQD - Iraqi Dinar' },
  { value: 'USD', label: 'USD - US Dollar' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'Draft', label: 'products.statusDraft' },
  { value: 'Active', label: 'products.statusActive' },
  { value: 'Archived', label: 'products.statusArchived' },
];

export default function ProductEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProductStatus();

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'Activity' as ProductType,
    price: '',
    currency: 'IQD',
    academicYearStart: '',
    academicYearEnd: '',
    applicableGrade: '',
    applicableSection: '',
    maxQuantity: '',
    availableFrom: '',
    availableUntil: '',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        type: product.type,
        price: product.price.toString(),
        currency: product.currency,
        academicYearStart: product.academicYearStart.toString(),
        academicYearEnd: product.academicYearEnd.toString(),
        applicableGrade: product.applicableGrade ?? '',
        applicableSection: product.applicableSection ?? '',
        maxQuantity: product.maxQuantity?.toString() ?? '',
        availableFrom: product.availableFrom?.split('T')[0] ?? '',
        availableUntil: product.availableUntil?.split('T')[0] ?? '',
      });
    }
  }, [product]);

  const typeOptions = PRODUCT_TYPES.map((pt) => ({ value: pt.value, label: t(pt.label) }));
  const statusOptions = STATUS_OPTIONS.map((s) => ({ value: s.value, label: t(s.label) }));

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isSaving = isUpdating || isUpdatingStatus;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const data: UpdateProductData = {
      name: form.name,
      description: form.description || undefined,
      type: form.type,
      price: parseFloat(form.price),
      currency: form.currency,
      academicYearStart: parseInt(form.academicYearStart),
      academicYearEnd: parseInt(form.academicYearEnd),
      applicableGrade: form.applicableGrade || undefined,
      applicableSection: form.applicableSection || undefined,
      maxQuantity: form.maxQuantity ? parseInt(form.maxQuantity) : undefined,
      availableFrom: form.availableFrom || undefined,
      availableUntil: form.availableUntil || undefined,
    };

    try {
      await updateProduct({ id: id!, data });
      navigate(ROUTES.PRODUCTS.getDetail(id!));
    } catch {
      // handled by mutation
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === product?.status) return;
    updateStatus({ id: id!, data: { status: newStatus as ProductStatus } });
  };

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('products.editProduct')}: ${product.name}`}
        backTo={ROUTES.PRODUCTS.getDetail(id!)}
        backLabel={t('products.backToProducts')}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-muted">{t('products.currentStatus')}:</span>
                <Badge variant={product.status === 'Active' ? 'success' : product.status === 'Draft' ? 'warning' : 'default'}>
                  {t(`products.status${product.status}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">{t('products.changeStatus')}:</span>
                <Select
                  options={statusOptions}
                  value={product.status}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                  className="max-w-[160px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                <Package className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{t('products.basicInfo')}</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="sm:col-span-2">
                <Input
                  label={t('products.name')}
                  placeholder={t('products.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label={t('products.description')}
                  placeholder={t('products.descriptionPlaceholder')}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('products.type')}</label>
                <Select
                  options={typeOptions}
                  value={form.type}
                  onChange={(val) => set('type', val)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{t('products.pricing')}</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
              <div>
                <Input
                  label={t('products.price')}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('products.currency')}</label>
                <Select
                  options={CURRENCIES}
                  value={form.currency}
                  onChange={(val) => set('currency', val)}
                />
              </div>
              <div>
                <Input
                  label={t('products.maxQty')}
                  type="number"
                  min="0"
                  placeholder={t('products.unlimited')}
                  value={form.maxQuantity}
                  onChange={(e) => set('maxQuantity', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope & Availability */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{t('products.scopeAvailability')}</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div>
                <Input
                  label={t('products.academicYearStart')}
                  type="number"
                  min="2020"
                  max="2050"
                  value={form.academicYearStart}
                  onChange={(e) => set('academicYearStart', e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('products.academicYearEnd')}
                  type="number"
                  min="2020"
                  max="2050"
                  value={form.academicYearEnd}
                  onChange={(e) => set('academicYearEnd', e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('products.grade')}
                  placeholder={t('products.gradePlaceholder')}
                  value={form.applicableGrade}
                  onChange={(e) => set('applicableGrade', e.target.value)}
                />
              </div>
              <div>
                <Input
                  label={t('products.section')}
                  placeholder={t('products.sectionPlaceholder')}
                  value={form.applicableSection}
                  onChange={(e) => set('applicableSection', e.target.value)}
                />
              </div>
              <div>
                <Input
                  label={t('products.availableFrom')}
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => set('availableFrom', e.target.value)}
                />
              </div>
              <div>
                <Input
                  label={t('products.availableUntil')}
                  type="date"
                  value={form.availableUntil}
                  onChange={(e) => set('availableUntil', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <span className="text-sm text-text-muted">{t('products.editHint')}</span>
          <div className="flex items-center gap-3">
            <Link to={ROUTES.PRODUCTS.getDetail(id!)}>
              <Button variant="secondary" type="button">{t('common.cancel')}</Button>
            </Link>
            <Button type="submit" isLoading={isSaving} disabled={!form.name || !form.price}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
