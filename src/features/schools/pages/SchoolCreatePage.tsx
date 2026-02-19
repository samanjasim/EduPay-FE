import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle, Button, Input, Select } from '@/components/ui';
import { createSchoolSchema, type CreateSchoolFormData } from '@/lib/validation';
import { useCreateSchool } from '../api';
import { ROUTES } from '@/config';

const SUBSCRIPTION_OPTIONS = [
  { value: 'Basic', label: 'Basic' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Premium', label: 'Premium' },
];

export default function SchoolCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: createSchool, isPending } = useCreateSchool();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateSchoolFormData>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: {
      name: '',
      code: '',
      city: '',
      subscriptionPlan: 'Basic',
      academicYearStart: new Date().getFullYear(),
      academicYearEnd: new Date().getFullYear() + 1,
      address: '',
      phone: '',
      contactEmail: '',
      logoUrl: '',
    },
  });

  const onSubmit = (data: CreateSchoolFormData) => {
    const cleaned = {
      ...data,
      address: data.address || undefined,
      phone: data.phone || undefined,
      contactEmail: data.contactEmail || undefined,
      logoUrl: data.logoUrl || undefined,
    };
    createSchool(cleaned, {
      onSuccess: () => navigate(ROUTES.SCHOOLS.LIST),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={ROUTES.SCHOOLS.LIST}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            {t('schools.backToSchools')}
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('schools.newSchool')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="py-6">
            <CardTitle className="mb-4">{t('schools.basicInfo')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <Input
                label={t('schools.name')}
                placeholder="e.g. Baghdad International School"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label={t('schools.code')}
                placeholder="e.g. SCH-BGD-001"
                error={errors.code?.message}
                {...register('code')}
              />
              <Input
                label={t('schools.city')}
                placeholder="e.g. Baghdad"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label={t('schools.address')}
                placeholder={t('schools.addressPlaceholder')}
                error={errors.address?.message}
                {...register('address')}
              />
              <Input
                label={t('schools.phone')}
                placeholder="+964..."
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label={t('schools.contactEmail')}
                placeholder="admin@school.edu.iq"
                error={errors.contactEmail?.message}
                {...register('contactEmail')}
              />
              <div className="sm:col-span-2">
                <Input
                  label={t('schools.logoUrl')}
                  placeholder="https://..."
                  error={errors.logoUrl?.message}
                  {...register('logoUrl')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Year & Plan */}
        <Card>
          <CardContent className="py-6">
            <CardTitle className="mb-4">{t('schools.academicYearAndPlan')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
              <Input
                label={t('schools.academicYearStart')}
                type="number"
                error={errors.academicYearStart?.message}
                {...register('academicYearStart', { valueAsNumber: true })}
              />
              <Input
                label={t('schools.academicYearEnd')}
                type="number"
                error={errors.academicYearEnd?.message}
                {...register('academicYearEnd', { valueAsNumber: true })}
              />
              <Controller
                name="subscriptionPlan"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('schools.subscriptionPlan')}
                    options={SUBSCRIPTION_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.subscriptionPlan?.message}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" isLoading={isPending}>{t('common.create')}</Button>
          <Link to={ROUTES.SCHOOLS.LIST}>
            <Button variant="secondary" type="button">{t('common.cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
