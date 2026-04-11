import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Wallet as WalletIcon, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Select,
  Spinner,
  Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useWallets } from '../api';
import { useSchools } from '@/features/schools/api';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores/ui.store';
import { usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import { CreateWalletModal } from '../components/CreateWalletModal';
import type { WalletListParams, WalletStatus } from '@/types';

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<WalletStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Active: 'success',
  Frozen: 'warning',
  Closed: 'error',
};

export default function WalletsListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  const setActiveSchoolId = useUIStore((s) => s.setActiveSchoolId);
  const isPlatformAdmin =
    user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: schoolsData } = useSchools({ pageSize: 100 });
  const schools = schoolsData?.data ?? [];

  useEffect(() => {
    if (!isPlatformAdmin && schools.length > 0 && !activeSchoolId) {
      setActiveSchoolId(schools[0].id);
    }
  }, [isPlatformAdmin, schools, activeSchoolId, setActiveSchoolId]);

  const schoolOptions = useMemo(() => {
    const opts = schools.map((s) => ({ value: s.id, label: s.name }));
    if (isPlatformAdmin) opts.unshift({ value: '', label: t('wallets.allSchools') });
    return opts;
  }, [schools, isPlatformAdmin, t]);

  const statusOptions = [
    { value: '', label: t('wallets.allStatuses') },
    { value: 'Active', label: t('wallets.active') },
    { value: 'Frozen', label: t('wallets.frozen') },
    { value: 'Closed', label: t('wallets.closed') },
  ];

  const params: WalletListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(statusFilter && { status: statusFilter as WalletStatus }),
  };

  const { data, isLoading } = useWallets(params);
  const wallets = data?.data ?? [];
  const pagination = data?.pagination;

  const canCreate = hasPermission(PERMISSIONS.Wallets.Create);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('wallets.title')}
        subtitle={t('wallets.subtitle')}
        actions={
          canCreate ? (
            <Button
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('wallets.create')}
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        {schoolOptions.length > 0 && (
          <Select
            options={schoolOptions}
            value={activeSchoolId ?? ''}
            onChange={(v) => {
              setActiveSchoolId(v || null);
              setPage(1);
            }}
            className="sm:max-w-[250px]"
          />
        )}
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          className="sm:max-w-[180px]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState icon={WalletIcon} title={t('common.noResults')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.userId')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.balance')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.currency')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.dailyLimit')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('wallets.perTransactionLimit')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {wallets.map((w) => (
                      <tr key={w.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5 text-text-primary">
                          <Link
                            to={ROUTES.WALLETS.getDetail(w.id)}
                            className="font-mono text-xs hover:text-primary-600"
                          >
                            {w.userId.slice(0, 8)}…
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {w.balance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">{w.currency}</td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {w.dailySpendingLimit.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">
                          {w.perTransactionLimit.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={STATUS_BADGE_VARIANT[w.status]} size="sm">
                            {t(`wallets.${w.status.toLowerCase()}`)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
        </>
      )}

      {showCreateModal && (
        <CreateWalletModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
