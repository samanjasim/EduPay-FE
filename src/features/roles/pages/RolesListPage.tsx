import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Shield, Users, Lock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useRoles } from '../api';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';

export default function RolesListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
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
          hasPermission(PERMISSIONS.Roles.Create) ? (
            <Link to={ROUTES.ROLES.CREATE}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>{t('roles.createRole')}</Button>
            </Link>
          ) : undefined
        }
      />

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
              <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{roles.length}</p>
              <p className="text-xs text-text-muted">Total Roles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{roles.filter((r) => r.isActive).length}</p>
              <p className="text-xs text-text-muted">Active Roles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{roles.filter((r) => r.isSystemRole).length}</p>
              <p className="text-xs text-text-muted">System Roles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {roles.length === 0 ? (
        <EmptyState icon={Shield} title={t('common.noResults')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Link key={role.id} to={ROUTES.ROLES.getDetail(role.id)}>
              <Card className="hover:shadow-soft-md transition-all hover:border-primary-200 dark:hover:border-primary-500/30 cursor-pointer h-full">
                <CardContent className="py-5 px-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20">
                      <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {role.isSystemRole && (
                        <Badge variant="outline" size="sm">
                          <Lock className="h-3 w-3 ltr:mr-0.5 rtl:ml-0.5" />
                          System
                        </Badge>
                      )}
                      <Badge variant={role.isActive ? 'success' : 'warning'} size="sm">
                        {role.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-text-primary">{role.name}</h3>
                  {role.description && (
                    <p className="mt-1 text-sm text-text-muted line-clamp-2">{role.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Users className="h-3.5 w-3.5" />
                      <span>{role.userCount} {t('roles.roleUsers').toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{role.permissions?.length || 0} {t('roles.rolePermissions').toLowerCase()}</span>
                    </div>
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
