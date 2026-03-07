import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Info } from 'lucide-react';
import { Card, CardContent, Button, Input, Textarea, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { createRoleSchema, type CreateRoleFormData } from '@/lib/validation';
import { useCreateRole, useAllPermissions, useUpdateRolePermissions } from '../api';
import { PermissionMatrix } from '../components';
import { ROUTES } from '@/config';

export default function RoleCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updatePermissions, isPending: isAssigning } = useUpdateRolePermissions();
  const { data: allPermissions, isLoading: isLoadingPerms } = useAllPermissions();

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '' },
  });

  const isSaving = isCreating || isAssigning;

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      const roleId = await createRole(data);

      if (selectedPermissionIds.size > 0) {
        updatePermissions(
          { id: roleId, data: { permissionIds: Array.from(selectedPermissionIds) } },
          { onSuccess: () => navigate(ROUTES.ROLES.getDetail(roleId)) }
        );
      } else {
        navigate(ROUTES.ROLES.getDetail(roleId));
      }
    } catch {
      // Error handled by mutation's onError / error interceptor
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('roles.newRole')}
        backTo={ROUTES.ROLES.LIST}
        backLabel={t('roles.backToRoles')}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Role Details */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Role Details</h3>
            </div>
            <div className="space-y-4 max-w-lg">
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
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Assign Permissions */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">2</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Assign Permissions</h3>
              </div>
              {selectedPermissionIds.size > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {selectedPermissionIds.size} permission{selectedPermissionIds.size !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 mb-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3 py-2.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Select the permissions this role should have. You can also modify permissions later from the role edit page.
              </p>
            </div>

            {isLoadingPerms ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : allPermissions ? (
              <PermissionMatrix
                allPermissions={allPermissions}
                selectedIds={selectedPermissionIds}
                onChange={setSelectedPermissionIds}
              />
            ) : null}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={isSaving}>
            {t('common.create')}
          </Button>
          <Link to={ROUTES.ROLES.LIST}>
            <Button variant="secondary" type="button">{t('common.cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
