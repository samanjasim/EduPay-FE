import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { createSchoolSchema, type CreateSchoolFormData } from '@/lib/validation';
import { useCreateSchool } from '../api';
import { ROUTES } from '@/config';

export default function SchoolCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: createSchool, isPending } = useCreateSchool();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSchoolFormData>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: {
      name: '',
      code: '',
      city: '',
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
      <PageHeader
        title={t('schools.newSchool')}
        backTo={ROUTES.SCHOOLS.LIST}
        backLabel={t('schools.backToSchools')}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="py-6">
            <CardTitle className="mb-5">{t('schools.basicInfo')}</CardTitle>
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
