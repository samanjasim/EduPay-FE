import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@/components/ui';
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
      <div className="flex items-center gap-4">
        <Link to={ROUTES.ROLES.LIST}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            {t('roles.backToRoles')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{role.name}</h1>
              {role.description && <p className="text-text-secondary">{role.description}</p>}
            </div>
            <Badge variant={role.isActive ? 'success' : 'warning'} className="ltr:ml-auto rtl:mr-auto">
              {role.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-text-muted">{t('roles.roleUsers')}</label>
              <p className="text-lg font-semibold text-text-primary">{role.userCount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('roles.rolePermissions')}</label>
              <p className="text-lg font-semibold text-text-primary">{role.permissions?.length || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('users.userCreated')}</label>
              <p className="text-text-primary">
                {role.createdAt ? format(new Date(role.createdAt), 'MMMM d, yyyy') : '-'}
              </p>
            </div>
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
