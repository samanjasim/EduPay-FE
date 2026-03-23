import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Receipt, Search } from 'lucide-react';
import {
  Card, CardContent, Badge, Input, Select, Spinner, Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useFeeInstances } from '../api';
import { useSchools } from '@/features/schools/api';
import { useDebounce } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/config';
import type { FeeInstanceListParams, FeeInstanceStatus } from '@/types';

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<FeeInstanceStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'error',
  Waived: 'default',
  Cancelled: 'default',
};

export default function FeeInstancesListPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  const setActiveSchoolId = useUIStore((s) => s.setActiveSchoolId);
  const isPlatformAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: schoolsData } = useSchools({ pageSize: 100 });
  const schools = schoolsData?.data ?? [];

  useEffect(() => {
    if (!isPlatformAdmin && schools.length > 0 && !activeSchoolId) {
      setActiveSchoolId(schools[0].id);
    }
  }, [isPlatformAdmin, schools, activeSchoolId, setActiveSchoolId]);

  const schoolOptions = useMemo(() => {
    const opts = schools.map((s) => ({ value: s.id, label: s.name }));
    if (isPlatformAdmin) opts.unshift({ value: '', label: t('feeInstances.allSchools') });
    return opts;
  }, [schools, isPlatformAdmin, t]);

  const statusOptions = [
    { value: '', label: t('feeInstances.allStatuses') },
    { value: 'Pending', label: t('feeInstances.pending') },
    { value: 'Paid', label: t('feeInstances.paid') },
    { value: 'Overdue', label: t('feeInstances.overdue') },
    { value: 'Waived', label: t('feeInstances.waived') },
    { value: 'Cancelled', label: t('feeInstances.cancelled') },
  ];

  const params: FeeInstanceListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as FeeInstanceStatus }),
  };

  const { data, isLoading } = useFeeInstances(params);
  const instances = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader title={t('feeInstances.title')} subtitle={t('feeInstances.subtitle')} />

      <div className="flex flex-col gap-3 sm:flex-row">
        {schoolOptions.length > 0 && (
          <Select options={schoolOptions} value={activeSchoolId ?? ''} onChange={(v) => { setActiveSchoolId(v || null); setPage(1); }} className="sm:max-w-[250px]" />
        )}
        <div className="sm:max-w-xs flex-1">
          <Input placeholder={t('common.search')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} />
        </div>
        <Select options={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} className="sm:max-w-[180px]" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : instances.length === 0 ? (
        <EmptyState icon={Receipt} title={t('common.noResults')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeInstances.student')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeInstances.feeStructure')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeInstances.feeType')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeInstances.amount')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeInstances.remaining')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeInstances.dueDate')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {instances.map((fi) => (
                      <tr key={fi.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5 text-text-primary">{fi.studentName}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{fi.feeStructureName}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{fi.feeTypeName}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{fi.netAmount.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{fi.remainingAmount.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-text-muted">{fi.dueDate}</td>
                        <td className="px-4 py-3.5">
                          <Link to={ROUTES.FEE_INSTANCES.getDetail(fi.id)}>
                            <Badge variant={STATUS_BADGE_VARIANT[fi.status]} size="sm">
                              {t(`feeInstances.${fi.status.toLowerCase()}`)}
                            </Badge>
                          </Link>
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
    </div>
  );
}
