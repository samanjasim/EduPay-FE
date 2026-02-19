import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, Badge, Button, Spinner } from '@/components/ui';
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
      <div className="flex items-center gap-4">
        <Link to={ROUTES.USERS.LIST}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            {t('users.backToUsers')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{user.firstName} {user.lastName}</h1>
            <p className="text-text-secondary">@{user.username}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-muted">{t('users.userEmail')}</label>
              <p className="text-text-primary">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('users.userStatus')}</label>
              <div className="mt-1">
                <Badge variant={user.status === 'Active' ? 'success' : 'warning'}>
                  {user.status || t('common.active')}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('users.userRoles')}</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {user.roles?.map((role) => (
                  <Badge key={role} variant="primary" size="sm">{role}</Badge>
                )) || <span className="text-text-muted">-</span>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted">{t('users.userCreated')}</label>
              <p className="text-text-primary">
                {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
