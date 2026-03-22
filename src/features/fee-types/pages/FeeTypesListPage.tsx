import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Tags, Search, Trash2, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  Card, CardContent, Badge, Button, Input, Select, Spinner, Pagination, Modal, ModalFooter,
} from '@/components/ui';
import { PageHeader, EmptyState, ConfirmModal } from '@/components/common';
import { useFeeTypes, useCreateFeeType, useUpdateFeeType, useDeleteFeeType, useToggleFeeTypeStatus } from '../api';
import { useDebounce, usePermissions } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import {
  createFeeTypeSchema, updateFeeTypeSchema,
  type CreateFeeTypeFormData, type UpdateFeeTypeFormData,
} from '@/lib/validation';
import { format } from 'date-fns';
import type { FeeTypeListParams, FeeTypeSummaryDto } from '@/types';

const PAGE_SIZE = 10;

export default function FeeTypesListPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editFeeType, setEditFeeType] = useState<FeeTypeSummaryDto | null>(null);
  const [deleteFeeType, setDeleteFeeType] = useState<FeeTypeSummaryDto | null>(null);
  const [toggleFeeType, setToggleFeeType] = useState<FeeTypeSummaryDto | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const statusOptions = [
    { value: '', label: t('feeTypes.allStatuses') },
    { value: 'true', label: t('feeTypes.active') },
    { value: 'false', label: t('feeTypes.inactive') },
  ];

  const params: FeeTypeListParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter !== '' && { isActive: statusFilter === 'true' }),
  };

  const { data, isLoading } = useFeeTypes(params);
  const feeTypes = data?.data ?? [];
  const pagination = data?.pagination;

  const { mutate: deleteFeeTypeMutation, isPending: isDeleting } = useDeleteFeeType();
  const { mutate: toggleStatusMutation, isPending: isToggling } = useToggleFeeTypeStatus();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDelete = () => {
    if (!deleteFeeType) return;
    deleteFeeTypeMutation(deleteFeeType.id, {
      onSuccess: () => setDeleteFeeType(null),
    });
  };

  const handleToggleStatus = () => {
    if (!toggleFeeType) return;
    toggleStatusMutation(
      { id: toggleFeeType.id, data: { isActive: !toggleFeeType.isActive } },
      { onSuccess: () => setToggleFeeType(null) }
    );
  };

  const canCreate = hasPermission(PERMISSIONS.FeeTypes.Create);
  const canUpdate = hasPermission(PERMISSIONS.FeeTypes.Update);
  const canDelete = hasPermission(PERMISSIONS.FeeTypes.Delete);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('feeTypes.title')}
        subtitle={t('feeTypes.subtitle')}
        actions={
          canCreate ? (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              {t('feeTypes.createFeeType')}
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:max-w-xs flex-1">
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={handleStatusChange}
          placeholder={t('feeTypes.filterByStatus')}
          className="sm:max-w-[200px]"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : feeTypes.length === 0 ? (
        <EmptyState icon={Tags} title={t('common.noResults')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('feeTypes.name')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.status')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                        {t('common.createdAt')}
                      </th>
                      {(canUpdate || canDelete) && (
                        <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted">
                          {t('common.actions')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {feeTypes.map((feeType) => (
                      <tr key={feeType.id} className="hover:bg-hover/50 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-text-primary">
                          {feeType.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={feeType.isActive ? 'success' : 'default'}
                            size="sm"
                          >
                            {feeType.isActive ? t('feeTypes.active') : t('feeTypes.inactive')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">
                          {format(new Date(feeType.createdAt), 'MMM d, yyyy')}
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              {canUpdate && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditFeeType(feeType)}
                                    title={t('common.edit')}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setToggleFeeType(feeType)}
                                    title={feeType.isActive ? t('feeTypes.deactivate') : t('feeTypes.activate')}
                                  >
                                    {feeType.isActive ? (
                                      <ToggleRight className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <ToggleLeft className="h-4 w-4 text-text-muted" />
                                    )}
                                  </Button>
                                </>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteFeeType(feeType)}
                                  title={t('common.delete')}
                                >
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

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateFeeTypeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editFeeType && (
        <EditFeeTypeModal
          isOpen={!!editFeeType}
          onClose={() => setEditFeeType(null)}
          feeTypeId={editFeeType.id}
          defaultValues={{ name: editFeeType.name }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteFeeType}
        onClose={() => setDeleteFeeType(null)}
        onConfirm={handleDelete}
        title={t('feeTypes.deleteFeeType')}
        description={t('feeTypes.deleteConfirmation', { name: deleteFeeType?.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Toggle Status Confirm */}
      <ConfirmModal
        isOpen={!!toggleFeeType}
        onClose={() => setToggleFeeType(null)}
        onConfirm={handleToggleStatus}
        title={toggleFeeType?.isActive ? t('feeTypes.deactivate') : t('feeTypes.activate')}
        description={
          toggleFeeType?.isActive
            ? t('feeTypes.deactivateConfirmation', { name: toggleFeeType?.name })
            : t('feeTypes.activateConfirmation', { name: toggleFeeType?.name })
        }
        confirmLabel={toggleFeeType?.isActive ? t('feeTypes.deactivate') : t('feeTypes.activate')}
        cancelLabel={t('common.cancel')}
        variant={toggleFeeType?.isActive ? 'danger' : 'primary'}
        isLoading={isToggling}
      />
    </div>
  );
}

/* ─── Create Fee Type Modal ─── */

function CreateFeeTypeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { mutate: createFeeType, isPending } = useCreateFeeType();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFeeTypeFormData>({
    resolver: zodResolver(createFeeTypeSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (data: CreateFeeTypeFormData) => {
    createFeeType(data, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('feeTypes.createFeeType')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('feeTypes.name')}
          error={errors.name?.message}
          {...register('name')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.create')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ─── Edit Fee Type Modal ─── */

function EditFeeTypeModal({
  isOpen,
  onClose,
  feeTypeId,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  feeTypeId: string;
  defaultValues: UpdateFeeTypeFormData;
}) {
  const { t } = useTranslation();
  const { mutate: updateFeeType, isPending } = useUpdateFeeType();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateFeeTypeFormData>({
    resolver: zodResolver(updateFeeTypeSchema),
    defaultValues,
  });

  const onSubmit = (data: UpdateFeeTypeFormData) => {
    updateFeeType({ id: feeTypeId, data }, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('feeTypes.editFeeType')} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('feeTypes.name')}
          error={errors.name?.message}
          {...register('name')}
        />
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
