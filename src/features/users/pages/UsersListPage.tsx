import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, Badge, Spinner } from '@/components/ui';
import { EmptyState } from '@/components/common';
import { useUsers } from '../api';
import { ROUTES } from '@/config';
import { Users } from 'lucide-react';
import { format } from 'date-fns';

export default function UsersListPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useUsers();

  const users = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('users.title')}</h1>
        <p className="text-text-secondary">{t('users.allUsers')}</p>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title={t('common.noResults')} />
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-text-secondary">{t('users.userName')}</th>
                    <th className="pb-3 text-left font-medium text-text-secondary">{t('users.userEmail')}</th>
                    <th className="pb-3 text-left font-medium text-text-secondary">{t('users.userRoles')}</th>
                    <th className="pb-3 text-left font-medium text-text-secondary">{t('users.userCreated')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-hover transition-colors">
                      <td className="py-3">
                        <Link to={ROUTES.USERS.getDetail(user.id)} className="font-medium text-text-primary hover:text-primary-600 dark:hover:text-primary-400">
                          {user.firstName} {user.lastName}
                        </Link>
                        <p className="text-xs text-text-muted">@{user.username}</p>
                      </td>
                      <td className="py-3 text-text-secondary">{user.email}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <Badge key={role} variant="primary" size="sm">{role}</Badge>
                          )) || <span className="text-text-muted">-</span>}
                        </div>
                      </td>
                      <td className="py-3 text-text-muted">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
