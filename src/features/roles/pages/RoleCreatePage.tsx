import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Input, Textarea } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { createRoleSchema, type CreateRoleFormData } from '@/lib/validation';
import { useCreateRole } from '../api';
import { ROUTES } from '@/config';

export default function RoleCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: createRole, isPending } = useCreateRole();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = (data: CreateRoleFormData) => {
    createRole(data, {
      onSuccess: () => navigate(ROUTES.ROLES.LIST),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('roles.newRole')}
        backTo={ROUTES.ROLES.LIST}
        backLabel={t('roles.backToRoles')}
      />

      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
            <Input
              label={t('roles.name')}
              placeholder="e.g. School Admin"
              error={errors.name?.message}
              {...register('name')}
            />

            <Textarea
              label={t('roles.description')}
              placeholder="Describe the role's purpose..."
              rows={3}
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isPending}>{t('common.create')}</Button>
              <Link to={ROUTES.ROLES.LIST}>
                <Button variant="secondary">{t('common.cancel')}</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
