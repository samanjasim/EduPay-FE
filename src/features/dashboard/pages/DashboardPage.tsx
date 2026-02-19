import { Users, Shield, TrendingUp, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui';
import { useAuthStore, selectUser } from '@/stores';
import { useUsers } from '@/features/users/api';
import { useRoles } from '@/features/roles/api';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'primary' | 'accent' | 'green' | 'blue';
}) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',
    accent: 'bg-accent-100 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  };

  return (
    <Card variant="elevated">
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const { data: usersData } = useUsers();
  const { data: roles = [] } = useRoles();

  const users = usersData?.items ?? [];
  const activeRoles = Array.isArray(roles) ? roles.filter((role) => role.isActive) : [];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t('dashboard.welcomeBack', { name: user?.firstName })}
              </h1>
              <p className="text-primary-100">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={t('dashboard.totalUsers')} value={users.length} color="primary" />
        <StatCard icon={Shield} label={t('dashboard.activeRoles')} value={activeRoles.length} color="accent" />
        <StatCard icon={TrendingUp} label={t('dashboard.totalRoles')} value={roles.length} color="green" />
        <StatCard icon={GraduationCap} label={t('dashboard.platformStatus')} value={t('common.active')} color="blue" />
      </div>

      {/* Quick overview */}
      <Card>
        <CardContent className="py-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">{t('dashboard.quickOverview')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-hover p-4">
              <h3 className="text-sm font-medium text-text-primary">{t('dashboard.usersManagement')}</h3>
              <p className="mt-1 text-sm text-text-muted">{t('dashboard.usersManagementDesc')}</p>
            </div>
            <div className="rounded-lg border border-border bg-hover p-4">
              <h3 className="text-sm font-medium text-text-primary">{t('dashboard.rolesPermissions')}</h3>
              <p className="mt-1 text-sm text-text-muted">{t('dashboard.rolesPermissionsDesc')}</p>
            </div>
            <div className="rounded-lg border border-border bg-hover p-4">
              <h3 className="text-sm font-medium text-text-primary">{t('dashboard.schoolsManagement')}</h3>
              <p className="mt-1 text-sm text-text-muted">{t('dashboard.schoolsManagementDesc')}</p>
            </div>
            <div className="rounded-lg border border-border bg-hover p-4">
              <h3 className="text-sm font-medium text-text-primary">{t('dashboard.paymentsOverview')}</h3>
              <p className="mt-1 text-sm text-text-muted">{t('dashboard.paymentsOverviewDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
