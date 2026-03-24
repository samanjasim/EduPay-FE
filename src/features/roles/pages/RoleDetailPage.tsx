import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield, Pencil, Trash2, Lock, Users, ShieldCheck,
  Calendar, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader, ConfirmModal } from '@/components/common';
import { useRole, useDeleteRole } from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { format } from 'date-fns';

function formatPermissionLabel(name: string): string {
  const action = name.split('.').pop() || name;
  return action.replace(/([A-Z])/g, ' $1').trim();
}

export default function RoleDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading } = useRole(id!);
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const { hasPermission } = usePermissions();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canUpdate = hasPermission(PERMISSIONS.Roles.Update);
  const canDelete = hasPermission(PERMISSIONS.Roles.Delete);
  const canManagePermissions = hasPermission(PERMISSIONS.Roles.ManagePermissions);
  const hasUsers = (role?.userCount ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!role) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const handleDelete = () => {
    deleteRole(role.id, {
      onSuccess: () => navigate(ROUTES.ROLES.LIST),
    });
  };

  // Group permissions by module for organized display
  const permissionsByModule = (role.permissions ?? []).reduce<Record<string, typeof role.permissions>>(
    (acc, perm) => {
      const module = perm.module || 'Other';
      if (!acc[module]) acc[module] = [];
      acc[module]!.push(perm);
      return acc;
    },
    {}
  );

  const moduleCount = Object.keys(permissionsByModule).length;

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={ROUTES.ROLES.LIST}
        backLabel={t('roles.backToRoles')}
      />

      {/* Role Header Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-text-primary">{role.name}</h1>
                {role.isSystemRole && (
                  <Badge variant="outline" size="sm">
                    <Lock className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                    System
                  </Badge>
                )}
              </div>
              {role.description && <p className="mt-1 text-text-secondary">{role.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={role.isActive ? 'success' : 'warning'}>
                {role.isActive ? t('common.active') : t('common.inactive')}
              </Badge>
              {!role.isSystemRole && (canUpdate || canManagePermissions) && (
                <Link to={ROUTES.ROLES.getEdit(role.id)}>
                  <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                    {t('common.edit')}
                  </Button>
                </Link>
              )}
              {!role.isSystemRole && canDelete && (
                <div className="relative group">
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => setShowDeleteModal(true)}
                    disabled={hasUsers}
                  >
                    {t('common.delete')}
                  </Button>
                  {hasUsers && (
                    <div className="absolute right-0 top-full mt-2 z-10 hidden group-hover:block w-64">
                      <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 shadow-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            This role is assigned to {role.userCount} user{role.userCount !== 1 ? 's' : ''}. Remove all users from this role before deleting.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* System role banner */}
          {role.isSystemRole && (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This is a system role and cannot be modified or deleted. Its permissions are managed automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{role.userCount}</p>
              <p className="text-xs text-text-muted">{t('roles.roleUsers')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{role.permissions?.length || 0}</p>
              <p className="text-xs text-text-muted">{t('roles.rolePermissions')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
              <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {role.createdAt ? format(new Date(role.createdAt), 'MMM d, yyyy') : '-'}
              </p>
              <p className="text-xs text-text-muted">{t('users.userCreated')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {t('roles.rolePermissions')}
            <Badge variant="primary" size="sm" className="ltr:ml-1 rtl:mr-1">
              {moduleCount} module{moduleCount !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          {!role.isSystemRole && canManagePermissions && (
            <Link to={ROUTES.ROLES.getEdit(role.id)}>
              <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                Edit Permissions
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {moduleCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated mb-3">
                <Shield className="h-6 w-6 text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">No permissions assigned to this role.</p>
              {!role.isSystemRole && canManagePermissions && (
                <Link to={ROUTES.ROLES.getEdit(role.id)} className="mt-3">
                  <Button size="sm" variant="secondary">Assign Permissions</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(permissionsByModule)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([module, perms]) => (
                  <div key={module} className="rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-hover/50">
                      <span className="text-sm font-medium text-text-primary">{module}</span>
                      <span className="text-xs text-text-muted">{perms!.length} permission{perms!.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                      {perms!.map((perm) => (
                        <div key={perm.id} className="flex items-center gap-2.5 px-4 py-2.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          <div className="min-w-0">
                            <span className="font-medium text-text-primary">
                              {formatPermissionLabel(perm.name)}
                            </span>
                            {perm.description && (
                              <p className="text-xs text-text-muted truncate">{perm.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`}
        confirmLabel="Delete Role"
        isLoading={isDeleting}
      />
    </div>
  );
}
