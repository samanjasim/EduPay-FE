import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Receipt, Search, Trash2, CheckCircle, Archive } from 'lucide-react';
import {
  Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination,
} from '@/components/ui';
import { PageHeader, EmptyState, ConfirmModal } from '@/components/common';
import { useFeeStructures, useDeleteFeeStructure, useUpdateFeeStructureStatus } from '../api';
import { useFeeTypes } from '@/features/fee-types/api';
import { useSchools } from '@/features/schools/api';
import { useDebounce, usePermissions } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores/ui.store';
import { PERMISSIONS } from '@/constants';
import { ROUTES } from '@/config';
import type { FeeStructureListParams, FeeStructureSummaryDto, FeeStructureStatus } from '@/types';

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<FeeStructureStatus, 'default' | 'success' | 'warning'> = {
  Draft: 'default',
  Active: 'success',
  Archived: 'warning',
};

export default function FeeStructuresListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const activeSchoolId = useUIStore((s) => s.activeSchoolId);
  const setActiveSchoolId = useUIStore((s) => s.setActiveSchoolId);

  const isPlatformAdmin =
    user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Admin');

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteStructure, setDeleteStructure] = useState<FeeStructureSummaryDto | null>(null);
  const [statusAction, setStatusAction] = useState<{ structure: FeeStructureSummaryDto; targetStatus: FeeStructureStatus } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('create') === 'true');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: schoolsData } = useSchools({ pageSize: 100 });
  const schools = schoolsData?.data ?? [];
  const { data: feeTypesData } = useFeeTypes({ pageSize: 100 });
  const feeTypes = feeTypesData?.data ?? [];

  useEffect(() => {
    if (!isPlatformAdmin && schools.length > 0 && !activeSchoolId) {
      setActiveSchoolId(schools[0].id);
    }
  }, [isPlatformAdmin, schools, activeSchoolId, setActiveSchoolId]);

  const schoolOptions = useMemo(() => {
    const opts = schools.map((s) => ({ value: s.id, label: s.name }));
    if (isPlatformAdmin) opts.unshift({ value: '', label: t('feeStructures.allSchools') });
    return opts;
  }, [schools, isPlatformAdmin, t]);

  const statusOptions = [
    { value: '', label: t('feeStructures.allStatuses') },
    { value: 'Draft', label: t('feeStructures.draft') },
    { value: 'Active', label: t('feeStructures.active') },
    { value: 'Archived', label: t('feeStructures.archived') },
  ];

  const feeTypeOptions = useMemo(() => {
    const opts = feeTypes.filter(ft => ft.isActive).map((ft) => ({ value: ft.id, label: ft.name }));
    opts.unshift({ value: '', label: t('feeStructures.allFeeTypes') });
    return opts;
  }, [feeTypes, t]);

  const params: FeeStructureListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as FeeStructureStatus }),
    ...(feeTypeFilter && { feeTypeId: feeTypeFilter }),
  };

  const { data, isLoading } = useFeeStructures(params);
  const structures = data?.data ?? [];
  const pagination = data?.pagination;

  const { mutate: deleteMutation, isPending: isDeleting } = useDeleteFeeStructure();
  const { mutate: statusMutation, isPending: isUpdatingStatus } = useUpdateFeeStructureStatus();

  const handleDelete = () => {
    if (!deleteStructure) return;
    deleteMutation(deleteStructure.id, { onSuccess: () => setDeleteStructure(null) });
  };

  const handleStatusChange = () => {
    if (!statusAction) return;
    statusMutation(
      { id: statusAction.structure.id, data: { status: statusAction.targetStatus } },
      { onSuccess: () => setStatusAction(null) }
    );
  };

  const canCreate = hasPermission(PERMISSIONS.Fees.Create);
  const canUpdate = hasPermission(PERMISSIONS.Fees.Update);
  const canDelete = hasPermission(PERMISSIONS.Fees.Delete);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('feeStructures.title')}
        subtitle={t('feeStructures.subtitle')}
        actions={
          canCreate ? (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
              disabled={!activeSchoolId}
              title={!activeSchoolId ? t('feeStructures.selectSchoolToCreate') : undefined}
            >
              {t('feeStructures.createFeeStructure')}
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {schoolOptions.length > 0 && (
          <Select
            options={schoolOptions}
            value={activeSchoolId ?? ''}
            onChange={(v) => { setActiveSchoolId(v || null); setPage(1); }}
            placeholder={t('feeStructures.selectSchool')}
            className="sm:max-w-[250px]"
          />
        )}
        <div className="sm:max-w-xs flex-1">
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          className="sm:max-w-[180px]"
        />
        <Select
          options={feeTypeOptions}
          value={feeTypeFilter}
          onChange={(v) => { setFeeTypeFilter(v); setPage(1); }}
          className="sm:max-w-[200px]"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : structures.length === 0 ? (
        <EmptyState icon={Receipt} title={t('common.noResults')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeStructures.name')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeStructures.feeType')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeStructures.amount')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeStructures.frequency')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeStructures.grade')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('feeStructures.dueDate')}</th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.status')}</th>
                      {(canUpdate || canDelete) && (
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">{t('common.actions')}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {structures.map((fs) => (
                      <tr key={fs.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <Link
                            to={ROUTES.FEE_STRUCTURES.getDetail(fs.id)}
                            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            {fs.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-text-secondary">{fs.feeTypeName}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{fs.amount.toLocaleString()} {fs.currency}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{t(`feeStructures.freq_${fs.frequency}`)}</td>
                        <td className="px-4 py-3.5 text-text-secondary">{fs.gradeName ?? t('feeStructures.allGrades')}</td>
                        <td className="px-4 py-3.5 text-text-muted">{fs.dueDate}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={STATUS_BADGE_VARIANT[fs.status]} size="sm">
                            {t(`feeStructures.${fs.status.toLowerCase()}`)}
                          </Badge>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              {canUpdate && fs.status === 'Draft' && (
                                <Button variant="ghost" size="sm" onClick={() => setStatusAction({ structure: fs, targetStatus: 'Active' })} title={t('feeStructures.activate')}>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {canUpdate && fs.status === 'Active' && (
                                <Button variant="ghost" size="sm" onClick={() => setStatusAction({ structure: fs, targetStatus: 'Archived' })} title={t('feeStructures.archive')}>
                                  <Archive className="h-4 w-4 text-amber-600" />
                                </Button>
                              )}
                              {canDelete && fs.status === 'Draft' && (
                                <Button variant="ghost" size="sm" onClick={() => setDeleteStructure(fs)} title={t('common.delete')}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
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

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteStructure}
        onClose={() => setDeleteStructure(null)}
        onConfirm={handleDelete}
        title={t('feeStructures.deleteFeeStructure')}
        description={t('feeStructures.deleteConfirmation', { name: deleteStructure?.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Status Change Confirm */}
      <ConfirmModal
        isOpen={!!statusAction}
        onClose={() => setStatusAction(null)}
        onConfirm={handleStatusChange}
        title={statusAction?.targetStatus === 'Active' ? t('feeStructures.activate') : t('feeStructures.archive')}
        description={
          statusAction?.targetStatus === 'Active'
            ? t('feeStructures.activateConfirmation', { name: statusAction?.structure.name })
            : t('feeStructures.archiveConfirmation', { name: statusAction?.structure.name })
        }
        confirmLabel={statusAction?.targetStatus === 'Active' ? t('feeStructures.activate') : t('feeStructures.archive')}
        cancelLabel={t('common.cancel')}
        variant={statusAction?.targetStatus === 'Active' ? 'primary' : 'danger'}
        isLoading={isUpdatingStatus}
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
    </div>
  );
}

/* ─── Create Fee Structure Modal (extracted to shared component) ─── */
import { CreateFeeStructureModal } from '../components/CreateFeeStructureModal';
