import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Badge, Spinner } from '@/components/ui';
import { PageHeader, InfoField } from '@/components/common';
import { useUser } from '../api';
import { ROUTES } from '@/config';
import { format } from 'date-fns';

export default function UserDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id!);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        subtitle={`@${user.username}`}
        backTo={ROUTES.USERS.LIST}
        backLabel={t('users.backToUsers')}
      />

      <Card>
        <CardContent className="py-6">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <InfoField label={t('users.userEmail')}>
              {user.email}
            </InfoField>
            <InfoField label={t('users.userStatus')}>
              <Badge variant={user.status === 'Active' ? 'success' : 'warning'}>
                {user.status || t('common.active')}
              </Badge>
            </InfoField>
            <InfoField label={t('users.userRoles')}>
              <div className="flex flex-wrap gap-1">
                {user.roles?.map((role) => (
                  <Badge key={role} variant="primary" size="sm">{role}</Badge>
                )) || <span className="text-text-muted">-</span>}
              </div>
            </InfoField>
            <InfoField label={t('users.userCreated')}>
              {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '-'}
            </InfoField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
