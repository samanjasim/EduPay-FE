import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Receipt, Search, Eye, CheckCircle, Archive, Trash2, Ban, ShieldOff, Plus, Pencil } from 'lucide-react';
import {
  Card, Badge, Button, Input, Select, Spinner, Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState, ConfirmModal } from '@/components/common';
import {
  useFeeStructures, useDeleteFeeStructure, useUpdateFeeStructureStatus, useGenerateFeeInstances,
} from '../api';
import {
  useFeeInstances, useWaiveFee, useCancelFee,
} from '../api';
import { CreateFeeStructureModal } from '../components/CreateFeeStructureModal';
import { EditFeeStructureModal } from '../components/EditFeeStructureModal';
import { useSchoolContext } from '@/features/school-portal/hooks/useSchoolContext';
import { useSchoolDashboard } from '@/features/school-portal/api';
import { useDebounce } from '@/hooks';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import type {
  FeeStructureListParams, FeeStructureSummaryDto, FeeStructureStatus,
  FeeInstanceListParams, FeeInstanceSummaryDto, FeeInstanceStatus,
} from '@/types';

const STRUCTURE_STATUS_BADGE: Record<FeeStructureStatus, 'default' | 'success' | 'warning'> = {
  Draft: 'default', Active: 'success', Archived: 'warning',
};

const INSTANCE_STATUS_BADGE: Record<FeeInstanceStatus, 'default' | 'success' | 'warning' | 'error'> = {
  Pending: 'warning', Paid: 'success', Overdue: 'error', Waived: 'default', Cancelled: 'default',
};

const PAGE_SIZE = 10;

export default function SchoolFeesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'structures' | 'instances'>('structures');

  return (
    <div className="space-y-6">
      <PageHeader title={t('schoolPortal.nav.fees')} subtitle={t('feeStructures.subtitle')} />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-surface-200 p-1 dark:bg-surface-elevated w-fit">
        <button
          onClick={() => setActiveTab('structures')}
          className={cn('rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'structures' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
          )}
        >
          {t('feeStructures.title')}
        </button>
        <button
          onClick={() => setActiveTab('instances')}
          className={cn('rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'instances' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
          )}
        >
          {t('feeInstances.title')}
        </button>
      </div>

      {activeTab === 'structures' ? <StructuresTab /> : <InstancesTab />}
    </div>
  );
}

// ─── Fee Structures Tab ───

function StructuresTab() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('create') === 'true');
  const [deleteTarget, setDeleteTarget] = useState<FeeStructureSummaryDto | null>(null);
  const [statusAction, setStatusAction] = useState<{ structure: FeeStructureSummaryDto; target: FeeStructureStatus } | null>(null);
  const [generateTarget, setGenerateTarget] = useState<FeeStructureSummaryDto | null>(null);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  const deleteMutation = useDeleteFeeStructure();
  const statusMutation = useUpdateFeeStructureStatus();
  const generateMutation = useGenerateFeeInstances();

  const statusOptions = [
    { value: '', label: t('feeStructures.allStatuses') },
    { value: 'Draft', label: t('feeStructures.draft') },
    { value: 'Active', label: t('feeStructures.active') },
    { value: 'Archived', label: t('feeStructures.archived') },
  ];

  const params: FeeStructureListParams = {
    pageNumber: page, pageSize: PAGE_SIZE,
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
          <Input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} placeholder={t('common.search')} className="ltr:pl-9 rtl:pr-9" />
        </div>
        <Select options={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} placeholder={t('feeStructures.allStatuses')} className="w-40" />
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t('feeStructures.createFeeStructure')}
        </Button>
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
                    <td className="px-4 py-3"><Badge variant={STRUCTURE_STATUS_BADGE[fs.status]}>{fs.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={ROUTES.SCHOOL.FEE_STRUCTURES.getDetail(fs.id)}>
                          <Button variant="ghost" size="sm" title="View"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        {fs.status === 'Draft' && (
                          <>
                            <Button variant="ghost" size="sm" title={t('common.edit')} onClick={() => setEditTargetId(fs.id)}>
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title={t('feeStructures.activate')} onClick={() => setStatusAction({ structure: fs, target: 'Active' })}>
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title={t('common.delete')} onClick={() => setDeleteTarget(fs)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {fs.status === 'Active' && (
                          <>
                            <Button variant="ghost" size="sm" title={t('feeStructures.generateFees')} onClick={() => setGenerateTarget(fs)}>
                              <Receipt className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title={t('feeStructures.archive')} onClick={() => setStatusAction({ structure: fs, target: 'Archived' })}>
                              <Archive className="h-4 w-4 text-amber-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border p-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
          )}
        </Card>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); } }}
        title={t('feeStructures.deleteFeeStructure')}
        description={t('feeStructures.deleteConfirmation', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        variant="danger"
      />

      {/* Status change confirmation */}
      <ConfirmModal
        isOpen={!!statusAction}
        onClose={() => setStatusAction(null)}
        onConfirm={() => {
          if (statusAction) {
            statusMutation.mutate({ id: statusAction.structure.id, data: { status: statusAction.target } });
            setStatusAction(null);
          }
        }}
        title={statusAction?.target === 'Active' ? t('feeStructures.activate') : t('feeStructures.archive')}
        description={statusAction?.target === 'Active'
          ? t('feeStructures.activateConfirmation', { name: statusAction?.structure.name })
          : t('feeStructures.archiveConfirmation', { name: statusAction?.structure.name })
        }
        confirmLabel={statusAction?.target === 'Active' ? t('feeStructures.activate') : t('feeStructures.archive')}
      />

      {/* Generate fees confirmation */}
      <ConfirmModal
        isOpen={!!generateTarget}
        onClose={() => setGenerateTarget(null)}
        onConfirm={() => { if (generateTarget) { generateMutation.mutate(generateTarget.id); setGenerateTarget(null); } }}
        title={t('feeStructures.generateFees')}
        description={`Generate fee instances for all applicable students from "${generateTarget?.name}"?`}
        confirmLabel={t('feeStructures.generateFees')}
      />

      {/* Create Fee Structure Modal */}
      {showCreateModal && (
        <CreateFeeStructureModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            searchParams.delete('create');
            setSearchParams(searchParams, { replace: true });
          }}
        />
      )}

      {/* Edit Fee Structure Modal */}
      {editTargetId && (
        <EditFeeStructureModal
          isOpen={!!editTargetId}
          onClose={() => setEditTargetId(null)}
          feeStructureId={editTargetId}
        />
      )}
    </div>
  );
}

// ─── Fee Instances Tab ───

function InstancesTab() {
  const { t } = useTranslation();
  const { schoolId } = useSchoolContext();
  const { data: dashboardData } = useSchoolDashboard(schoolId ?? undefined);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [waiveTarget, setWaiveTarget] = useState<FeeInstanceSummaryDto | null>(null);
  const [cancelTarget, setCancelTarget] = useState<FeeInstanceSummaryDto | null>(null);

  const waiveMutation = useWaiveFee();
  const cancelMutation = useCancelFee();

  const statusOptions = [
    { value: '', label: t('feeInstances.allStatuses') },
    { value: 'Pending', label: t('feeInstances.pending') },
    { value: 'Paid', label: t('feeInstances.paid') },
    { value: 'Overdue', label: t('feeInstances.overdue') },
    { value: 'Waived', label: t('feeInstances.waived') },
    { value: 'Cancelled', label: t('feeInstances.cancelled') },
  ];

  const params: FeeInstanceListParams = {
    pageNumber: page, pageSize: PAGE_SIZE,
    status: (statusFilter || undefined) as FeeInstanceStatus | undefined,
  };

  const { data, isLoading } = useFeeInstances(params);
  const instances = data?.data ?? [];
  const pagination = data?.pagination;
  const collection = dashboardData?.feeCollection;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {collection && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label={t('feeInstances.amount')} value={collection.totalDue.toLocaleString()} color="blue" />
          <SummaryCard label={t('feeInstances.paidAmount')} value={collection.totalCollected.toLocaleString()} color="emerald" />
          <SummaryCard label={t('parentFees.totalOutstanding')} value={(collection.totalDue - collection.totalCollected).toLocaleString()} color="amber" />
          <SummaryCard label={t('parentFees.totalOverdue')} value={collection.totalOverdue.toLocaleString()} color="red" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Select options={statusOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} placeholder={t('feeInstances.allStatuses')} className="w-40" />
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
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.discount')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('feeInstances.dueDate')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((fi) => (
                  <tr
                    key={fi.id}
                    className={cn(
                      'border-b border-border last:border-0 hover:bg-hover transition-colors',
                      fi.status === 'Overdue' && 'bg-red-50/50 dark:bg-red-500/5'
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{fi.studentName}</td>
                    <td className="px-4 py-3 text-text-secondary">{fi.feeStructureName}</td>
                    <td className="px-4 py-3 text-text-secondary">{fi.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-text-secondary">{fi.discountAmount ? fi.discountAmount.toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{fi.dueDate}</td>
                    <td className="px-4 py-3"><Badge variant={INSTANCE_STATUS_BADGE[fi.status]}>{fi.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={ROUTES.SCHOOL.FEE_INSTANCES.getDetail(fi.id)}>
                          <Button variant="ghost" size="sm" title="View"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        {(fi.status === 'Pending' || fi.status === 'Overdue') && (
                          <>
                            <Button variant="ghost" size="sm" title={t('feeInstances.waiveFee')} onClick={() => setWaiveTarget(fi)}>
                              <ShieldOff className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="sm" title={t('feeInstances.cancelFee')} onClick={() => setCancelTarget(fi)}>
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border p-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
          )}
        </Card>
      )}

      {/* Waive confirmation */}
      <ConfirmModal
        isOpen={!!waiveTarget}
        onClose={() => setWaiveTarget(null)}
        onConfirm={() => { if (waiveTarget) { waiveMutation.mutate({ id: waiveTarget.id, data: { reason: 'Waived by school admin' } }); setWaiveTarget(null); } }}
        title={t('feeInstances.waiveFee')}
        description={t('feeInstances.waiveConfirmation')}
        confirmLabel={t('feeInstances.waiveFee')}
        variant="danger"
      />

      {/* Cancel confirmation */}
      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => { if (cancelTarget) { cancelMutation.mutate({ id: cancelTarget.id, data: { reason: 'Cancelled by school admin' } }); setCancelTarget(null); } }}
        title={t('feeInstances.cancelFee')}
        description={t('feeInstances.cancelConfirmation')}
        confirmLabel={t('feeInstances.cancelFee')}
        variant="danger"
      />
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: 'blue' | 'emerald' | 'amber' | 'red' }) {
  const colors = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10',
    emerald: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
    red: 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10',
  };
  const textColors = {
    blue: 'text-blue-700 dark:text-blue-300',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    amber: 'text-amber-700 dark:text-amber-300',
    red: 'text-red-700 dark:text-red-300',
  };
  return (
    <div className={cn('rounded-lg border p-3', colors[color])}>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={cn('text-lg font-bold mt-0.5', textColors[color])}>{value}</p>
    </div>
  );
}
