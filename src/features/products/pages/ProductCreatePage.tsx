import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Info, DollarSign, Calendar, School } from 'lucide-react';
import { Card, CardContent, Button, Input, Textarea, Select } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useCreateProduct } from '../api';
import { useSchools } from '@/features/schools/api';
import { ROUTES } from '@/config';
import type { CreateProductData, ProductType } from '@/types';

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

export default function ProductCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { data: schoolsData } = useSchools();
  const schools = schoolsData?.data ?? [];

  const [form, setForm] = useState({
    schoolId: '',
    name: '',
    description: '',
    type: 'Activity' as ProductType,
    price: '',
    currency: 'IQD',
    academicYearStart: new Date().getFullYear().toString(),
    academicYearEnd: (new Date().getFullYear() + 1).toString(),
    applicableGrade: '',
    applicableSection: '',
    maxQuantity: '',
    availableFrom: '',
    availableUntil: '',
  });

  useEffect(() => {
    if (!form.schoolId && schools.length > 0) {
      setForm((prev) => ({ ...prev, schoolId: schools[0].id }));
    }
  }, [schools, form.schoolId]);

  const schoolOptions = schools.map((s) => ({ value: s.id, label: s.name }));
  const typeOptions = PRODUCT_TYPES.map((pt) => ({ value: pt.value, label: t(pt.label) }));

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolId || !form.name || !form.price) return;

    const data: CreateProductData = {
      schoolId: form.schoolId,
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
      await createProduct(data);
      navigate(ROUTES.PRODUCTS.LIST);
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('products.createProduct')}
        backTo={ROUTES.PRODUCTS.LIST}
        backLabel={t('products.backToProducts')}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Info */}
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
                <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('products.school')}</label>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-text-muted shrink-0" />
                  <Select
                    options={schoolOptions}
                    value={form.schoolId}
                    onChange={(val) => set('schoolId', val)}
                    className="flex-1"
                  />
                </div>
              </div>
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

        {/* Step 2: Pricing */}
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

        {/* Step 3: Scope & Availability */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{t('products.scopeAvailability')}</h3>
            </div>

            <div className="flex items-start gap-2 mb-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3 py-2.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t('products.scopeHint')}
              </p>
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
        <div className="flex items-center justify-end rounded-lg border border-border bg-surface px-4 py-3 gap-3">
          <Link to={ROUTES.PRODUCTS.LIST}>
            <Button variant="secondary" type="button">{t('common.cancel')}</Button>
          </Link>
          <Button type="submit" isLoading={isPending} disabled={!form.schoolId || !form.name || !form.price}>
            {t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}
