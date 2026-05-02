import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, DollarSign, Calendar, Globe, Layers } from 'lucide-react';
import { Card, CardContent, Button, Input, Textarea, Select } from '@/components/ui';
import { useSchools } from '@/features/schools/api';
import { useAcademicYears } from '@/features/academic-years/api';
import { useGrades, useGrade } from '@/features/grades/api';
import { useCreateProduct, useUpdateProduct } from '../api';
import type {
  ProductDetailDto,
  ProductType,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types';

// ─── form shape ───
//
// Multilingual NAME (3 fields, EN required); description is English-only for v1
// to keep the spec slim — multilingual description is a v2 polish per task spec.

// Use a permissive schema that operates on form values as-typed by the input
// (numbers come in as `number` via `valueAsNumber`, but RHF still types them as
//  the field default — so we mark the numerics as optional `number`).
const formSchema = z
  .object({
    nameEn: z.string().trim().min(1, 'required'),
    nameAr: z.string().optional().nullable(),
    nameKu: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    type: z.enum(['Activity', 'Trip', 'Uniform', 'Books', 'Lab', 'Transport', 'Other']),
    schoolId: z.string().min(1, 'required'),
    academicYearId: z.string().min(1, 'required'),
    applicableGradeId: z.string().optional().nullable(),
    applicableSectionId: z.string().optional().nullable(),
    availableFrom: z.string().optional().nullable(),
    availableUntil: z.string().optional().nullable(),
    defaultPrice: z.number().nonnegative().optional(),
    currency: z.string().min(1),
    maxQuantityPerPurchase: z.number().int().positive().optional(),
    maxQuantityPerStudent: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.availableFrom && data.availableUntil) {
      if (new Date(data.availableUntil) < new Date(data.availableFrom)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'availableUntilBeforeFrom',
          path: ['availableUntil'],
        });
      }
    }
  });

export type ProductFormValues = z.infer<typeof formSchema>;

const PRODUCT_TYPES: ProductType[] = [
  'Activity',
  'Trip',
  'Uniform',
  'Books',
  'Lab',
  'Transport',
  'Other',
];

const CURRENCIES = [
  { value: 'IQD', label: 'IQD - Iraqi Dinar' },
  { value: 'USD', label: 'USD - US Dollar' },
];

const NAME_TABS: Array<{ key: 'nameEn' | 'nameAr' | 'nameKu'; tabLabel: string }> = [
  { key: 'nameEn', tabLabel: 'EN' },
  { key: 'nameAr', tabLabel: 'AR' },
  { key: 'nameKu', tabLabel: 'KU' },
];

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: ProductDetailDto;
  onCreated?: (id: string) => void;
  onSaved?: () => void;
  /**
   * When the product is Active or Disabled, only certain fields are editable
   * (per Task 2 BE rule — availability dates, description, image-related).
   */
  restrictedEdit?: boolean;
}

export function ProductForm({
  mode,
  product,
  onCreated,
  onSaved,
  restrictedEdit = false,
}: ProductFormProps) {
  const { t } = useTranslation();
  const [activeNameTab, setActiveNameTab] = useState<'nameEn' | 'nameAr' | 'nameKu'>('nameEn');

  const { data: schoolsData } = useSchools();
  const schools = schoolsData?.data ?? [];

  const { data: academicYearsData } = useAcademicYears({ pageSize: 100 });
  const academicYears = academicYearsData?.data ?? [];

  const { data: gradesData } = useGrades({ pageSize: 200 });
  const grades = gradesData?.data ?? [];

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();

  const defaultValues: ProductFormValues = useMemo(() => {
    if (product) {
      return {
        nameEn: product.nameEn,
        nameAr: product.nameAr ?? '',
        nameKu: product.nameKu ?? '',
        description: product.description ?? '',
        type: (product.type as ProductType) ?? 'Activity',
        schoolId: product.schoolId,
        academicYearId: product.academicYearId,
        applicableGradeId: product.applicableGradeId ?? '',
        applicableSectionId: product.applicableSectionId ?? '',
        availableFrom: product.availableFrom?.split('T')[0] ?? '',
        availableUntil: product.availableUntil?.split('T')[0] ?? '',
        currency: product.currency || 'IQD',
        ...(product.maxQuantityPerPurchase != null
          ? { maxQuantityPerPurchase: product.maxQuantityPerPurchase }
          : {}),
        ...(product.maxQuantityPerStudent != null
          ? { maxQuantityPerStudent: product.maxQuantityPerStudent }
          : {}),
      } as ProductFormValues;
    }
    return {
      nameEn: '',
      nameAr: '',
      nameKu: '',
      description: '',
      type: 'Activity',
      schoolId: '',
      academicYearId: '',
      applicableGradeId: '',
      applicableSectionId: '',
      availableFrom: '',
      availableUntil: '',
      currency: 'IQD',
    } as ProductFormValues;
  }, [product]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset to defaults when product changes (edit mode initial load)
  useEffect(() => {
    if (mode === 'edit' && product) {
      Object.entries(defaultValues).forEach(([k, v]) => {
        setValue(k as keyof ProductFormValues, v as never, { shouldDirty: false });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Auto-pick first school if creating and only one is available
  useEffect(() => {
    if (mode === 'create' && !watch('schoolId') && schools.length > 0) {
      setValue('schoolId', schools[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools.length]);

  const selectedGradeId = watch('applicableGradeId') || '';
  // Fetch detail (with sections) for selected grade
  const { data: selectedGradeDetail } = useGrade(selectedGradeId);
  const sectionsForGrade = selectedGradeDetail?.sections ?? [];

  const schoolOptions = schools.map((s) => ({ value: s.id, label: s.name }));
  const academicYearOptions = academicYears.map((y) => ({ value: y.id, label: y.label }));
  const typeOptions = PRODUCT_TYPES.map((p) => ({
    value: p,
    label: t(`products.type${p}`),
  }));
  const gradeOptions = [
    { value: '', label: t('products.allGrades') },
    ...grades.map((g) => ({ value: g.id, label: g.name })),
  ];
  const sectionOptions = [
    { value: '', label: t('products.allSections') },
    ...sectionsForGrade
      .filter((s) => s.isActive)
      .map((s) => ({ value: s.id, label: s.name })),
  ];

  const isCreate = mode === 'create';
  const noVariants = !product || (product.variants?.length ?? 0) === 0;

  const onSubmit = async (values: ProductFormValues) => {
    // BE expects either a date-only string (yyyy-MM-dd) or null. Empty form
    // fields collapse to null; valid date inputs are passed through unchanged.
    const toDateOrNull = (v: string | null | undefined) =>
      v && v.trim() ? v : null;
    const toStringOrNull = (v: string | null | undefined) =>
      v && v.trim() ? v.trim() : null;

    if (isCreate) {
      // Default price is required when creating (BE always materializes a default
      // single variant priced at this value).
      if (values.defaultPrice == null || Number.isNaN(values.defaultPrice)) {
        return;
      }
      const data: CreateProductRequest = {
        schoolId: values.schoolId,
        nameEn: values.nameEn.trim(),
        nameAr: toStringOrNull(values.nameAr),
        nameKu: toStringOrNull(values.nameKu),
        description: toStringOrNull(values.description),
        type: values.type,
        currency: values.currency,
        academicYearId: values.academicYearId,
        defaultVariantPrice: values.defaultPrice,
        applicableGradeId: values.applicableGradeId || null,
        applicableSectionId: values.applicableSectionId || null,
        maxQuantityPerPurchase: values.maxQuantityPerPurchase ?? null,
        maxQuantityPerStudent: values.maxQuantityPerStudent ?? null,
        availableFrom: toDateOrNull(values.availableFrom),
        availableUntil: toDateOrNull(values.availableUntil),
      };
      const id = await createMut.mutateAsync(data);
      onCreated?.(id);
      return;
    }

    // Edit mode — multilingual update. BE rejects price changes via this
    // endpoint once variants exist; variant prices are managed in the variant
    // builder, not here.
    const data: UpdateProductRequest = {
      nameEn: values.nameEn.trim(),
      nameAr: toStringOrNull(values.nameAr),
      nameKu: toStringOrNull(values.nameKu),
      description: toStringOrNull(values.description),
      type: values.type,
      currency: values.currency,
      academicYearId: values.academicYearId,
      applicableGradeId: values.applicableGradeId || null,
      applicableSectionId: values.applicableSectionId || null,
      maxQuantityPerPurchase: values.maxQuantityPerPurchase ?? null,
      maxQuantityPerStudent: values.maxQuantityPerStudent ?? null,
      availableFrom: toDateOrNull(values.availableFrom),
      availableUntil: toDateOrNull(values.availableUntil),
    };
    await updateMut.mutateAsync({ id: product!.id, data });
    onSaved?.();
  };

  const isPending = createMut.isPending || updateMut.isPending;

  // Lock fields per Task 2 BE rule: when restrictedEdit, only availability dates
  // and description remain editable. Variant prices are managed in the variant
  // builder.
  const lockBasic = restrictedEdit;
  const lockEligibility = restrictedEdit;
  const lockPricing = restrictedEdit;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basics — multilingual name */}
      <Card>
        <CardContent className="py-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
              <Package className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{t('products.basicInfo')}</h3>
          </div>

          <div className="space-y-4">
            {/* Multilingual name tabs */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">
                {t('products.name')}
              </label>
              <div className="mb-2 flex items-center gap-1 rounded-lg border border-border bg-surface-50 dark:bg-surface-elevated p-1 w-fit">
                {NAME_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveNameTab(tab.key)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      activeNameTab === tab.key
                        ? 'bg-primary-600 text-white'
                        : 'text-text-secondary hover:bg-hover'
                    }`}
                  >
                    <Globe className="h-3 w-3" />
                    {tab.tabLabel}
                    {tab.key === 'nameEn' && <span className="text-amber-300">*</span>}
                  </button>
                ))}
              </div>
              <Input
                key={activeNameTab}
                placeholder={
                  activeNameTab === 'nameEn'
                    ? t('products.namePlaceholder')
                    : activeNameTab === 'nameAr'
                    ? t('products.namePlaceholderAr')
                    : t('products.namePlaceholderKu')
                }
                error={
                  activeNameTab === 'nameEn'
                    ? errors.nameEn?.message && t('products.errNameEnRequired')
                    : undefined
                }
                disabled={lockBasic}
                {...register(activeNameTab)}
              />
              <p className="mt-1.5 text-xs text-text-muted">
                {t('products.nameMultilingualHint')}
              </p>
            </div>

            <Textarea
              label={t('products.description')}
              placeholder={t('products.descriptionPlaceholder')}
              rows={3}
              {...register('description')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('products.type')}
                    options={typeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={lockBasic}
                  />
                )}
              />
              <Controller
                name="schoolId"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('products.school')}
                    options={schoolOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.schoolId?.message && t('products.errSchoolRequired')}
                    disabled={!isCreate}
                  />
                )}
              />
              <Controller
                name="academicYearId"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('products.academicYear')}
                    options={academicYearOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.academicYearId?.message && t('products.errAcademicYearRequired')}
                    disabled={lockBasic}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility */}
      <Card>
        <CardContent className="py-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{t('products.eligibility')}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="applicableGradeId"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('products.grade')}
                  options={gradeOptions}
                  value={field.value ?? ''}
                  onChange={(v) => {
                    field.onChange(v);
                    // Clear section when grade changes
                    setValue('applicableSectionId', '');
                  }}
                  disabled={lockEligibility}
                />
              )}
            />
            <Controller
              name="applicableSectionId"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('products.section')}
                  options={sectionOptions}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={lockEligibility || !selectedGradeId}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardContent className="py-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{t('products.availability')}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('products.availableFrom')}
              type="date"
              {...register('availableFrom')}
            />
            <Input
              label={t('products.availableUntil')}
              type="date"
              error={
                errors.availableUntil?.message === 'availableUntilBeforeFrom'
                  ? t('products.errAvailableUntilBeforeFrom')
                  : undefined
              }
              {...register('availableUntil')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Limits */}
      <Card>
        <CardContent className="py-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{t('products.pricingLimits')}</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {(isCreate || noVariants) && (
              <Input
                label={t('products.defaultPrice')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                hint={t('products.defaultPriceHint')}
                error={
                  isCreate &&
                  (watch('defaultPrice') == null || Number.isNaN(watch('defaultPrice') as number))
                    ? undefined
                    : undefined
                }
                disabled={lockPricing}
                {...register('defaultPrice', { valueAsNumber: true })}
              />
            )}
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  label={t('products.currency')}
                  options={CURRENCIES}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={lockPricing}
                />
              )}
            />
            <Input
              label={t('products.maxPerPurchase')}
              type="number"
              min="1"
              placeholder={t('products.unlimited')}
              disabled={lockPricing}
              {...register('maxQuantityPerPurchase', { valueAsNumber: true })}
            />
            <Input
              label={t('products.maxPerStudent')}
              type="number"
              min="1"
              placeholder={t('products.unlimited')}
              disabled={lockPricing}
              {...register('maxQuantityPerStudent', { valueAsNumber: true })}
            />
          </div>

          {!isCreate && !noVariants && (
            <p className="mt-3 text-xs text-text-muted">{t('products.priceManagedByVariants')}</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="submit" isLoading={isPending}>
          {isCreate ? t('common.create') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
