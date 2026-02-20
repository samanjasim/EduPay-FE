import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { Card, CardContent, Badge, Spinner } from '@/components/ui';
import { PageHeader, InfoField } from '@/components/common';
import { useRole } from '../api';
import { ROUTES } from '@/config';
import { format } from 'date-fns';

export default function RoleDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: role, isLoading } = useRole(id!);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        backTo={ROUTES.ROLES.LIST}
        backLabel={t('roles.backToRoles')}
      />

      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-text-primary">{role.name}</h2>
              {role.description && <p className="text-text-secondary">{role.description}</p>}
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

          {role.permissions && role.permissions.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-text-primary">{t('roles.rolePermissions')}</h3>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm) => (
                  <Badge key={perm.id} variant="info" size="sm">
                    {perm.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
