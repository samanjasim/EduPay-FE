import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Shield } from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useRoles } from '../api';
import { ROUTES } from '@/config';

export default function RolesListPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useRoles();
  const roles = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('roles.title')}
        subtitle={t('roles.allRoles')}
        actions={
          <Link to={ROUTES.ROLES.CREATE}>
            <Button leftIcon={<Plus className="h-4 w-4" />}>{t('roles.createRole')}</Button>
          </Link>
        }
      />

      {roles.length === 0 ? (
        <EmptyState icon={Shield} title={t('common.noResults')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Link key={role.id} to={ROUTES.ROLES.getDetail(role.id)}>
              <Card className="hover:shadow-soft-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                      <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <Badge variant={role.isActive ? 'success' : 'warning'} size="sm">
                      {role.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-text-primary">{role.name}</h3>
                  {role.description && (
                    <p className="mt-1 text-sm text-text-muted line-clamp-2">{role.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
                    <span>{role.userCount} {t('roles.roleUsers').toLowerCase()}</span>
                    <span>{role.permissions?.length || 0} {t('roles.rolePermissions').toLowerCase()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
