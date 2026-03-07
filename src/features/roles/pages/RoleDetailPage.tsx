import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Pencil, Trash2, Lock } from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import { useRole, useDeleteRole } from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { format } from 'date-fns';

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        backTo={ROUTES.ROLES.LIST}
        backLabel={t('roles.backToRoles')}
        actions={
          !role.isSystemRole ? (
            <div className="flex items-center gap-2">
              {(canUpdate || canManagePermissions) && (
                <Link to={ROUTES.ROLES.getEdit(role.id)}>
                  <Button variant="secondary" leftIcon={<Pencil className="h-4 w-4" />}>
                    {t('common.edit')}
                  </Button>
                </Link>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t('common.delete')}
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Role Overview */}
      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-primary">{role.name}</h2>
                {role.isSystemRole && (
                  <Badge variant="outline" size="sm">
                    <Lock className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                    System
                  </Badge>
                )}
              </div>
              {role.description && <p className="mt-1 text-text-secondary">{role.description}</p>}
            </div>
            <Badge variant={role.isActive ? 'success' : 'warning'} className="shrink-0">
              {role.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
          </div>

          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <InfoField label={t('roles.roleUsers')}>
              <p className="text-lg font-semibold">{role.userCount}</p>
            </InfoField>
            <InfoField label={t('roles.rolePermissions')}>
              <p className="text-lg font-semibold">{role.permissions?.length || 0}</p>
            </InfoField>
            <InfoField label={t('users.userCreated')}>
              {role.createdAt ? format(new Date(role.createdAt), 'MMMM d, yyyy') : '-'}
            </InfoField>
          </div>
        </CardContent>
      </Card>

      {/* Permissions grouped by Module */}
      {Object.keys(permissionsByModule).length > 0 && (
        <Card>
          <CardContent className="py-6">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">{t('roles.rolePermissions')}</h3>
            <div className="space-y-4">
              {Object.entries(permissionsByModule)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([module, perms]) => (
                  <div key={module}>
                    <h4 className="mb-2 text-sm font-medium text-text-secondary">{module}</h4>
                    <div className="flex flex-wrap gap-2">
                      {perms!.map((perm) => (
                        <Badge key={perm.id} variant="info" size="sm">
                          {perm.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${role.name}"? This action cannot be undone. Users assigned to this role will lose its permissions.`}
        confirmLabel="Delete Role"
        isLoading={isDeleting}
      />
    </div>
  );
}
