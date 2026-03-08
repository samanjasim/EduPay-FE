import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Lock, Info, ShieldCheck, FileText } from 'lucide-react';
import { Card, CardContent, Button, Input, Textarea, Spinner, Badge } from '@/components/ui';
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

  const addedPerms = useMemo(
    () => [...selectedPermissionIds].filter((id) => !initialPermIds.has(id)).length,
    [selectedPermissionIds, initialPermIds]
  );

  const removedPerms = useMemo(
    () => [...initialPermIds].filter((id) => !selectedPermissionIds.has(id)).length,
    [selectedPermissionIds, initialPermIds]
  );

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

    if (isDirty && canUpdate) {
      pendingOps++;
      updateRole(
        { id: role.id, data },
        { onSuccess: checkDone }
      );
    }

    if (permissionsChanged && canManagePermissions) {
      pendingOps++;
      updatePermissions(
        { id: role.id, data: { permissionIds: Array.from(selectedPermissionIds) } },
        { onSuccess: checkDone }
      );
    }

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

      {/* System role warning */}
      {role.isSystemRole && (
        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3">
          <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This is a system role. Its details and permissions cannot be modified.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Role Details */}
        {canUpdate && (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                    <FileText className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">Role Details</h3>
                </div>
                {isDirty && (
                  <Badge variant="warning" size="sm">Modified</Badge>
                )}
              </div>
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

        {/* Step 2: Permission Matrix */}
        {canManagePermissions && allPermissions && (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">Permissions</h3>
                </div>
                <div className="flex items-center gap-2">
                  {permissionsChanged && (
                    <Badge variant="warning" size="sm">Modified</Badge>
                  )}
                  {addedPerms > 0 && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+{addedPerms} added</span>
                  )}
                  {removedPerms > 0 && (
                    <span className="text-xs font-medium text-red-500 dark:text-red-400">-{removedPerms} removed</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 mb-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3 py-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Changes to permissions will replace all current permissions with the selected ones.
                </p>
              </div>

              <PermissionMatrix
                allPermissions={allPermissions}
                selectedIds={selectedPermissionIds}
                onChange={setSelectedPermissionIds}
                disabled={role.isSystemRole}
              />
            </CardContent>
          </Card>
        )}

        {/* Sticky Actions Bar */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <div className="text-sm text-text-muted">
            {hasChanges ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">You have unsaved changes</span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link to={ROUTES.ROLES.getDetail(role.id)}>
              <Button variant="secondary" type="button">{t('common.cancel')}</Button>
            </Link>
            <Button type="submit" isLoading={isSaving} disabled={!hasChanges || role.isSystemRole}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
