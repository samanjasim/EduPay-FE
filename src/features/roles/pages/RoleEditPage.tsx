import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Button, Input, Textarea, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { updateRoleSchema, type UpdateRoleFormData } from '@/lib/validation';
import { useRole, useUpdateRole, useAllPermissions, useUpdateRolePermissions } from '../api';
import { PermissionMatrix } from '../components';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';

export default function RoleEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: role, isLoading: isLoadingRole } = useRole(id!);
  const { data: allPermissions, isLoading: isLoadingPerms } = useAllPermissions();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateRole();
  const { mutate: updatePermissions, isPending: isUpdatingPerms } = useUpdateRolePermissions();

  const canUpdate = hasPermission(PERMISSIONS.Roles.Update);
  const canManagePermissions = hasPermission(PERMISSIONS.Roles.ManagePermissions);

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
  });

  // Initialize form + permission selection when role loads
  useEffect(() => {
    if (role) {
      reset({ name: role.name, description: role.description || '' });
      setSelectedPermissionIds(new Set(role.permissions?.map((p) => p.id) ?? []));
    }
  }, [role, reset]);

  const initialPermIds = useMemo(
    () => new Set(role?.permissions?.map((p) => p.id) ?? []),
    [role]
  );

  const permissionsChanged = useMemo(() => {
    if (selectedPermissionIds.size !== initialPermIds.size) return true;
    for (const id of selectedPermissionIds) {
      if (!initialPermIds.has(id)) return true;
    }
    return false;
  }, [selectedPermissionIds, initialPermIds]);

  const hasChanges = isDirty || permissionsChanged;
  const isSaving = isUpdatingRole || isUpdatingPerms;

  if (isLoadingRole || isLoadingPerms) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!role) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const onSubmit = (data: UpdateRoleFormData) => {
    let pendingOps = 0;
    let completedOps = 0;

    const checkDone = () => {
      completedOps++;
      if (completedOps === pendingOps) {
        navigate(ROUTES.ROLES.getDetail(role.id));
      }
    };

    // Update role info if changed
    if (isDirty && canUpdate) {
      pendingOps++;
      updateRole(
        { id: role.id, data },
        { onSuccess: checkDone }
      );
    }

    // Update permissions if changed
    if (permissionsChanged && canManagePermissions) {
      pendingOps++;
      updatePermissions(
        { id: role.id, data: { permissionIds: Array.from(selectedPermissionIds) } },
        { onSuccess: checkDone }
      );
    }

    // If nothing changed, just navigate back
    if (pendingOps === 0) {
      navigate(ROUTES.ROLES.getDetail(role.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${role.name}`}
        backTo={ROUTES.ROLES.getDetail(role.id)}
        backLabel={t('roles.backToRoles')}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Details */}
        {canUpdate && (
          <Card>
            <CardContent className="py-6">
              <h3 className="mb-4 text-lg font-semibold text-text-primary">Role Details</h3>
              <div className="space-y-4 max-w-lg">
                <Input
                  label={t('roles.name')}
                  placeholder="e.g. School Admin"
                  error={errors.name?.message}
                  disabled={role.isSystemRole}
                  {...register('name')}
                />
                <Textarea
                  label={t('roles.description')}
                  placeholder="Describe the role's purpose..."
                  rows={3}
                  error={errors.description?.message}
                  disabled={role.isSystemRole}
                  {...register('description')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permission Matrix */}
        {canManagePermissions && allPermissions && (
          <Card>
            <CardContent className="py-6">
              <h3 className="mb-4 text-lg font-semibold text-text-primary">Permissions</h3>
              <PermissionMatrix
                allPermissions={allPermissions}
                selectedIds={selectedPermissionIds}
                onChange={setSelectedPermissionIds}
                disabled={role.isSystemRole}
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={isSaving} disabled={!hasChanges || role.isSystemRole}>
            {t('common.save')}
          </Button>
          <Link to={ROUTES.ROLES.getDetail(role.id)}>
            <Button variant="secondary">{t('common.cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
