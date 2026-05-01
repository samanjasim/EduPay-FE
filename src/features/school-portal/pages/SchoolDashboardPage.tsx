import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Receipt, AlertTriangle, TrendingUp, Plus, Eye, ArrowRight, Clock, Banknote } from 'lucide-react';
import { useAuthStore, selectUser } from '@/stores';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';
import { useSchoolDashboard, useSchoolSetupStatus } from '@/features/school-portal/api';
import { ROUTES } from '@/config';
import { PERMISSIONS } from '@/constants';
import { usePermissions } from '@/hooks';
import { Button, Card, Badge } from '@/components/ui';
import { Spinner } from '@/components/ui';
import type { RecentFeeInstance } from '@/types/school-portal.types';

export default function SchoolDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const { schoolId } = useSchoolContext();
  const { hasAllPermissions } = usePermissions();
  const { data: dashboard, isLoading } = useSchoolDashboard(schoolId ?? undefined);
  const { data: setupStatus } = useSchoolSetupStatus(schoolId ?? undefined);
  const canViewCashCollection = hasAllPermissions([
    PERMISSIONS.CashCollections.View,
    PERMISSIONS.Fees.View,
  ]);

  // Auto-redirect to setup wizard if school is not configured and wizard hasn't been completed
  useEffect(() => {
    if (setupStatus && setupStatus.gradesCount === 0 && !setupStatus.setupWizardCompleted) {
      navigate(ROUTES.SCHOOL.SETUP, { replace: true });
    }
  }, [setupStatus, navigate]);

  const isSetupIncomplete = setupStatus && (
    setupStatus.gradesCount === 0 ||
    setupStatus.studentsCount === 0 ||
    setupStatus.feeStructuresCount === 0
  );

  return (
    <div className="space-y-6">
      {/* Setup incomplete banner */}
      {isSetupIncomplete && setupStatus.gradesCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {t('schoolPortal.dashboard.setupIncomplete')}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
              {t('schoolPortal.dashboard.setupIncompleteDesc')}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate(ROUTES.SCHOOL.SETUP)}>
            {t('schoolPortal.dashboard.completeSetup')}
            <ArrowRight className="h-4 w-4 ltr:ml-1 rtl:mr-1" />
          </Button>
        </div>
      )}

      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
        <h1 className="text-2xl font-bold">
          {t('schoolPortal.dashboard.welcome', { name: user?.firstName })}
        </h1>
        <p className="mt-1 text-emerald-100">
          {t('schoolPortal.dashboard.subtitle')}
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t('schoolPortal.dashboard.totalStudents')}
              value={dashboard?.activeStudents ?? 0}
              icon={Users}
              color="emerald"
            />
            <StatCard
              label={t('schoolPortal.dashboard.activeFeeStructures')}
              value={dashboard?.activeFeeStructures ?? 0}
              icon={Receipt}
              color="blue"
            />
            <StatCard
              label={t('schoolPortal.dashboard.collectionRate')}
              value={`${dashboard?.feeCollection?.collectionRate?.toFixed(1) ?? 0}%`}
              icon={TrendingUp}
              color="violet"
            />
            <StatCard
              label={t('schoolPortal.dashboard.overdueAmount')}
              value={dashboard?.feeCollection?.totalOverdue?.toLocaleString() ?? '0'}
              icon={AlertTriangle}
              color="red"
            />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate(`${ROUTES.SCHOOL.STUDENTS.LIST}?create=true`)}>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('schoolPortal.dashboard.addStudent')}
            </Button>
            <Button variant="outline" onClick={() => navigate(`${ROUTES.SCHOOL.FEES}?create=true`)}>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('schoolPortal.dashboard.createFeeStructure')}
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.SCHOOL.FEES)}>
              <Eye className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('schoolPortal.dashboard.viewOverdue')}
            </Button>
            {canViewCashCollection && (
              <Button variant="outline" onClick={() => navigate(ROUTES.SCHOOL.CASH_COLLECTION)}>
                <Banknote className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t('schoolPortal.nav.cashCollection')}
              </Button>
            )}
          </div>

          {/* Two-column: Fee breakdown + Recent activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Fee status breakdown */}
            {dashboard?.feeStatusBreakdown && (
              <Card>
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">
                    {t('schoolPortal.dashboard.feeStatusBreakdown')}
                  </h3>
                  <FeeStatusBar breakdown={dashboard.feeStatusBreakdown} />
                </div>
              </Card>
            )}

            {/* Recent activity */}
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {t('schoolPortal.dashboard.recentActivity')}
                  </h3>
                  <Link to={ROUTES.SCHOOL.FEES}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3.5 w-3.5 ltr:mr-1 rtl:ml-1" />
                      {t('common.viewAll')}
                    </Button>
                  </Link>
                </div>
                <RecentActivityList items={dashboard?.recentFeeInstances ?? []} />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// --- Sub-components ---

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'violet' | 'red';
}

const colorMap = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', icon: 'text-violet-600 dark:text-violet-400' },
  red: { bg: 'bg-red-50 dark:bg-red-500/10', icon: 'text-red-600 dark:text-red-400' },
};

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <Card>
      <div className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-sm text-text-muted">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function FeeStatusBar({ breakdown }: { breakdown: { pending: number; paid: number; overdue: number; waived: number; cancelled: number } }) {
  const total = breakdown.pending + breakdown.paid + breakdown.overdue + breakdown.waived + breakdown.cancelled;
  const { t } = useTranslation();
  if (total === 0) return <p className="text-sm text-text-muted">{t('schoolPortal.dashboard.noFeeInstances')}</p>;

  const segments = [
    { key: 'paid', count: breakdown.paid, color: 'bg-emerald-500', label: t('feeInstances.paid') },
    { key: 'pending', count: breakdown.pending, color: 'bg-amber-400', label: t('feeInstances.pending') },
    { key: 'overdue', count: breakdown.overdue, color: 'bg-red-500', label: t('feeInstances.overdue') },
    { key: 'waived', count: breakdown.waived, color: 'bg-gray-400', label: t('feeInstances.waived') },
    { key: 'cancelled', count: breakdown.cancelled, color: 'bg-gray-300', label: t('feeInstances.cancelled') },
  ];

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div key={seg.key} className={`${seg.color} transition-all`} style={{ width: `${(seg.count / total) * 100}%` }} />
          ) : null
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2 text-sm">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-text-muted">
              {seg.label}: <span className="font-medium text-text-primary">{seg.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Paid: 'success', Pending: 'warning', Overdue: 'error', Waived: 'default', Cancelled: 'default',
};

function RecentActivityList({ items }: { items: RecentFeeInstance[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-muted">No recent activity.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 shrink-0">
              <Clock className="h-3.5 w-3.5 text-text-muted" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{item.studentName}</p>
              <p className="text-xs text-text-muted truncate">{item.feeStructureName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-text-primary">{item.amount?.toLocaleString()}</span>
            <Badge variant={STATUS_COLORS[item.status] ?? 'default'}>{item.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
