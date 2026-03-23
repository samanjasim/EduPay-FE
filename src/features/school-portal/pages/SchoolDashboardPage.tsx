import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Receipt, AlertTriangle, TrendingUp, Plus, Eye } from 'lucide-react';
import { useAuthStore, selectUser } from '@/stores';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';
import { useSchoolDashboard, useSchoolSetupStatus } from '@/features/school-portal/api';
import { ROUTES } from '@/config';
import { Button, Card } from '@/components/ui';
import { Spinner } from '@/components/ui';

export default function SchoolDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const { schoolId } = useSchoolContext();
  const { data: dashboard, isLoading } = useSchoolDashboard(schoolId ?? undefined);
  const { data: setupStatus } = useSchoolSetupStatus(schoolId ?? undefined);

  // Auto-redirect to setup wizard if school is not configured
  useEffect(() => {
    if (setupStatus && setupStatus.gradesCount === 0) {
      navigate(ROUTES.SCHOOL.SETUP, { replace: true });
    }
  }, [setupStatus, navigate]);

  return (
    <div className="space-y-6">
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
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
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
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.SCHOOL.STUDENTS.LIST)}
            >
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('schoolPortal.dashboard.addStudent')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.SCHOOL.FEES)}
            >
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('schoolPortal.dashboard.createFeeStructure')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.SCHOOL.FEES)}
            >
              <Eye className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t('schoolPortal.dashboard.viewOverdue')}
            </Button>
          </div>

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
        </>
      )}
    </div>
  );
}

// --- Inline components for now, will extract later if needed ---

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'violet' | 'red';
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    icon: 'text-violet-600 dark:text-violet-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    icon: 'text-red-600 dark:text-red-400',
  },
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

interface FeeStatusBarProps {
  breakdown: {
    pending: number;
    paid: number;
    overdue: number;
    waived: number;
    cancelled: number;
  };
}

function FeeStatusBar({ breakdown }: FeeStatusBarProps) {
  const total = breakdown.pending + breakdown.paid + breakdown.overdue + breakdown.waived + breakdown.cancelled;
  if (total === 0) return <p className="text-sm text-text-muted">No fee instances yet.</p>;

  const segments = [
    { key: 'paid', count: breakdown.paid, color: 'bg-emerald-500', label: 'Paid' },
    { key: 'pending', count: breakdown.pending, color: 'bg-amber-400', label: 'Pending' },
    { key: 'overdue', count: breakdown.overdue, color: 'bg-red-500', label: 'Overdue' },
    { key: 'waived', count: breakdown.waived, color: 'bg-gray-400', label: 'Waived' },
    { key: 'cancelled', count: breakdown.cancelled, color: 'bg-gray-300', label: 'Cancelled' },
  ];

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div
              key={seg.key}
              className={`${seg.color} transition-all`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
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
