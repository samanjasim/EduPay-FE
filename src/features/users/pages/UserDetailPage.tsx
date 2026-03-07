import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, X, Mail, Phone, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, Badge, Spinner, Button } from '@/components/ui';
import { PageHeader, InfoField, ConfirmModal } from '@/components/common';
import { useUser } from '../api';
import { useRoles, useRemoveUserRole } from '@/features/roles/api';
import { RoleAssignModal } from '../components';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  Active: 'success',
  Pending: 'warning',
  Suspended: 'error',
  Deactivated: 'error',
  Locked: 'error',
};

export default function UserDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser(id!);
  const { data: rolesData } = useRoles();
  const { mutate: removeRole, isPending: isRemovingRole } = useRemoveUserRole();
  const { hasPermission } = usePermissions();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState<{ roleId: string; roleName: string } | null>(null);

  const canManageRoles = hasPermission(PERMISSIONS.Users.ManageRoles);

  const allRoles = rolesData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-text-secondary">{t('common.noResults')}</div>;
  }

  const handleRemoveRole = () => {
    if (!roleToRemove) return;
    removeRole(
      { roleId: roleToRemove.roleId, userId: user.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.id) });
          setRoleToRemove(null);
        },
      }
    );
  };

  const handleRoleAssigned = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.id) });
  };

  // Find role IDs from role names for removal
  const findRoleId = (roleName: string): string | undefined => {
    return allRoles.find((r) => r.name === roleName)?.id;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        subtitle={`@${user.username}`}
        backTo={ROUTES.USERS.LIST}
        backLabel={t('users.backToUsers')}
      />

      {/* User Info */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 text-lg font-bold text-primary-600 dark:text-primary-400">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-text-primary">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-text-secondary">@{user.username}</p>
            </div>
            <Badge variant={STATUS_VARIANT[user.status || 'Active'] || 'default'}>
              {user.status || 'Active'}
            </Badge>
          </div>

          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label={t('users.userEmail')}>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-text-muted" />
                <span>{user.email}</span>
                {user.emailConfirmed && (
                  <Badge variant="success" size="sm">Verified</Badge>
                )}
              </div>
            </InfoField>
            {user.phoneNumber && (
              <InfoField label="Phone">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-text-muted" />
                  <span>{user.phoneNumber}</span>
                  {user.phoneConfirmed && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>
              </InfoField>
            )}
            <InfoField label={t('users.userCreated')}>
              {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '-'}
            </InfoField>
            {user.lastLoginAt && (
              <InfoField label="Last Login">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-muted" />
                  <span>{format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              </InfoField>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Roles Management */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              <ShieldCheck className="h-5 w-5 inline ltr:mr-2 rtl:ml-2 text-primary-600 dark:text-primary-400" />
              {t('users.userRoles')}
            </h3>
            {canManageRoles && (
              <Button
                size="sm"
                leftIcon={<UserPlus className="h-4 w-4" />}
                onClick={() => setShowAssignModal(true)}
              >
                Assign Role
              </Button>
            )}
          </div>

          {!user.roles || user.roles.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">No roles assigned.</p>
          ) : (
            <div className="space-y-2">
              {user.roles.map((roleName) => {
                const roleId = findRoleId(roleName);
                return (
                  <div
                    key={roleName}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                        <ShieldCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{roleName}</span>
                    </div>
                    {canManageRoles && roleId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoleToRemove({ roleId, roleName })}
                        className="text-text-muted hover:text-red-600 dark:hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Permissions (derived from roles) */}
      {user.permissions && user.permissions.length > 0 && (
        <Card>
          <CardContent className="py-6">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Effective Permissions
            </h3>
            <p className="mb-3 text-xs text-text-muted">
              These permissions are derived from the user's assigned roles.
            </p>
            <div className="flex flex-wrap gap-2">
              {[...user.permissions].sort().map((perm) => (
                <Badge key={perm} variant="info" size="sm">
                  {perm}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Role Modal */}
      <RoleAssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        userId={user.id}
        currentRoles={user.roles ?? []}
        onSuccess={handleRoleAssigned}
      />

      {/* Remove Role Confirmation */}
      <ConfirmModal
        isOpen={!!roleToRemove}
        onClose={() => setRoleToRemove(null)}
        onConfirm={handleRemoveRole}
        title="Remove Role"
        description={`Are you sure you want to remove the "${roleToRemove?.roleName}" role from ${user.firstName} ${user.lastName}? They will lose all permissions associated with this role.`}
        confirmLabel="Remove Role"
        isLoading={isRemovingRole}
      />
    </div>
  );
}
