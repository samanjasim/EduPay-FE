import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Receipt, Search, Eye } from 'lucide-react';
import {
  Card, Badge, Button, Input, Select, Spinner, Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState } from '@/components/common';
import { useFeeStructures } from '../api';
import { useFeeInstances } from '../api';
import { useDebounce } from '@/hooks';
import { ROUTES } from '@/config';
import type { FeeStructureListParams, FeeStructureStatus, FeeInstanceListParams, FeeInstanceStatus } from '@/types';

const STRUCTURE_STATUS_BADGE: Record<FeeStructureStatus, 'default' | 'success' | 'warning'> = {
  Draft: 'default',
  Active: 'success',
  Archived: 'warning',
};

const INSTANCE_STATUS_BADGE: Record<FeeInstanceStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'error',
  Waived: 'default',
  Cancelled: 'default',
};

const PAGE_SIZE = 10;

export default function SchoolFeesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'structures' | 'instances'>('structures');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('schoolPortal.nav.fees')}
        subtitle={t('feeStructures.subtitle')}
      />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-surface-200 p-1 dark:bg-surface-elevated w-fit">
        <button
          onClick={() => setActiveTab('structures')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'structures'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t('feeStructures.title')}
        </button>
        <button
          onClick={() => setActiveTab('instances')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'instances'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t('feeInstances.title')}
        </button>
      </div>

      {activeTab === 'structures' ? <StructuresTab /> : <InstancesTab />}
    </div>
  );
}

function StructuresTab() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const statusOptions = [
    { value: '', label: t('feeStructures.allStatuses') },
    { value: 'Draft', label: t('feeStructures.draft') },
    { value: 'Active', label: t('feeStructures.active') },
    { value: 'Archived', label: t('feeStructures.archived') },
  ];

  const params: FeeStructureListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    searchTerm: debouncedSearch || undefined,
    status: (statusFilter || undefined) as FeeStructureStatus | undefined,
  };

  const { data, isLoading } = useFeeStructures(params);
  const structures = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder={t('common.search')}
            className="ltr:pl-9 rtl:pr-9"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder={t('feeStructures.allStatuses')}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : structures.length === 0 ? (
        <EmptyState icon={Receipt} title={t('common.noResults')} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="px-4 py-3 text-start font-medium">{t('feeStructures.name')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeStructures.feeType')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeStructures.amount')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeStructures.frequency')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeStructures.dueDate')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((fs) => (
                  <tr key={fs.id} className="border-b border-border last:border-0 hover:bg-hover transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{fs.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{fs.feeTypeName}</td>
                    <td className="px-4 py-3 text-text-secondary">{fs.amount?.toLocaleString()} {fs.currency}</td>
                    <td className="px-4 py-3 text-text-secondary">{fs.frequency}</td>
                    <td className="px-4 py-3 text-text-secondary">{fs.dueDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STRUCTURE_STATUS_BADGE[fs.status]}>{fs.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={ROUTES.SCHOOL.FEE_STRUCTURES.getDetail(fs.id)}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border p-4">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function InstancesTab() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

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
    status: (statusFilter || undefined) as FeeInstanceStatus | undefined,
  };

  const { data, isLoading } = useFeeInstances(params);
  const instances = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder={t('feeInstances.allStatuses')}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : instances.length === 0 ? (
        <EmptyState icon={Receipt} title={t('common.noResults')} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.student')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.feeStructure')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.amount')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.dueDate')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((fi) => (
                  <tr
                    key={fi.id}
                    className={`border-b border-border last:border-0 hover:bg-hover transition-colors ${
                      fi.status === 'Overdue' ? 'bg-red-50/50 dark:bg-red-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{fi.studentName}</td>
                    <td className="px-4 py-3 text-text-secondary">{fi.feeStructureName}</td>
                    <td className="px-4 py-3 text-text-secondary">{fi.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-text-secondary">{fi.dueDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant={INSTANCE_STATUS_BADGE[fi.status]}>{fi.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={ROUTES.SCHOOL.FEE_INSTANCES.getDetail(fi.id)}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border p-4">
              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
